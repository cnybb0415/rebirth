import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { ContactType, ExchangeCategory, ItemRow, TicketHave, TicketWant } from "@/data/exchange";

// 교환 게시판 (Supabase exchange_posts, 사진은 exchange-photos 버킷 — supabase/migrations 참고)
// 비밀번호·IP 는 해시로만 저장, 목록 응답에는 절대 포함하지 않음

export const PHOTO_BUCKET = "exchange-photos";

let _client: SupabaseClient | null = null;
export function getDb(): SupabaseClient {
  if (!_client) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("supabase env missing");
    _client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return _client;
}

export type ExchangePost = {
  id: string;
  category: ExchangeCategory;
  etc_label: string | null;
  event_name: string | null;
  haves: ItemRow[] | TicketHave[];
  wants: ItemRow[] | TicketWant[];
  dates: string[];
  photos: string[];
  contact_type: ContactType;
  contact: string;
  memo: string | null;
  status: "open" | "done";
  created_at: string;
};

const PUBLIC_COLS = "id,category,etc_label,event_name,haves,wants,dates,photos,contact_type,contact,memo,status,created_at";

export function photoUrl(path: string): string {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip + (process.env.VOTE_IP_SALT ?? "exchange-salt")).digest("hex");
}

export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 32).toString("hex")}`;
}

function checkPassword(pw: string, stored: string): boolean {
  const [salt, hex] = stored.split(":");
  if (!salt || !hex) return false;
  const a = Buffer.from(hex, "hex");
  const b = scryptSync(pw, salt, 32);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function log(category: string, action: "created" | "done" | "reopened" | "deleted") {
  await getDb().from("exchange_log").insert({ category, action }).then(() => undefined, () => undefined);
}

export async function listExchanges(category: ExchangeCategory): Promise<ExchangePost[]> {
  const { data, error } = await getDb()
    .from("exchange_posts")
    .select(PUBLIC_COLS)
    .eq("category", category)
    .is("deleted_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw new Error(error.message);
  return (data ?? []) as ExchangePost[];
}

export async function countRecentByIp(ipHash: string, sinceMs: number): Promise<number> {
  const { count, error } = await getDb()
    .from("exchange_posts")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", new Date(Date.now() - sinceMs).toISOString());
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export type NewExchange = Omit<ExchangePost, "id" | "status" | "created_at"> & {
  pw_hash: string;
  ip_hash: string;
  expires_at: string;
};

export async function createExchange(row: NewExchange) {
  const { data, error } = await getDb().from("exchange_posts").insert(row).select(PUBLIC_COLS).single();
  if (error) throw new Error(error.message);
  await log(row.category, "created");
  return data as ExchangePost;
}

// 비밀번호가 맞을 때만 상태 변경/삭제
// 숫자 6자리라 경우의 수가 100만 개뿐 → 한 글에 5번 틀리면 30분 잠금
const PW_MAX_FAILS = 5;
const PW_LOCK_MS = 30 * 60_000;

type AuthResult = { r: "ok"; category: string; photos: string[] } | { r: "forbidden" | "not_found" | "locked" };

async function authorize(id: string, pw: string): Promise<AuthResult> {
  const db = getDb();
  const { data, error } = await db
    .from("exchange_posts")
    .select("category,photos,pw_hash,pw_fail_count,pw_locked_until")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return { r: "not_found" };

  const lockedUntil = data.pw_locked_until ? Date.parse(data.pw_locked_until as string) : 0;
  if (lockedUntil > Date.now()) return { r: "locked" }; // 잠긴 동안은 맞는 비밀번호도 확인하지 않음

  if (checkPassword(pw, data.pw_hash as string)) {
    if ((data.pw_fail_count as number) > 0 || lockedUntil) {
      await db.from("exchange_posts").update({ pw_fail_count: 0, pw_locked_until: null }).eq("id", id);
    }
    return { r: "ok", category: data.category as string, photos: (data.photos as string[]) ?? [] };
  }

  const fails = ((data.pw_fail_count as number) ?? 0) + 1;
  const lock = fails >= PW_MAX_FAILS;
  await db
    .from("exchange_posts")
    .update(lock ? { pw_fail_count: 0, pw_locked_until: new Date(Date.now() + PW_LOCK_MS).toISOString() } : { pw_fail_count: fails })
    .eq("id", id);
  return { r: lock ? "locked" : "forbidden" };
}

export async function setExchangeStatus(id: string, pw: string, status: "open" | "done") {
  const auth = await authorize(id, pw);
  if (auth.r !== "ok") return auth.r;
  const { error } = await getDb()
    .from("exchange_posts")
    .update({ status, done_at: status === "done" ? new Date().toISOString() : null })
    .eq("id", id)
    .is("deleted_at", null);
  if (error) throw new Error(error.message);
  await log(auth.category, status === "done" ? "done" : "reopened");
  return "ok" as const;
}

// 작성자가 지우면 글과 사진을 바로 지움
export async function deleteExchange(id: string, pw: string) {
  const auth = await authorize(id, pw);
  if (auth.r !== "ok") return auth.r;
  const { error } = await getDb().from("exchange_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  if (auth.photos.length) await getDb().storage.from(PHOTO_BUCKET).remove(auth.photos).catch(() => undefined);
  await log(auth.category, "deleted");
  return "ok" as const;
}

// 기간이 지난 글(사진 포함)과, 올렸지만 글에 쓰이지 않은 사진(하루 지난 것)을 지움
// 게시판을 여는 요청 때 서버 인스턴스마다 최대 10분에 한 번
let lastPurge = 0;
export async function purgeExpired(): Promise<void> {
  if (Date.now() - lastPurge < 10 * 60_000) return;
  lastPurge = Date.now();
  const db = getDb();
  const now = new Date().toISOString();

  const { data: expired } = await db.from("exchange_posts").select("id,photos").lte("expires_at", now).limit(200);
  if (expired?.length) {
    const paths = expired.flatMap((p) => (p.photos as string[]) ?? []);
    if (paths.length) await db.storage.from(PHOTO_BUCKET).remove(paths).catch(() => undefined);
    await db.from("exchange_posts").delete().in("id", expired.map((p) => p.id));
  }

  // 사진은 up/YYYY-MM-DD/ 폴더에 올라감 → 이틀 전 폴더부터 글에 안 쓰인 것 정리
  const { data: folders } = await db.storage.from(PHOTO_BUCKET).list("up", { limit: 100 });
  const cutoff = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  for (const f of folders ?? []) {
    if (f.name >= cutoff) continue;
    const { data: files } = await db.storage.from(PHOTO_BUCKET).list(`up/${f.name}`, { limit: 1000 });
    const paths = (files ?? []).map((x) => `up/${f.name}/${x.name}`);
    if (!paths.length) continue;
    const { data: used } = await db.from("exchange_posts").select("photos").overlaps("photos", paths);
    const keep = new Set((used ?? []).flatMap((u) => (u.photos as string[]) ?? []));
    const drop = paths.filter((p) => !keep.has(p));
    if (drop.length) await db.storage.from(PHOTO_BUCKET).remove(drop).catch(() => undefined);
  }
}

// 사진 올리기 (서버에서 이미 다시 줄이고 위치정보 등을 지운 webp)
export async function uploadPhoto(path: string, body: Buffer): Promise<void> {
  const { error } = await getDb().storage.from(PHOTO_BUCKET).upload(path, body, { contentType: "image/webp", upsert: false });
  if (error) throw new Error(error.message);
}

// 글에 붙인 사진이 실제로 저장소에 있는지
export async function photosExist(paths: string[]): Promise<boolean> {
  for (const p of paths) {
    const dir = p.slice(0, p.lastIndexOf("/"));
    const name = p.slice(p.lastIndexOf("/") + 1);
    const { data } = await getDb().storage.from(PHOTO_BUCKET).list(dir, { search: name, limit: 1 });
    if (!data?.some((f) => f.name === name)) return false;
  }
  return true;
}

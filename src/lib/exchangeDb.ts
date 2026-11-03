import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { ContactType, ExchangeKind, HaveRow, WantRow } from "@/data/ticketExchange";

// 콘서트 티켓 교환 게시판 (Supabase ticket_exchanges, supabase/migrations 참고)
// 비밀번호·IP 는 해시로만 저장, 목록 응답에는 절대 포함하지 않음

let _client: SupabaseClient | null = null;
function getDb(): SupabaseClient {
  if (!_client) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("supabase env missing");
    _client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return _client;
}

export type ExchangePost = {
  id: string;
  kind: ExchangeKind;
  haves: HaveRow[];
  wants: WantRow[];
  have_dates: string[];
  want_dates: string[];
  contact_type: ContactType;
  contact: string;
  memo: string | null;
  status: "open" | "done";
  created_at: string;
};

const PUBLIC_COLS = "id,kind,haves,wants,have_dates,want_dates,contact_type,contact,memo,status,created_at";

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

export async function listExchanges(kind: ExchangeKind, openDates: string[]): Promise<ExchangePost[]> {
  if (openDates.length === 0) return [];
  const { data, error } = await getDb()
    .from("ticket_exchanges")
    .select(PUBLIC_COLS)
    .eq("kind", kind)
    .overlaps("have_dates", openDates) // 가진 티켓 중 아직 안 지난 공연이 하나라도 있는 글만
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw new Error(error.message);
  return (data ?? []) as ExchangePost[];
}

export async function countRecentByIp(ipHash: string, sinceMs: number): Promise<number> {
  const { count, error } = await getDb()
    .from("ticket_exchanges")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", new Date(Date.now() - sinceMs).toISOString());
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function createExchange(row: Omit<ExchangePost, "id" | "status" | "created_at"> & { pw_hash: string; ip_hash: string }) {
  const { data, error } = await getDb().from("ticket_exchanges").insert(row).select(PUBLIC_COLS).single();
  if (error) throw new Error(error.message);
  return data as ExchangePost;
}

// 비밀번호가 맞을 때만 상태 변경/삭제. 틀리면 "forbidden", 없으면 "not_found"
async function authorize(id: string, pw: string): Promise<"ok" | "forbidden" | "not_found"> {
  const { data, error } = await getDb().from("ticket_exchanges").select("pw_hash").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return "not_found";
  return checkPassword(pw, data.pw_hash as string) ? "ok" : "forbidden";
}

export async function setExchangeStatus(id: string, pw: string, status: "open" | "done") {
  const auth = await authorize(id, pw);
  if (auth !== "ok") return auth;
  const { error } = await getDb().from("ticket_exchanges").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  return "ok" as const;
}

export async function deleteExchange(id: string, pw: string) {
  const auth = await authorize(id, pw);
  if (auth !== "ok") return auth;
  const { error } = await getDb().from("ticket_exchanges").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return "ok" as const;
}

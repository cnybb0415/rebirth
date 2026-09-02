import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

let _client: SupabaseClient | null = null;

function getDb(): SupabaseClient {
  if (!_client) {
    if (!process.env.SUPABASE_URL) throw new Error("SUPABASE_URL is not set");
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    _client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return _client;
}

export function hashVoterId(ip: string): string {
  return createHash("sha256")
    .update(ip + (process.env.VOTE_IP_SALT ?? "chorus-salt"))
    .digest("hex");
}

// day 2 = "미리메리크리스마스" — 이 날만 1인 2투표(서로 다른 곡) 허용, 나머지는 1인 1투표
const DOUBLE_VOTE_DAYS = new Set<number>([2]);

function getMaxVotesForDay(day: number): number {
  return DOUBLE_VOTE_DAYS.has(day) ? 2 : 1;
}

export async function castChorusVote(
  day: number,
  songId: string,
  voterId: string
): Promise<{ ok: boolean; alreadyVoted?: boolean }> {
  const db = getDb();
  const maxVotes = getMaxVotesForDay(day);

  // 이 voter가 오늘(day) 이미 투표한 횟수를 확인해 허용 횟수를 넘지 못하게 막는다.
  const { count, error: countError } = await db
    .from("chorus_votes")
    .select("id", { count: "exact", head: true })
    .eq("day", day)
    .eq("voter_id", voterId);

  if (countError) throw new Error(countError.message);
  if ((count ?? 0) >= maxVotes) {
    return { ok: false, alreadyVoted: true };
  }

  const { error } = await db
    .from("chorus_votes")
    .insert({ day, song_id: songId, voter_id: voterId });

  if (error) {
    // 동일 곡에 대한 중복 투표(day + song_id + voter_id) 방지
    if (error.code === "23505") return { ok: false, alreadyVoted: true };
    throw new Error(error.message);
  }
  return { ok: true };
}

export async function adjustVoteCount(day: number, songId: string, amount: number): Promise<void> {
  const db = getDb();
  const rows = Array.from({ length: amount }, (_, i) => ({
    day,
    song_id: songId,
    voter_id: `admin_adj_${Date.now()}_${Math.random().toString(36).slice(2)}_${i}`,
  }));
  const { error } = await db.from("chorus_votes").insert(rows);
  if (error) throw new Error(error.message);
}

export async function hasVotedToday(day: number, voterId: string): Promise<boolean> {
  const db = getDb();
  const { count, error } = await db
    .from("chorus_votes")
    .select("id", { count: "exact", head: true })
    .eq("day", day)
    .eq("voter_id", voterId);
  if (error) throw new Error(error.message);
  return (count ?? 0) >= getMaxVotesForDay(day);
}

export type ChorusVoteResult = { day: number; song_id: string; count: number };

export async function getChorusVoteResults(): Promise<ChorusVoteResult[]> {
  const db = getDb();
  // Supabase doesn't support GROUP BY via client SDK — use RPC
  const { data, error } = await db.rpc("get_chorus_vote_results");
  if (error) throw new Error(error.message);
  return (data as ChorusVoteResult[]).map((r) => ({
    day: Number(r.day),
    song_id: String(r.song_id),
    count: Number(r.count),
  }));
}

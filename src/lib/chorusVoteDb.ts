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

export async function castChorusVote(
  day: number,
  songId: string,
  voterId: string
): Promise<{ ok: boolean; alreadyVoted?: boolean }> {
  const db = getDb();
  const { error } = await db
    .from("chorus_votes")
    .insert({ day, song_id: songId, voter_id: voterId });

  if (error) {
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
  const { data } = await db
    .from("chorus_votes")
    .select("id")
    .eq("day", day)
    .eq("voter_id", voterId)
    .limit(1);
  return (data?.length ?? 0) > 0;
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

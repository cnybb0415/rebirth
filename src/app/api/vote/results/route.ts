import { NextResponse } from "next/server";
import { getDb } from "@/lib/voteDb";

export const dynamic = "force-dynamic";

interface CandidateRow {
  id: number;
  title: string;
  member: string;
  description: string | null;
  description_ko: string | null;
  description_en: string | null;
  image_path: string;
  created_at: string;
  vote_count: number;
}

export async function GET() {
  const db = await getDb();

  const candidatesResult = await db.execute(
    `SELECT c.id, c.title, c.member, c.description, c.description_ko, c.description_en, c.image_path, c.created_at,
            COUNT(v.id) AS vote_count
     FROM candidates c
     LEFT JOIN votes v ON v.candidate_id = c.id
     WHERE c.status = 'approved'
     GROUP BY c.id
     ORDER BY c.created_at DESC`
  );
  const candidates = candidatesResult.rows as unknown as CandidateRow[];

  const configResult = await db.execute(
    "SELECT start_at, end_at FROM vote_config WHERE id = 1"
  );
  const config = (configResult.rows[0] as unknown as { start_at: string; end_at: string }) ?? null;

  const memberTotals: Record<string, number> = {};
  candidates.forEach((c) => {
    memberTotals[c.member] = (memberTotals[c.member] ?? 0) + c.vote_count;
  });

  const results = candidates.map((c) => ({
    id: c.id,
    title: c.title,
    member: c.member,
    description: c.description,
    description_ko: c.description_ko,
    description_en: c.description_en,
    image_path: c.image_path,
    created_at: c.created_at,
    vote_rank: c.vote_count,
    percent: memberTotals[c.member] > 0 ? Math.round((c.vote_count / memberTotals[c.member]) * 1000) / 10 : 0,
  }));

  return NextResponse.json({ results, config });
}

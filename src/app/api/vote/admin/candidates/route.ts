import { NextResponse } from "next/server";
import { getDb } from "@/lib/voteDb";

export const dynamic = "force-dynamic";

interface CandidateRow {
  id: number;
  title: string;
  member: string;
  description: string | null;
  image_path: string;
  created_at: string;
  vote_count: number;
  status: string;
}

export async function GET() {
  const db = await getDb();
  const result = await db.execute(
    `SELECT c.id, c.title, c.member, c.description, c.image_path, c.created_at, c.status,
            COUNT(v.id) AS vote_count
     FROM candidates c
     LEFT JOIN votes v ON v.candidate_id = c.id
     GROUP BY c.id
     ORDER BY c.created_at DESC`
  );
  const candidates = result.rows as unknown as CandidateRow[];
  return NextResponse.json({ candidates });
}

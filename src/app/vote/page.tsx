import { VotePanel, type VoteItem } from "@/components/VotePanel";

export const revalidate = 3600;

async function fetchVoteItems(): Promise<VoteItem[]> {
  const csvUrl = process.env.VOTE_SHEET_CSV_URL;
  if (!csvUrl) return [];

  try {
    const res = await fetch(csvUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const text = await res.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const now = new Date();

    // Columns: 카테고리(0) 투표주최(1) 투표이름(2) 투표페이지(3) 마감날짜(4) 링크(5) 후보(6) 순위(7) 퍼센트(8)
    return lines.slice(1).flatMap((line) => {
      const cols = parseCSVLine(line);
      if (cols.length < 3) return [];

      const [category, organizer, name, votePage, deadline, link, candidate, rank, percent] =
        cols.map((c) => c.trim());
      if (!name) return [];

      // Supports "YYYY.MM.DD HH:MM" or "YYYY-MM-DD"
      const isActive = (() => {
        if (!deadline) return false;
        const m = deadline.match(/(\d{4})[.\-](\d{2})[.\-](\d{2})(?:\s+(\d{2}):(\d{2}))?/);
        if (!m) return false;
        const deadlineDate = new Date(
          `${m[1]}-${m[2]}-${m[3]}T${m[4] ?? "23"}:${m[5] ?? "59"}:00+09:00`
        );
        return now <= deadlineDate;
      })();

      return [
        {
          category: category ?? "",
          organizer: organizer ?? "",
          name,
          votePage: votePage ?? "",
          deadline: deadline ?? "",
          link: link ?? "",
          candidate: candidate ?? "",
          rank: rank ?? "",
          percent: percent ?? "",
          isActive,
        } satisfies VoteItem,
      ];
    });
  } catch {
    return [];
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export default async function VotePage() {
  const items = await fetchVoteItems();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="mb-6 text-2xl font-bold">투표</h1>
      <VotePanel items={items} guideHref="/guide/prevote?tab=시상식" />
    </main>
  );
}

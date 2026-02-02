import Link from "next/link";
import { FanchantSongGrid } from "@/components/FanchantSongGrid";

export default function CheerPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-6xl px-3 py-10 sm:px-6 sm:py-14">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">응원법</h1>
          </div>
          <Link
            href="/concert"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            <span className="text-sm sm:text-xl" aria-hidden>
              ‹
            </span>
            콘서트 목록
          </Link>
        </div>

        <div className="mt-6">
          <FanchantSongGrid />
        </div>
      </main>
    </div>
  );
}

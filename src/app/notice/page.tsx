import Link from "next/link";
import { announcements } from "@/data/announcements";

export default function NoticePage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">공지사항</h1>
            <p className="mt-2 text-base text-black">콘서트 관련 공지사항을 확인해주세요.</p>
          </div>
          <Link
            href="/concert"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            <span className="text-xl" aria-hidden>
              ‹
            </span>
            콘서트 목록
          </Link>
        </div>

        <section className="mt-6 rounded-2xl border border-foreground/10 bg-white p-5 shadow-sm">
          <ul className="divide-y divide-foreground/10">
            {announcements.map((item) => (
              <li key={item.id} className="py-4">
                <Link href={`/notice/${item.id}`} className="block">
                  <div className="text-sm font-semibold text-foreground">{item.title}</div>
                  <div className="mt-1 text-xs text-foreground/60">{item.date}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

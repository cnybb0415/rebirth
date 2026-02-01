import Link from "next/link";

export default function ConcertPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">콘서트</h1>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link href="/cheer" className="block">
            <div className="flex items-center justify-between rounded-2xl border border-foreground/10 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="text-lg font-semibold">응원법</div>
              <span className="text-foreground/60 text-2xl" aria-hidden>
                ›
              </span>
            </div>
          </Link>
          <Link href="/notice" className="block">
            <div className="flex items-center justify-between rounded-2xl border border-foreground/10 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="text-lg font-semibold">공지사항</div>
              <span className="text-foreground/60 text-2xl" aria-hidden>
                ›
              </span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

import { notFound } from "next/navigation";
import { announcements } from "@/data/announcements";
import { AnnouncementDetailActions } from "@/components/AnnouncementDetailActions";

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = announcements.find((entry) => entry.id === id);

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{item.title}</h1>
            <div className="mt-2 text-sm text-foreground/60">{item.date}</div>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-foreground/10 bg-white p-6 shadow-sm">
          <ul className="space-y-2 text-sm text-foreground/80">
            {item.content.map((line, idx) => (
              <li key={`${item.id}-line-${idx}`}>{line}</li>
            ))}
          </ul>
          {item.images && item.images.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {item.images.map((image, idx) => (
                <div key={`${item.id}-image-${idx}`} className="overflow-hidden rounded-xl">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-auto w-full object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <div className="mt-6 flex justify-end">
          <a
            href="https://m.ticket.melon.com/public/index.html#performance.index?prodId=212768"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-black/90 sm:hidden"
          >
            멜론티켓 바로가기
          </a>
          <a
            href="https://ticket.melon.com/performance/index.htm?prodId=212768"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center justify-center rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-black/90 sm:inline-flex"
          >
            멜론티켓 바로가기
          </a>
        </div>

        <AnnouncementDetailActions />
      </main>
    </div>
  );
}

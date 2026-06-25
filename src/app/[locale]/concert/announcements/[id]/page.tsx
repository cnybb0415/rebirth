import { notFound } from "next/navigation";
import { announcements } from "@/data/announcements";
import { AnnouncementDetailActions } from "@/components/AnnouncementDetailActions";

export default async function AnnouncementDetailPage({
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
          <div className="space-y-3 text-sm text-foreground/80">
            {item.content.map((line, idx) => {
              if (typeof line === "string") {
                return line.trim().length === 0 ? (
                  <div key={`${item.id}-spacer-${idx}`} className="h-3" aria-hidden />
                ) : (
                  <p key={`${item.id}-line-${idx}`}>{line}</p>
                );
              }

              return line.text.trim().length === 0 ? (
                <div key={`${item.id}-spacer-${idx}`} className="h-3" aria-hidden />
              ) : (
                <p key={`${item.id}-line-${idx}`} className={line.emphasis ? "font-semibold" : undefined}>
                  {line.text}
                </p>
              );
            })}
          </div>
          {item.actions && item.actions.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {item.actions.map((action, idx) => (
                <a
                  key={`${item.id}-action-${idx}`}
                  href={action.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-black/90"
                >
                  {action.label}
                </a>
              ))}
            </div>
          ) : null}
        </section>

        <AnnouncementDetailActions />
      </main>
    </div>
  );
}

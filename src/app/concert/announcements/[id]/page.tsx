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
          <ul className="list-disc space-y-2 pl-5 text-sm text-foreground/80">
            {item.content.map((line, idx) => (
              <li key={`${item.id}-line-${idx}`}>{line}</li>
            ))}
          </ul>
        </section>

        <AnnouncementDetailActions />
      </main>
    </div>
  );
}

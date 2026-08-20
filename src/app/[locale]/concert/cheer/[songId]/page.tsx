import { notFound } from "next/navigation";
import { CheerGuideViewer } from "@/components/CheerGuideViewer";
import { getCheeringSongs, getCheeringSongById } from "@/lib/cheering";
import { setRequestLocale } from "next-intl/server";
import s from "./cheer-detail.module.css";

export async function generateStaticParams() {
  const songs = await getCheeringSongs();
  return songs.map((song) => ({ songId: song.slug }));
}

function toYouTubeEmbedUrl(input: string): string {
  try {
    const url = new URL(input);
    const t = url.searchParams.get("t");
    const startParam = t ? `?start=${t}` : "";
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace(/^\//, "").split("/")[0];
      if (id) return `https://www.youtube.com/embed/${id}${startParam}`;
    }
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}${startParam}`;
    }
  } catch { return input; }
  return input;
}

export default async function CheerDetailPage({
  params,
}: {
  params: Promise<{ locale: string; songId: string }>;
}) {
  const { locale, songId } = await params;
  setRequestLocale(locale);
  const song = await getCheeringSongById(songId);
  if (!song) notFound();

  const embedUrl = song.youtubeUrl ? toYouTubeEmbedUrl(song.youtubeUrl) : null;

  return (
    <>
      <div className={s.bg} aria-hidden />
      <div className={s.page}>
        <CheerGuideViewer
          guideByLang={song.guideByLang}
          songLabel={song.label}
          locale={locale}
          embedUrl={embedUrl}
          backHref={`/${locale}/concert/cheer`}
        />
      </div>
    </>
  );
}

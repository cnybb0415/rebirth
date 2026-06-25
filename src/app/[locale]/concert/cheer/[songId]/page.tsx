import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { BinderPage, BinderHeading } from "@/components/concert/BinderPage";
import { CheerMiniPlayer } from "@/components/CheerMiniPlayer";
import { CheerGuideViewer } from "@/components/CheerGuideViewer";
import { getCheeringSongs, getCheeringSongById } from "@/lib/cheering";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateStaticParams() {
  const songs = await getCheeringSongs();
  return songs.map((s) => ({ songId: s.slug }));
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
  } catch {
    return input;
  }

  return input;
}

const ACCENT = "#ff4d8d";

export default async function CheerDetailPage({
  params,
}: {
  params: Promise<{ locale: string; songId: string }>;
}) {
  const { locale, songId } = await params;
  setRequestLocale(locale);
  const [song, t] = await Promise.all([getCheeringSongById(songId), getTranslations("concert")]);
  if (!song) notFound();

  const embedUrl = song.youtubeUrl ? toYouTubeEmbedUrl(song.youtubeUrl) : null;

  return (
    <BinderPage activeTab="cheer" pixelFontFamily="'Mulmaru', 'PFStarDust', monospace" locale={locale}>
      <div className="pt-1 pb-6">
        <BinderHeading
          emoji="📣"
          title={song.label}
          subtitle="CHEER GUIDE"
          accentColor={ACCENT}
        />

        <Link
          href="/concert/cheer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.55rem",
            letterSpacing: "0.2em",
            color: "rgba(255,77,141,0.7)",
            fontWeight: 700,
            marginBottom: "14px",
          }}
        >
          {t("backToList")}
        </Link>

        <CheerGuideViewer
          guideByLang={song.guideByLang}
          songLabel={song.label}
          locale={locale}
        />

        {embedUrl && <CheerMiniPlayer songLabel={song.label} embedUrl={embedUrl} />}
      </div>
    </BinderPage>
  );
}

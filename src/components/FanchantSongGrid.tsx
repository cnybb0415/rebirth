import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getCheeringSongs } from "@/lib/cheering";
import { getTranslations } from "next-intl/server";

export async function FanchantSongGrid({
  variant = "grid",
  hrefBase = "/concert/cheer",
}: {
  variant?: "grid" | "list";
  hrefBase?: string;
}) {
  const t = await getTranslations("concert");
  const gridClassName =
    variant === "list" ? "grid gap-3" : "grid gap-3 sm:grid-cols-2";

  const songs = await getCheeringSongs();

  return (
    <div className={gridClassName}>
      {songs.map((song) => {
        const cover = song.coverSrc;
        const disabled = !song.hasGuide;

        const card = (
          <Card
            className={
              "group overflow-hidden transition " +
              (disabled
                ? "cursor-not-allowed border-foreground/10 opacity-80"
                : "hover:border-foreground/25")
            }
          >
            <CardContent className="p-0">
              <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 p-4">
                <div className="overflow-hidden rounded-xl border border-foreground/10 bg-white">
                  <div className="relative h-24 w-24">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt={`${song.label} 커버`}
                        className={
                          "h-24 w-24 object-cover transition " +
                          (disabled ? "opacity-40" : "opacity-100")
                        }
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-24 w-24 bg-gradient-to-br from-foreground/5 to-foreground/10" />
                    )}

                    {disabled ? (
                      <div className="absolute inset-0 grid place-items-center">
                        <span className="rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold text-white">
                          {t("preparing")}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="mt-1 truncate text-base font-semibold">
                    {song.label}
                  </div>

                  <div className="mt-3 text-sm text-foreground/70">
                    {disabled ? t("preparing") : t("viewCheerGuide")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

        if (disabled) {
          return (
            <div
              key={song.id}
              className="block"
              aria-disabled="true"
              tabIndex={-1}
            >
              {card}
            </div>
          );
        }

        return (
          <Link
            key={song.id}
            href={`${hrefBase}/${encodeURIComponent(song.slug)}`}
            className="block"
          >
            {card}
          </Link>
        );
      })}
    </div>
  );
}

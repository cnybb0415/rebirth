import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { StreamingCategoryContent } from "@/components/StreamingCategoryContent";
import { getStreamingCategory, streamingCategories, StreamingCategoryId } from "@/lib/streamingCategories";

export default async function StreamingCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category: categoryId } = await params;
  setRequestLocale(locale);
  const category = getStreamingCategory(categoryId);
  if (!category) return notFound();

  const t = await getTranslations("streaming");
  const tnav = await getTranslations("nav");

  const catLabels: Record<StreamingCategoryId, string> = {
    recommended: t("cat.recommended"),
    oneclick: t("cat.oneclick"),
    links: t("cat.links"),
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-2xl font-bold">{catLabels[category.id]}</h1>
        <Link
          href="/streaming"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
        >
          <span className="text-sm sm:text-xl" aria-hidden>
            ‹
          </span>
          {tnav("streaming")}
        </Link>
      </div>
      <p className="mt-2 text-sm text-foreground/70">{category.description}</p>

      <div className="mt-6">
        <StreamingCategoryContent categoryId={category.id} />
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return streamingCategories.map((category) => ({ category: category.id }));
}

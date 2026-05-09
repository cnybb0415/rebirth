import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { GuideCategoryContent } from "@/components/GuideCategoryContent";
import { guideCategories, getGuideCategory, GuideCategoryId } from "@/lib/guideCategories";

export default async function GuideCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string }>;
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  setRequestLocale(resolvedParams.locale);
  const category = getGuideCategory(resolvedParams.category);
  if (!category) return notFound();
  const tnav = await getTranslations("nav");
  const tguide = await getTranslations("guide");

  const catLabels: Record<GuideCategoryId, string> = {
    streaming: tguide("cat.streaming"),
    download: tguide("cat.download"),
    signup: tguide("cat.signup"),
    gift: tguide("cat.gift"),
    mv: tguide("cat.mv"),
    prevote: tguide("cat.prevote"),
  };

  const tabParam = resolvedSearch?.tab;
  const initialTab = typeof tabParam === "string" ? tabParam : undefined;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-2xl font-bold">{catLabels[category.id]}</h1>
        <Link
          href="/guide"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
        >
          <span className="text-sm sm:text-xl" aria-hidden>
            ‹
          </span>
          {tnav("guide")}
        </Link>
      </div>
      <p className="mt-2 text-sm text-foreground/70">{category.description}</p>

      <div className="mt-6">
        <GuideCategoryContent categoryId={category.id} initialTab={initialTab} />
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return guideCategories.map((category) => ({ category: category.id }));
}

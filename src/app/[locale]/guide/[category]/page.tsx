import { PageHeader } from "@/components/PageHeader";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { GuideCategoryContent } from "@/components/GuideCategoryContent";
import { guideCategories, getGuideCategory, GuideCategoryId } from "@/lib/guideCategories";

export default async function GuideCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const resolvedParams = await params;
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

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader back={{ href: "/guide", label: tnav("guide") }} title={catLabels[category.id]} />
      {category.description ? <p className="mt-1.5 text-sm text-foreground/60">{category.description}</p> : null}

      <div className="mt-6">
        <GuideCategoryContent categoryId={category.id} />
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return guideCategories.map((category) => ({ category: category.id }));
}

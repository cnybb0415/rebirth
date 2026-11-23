import { PageHeader } from "@/components/PageHeader";
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
      <PageHeader back={{ href: "/streaming", label: tnav("streaming") }} title={catLabels[category.id]} />
      {category.description ? <p className="mt-1.5 text-sm text-foreground/60">{category.description}</p> : null}

      <div className="mt-6">
        <StreamingCategoryContent categoryId={category.id} />
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return streamingCategories.map((category) => ({ category: category.id }));
}

import Link from "next/link";
import { notFound } from "next/navigation";

import { GuideCategoryContent } from "@/components/GuideCategoryContent";
import { guideCategories, getGuideCategory } from "@/lib/guideCategories";

export default async function GuideCategoryPage({
  params,
  searchParams,
}: {
  params: { category: string } | Promise<{ category: string }>;
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const category = getGuideCategory(resolvedParams.category);
  if (!category) return notFound();

  const tabParam = resolvedSearch?.tab;
  const initialTab = typeof tabParam === "string" ? tabParam : undefined;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-2xl font-bold">{category.label}</h1>
        <Link
          href="/guide"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
        >
          <span className="text-sm sm:text-xl" aria-hidden>
            ‹
          </span>
          가이드 목록
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

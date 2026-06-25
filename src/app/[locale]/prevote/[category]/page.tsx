import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";

import { PrevoteCategoryContent } from "@/components/PrevoteCategoryContent";
import { PrevoteQuickLinks } from "@/components/PrevoteQuickLinks";
import { getPrevoteCategory, prevoteCategories } from "@/lib/prevoteCategories";

export default async function PrevoteCategoryPage({
  params,
}: {
  params: { category: string } | Promise<{ category: string }>;
}) {
  const resolvedParams = await params;
  const category = getPrevoteCategory(resolvedParams.category);
  if (!category) return notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-bold">음악방송 사전투표</h1>
      <PrevoteQuickLinks />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold">{category.label}</h2>
        <Link href="/prevote" className="text-sm text-foreground/70 hover:text-foreground">
          사전투표 목록으로
        </Link>
      </div>
      <p className="mt-2 text-sm text-foreground/70">{category.description}</p>

      <div className="mt-6">
        <PrevoteCategoryContent categoryId={category.id} />
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return prevoteCategories.map((category) => ({ category: category.id }));
}

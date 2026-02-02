import Link from "next/link";
import { notFound } from "next/navigation";

import { StreamingCategoryContent } from "@/components/StreamingCategoryContent";
import { getStreamingCategory, streamingCategories } from "@/lib/streamingCategories";

export default async function StreamingCategoryPage({
  params,
}: {
  params: { category: string } | Promise<{ category: string }>;
}) {
  const resolvedParams = await params;
  const category = getStreamingCategory(resolvedParams.category);
  if (!category) return notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-2xl font-bold">{category.label}</h1>
        <Link
          href="/streaming"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
        >
          <span className="text-sm sm:text-xl" aria-hidden>
            ‹
          </span>
          스트리밍 목록
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

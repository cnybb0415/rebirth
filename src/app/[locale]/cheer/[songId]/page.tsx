import { redirect } from "next/navigation";

export default async function CheerDetailRedirect({
  params,
}: {
  params: Promise<{ songId: string }>;
}) {
  const { songId } = await params;
  redirect(`/concert/cheer/${encodeURIComponent(songId)}`);
}

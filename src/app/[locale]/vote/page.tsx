import { setRequestLocale } from "next-intl/server";
import { VoteClient } from "./VoteClient";

export const dynamic = "force-dynamic";

export default async function VotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <VoteClient />;
}

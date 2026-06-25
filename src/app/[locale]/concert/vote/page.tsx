import { BinderPage, BinderHeading } from "@/components/concert/BinderPage";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { VoteBinderClient } from "./VoteBinderClient";

export const dynamic = "force-dynamic";

const ACCENT = "#a3e635";

export default async function ConcertVotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await getTranslations("concert");

  return (
    <BinderPage activeTab="vote" pixelFontFamily="'PFStarDust', monospace" locale={locale}>
      <BinderHeading
        emoji="🗳️"
        title="아바타스타 엑소"
        subtitle="AVATAR STAR EXO"
        accentColor={ACCENT}
      />
      <VoteBinderClient />
    </BinderPage>
  );
}

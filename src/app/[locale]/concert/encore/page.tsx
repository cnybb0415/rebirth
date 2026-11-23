import { setRequestLocale } from "next-intl/server";
import { EncoreMenuClient } from "./EncoreMenuClient";

export default async function EncorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 콘서트 종료 후 다이어리는 내리고 원래 앙코르 화면으로 (다이어리는 /concert/encore/diary 에 남겨 둠)
  return <EncoreMenuClient />;
}

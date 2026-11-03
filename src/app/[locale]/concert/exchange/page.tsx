import { setRequestLocale } from "next-intl/server";
import { ExchangeBoard } from "@/components/concert/ExchangeBoard";

export default async function ConcertExchangePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ExchangeBoard />;
}

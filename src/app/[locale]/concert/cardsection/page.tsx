import { setRequestLocale } from "next-intl/server";
import { CardSectionFinder } from "@/components/concert/CardSectionFinder";

export default async function ConcertCardSectionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CardSectionFinder />;
}

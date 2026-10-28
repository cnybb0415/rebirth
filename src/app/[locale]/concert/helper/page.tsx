import { HelperWizard } from "@/components/concert/HelperWizard";
import { setRequestLocale } from "next-intl/server";

export default async function ConcertHelperPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HelperWizard />;
}

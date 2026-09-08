import { setRequestLocale } from "next-intl/server";
import { FundingPage } from "@/components/concert/FundingPage";
import { getFundingConfig } from "@/lib/adminDb";
import fs from "fs";
import path from "path";

export const revalidate = 30;

// 파일명에 포함된 키워드로 locale 매칭
const LOCALE_KEYWORDS: Record<string, string[]> = {
  ko: ["한국어", "_ko", "notice_ko", "ko_"],
  zh: ["중국어", "_zh", "notice_zh", "zh_"],
  en: ["영어", "_en", "notice_en", "en_"],
  ja: ["일본어", "_ja", "_jp", "notice_ja", "notice_jp", "ja_", "jp_"],
};

function getNoticeImages(locale: string): { src: string; alt?: string }[] {
  try {
    const dir = path.join(process.cwd(), "public/images/concert/funding");
    const files = fs.readdirSync(dir);
    const keywords = LOCALE_KEYWORDS[locale] ?? LOCALE_KEYWORDS["ko"];
    return files
      .filter((f) =>
        keywords.some((kw) => f.includes(kw)) &&
        /\.(jpe?g|png|gif|webp)$/i.test(f)
      )
      .sort()
      .map((f) => ({
        src: `/images/concert/funding/${encodeURIComponent(f)}`,
        alt: f.replace(/\.\w+$/, ""),
      }));
  } catch {
    return [];
  }
}

export default async function ConcertFundingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const raw = await getFundingConfig().catch(() => null);
  const noticeImages = getNoticeImages(locale);

  const config = {
    percent: raw?.percent ?? 0,
    deadline: raw?.deadline ?? "",
    form_url: raw?.form_url ?? "",
    notice_images: noticeImages,
  };

  return <FundingPage config={config} />;
}

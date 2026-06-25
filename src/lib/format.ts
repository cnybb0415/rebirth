export function formatCompactNumber(value: number, locale = "ko"): string {
  const intlLocale =
    locale === "zh" ? "zh-CN" :
    locale === "ja" ? "ja-JP" :
    locale === "en" ? "en-US" :
    "ko-KR";
  return new Intl.NumberFormat(intlLocale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatIsoDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

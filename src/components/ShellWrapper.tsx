"use client";

import { usePathname } from "@/i18n/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooterNav } from "@/components/SiteFooterNav";
import { HomeVotePopup } from "@/components/HomeVotePopup";
import { isDiaryOpen } from "@/data/diary";

// 투표 광고 팝업을 띄우지 않을 페이지: 다이어리(미리보기 + 11/8 21시 이후 encore), 어드민,
// EXO.zip(다운로드 버튼에 같은 광고가 이미 있어서 두 번 보이지 않게)
const noPopup = (pathname: string) =>
  pathname.startsWith("/concert/encore/diary") ||
  pathname.startsWith("/admin") ||
  pathname.startsWith("/lab") ||
  (pathname === "/concert/encore" && isDiaryOpen());

export function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isQR = pathname.startsWith("/QR") || /^\/concert\/encore\/(event\/)?day\d+$/.test(pathname);

  // QR 페이지는 헤더·푸터·팝업 없이 내용만
  if (isQR) {
    return <>{children}</>;
  }

  return (
    <>
      {!noPopup(pathname) && <HomeVotePopup />}
      <SiteHeader />
      <div className="pb-24">{children}</div>
      <SiteFooterNav />
    </>
  );
}

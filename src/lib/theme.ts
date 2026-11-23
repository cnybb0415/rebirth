// 크라운 다크 테마를 쓰지 않는 페이지: 콘서트(공지·응원법 포함)와 어드민
export const isLightOnlyPath = (pathname: string) =>
  pathname.startsWith("/concert") ||
  pathname.startsWith("/notice") ||
  pathname.startsWith("/cheer") ||
  pathname.startsWith("/admin");

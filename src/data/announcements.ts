export type AnnouncementContentLine = string | { text: string; emphasis?: boolean };

export type AnnouncementItem = {
  id: string;
  title: string;
  localizedTitles?: { en?: string; zh?: string; ja?: string };
  date: string;
  content: AnnouncementContentLine[];
  images?: Array<{ src: string; alt: string }>;
  localizedImages?: Array<{
    label: string;
    images: Array<{ src: string; alt: string }>;
    content?: AnnouncementContentLine[];
  }>;
  actions?: Array<{ label: string; href: string }>;
  ticketLinks?: { mobile: string; desktop: string };
};

export function getAnnouncementTitle(item: AnnouncementItem, locale: string): string {
  if (locale === "en") return item.localizedTitles?.en ?? item.title;
  if (locale === "zh") return item.localizedTitles?.zh ?? item.title;
  if (locale === "ja") return item.localizedTitles?.ja ?? item.title;
  return item.title;
}

export const announcements: AnnouncementItem[] = [
  {
    id: "1",
    title: "[공지] EXO PLANET #6 - EXhOrizon [dot] INFO",
    date: "2026.08.23",
    content: ["좌석배치도 및 타임테이블 일정 공유"],
    images: [
      {
        src: "/images/concert/notice/encore/01-1 좌배도.jpg",
        alt: "EXO PLANET #6 - EXhOrizon [dot] 좌석배치도",
      },
      {
        src: "/images/concert/notice/encore/01-2 타임테이블.jpg",
        alt: "EXO PLANET #6 - EXhOrizon [dot] 타임테이블",
      },
    ],
  },
];

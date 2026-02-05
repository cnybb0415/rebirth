export type AnnouncementItem = {
  id: string;
  title: string;
  date: string;
  content: string[];
  images?: Array<{ src: string; alt: string }>;
};

export const announcements: AnnouncementItem[] = [
  {
    id: "1",
    title: "[공지] EXO PLANET #6 - EXhOrizon in SEOUL INFO",
    date: "2026.02.04",
    content: ["좌석배치도 및 타임테이블 일정 공유"],
    images: [
      {
        src: "/images/concert/notice/01.%EC%A2%8C%EB%B0%B0%EB%8F%84.jpg",
        alt: "EXO PLANET #6 - EXhOrizon in SEOUL 좌석배치도",
      },
      {
        src: "/images/concert/notice/02.%ED%83%80%EC%9E%84%ED%85%8C%EC%9D%B4%EB%B8%94jpg.jpg",
        alt: "EXO PLANET #6 - EXhOrizon in SEOUL 타임테이블",
      },
    ],
  },
];

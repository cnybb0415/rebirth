export type AnnouncementContentLine = string | { text: string; emphasis?: boolean };

export type AnnouncementItem = {
  id: string;
  title: string;
  date: string;
  content: AnnouncementContentLine[];
  images?: Array<{ src: string; alt: string }>;
  actions?: Array<{ label: string; href: string }>;
  ticketLinks?: { mobile: string; desktop: string };
};

export const announcements: AnnouncementItem[] = [
  {
    id: "2",
    title: "[공지] 떼창 투표 & 슬로건 문구 모집 안내 (~2/18 17:00 마감)",
    date: "2026.02.13",
    content: [
      { text: "📢 떼창 투표 & 슬로건 문구 모집 안내 (~2/18 17:00 마감)", emphasis: true },
      "",
      "EXO PLANET #6 - EXhOrizon에서 진행될",
      "떼창곡 투표 및 슬로건 문구 모집을 진행합니다.",
      "",
      "떼창 후보 곡은 비교적 여러번 진행되었던 곡, 박자 합 맞추기가 어려운 곡들을 최대한 제외하여 구성하였습니다.",
      { text: "슬로건 문구는 내부 논의를 거쳐 최종 확정되며, 운영 여건에 따라 일부 수정될 수 있습니다.", emphasis: true },
      "",
      { text: "엑소엘분들의 많은 참여 부탁드립니다. 🩶", emphasis: true },
      "본 이벤트는 사측과 협의 후 진행됩니다.",
      "하단 버튼을 클릭하시면 바로 폼으로 이동 가능합니다.",
    ],
    actions: [
      { label: "떼창곡 투표", href: "https://forms.gle/zjJB9nfMw8JTSH9N6" },
      { label: "슬로건 문구", href: "https://forms.gle/nTAxbiEwCoBZTbsc9" },
    ],
  },
  {
    id: "1",
    title: "[공지] EXO PLANET #6 - EXhOrizon in SEOUL INFO",
    date: "2026.02.04",
    content: ["좌석배치도 및 타임테이블 일정 공유"],
    ticketLinks: {
      mobile: "https://m.ticket.melon.com/public/index.html#performance.index?prodId=212768",
      desktop: "https://ticket.melon.com/performance/index.htm?prodId=212768",
    },
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

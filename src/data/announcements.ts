export type AnnouncementItem = {
  id: string;
  title: string;
  date: string;
  content: string[];
};

export const announcements: AnnouncementItem[] = [
  {
    id: "4",
    title: "[공지] 📢 팬 이벤트 아이디어 모집 안내",
    date: "2026-02-01",
    content: [
      "엑소 여섯 번째 단독 콘서트 투어 ‘EXhOrizon’ 개최를 맞아 팬 이벤트 아이디어를 모집합니다.",
      "엑소엘의 아이디어로 EXO 콘서트를 더 특별하게 만들어 주세요. ✨",
      "아래 링크를 통해 폼 작성 부탁드립니다.",
      "※ 접수된 아이디어는 내부 검토 후 진행 여부가 결정됩니다.",
    ],
  },
];

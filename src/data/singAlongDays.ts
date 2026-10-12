// 날짜별 확정 떼창곡 — 가사지 폴더(public/images/concert/encore/sing-along/가사지)의
// {songId}_{lang}.png 파일명과 songId가 일치해야 함
export type SingAlongDay = {
  day: 1 | 2 | 3;
  songId: string;
  title: string;
  youtubeId: string;
};

export const singAlongDays: SingAlongDay[] = [
  { day: 1, songId: "tender_love", title: "TENDER LOVE", youtubeId: "Bp1ZZ62QKV0" },
  { day: 2, songId: "girlxfriend", title: "Girl x Friend", youtubeId: "-VuVm8DLiv0" },
  { day: 3, songId: "발자국", title: "발자국(On the snow)", youtubeId: "ceHo4qFYqGQ" },
];

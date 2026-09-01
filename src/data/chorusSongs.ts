export type ChorusSong = {
  id: string;
  title: string;
  artist: string;
  itunesQuery: string;
};

export type ChorusDay = {
  day: 1 | 2;
  label: string;
  date: string;
  songs: ChorusSong[];
};

// 투표 기간: 9월 2일 12:00 KST ~ 9월 4일 23:59 KST
export const VOTE_START = new Date("2026-09-01T00:00:00Z"); // 테스트용 — 원래: 9/2 12:00 KST
export const VOTE_END   = new Date("2026-09-04T14:59:59Z"); // 23:59:59 KST

export function isVotingOpen(): boolean {
  const now = new Date();
  return now >= VOTE_START && now <= VOTE_END;
}

export const chorusDays: ChorusDay[] = [
  {
    day: 1,
    label: "비주류 클럽",
    date: "",
    songs: [
      { id: "back-pocket",      title: "Back Pocket",               artist: "EXO", itunesQuery: "EXO-CBX Back Pocket" },
      { id: "boomerang",        title: "Boomerang",                 artist: "EXO", itunesQuery: "EXO-CBX Boomerang" },
      { id: "butterfly-effect", title: "나비효과 (Butterfly Effect)", artist: "EXO", itunesQuery: "EXO 나비효과" },
      { id: "history",          title: "History",                   artist: "EXO", itunesQuery: "EXO History" },
      { id: "lovefool",         title: "Lovefool",                  artist: "EXO", itunesQuery: "EXO-CBX Lovefool" },
      { id: "mama",             title: "MAMA",                      artist: "EXO", itunesQuery: "EXO MAMA" },
      { id: "non-stop",         title: "Non-Stop",                  artist: "EXO", itunesQuery: "EXO-CBX Non-Stop" },
      { id: "paradise",         title: "파라다이스 (Paradise)",       artist: "EXO", itunesQuery: "EXO 파라다이스" },
      { id: "tender-love",      title: "Tender Love",               artist: "EXO", itunesQuery: "EXO-CBX Tender Love" },
    ],
  },
  {
    day: 2,
    label: "미리메리크리스마스",
    date: "",
    songs: [
      { id: "christmas-day",       title: "Christmas Day",             artist: "EXO", itunesQuery: "EXO Christmas Day" },
      { id: "falling-for-you",     title: "Falling for You",           artist: "EXO", itunesQuery: "EXO Falling for You" },
      { id: "footprint",           title: "발자국 (Footprint)",         artist: "EXO", itunesQuery: "EXO 발자국" },
      { id: "girlfriend",          title: "Girl x Friend",             artist: "EXO", itunesQuery: "EXO Girl x Friend" },
      { id: "im-home",             title: "I'm Home",                  artist: "EXO", itunesQuery: "EXO I'm Home" },
      { id: "my-turn-to-cry",      title: "My Turn to Cry",            artist: "EXO", itunesQuery: "EXO-CBX My Turn to Cry" },
      { id: "unfair",              title: "Unfair (불공평해)",          artist: "EXO", itunesQuery: "EXO-CBX Unfair" },
      { id: "wait",                title: "Wait",                      artist: "EXO", itunesQuery: "EXO Wait" },
      { id: "what-i-fall-for-xmas", title: "What I Want for Christmas", artist: "EXO", itunesQuery: "EXO-CBX What I Want for Christmas" },
    ],
  },
];

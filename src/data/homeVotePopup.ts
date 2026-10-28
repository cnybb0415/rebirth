// 메인 화면 투표 광고 팝업 설정 (2026 MAMA 팬스 초이스 2차)
// - 링크·문구·기간은 여기서만 고치면 팝업에 그대로 반영됨

export const MAMA_VOTE = {
  // Mnet Plus 투표 페이지 (앱이 있으면 앱으로 열림)
  voteUrl:
    "https://mnetplus.world/event/2026-mama?deeplink=mnetplus%3A%2F%2Fvote%2Ftemplates%2Fmama-fans-choice-vote-r2-v2%2F6acecda6f3778e1b06f5170b%3Furl_fallback_type%3Dupdate&missionType=MAMA_2026_FANS_CHOICE_VOTE_2ND_SHARE&refererCode=",

  // X 해시태그 투표: 두 태그가 모두 있어야 유효, 다른 아티스트 태그가 같이 있으면 무효
  hashtags: ["#2026MAMAVOTE", "#EXO"],
  // X 글쓰기 창에 미리 채워질 문구 (해시태그는 끝에 자동으로 붙음)
  postText: {
    ko: "EXO에게 2026 MAMA 팬스 초이스 투표 🗳️\n매일 잊지 말고 함께 투표해요! 🩶",
    en: "Voting for EXO at the 2026 MAMA Fans' Choice 🗳️\nDon't forget to vote every day! 🩶",
  },

  period: { ko: "10월 28일 18:00 ~ 11월 8일 23:59 (KST)", en: "Oct 28 18:00 – Nov 8 23:59 (KST)" },
  endsAt: "2026-11-08T23:59:59+09:00",

  // 팝업 맨 위에 보이는 메인 이미지
  mainImage: "/images/home/popup/mama_main.webp",
  // "투표 방법 자세히 보기"에서 넘겨 보는 이미지
  howToImages: [
    "/images/home/popup/mama_howto2.webp",
    "/images/home/popup/mama_howto3.webp",
    "/images/home/popup/mama_howto4.webp",
  ],
};

const text = (lang: "ko" | "en") => `${MAMA_VOTE.postText[lang]}\n\n${MAMA_VOTE.hashtags.join(" ")}`;

// 누르면 X 글쓰기 창이 문구+해시태그가 채워진 채로 열림 (게시는 사용자가 직접 누름)
export const xComposeUrl = (lang: "ko" | "en") => `https://x.com/intent/post?text=${encodeURIComponent(text(lang))}`;

// 두 해시태그가 모두 들어간 최신 글 검색 (재게시도 유효 투표로 인정됨)
export const xSearchUrl = `https://x.com/search?q=${encodeURIComponent(MAMA_VOTE.hashtags.join(" "))}&f=live`;

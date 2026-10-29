// 앙콘 헬퍼모집 설정
// - 날짜·역할을 바꾸면 신청서 화면과 구글시트로 보내는 값이 같이 바뀜
// - 좌석 입력은 needsSeat 역할을 고른 경우 선택한 날짜마다 받음

export type HelperDate = { id: "d7" | "d8"; label: string };
export type HelperRole = {
  id: string;
  label: string;
  guideImage: string;
  needsSeat: boolean;
  // 첫 화면에 보여줄 공지 요약 (공지 이미지와 같은 내용)
  summary: { headcount: string; condition: string; meet: string };
};

export const HELPER_DATES: HelperDate[] = [
  { id: "d7", label: "11월 7일(토)" },
  { id: "d8", label: "11월 8일(일)" },
];

export const HELPER_ROLES: HelperRole[] = [
  {
    id: "placement",
    label: "카드섹션 배치 도우미",
    guideImage: "/images/concert/encore/helper/placement.webp",
    needsSeat: false,
    summary: { headcount: "회차당 25명", condition: "티켓 소지 여부 상관없이 누구나", meet: "오전 7시 20분" },
  },
  {
    id: "lightstick",
    label: "카드섹션 경광봉 도우미",
    guideImage: "/images/concert/encore/helper/lightstick.webp",
    needsSeat: true,
    summary: { headcount: "회차당 5명", condition: "공연 당일 1~2층 좌석 티켓 소지자", meet: "콘서트 1시간 전" },
  },
];

export const HELPER_PRIVACY = [
  "콘서트 이벤트 헬퍼를 위한 연락용 연락처, 이메일을 수집·이용하는 것에 동의합니다.",
  "수집된 정보는 세부 일정 및 진행 방법 전달을 위한 연락 목적 외에는 사용되지 않으며 콘서트 이후 전부 폐기처리됩니다.",
];

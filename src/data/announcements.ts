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
    id: "3",
    title: "[공지] 콘서트 관람 유의사항",
    localizedTitles: {
      en: "[Notice] Concert Attendance Guidelines",
      zh: "[公告] 演唱会观看注意事项",
      ja: "[お知らせ] コンサート観覧の注意事項",
    },
    date: "2026.04.09",
    content: ["자세한 내용은 사진 참고 부탁드리며, 모두가 즐겁게 공연을 즐길 수 있도록 배려 부탁드립니다."],
    localizedImages: [
      {
        label: "한국어",
        content: ["자세한 내용은 사진 참고 부탁드리며, 모두가 즐겁게 공연을 즐길 수 있도록 배려 부탁드립니다."],
        images: [{ src: "/images/concert/notice/03-1 한국어.jpg", alt: "공지 03 한국어" }],
      },
      {
        label: "English",
        content: ["Please refer to the image for details. We kindly ask for your cooperation so that everyone can enjoy the concert."],
        images: [{ src: "/images/concert/notice/03-2 영어.jpg", alt: "공지 03 English" }],
      },
      {
        label: "中文",
        content: ["详细内容请参考图片。希望大家互相体谅，让所有人都能愉快地享受演出。"],
        images: [{ src: "/images/concert/notice/03-3 중국어.jpg", alt: "公告 03 中文" }],
      },
      {
        label: "日本語",
        content: ["詳細は画像をご参照ください。皆が楽しくコンサートを楽しめるよう、ご配慮をお願いいたします。"],
        images: [{ src: "/images/concert/notice/03-4 일본어.jpg", alt: "お知らせ 03 日本語" }],
      },
    ],
  },
  {
    id: "2",
    title: "[공지] EXO PLANET #6 - EXhOrizon 팬 이벤트 모금 공지",
    localizedTitles: {
      en: "[Notice] EXO PLANET #6 - EXhOrizon Fan Event Fundraising",
      zh: "[公告] EXO PLANET #6 - EXhOrizon 粉丝活动募款公告",
      ja: "[お知らせ] EXO PLANET #6 - EXhOrizon ファンイベント募金のお知らせ",
    },
    date: "2026.02.23",
    content: [
      "자세한 내용은 사진 참고 부탁드리며 아래 버튼 클릭 시 송금 앱으로 바로 연결됩니다.",
    ],
    actions: [
      {
        label: "TOSS",
        href: "supertoss://send?bank=토스뱅크&accountNo=100159180057",
      },
      { label: "PAYPAL", href: "https://paypal.me/EXOREBIRTH" },
    ],
    localizedImages: [
      {
        label: "한국어",
        content: ["자세한 내용은 사진 참고 부탁드리며 아래 버튼 클릭 시 송금 앱으로 바로 연결됩니다."],
        images: [{ src: "/images/concert/notice/02-1 한국어.jpg", alt: "EXhOrizon 팬 이벤트 모금 안내 한국어" }],
      },
      {
        label: "English",
        content: ["Please refer to the image for details. Click the button below to open the transfer app directly."],
        images: [{ src: "/images/concert/notice/02-2 영어.jpg", alt: "EXhOrizon fan event fundraising notice English" }],
      },
      {
        label: "中文",
        content: ["详细内容请参考图片。点击下方按钮可直接打开转账应用。"],
        images: [{ src: "/images/concert/notice/02-3 중국어.jpg", alt: "EXhOrizon 粉丝活动募款公告 中文" }],
      },
      {
        label: "日本語",
        content: ["詳細は画像をご参照いただき、下のボタンをクリックすると送金アプリが直接開きます。"],
        images: [{ src: "/images/concert/notice/02-4 일본어.jpg", alt: "EXhOrizon ファンイベント募金案内 日本語" }],
      },
    ],
  }, 
  {
    id: "1",
    title: "[공지] EXO PLANET #6 - EXhOrizon in SEOUL INFO",
    localizedTitles: {
      en: "[Notice] EXO PLANET #6 - EXhOrizon in SEOUL INFO",
      zh: "[公告] EXO PLANET #6 - EXhOrizon in SEOUL INFO",
      ja: "[お知らせ] EXO PLANET #6 - EXhOrizon in SEOUL INFO",
    },
    date: "2026.02.04",
    content: ["좌석배치도 및 타임테이블 일정 공유"],
    ticketLinks: {
      mobile: "https://m.ticket.melon.com/public/index.html#performance.index?prodId=212768",
      desktop: "https://ticket.melon.com/performance/index.htm?prodId=212768",
    },
    images: [
      {
        src: "/images/concert/notice/01-1 좌배도.jpg",
        alt: "EXO PLANET #6 - EXhOrizon in SEOUL 좌석배치도",
      },
      {
        src: "/images/concert/notice/01-2 타임테이블.jpg",
        alt: "EXO PLANET #6 - EXhOrizon in SEOUL 타임테이블",
      },
    ],
  },
];

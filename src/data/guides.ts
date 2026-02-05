// 사전투표 가이드 타입
export type VoteGuide = {
  id: string;
  label: string;
  assets: GuideAsset[];
};

export type VoteAppLink = {
  id: string;
  label: string;
  logoSrc?: string;
  actions: Array<{
    id: string;
    label: string;
    href?: string;
    iosHref?: string;
    androidHref?: string;
    webHref?: string;
  }>;
};

export const voteAppLinks: VoteAppLink[] = [
  {
    id: "showchampion",
    label: "쇼챔피언",
    logoSrc: "/images/vote/쇼챔피언/logo/쇼챔피언_logo.png",
    actions: [
      {
        id: "app",
        label: "투표하기",
        iosHref:
          "https://promo-web.idolchamp.com/app_proxy.html?deeplink=https%3A%2F%2Fapp.idolchamp.com%2Fopen%2Fvote%2F01KF5C4HGGN9K997CN27PJXAZE",
        androidHref:
          "intent://app.idolchamp.com/open/vote/01KF5C4HGGN9K997CN27PJXAZE#Intent;scheme=https;package=com.nwz.ichampclient;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end;",
        webHref:
          "https://promo-web.idolchamp.com/app_proxy.html?deeplink=https%3A%2F%2Fapp.idolchamp.com%2Fopen%2Fvote%2F01KF5C4HGGN9K997CN27PJXAZE",
      },
    ],
  },
  {
    id: "mcountdown",
    label: "엠카운트다운",
    logoSrc: "/images/vote/엠카운트다운/logo/엠카운트다운_logo.png",
    actions: [
      {
        id: "app",
        label: "투표하기",
        href: "https://mnetplus.onelink.me/TRa8/t9zck1c1?custom_link_value=vote%2Fv2%2F69701d0818149e25f7f64a4b",
        iosHref: "https://mnetplus.onelink.me/TRa8/t9zck1c1?custom_link_value=vote%2Fv2%2F69701d0818149e25f7f64a4b",
        androidHref: "https://mnetplus.onelink.me/TRa8/t9zck1c1?custom_link_value=vote%2Fv2%2F69701d0818149e25f7f64a4b",
        webHref: "https://mnetplus.onelink.me/TRa8/t9zck1c1?custom_link_value=vote%2Fv2%2F69701d0818149e25f7f64a4b",
      },
    ],
  },
  {
    id: "musicbank",
    label: "뮤직뱅크",
    logoSrc: "/images/vote/뮤직뱅크/logo/뮤직뱅크_logo.png",
    actions: [
      {
        id: "app",
        label: "투표하기",
        href: "https://fancast.go.link/4sLS8",
        iosHref: "https://fancast.go.link/4sLS8",
        androidHref: "https://fancast.go.link/4sLS8",
        webHref: "https://fancast.go.link/4sLS8",
      },
    ],
  },
  {
    id: "musiccore",
    label: "음악중심",
    logoSrc: "/images/vote/음악중심/logo/음악중심_logo.png",
    actions: [
      {
        id: "app",
        label: "투표하기",
        androidHref:
          "intent://applink.info#Intent;scheme=mubeat;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.vlending.apps.mubeat;end;",
      },
    ],
  },
  {
    id: "inkigayo",
    label: "인기가요",
    logoSrc: "/images/vote/인기가요/logo/인기가요_logo.png",
    actions: [
      { id: "link", label: "링크", href: "https://app.linc.fan/31TL/01KF9VV0VVE7GNAN51SAWHRTT6" },
      { id: "higher", label: "하이어", href: "https://myhigher.chottu.link/UGgDXQ" },
    ],
  },
];

export const voteGuides: VoteGuide[] = [
  {
    id: "common",
    label: "공통",
    assets: [
      { type: "image", src: "/images/vote/공통/01.음악방송_사전투표.jpg", alt: "음악방송 사전투표 공통 가이드" },
      { type: "image", src: "/images/vote/공통/02.음악방송_반영비율.png", alt: "음악방송 반영비율 공통 가이드" },
    ],
  },
  {
    id: "showchampion",
    label: "쇼챔피언",
    assets: [
      { type: "image", src: "/images/vote/쇼챔피언/guide/아이돌챔프.png", alt: "쇼챔피언 아이돌챔프 사전투표 가이드" },
    ],
  },
  {
    id: "mcountdown",
    label: "엠카운트다운",
    assets: [
      { type: "image", src: "/images/vote/엠카운트다운/guide/엠넷플러스.png", alt: "엠카운트다운 엠넷플러스 사전투표 가이드" },
    ],
  },
  {
    id: "musicbank",
    label: "뮤직뱅크",
    assets: [
      { type: "image", src: "/images/vote/뮤직뱅크/guide/팬캐스트.png", alt: "뮤직뱅크 팬캐스트 사전투표 가이드" },
    ],
  },
  {
    id: "musiccore",
    label: "음악중심",
    assets: [
      { type: "image", src: "/images/vote/음악중심/guide/뮤빗.png", alt: "음악중심 뮤빗 사전투표 가이드" },
    ],
  },
  {
    id: "inkigayo",
    label: "인기가요",
    assets: [
      { type: "image", src: "/images/vote/인기가요/guide/링크.png", alt: "인기가요 링크 사전투표 가이드" },
      { type: "image", src: "/images/vote/인기가요/guide/하이어.png", alt: "인기가요 하이어 사전투표 가이드" },
    ],
  },
];
export type GuideAsset =
  | { type: "image"; src: string; alt?: string; fallbackSrcs?: string[] }
  | { type: "pdf"; href: string; label?: string };

export type StreamingGuidePart = {
  id: "streaming" | "signup" | "download" | "gift" | "pcver" | "mobilever" | "mv";
  label: string;
  assets: GuideAsset[];
};

export type StreamingGuideService = {
  id: string;
  label: string;
  parts: StreamingGuidePart[];
};

export type CheeringGuideSong = {
  id: string;
  label: string;
  artist?: string;
  coverImageSrc?: string;
  updatedAt?: string;
  assets: GuideAsset[];
};

const defaultStreamingParts = (): StreamingGuidePart[] => [
  { id: "streaming", label: "스트리밍", assets: [] },
  { id: "signup", label: "아이디 생성", assets: [] },
  { id: "download", label: "음원 다운로드", assets: [] },
  { id: "gift", label: "선물하기", assets: [] },
];

const guideImageSrc = (serviceId: string, partFolder: string, filename: string) =>
  `/images/guides/${encodeURIComponent(serviceId)}/${encodeURIComponent(partFolder)}/${encodeURIComponent(filename)}`;

const partFolderById: Record<StreamingGuidePart["id"], string> = {
  streaming: "streaming",
  signup: "idcreate",
  download: "download",
  gift: "gift",
  pcver: "PC",
  mobilever: "모바일",
  mv: "mv",
};

const buildMvPart = (serviceId: string, serviceLabel: string): StreamingGuidePart => ({
  id: "mv",
  label: "뮤직비디오 다운로드",
  assets: [
    {
      type: "image",
      src: guideImageSrc(serviceId, "mv", `${serviceId}_mv.png`),
      alt: `${serviceLabel} 뮤직비디오 다운로드 가이드`,
    },
  ],
});

function buildStreamingParts(serviceId: string, serviceLabel: string): StreamingGuidePart[] {
  return defaultStreamingParts().map((part) => {
    const partFolder = partFolderById[part.id];
    const baseName = `${serviceId}_${partFolder}`;

    const primary = guideImageSrc(serviceId, partFolder, `${baseName}.png`);
    const fallbackSrcs: string[] = [
      guideImageSrc(serviceId, partFolder, `${baseName}.jpg`),
      guideImageSrc(serviceId, partFolder, `${baseName}.jpeg`),
      guideImageSrc(serviceId, partFolder, `${baseName}.webp`),
    ];

    // Backward compatibility for existing example images like "멜론 예시.png" in streaming/
    if (part.id === "streaming" && serviceId !== "common") {
      fallbackSrcs.push(guideImageSrc(serviceId, "streaming", `${serviceLabel} 예시.png`));
    }

    return {
      ...part,
      assets: [
        {
          type: "image",
          src: primary,
          fallbackSrcs,
          alt: `${serviceLabel} ${part.label} 가이드`,
        },
      ],
    };
  });
}

/**
 * 업로드 규칙
 * - 스트리밍: public/images/guides/<service-id>/<part-folder>/...
 *   파일명 규칙: <service-id>_<part-folder>.png (또는 .jpg)
 *   예) /images/guides/melon/streaming/melon_streaming.png
 * - 응원법: public/images/concert/cheering/<song-id>/{guide,album-art}/...
 *   예) /images/concert/cheering/who-are-you/guide/who-are-you.jpg
 */
export const streamingGuideServices: StreamingGuideService[] = [
  // 뮤직비디오: PCver, 모바일ver
  {
    id: "mv",
    label: "뮤직비디오",
    parts: [
      {
        id: "pcver",
        label: "PC",
        assets: [
          { type: "image", src: "/images/guides/뮤직비디오/PC/PC.png", alt: "뮤직비디오 PCver 1" },
          { type: "image", src: "/images/guides/뮤직비디오/PC/PC2.png", alt: "뮤직비디오 PCver 2" },
        ],
      },
      {
        id: "mobilever",
        label: "모바일",
        assets: [
          { type: "image", src: "/images/guides/뮤직비디오/모바일/모바일.png", alt: "뮤직비디오 모바일ver 1" },
          { type: "image", src: "/images/guides/뮤직비디오/모바일/모바일2.png", alt: "뮤직비디오 모바일ver 2" },
        ],
      },
    ],
  },
  // 멜론, 지니, 벅스: 다운로드/기프트/ID생성 등 전체 가이드
  {
    id: "melon",
    label: "멜론",
    parts: [...buildStreamingParts("melon", "멜론"), buildMvPart("melon", "멜론")],
  },
  {
    id: "genie",
    label: "지니",
    parts: buildStreamingParts("genie", "지니").filter((part) => part.id !== "gift"),
  },
  {
    id: "bugs",
    label: "벅스",
    parts: [...buildStreamingParts("bugs", "벅스").filter((part) => part.id !== "gift"), buildMvPart("bugs", "벅스")],
  },
  {
    id: "kakao music",
    label: "카카오뮤직",
    parts: [
      {
        id: "download",
        label: "음원 다운로드",
        assets: [
          {
            type: "image",
            src: guideImageSrc("kakao music", "download", "kakao_download.png"),
            alt: "카카오 뮤직 음원 다운로드 가이드",
          },
        ],
      },
    ],
  },
  // 플로, 바이브: 스트리밍만 남김
  { id: "flo", label: "플로", parts: [buildStreamingParts("flo", "플로")[0]] },
  { id: "vibe", label: "바이브", parts: [buildStreamingParts("vibe", "바이브")[0]] },
];

export const cheeringGuideSongs: CheeringGuideSong[] = [
  {
    id: "who-are-you",
    label: "Who Are You",
    artist: "SUHO",
    coverImageSrc: "/images/concert/cheering/who-are-you/album-art/who-are-you.webp",
    updatedAt: undefined,
    assets: [
      { type: "image", src: "/images/concert/cheering/who-are-you/guide/who-are-you.jpg", alt: "Who Are You 응원법" },
    ],
  },
  {
    id: "medicine",
    label: "Medicine",
    artist: "SUHO",
    coverImageSrc: "/images/concert/cheering/medicine/album-art/medicine.jpg",
    updatedAt: undefined,
    assets: [
      { type: "image", src: "/images/concert/cheering/medicine/guide/medicine.jpg", alt: "Medicine 응원법" },
    ],
  },
  {
    id: "cream-soda",
    label: "Cream Soda",
    artist: "EXO",
    coverImageSrc: "/images/concert/cheering/cream-soda/album-art/cream-soda.jpg",
    updatedAt: undefined,
    assets: [
      { type: "image", src: "/images/concert/cheering/cream-soda/guide/cream-soda.jpg", alt: "Cream Soda 응원법" },
    ],
  },
];

export function getCheeringGuideSong(songId: string | undefined | null) {
  if (!songId) return null;
  const normalize = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, "-")
      .replace(/-+/g, "-");

  const target = normalize(songId);
  return (
    cheeringGuideSongs.find((s) => normalize(s.id) === target) ??
    cheeringGuideSongs.find((s) => normalize(s.label) === target) ??
    null
  );
}

/**
 * 응원법 상세 페이지는 `/cheer/<song-id>` 를 사용합니다.
 */
export function getFanchantPublicHref(songId: string) {
  return `/cheer/${songId}`;
}

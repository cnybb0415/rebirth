export const siteConfig = {
  title: "EXO RE:BIRTH",
  artistName: "EXO",
  trackTitle: "Crown",
  releaseDate: "",

  links: {
    guideUrl: "/guide",
    streamingUrl: "/streaming",
    voteUrl: "/vote",
    // Backward compatibility (older nav/pages may still link here)
    linksUrl: "/links",
  },

  assets: {
    // Fill these later with your images (leave empty to use placeholders)
    cover: {
      src: "",
      alt: "Track cover",
    },
    // Optional: full-page background wallpaper
    wallpaper: {
      // Example: "/images/wallpaper/main.jpg"
      src: "",
      // 0~1, higher = more white overlay (better readability)
      overlayOpacity: 0.2,
    },
    // Optional: 1~2 banner images linking to tweets/announcements
    heroBanners: [] as Array<{ href: string; src: string; alt: string }>,
  },

  youtube: {
    videoId: "BWfKkqo1Mk8",
    url: "https://youtu.be/BWfKkqo1Mk8?si=OSCkEoUdApwZ5SNW",
    embedUrl: "https://www.youtube.com/embed/BWfKkqo1Mk8",
  },

  actions: [
    { label: "원클릭 스트리밍", href: "#", kind: "streamingModal" },
    { label: "REVERXE 앨범구매", href: "#", kind: "albumModal" },
    { label: "라디오 신청하기", href: "/radio" },
    // Opens the SMS app directly with OS-specific sms: URI format.
    { label: "생방송 문자투표", href: "#", kind: "smsVote", smsTo: "#0505", smsBody: "EXO" },
    { label: "가이드", href: "/guide" },
    { label: "음악방송 사전투표", href: "/prevote" },
  ] as const,

  streamingLinks: [
    {
      label: "멜론",
      pcHref: "https://www.melon.com/artist/timeline.htm?artistId=724619",
      mobileHref: "https://m2.melon.com/artist/song.htm?artistId=724619",
    },
    {
      label: "지니",
      pcHref: "https://www.genie.co.kr/detail/artistInfo?xxnm=80220847",
      mobileHref: "https://mw.genie.co.kr/detail/artistInfo?xxnm=80220847",
    },
    {
      label: "벅스",
      pcHref: "https://music.bugs.co.kr/artist/80155940?wl_ref=M_Search_01_01",
      mobileHref: "https://m.bugs.co.kr/artist/80155940?_redir=n",
    },
    {
      label: "플로",
      pcHref: "https://www.music-flo.com/detail/artist/80155940/track?sortType=POPULARITY&roleType=ALL",
      mobileHref: "https://m.music-flo.com/detail/artist/80155940",
    },
    {
      label: "바이브",
      pcHref: "https://vibe.naver.com/artist/272211",
      mobileHref: "https://vibe.naver.com/artist/272211",
    },
    {
      label: "카카오뮤직",
      pcHref: "https://music.kakao.com",
      mobileHref: "https://music.kakao.com",
    },
  ] as const,

  // 원클릭 스트리밍(앱 딥링크/유니버설 링크)을 서비스별 + OS별로 설정합니다.
  // iosHref / androidHref / webHref 중 필요한 것만 채우면 됩니다.
  oneClickStreamingLinks: [
    // 멜론: 안드로이드 전용 링크 4개를 각각 별도 버튼으로 노출

    {
      id: "melon",
      label: "멜론 Android 1",
      androidHref:
        "melonapp://play?menuid=0&ctype=1&cid=600691215,600691216,600691223,600691217,600691218",
    },
    {
      id: "melon",
      label: "멜론 Android 2",
      androidHref:
        "melonapp://play?menuid=0&ctype=1&cid=600691215,600691216,600691223,600691219,600691220",
    },
    {
      id: "melon",
      label: "멜론 Android 3",
      androidHref:
        "melonapp://play?menuid=0&ctype=1&cid=600691215,600691216,600691223,600691221,600691222",
    },
    {
      id: "melon",
      label: "멜론 Android 4",
      androidHref:
        "melonapp://play?menuid=0&ctype=1&cid=600691215,600691219,600691221,600691222",
    },

    // 멜론: iOS 전용 링크
    {
      id: "melon",
      label: "멜론 iOS",
      iosHref:
        "meloniphone://play/?ctype=1&menuid=0&cid=600691215,600691216,600691223,600691217,600691218,600691215,600691216,600691223,600691219,600691220,600691215,600691216,600691223,600691221,600691222,600691215,600691219,600691221,600691222",
    },

    // 멜론: 웹/앱 공용 링크 (웹은 웹으로, 모바일은 앱으로)
    {
      id: "melon",
      label: "멜론 뮤직웨이브",
      iosHref: "https://into.melon.com/bridge/kakaotalk/musicwave/IIpiAqygEMGAm65tmszsBw?type=channel&t=1768917589576",
      androidHref: "https://into.melon.com/bridge/kakaotalk/musicwave/IIpiAqygEMGAm65tmszsBw?type=channel&t=1768917589576",
      webHref: "https://kko.to/TSpv-uFGYK",
    },

    // 지니: OS별 링크
    {
      id: "genie",
      label: "지니",
      iosHref:
        "ktolleh00167://landing/?landing_type=31&landing_target=113074172;113074173;113074180;113074174;113074175;113074172;113074173;113074180;113074176;113074177;113074172;113074173;113074180;113074178;113074179;113074172;113074176;113074178;113074179",
      androidHref:
        "cromegenie://scan/?landing_type=31&landing_target=113074172;113074173;113074180;113074174;113074175;113074172;113074173;113074180;113074176;113074177;113074172;113074173;113074180;113074178;113074179;113074172;113074176;113074178;113074179",
    },

    {
      id: "bugs",
      label: "벅스",
      iosHref:
        "bugs3://app/tracks/lists?title=%EC%A0%84%EC%B2%B4%EB%93%A3%EA%B8%B0&miniplay=Y&track_ids=6407607|6407608|6391981|6407609|6407610|6407607|6407608|6391981|6407611|6407612|6407607|6407608|6391981|6407613|6407614|6407607|6407611|6407613|6407614",
      androidHref:
        "bugs3://app/tracks/lists?title=%EC%A0%84%EC%B2%B4%EB%93%A3%EA%B8%B0&miniplay=Y&track_ids=6407607|6407608|6391981|6407609|6407610|6407607|6407608|6391981|6407611|6407612|6407607|6407608|6391981|6407613|6407614|6407607|6407611|6407613|6407614",
      webHref:
        "bugs3://app/tracks/lists?title=%EC%A0%84%EC%B2%B4%EB%93%A3%EA%B8%B0&miniplay=Y&track_ids=6407607|6407608|6391981|6407609|6407610|6407607|6407608|6391981|6407611|6407612|6407607|6407608|6391981|6407613|6407614|6407607|6407611|6407613|6407614",
    },
    {
      id: "flo",
      label: "플로",
      iosHref:
        "flomusic://play/track?ids=570963566,570963567,570963574,570963568,570963569,570963566,570963567,570963574,570963570,570963571,570963566,570963567,570963574,570963572,570963573,570963566,570963570,570963572,570963573",
      androidHref:
        "flomusic://play/track?ids=570963566,570963567,570963574,570963568,570963569,570963566,570963567,570963574,570963570,570963571,570963566,570963567,570963574,570963572,570963573,570963566,570963570,570963572,570963573",
    },
    {
      id: "vibe",
      label: "바이브 1",
      iosHref: "vibe://listen?version=3&trackIds=98953180,98953181,98953188,98953182,98953183",
      androidHref: "vibe://listen?version=3&trackIds=98953180,98953181,98953188,98953182,98953183",
    },
    {
      id: "vibe",
      label: "바이브 2",
      iosHref: "vibe://listen?version=3&trackIds=98953180,98953181,98953188,98953184,98953185",
      androidHref: "vibe://listen?version=3&trackIds=98953180,98953181,98953188,98953184,98953185",
    },
    {
      id: "vibe",
      label: "바이브 3",
      iosHref: "vibe://listen?version=3&trackIds=98953180,98953181,98953188,98953186,98953187",
      androidHref: "vibe://listen?version=3&trackIds=98953180,98953181,98953188,98953186,98953187",
    },
    {
      id: "vibe",
      label: "바이브 4",
      iosHref: "vibe://listen?version=3&trackIds=98953180,98953184,98953186,98953187",
      androidHref: "vibe://listen?version=3&trackIds=98953180,98953184,98953186,98953187",
    },
  ] as const,

  albumPurchaseLinks: [
    { label: "메이크스타", href: "https://www.makestar.com/product/14771" },
    { label: "뮤브", href: "https://www.muvve.co.kr/product/detail.html?product_no=166&cate_no=43&display_group=1" },
    { label: "베리즈", href: "https://shop.berriz.in/ko/product/?productId=246447171123648" },
    { label: "알라딘", href: "https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=380802354&start=pcsearch_auto" },
    { label: "애플뮤직", href: "https://www.applemusic.co.kr/shop/shopdetail.html?branduid=3398193&search=exo&sort=regdate&xcode=009&mcode=001&scode=001&GfDT=Zmp3UQ%3D%3D" },
    { label: "위드뮤", href: "https://withmuu.com/goods/goods_view.php?goodsNo=1000013450" },
    { label: "YES24", href: "https://www.yes24.com/product/goods/169141936" },
    { label: "케이타운포유", href: "https://kr.ktown4u.com/iteminfo?goods_no=153803" },
    { label: "핫트랙스", href: "https://hottracks.kyobobook.co.kr/media/music/detail/S000218796429" },
  ] as const,

  contacts: {
    twitterUrl: "https://x.com/weareoneEXO",
    instagramUrl: "https://www.instagram.com/weareone.exo",
    devEmail: "dev@example.com",
    teamEmail: "team@example.com",
  },
} as const;

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

---

## 콘서트 페이지 수정 가이드

### 페이지 구조

```
/concert                ← 메인 바인더 페이지 (콘서트 정보 + 사진)
/concert/cheer          ← 응원법 (바인더 디자인)
/concert/funding        ← 모금 (바인더 디자인)
/concert/chorus         ← 떼창곡 (바인더 디자인)
/concert/helper         ← 헬퍼모집 (바인더 디자인)
```

### 관련 파일 위치

| 역할 | 파일 경로 |
|------|-----------|
| ★ 콘서트 메인 페이지 | `src/app/concert/page.tsx` |
| ★ 공유 바인더 프레임 + 탭 설정 | `src/components/concert/BinderPage.tsx` |
| 콘서트 배경 레이아웃 | `src/app/concert/layout.tsx` |
| 응원법 서브 페이지 | `src/app/concert/cheer/page.tsx` |
| 모금 서브 페이지 | `src/app/concert/funding/page.tsx` |
| 떼창곡 서브 페이지 | `src/app/concert/chorus/page.tsx` |
| 헬퍼모집 서브 페이지 | `src/app/concert/helper/page.tsx` |
| 배경 이미지 | `public/images/concert/design/pixel art space wallpapers.jfif` |
| 폰트 파일 | `public/font/PF스타더스트 3.0*.ttf` |
| 전역 CSS (폰트 등록) | `src/app/globals.css` |

---

### 1. 콘서트 정보 수정 (날짜·장소·타이틀·사진)

파일: `src/app/concert/page.tsx` 상단 `CONCERT` 객체

```ts
const CONCERT = {
  artist: "ARTIST:",       // 아티스트명 (예: "EXO:")
  title: "CONCERT\nTITLE", // 큰 제목 (\n 으로 줄바꿈 가능)
  subtitle: "SUBTITLE",    // 부제목 (투어명 등)
  date: "0000. 00. 00",   // 날짜
  day: "---",              // 요일 (예: "SAT")
  time: "00:00 (KST)",    // 공연 시간
  venue: "공연장명",        // 공연장 이름
  venueDetail: "",         // 공연장 상세 주소 (없으면 빈 문자열)
  photo: null,             // 사진 파일명 (아래 참고)
};
```

**단체사진 추가 방법:**
1. 이미지 파일을 `public/images/concert/design/` 폴더에 넣기
2. `photo: "파일명.jpg"` 로 변경
   예) `photo: "main-photo.jpg"`
   → 이미지가 없으면 `null` — 플레이스홀더 표시

---

### 2. 사이드 인덱스 탭 수정 (이름·색상·링크·순서)

파일: `src/components/concert/BinderPage.tsx` 상단 `BINDER_CATEGORIES` 배열

```ts
export const BINDER_CATEGORIES = [
  {
    id: "cheer",          // 고유 키 (중복 없이)
    title: "응원법",      // 탭 세로 텍스트
    emoji: "📣",          // 탭 상단 이모지
    href: "/concert/cheer", // 클릭 시 이동 경로
    tabColor: "#ff4d8d",  // 탭 배경색 (hex)
    textColor: "#000",    // 탭 글자색
  },
  // ... 나머지
];
```

- **탭 추가**: 배열에 항목 추가 + 해당 경로에 `page.tsx` 생성
- **탭 삭제**: 배열에서 항목 제거
- **순서 변경**: 배열 순서 바꾸기
- **색상 변경**: `tabColor` 값 수정

---

### 3. 배경 이미지 변경

파일: `src/app/concert/layout.tsx`

```ts
backgroundImage: "url('/images/concert/design/pixel%20art%20space%20wallpapers.jfif')"
// ↑ 이 경로를 원하는 이미지 경로로 변경 (공백 → %20)
```

배경 밝기 조절 (같은 파일):
```ts
<div className="min-h-screen bg-black/55">
//                              ↑ 숫자 높이면 더 어두워짐 (0~100)
```

---

### 4. 폰트 굵기 변경

폰트 파일: `public/font/`
- `PF스타더스트 3.0.ttf` → 기본체 (weight 400, Regular)
- `PF스타더스트 3.0 Bold.ttf` → 굵은체 (weight 700, Bold)
- `PF스타더스트 3.0 ExtraBold.ttf` → 매우 굵은체 (weight 800, ExtraBold)

각 요소에서 `fontWeight` 값을 400 / 700 / 800 중 원하는 걸로 바꾸면 됩니다:
- **메인 타이틀**: `src/app/concert/page.tsx` → `<h1>` 의 `fontWeight: 800`
- **탭 세로 텍스트**: `src/components/concert/BinderPage.tsx` → `fontWeight: 800`
- **서브 페이지 헤딩**: `BinderHeading` 내부 `fontWeight: 800`

---

### 5. 글로우(네온) 색상 변경

메인 타이틀: `src/app/concert/page.tsx` → `<h1>` 의 `textShadow`
```ts
textShadow: "2px 2px 0 #00e5ff, 4px 4px 0 rgba(0,229,255,0.2), 0 0 28px rgba(0,229,255,0.4)"
//                     ↑ #00e5ff (시안) 부분을 원하는 색으로 변경
```

서브 페이지 헤딩: `accentColor="#00e5ff"` 값을 수정
```tsx
<BinderHeading accentColor="#ff4d8d" ... />
```

---

### 6. 떼창곡·헬퍼모집 내용 채우기

현재 두 페이지는 "준비중" 상태입니다.
내용을 채우려면 아래 파일에서 `<ComingSoon />` 을 실제 내용으로 교체하세요:

- `src/app/concert/chorus/page.tsx`
- `src/app/concert/helper/page.tsx`

---

### 7. 모금 공지 추가·수정

파일: `src/data/announcements.ts`

`announcements` 배열에 항목을 추가/수정하면 `/concert/funding` 페이지에 자동 반영됩니다.

---

## Real data (YouTube / charts)

This template can show real YouTube view/like counts via a server-side API route.

1) Create `.env.local` from `.env.example`

2) Fill these values:
- `YOUTUBE_API_KEY`: YouTube Data API v3 key
- `YOUTUBE_VIDEO_ID`: the video id to track

3) Run the dev server:
- `npm run dev`

Optional:
- `CHARTS_JSON_URL`: override chart status data with your own JSON endpoint

### Using korea-music-chart-api (auto ranks)

If you run a compatible chart API server (e.g. the Java/Spring project `max-jang/korea-music-chart-api`), this app can convert it into the `ChartsData` JSON shape via:

- `GET /api/charts`

To enable:

1) Host the chart API server yourself and set:
- `KOREA_MUSIC_CHART_API_BASE_URL` (example: `https://your-chart-api.example.com`)

2) Point this app’s chart source to its own converter route:
- `CHARTS_JSON_URL=http://localhost:3000/api/charts` (dev)
- `CHARTS_JSON_URL=https://your-site.example.com/api/charts` (prod)

Optional query overrides:
- `/api/charts?artist=EXO&track=I'm%20Home`

Notes:
- The referenced repo is archived and may not be maintained.
- Make sure you have permission to deploy/use any upstream scraping service and that it complies with the target sites’ terms.

### Hourly refresh + local file cache (dev)

When `CHARTS_JSON_URL` points to this app’s `/api/charts`, the route maintains a local cache file so ranks can be compared across restarts (needed for providers that don’t include rank change info).

- Cache file path (default): `.cache/charts-cache.json`
- Override path: `CHARTS_CACHE_FILE=...`
- Background refresh: by default enabled in development
	- Set `CHARTS_BACKGROUND_REFRESH=0` to disable

Refresh policy:
- `/api/charts` refreshes the cache once per hour (on the top of the hour)
- You can force a refresh anytime: `/api/charts?force=1`

### Charts “real-time” integration (how it works)

This project does **not** directly call Melon/Genie/Bugs/etc. from the browser.
Instead, the home page reads chart status from a JSON source:

- Default: local file at src/data/charts.json
- Override: set `CHARTS_JSON_URL` to a URL that returns the same JSON shape

The app fetches `CHARTS_JSON_URL` on the server with caching (revalidate ~60s). If the URL fails or returns invalid JSON, it falls back to the local file.

#### JSON schema

Your JSON endpoint must return:

```json
{
	"lastUpdated": "2026-01-15T00:00:00.000Z",
	"items": [
		{ "label": "지니", "status": "TOP100 12위" },
		{ "label": "멜론 TOP100", "rank": 12, "prevRank": 15 },
		{ "label": "벅스", "status": "진입 성공" }
	]
}
```

Notes:
- `lastUpdated` must be an ISO string.
- `items[].label` is required.
- `items[].status` is optional (free-form).
- `items[].rank` and `items[].prevRank` are optional numbers.
	- If `rank`/`prevRank` are present, the UI can auto-derive status like “상승/하락/유지/진입”.

#### Recommended ways to keep it updated

Because many chart services don’t provide a public official API, a practical and safe approach is:
- Manual updates: edit src/data/charts.json and redeploy
- External status feed: publish a JSON (e.g. Google Sheets via Apps Script, or a small admin tool) and set `CHARTS_JSON_URL`

If you have an official/contracted data source (or an aggregator API you’re allowed to use), you can generate the JSON from that source and host it.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

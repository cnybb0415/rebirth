# Page keys (페이지/버튼 이름 정리)

이 문서는 “지금 있는 페이지들”을 기준으로, 알아보기 쉬운 **페이지 키 이름**(예: `main`, `main-btn-*`)을 정리해둔 표입니다.

## 1) 네이밍 규칙(추천)

- **페이지**: `kebab-case` 단일 키
  - 예: `main`, `guide`, `streaming`, `cheer-detail`
- **섹션**: `<pageKey>-section-<what>`
  - 예: `main-section-video`, `main-section-chart-summary`
- **버튼/CTA**: `<pageKey>-btn-<what>`
  - 예: `main-btn-oneclick-streaming`, `cheer-detail-btn-back`
- **탭/하위항목**: `<pageKey>-tab-...`, `<pageKey>-part-...`
  - 예: `guide-tab-melon`, `guide-part-melon-streaming`

> 키는 “영어 소문자 + 하이픈”으로 통일하면, 나중에 GA/Amplitude 같은 이벤트 이름에도 그대로 쓰기 편합니다.

## 2) 현재 라우트(페이지) 목록

| Path | Page file | 추천 pageKey | 화면 라벨(대략) |
|---|---|---|---|
| `/` | `src/app/page.tsx` | `main` | 메인 |
| `/guide` | `src/app/guide/page.tsx` | `guide` | 가이드 |
| `/streaming` | `src/app/streaming/page.tsx` | `streaming` | 스트리밍 |
| `/vote` | `src/app/vote/page.tsx` | `vote` | 투표 |
| `/cheer` | `src/app/cheer/page.tsx` | `cheer` | 응원법 |
| `/cheer/[songId]` | `src/app/cheer/[songId]/page.tsx` | `cheer-detail` | 응원법 상세 |
| `/links` | `src/app/links/page.tsx` | `links` | (레거시) 원클릭/바로가기 |
| `/support` | `src/app/support/page.tsx` | `support` | 서포트 |

### API 라우트

| Path | Route file | 추천 key |
|---|---|---|
| `/api/charts` | `src/app/api/charts/route.ts` | `api-charts` |
| `/api/youtube` | `src/app/api/youtube/route.ts` | `api-youtube` |

## 3) 폴더는 있지만 아직 라우트가 아닌 것

아래 경로는 폴더는 있으나 `page.tsx`가 없어서 Next.js 라우트로 생성되지 않습니다.

- `src/app/guide/fanchant/[songId]/`
- `src/app/guide/categories/fanchant/`

## 4) 페이지별 섹션/버튼 키(추천)

### `main` (`/`)

- 섹션
  - `main-section-video` (유튜브 iframe)
  - `main-section-youtube-stats` (YouTubeStatsCards)
  - `main-section-quick-actions` (QuickActionsBar)
  - `main-section-social` (인스타/유튜브/X 아이콘)
  - `main-section-chart-summary` (ChartSummaryGrid)
- 버튼/CTA (siteConfig.actions 기반)
  - `main-btn-oneclick-streaming` ("원클릭 스트리밍" / streaming modal)
  - `main-btn-album-buy` ("REVERXE 앨범구매" / album modal)
  - `main-btn-radio-request` ("라디오 신청하기")
  - `main-btn-live-sms-vote` ("생방송 문자투표")
  - `main-btn-guide` ("가이드" → `/guide`)
  - `main-btn-cheer` ("응원법" → `/cheer`)
- 소셜
  - `main-btn-instagram`
  - `main-btn-youtube`
  - `main-btn-x`

### `guide` (`/guide`)

- 섹션
  - `guide-section-tabs`
- 탭(서비스) (src/data/guides.ts 기준)
  - `guide-tab-melon`
  - `guide-tab-genie`
  - `guide-tab-bugs`
  - `guide-tab-flo`
  - `guide-tab-vibe`
- 파트(항목)
  - `guide-part-<service>-streaming`
  - `guide-part-<service>-signup`
  - `guide-part-<service>-download`
  - `guide-part-<service>-gift`

### `streaming` (`/streaming`)

- 섹션
  - `streaming-section-actions` ("원클릭 바로가기" 카드)
  - `streaming-section-services` ("음원사이트 바로가기" 카드)
- 버튼/CTA
  - `streaming-btn-action-oneclick-streaming`
  - `streaming-btn-action-album-buy`
  - `streaming-btn-action-radio-request`
  - `streaming-btn-action-live-sms-vote`
  - `streaming-btn-action-guide`
  - `streaming-btn-action-cheer`
- 음원사이트 버튼 (siteConfig.streamingLinks + 유튜브)
  - `streaming-btn-service-melon`
  - `streaming-btn-service-genie`
  - `streaming-btn-service-bugs`
  - `streaming-btn-service-flo`
  - `streaming-btn-service-vibe`
  - `streaming-btn-service-youtube`

### `vote` (`/vote`)

- 섹션
  - `vote-section-header`
  - `vote-section-card`

### `cheer` (`/cheer`)

- 섹션
  - `cheer-section-song-grid`
- 상세로 가는 카드/버튼
  - `cheer-btn-song-<songId>` (예: `cheer-btn-song-cream-soda`)

### `cheer-detail` (`/cheer/[songId]`)

- 버튼
  - `cheer-detail-btn-back` ("목록")
  - `cheer-detail-btn-pdf-open` (PDF 자산이 있을 때)

### `support` (`/support`)

- 섹션
  - `support-section-tiles`
  - `support-section-notice`
- 타일
  - `support-tile-team`
  - `support-tile-fund`
- 버튼
  - `support-btn-close` (공지 닫기)

### `links` (`/links`) (레거시)

- 성격이 `streaming`과 동일해서 키도 동일 패턴 권장
  - `links-section-actions`, `links-section-services`
  - `links-btn-action-*`, `links-btn-service-*`

// ════════════════════════════════════════════════════════════
//  EXhOrizon 헬퍼 신청 — Google Apps Script
//
//  【처음 설치】
//  1. Google Sheets에서 새 스프레드시트를 만드세요.
//  2. 상단 메뉴 [확장 프로그램] → [Apps Script] 클릭.
//  3. 기본 코드를 지우고 이 파일 내용 전체를 붙여넣으세요.
//  4. 상단 메뉴 [배포] → [새 배포] → 종류: 웹 앱
//       - 다음 사용자로 실행: 나 (본인 계정)
//       - 액세스 권한: 모든 사용자
//     → [배포] 클릭 후 나오는 URL을 복사하세요.
//  5. .env.local 과 Vercel 환경변수에 추가하세요:
//       GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/.../exec
//
//  【기존 시트에 업데이트 (URL 그대로 유지)】
//  1. 기존 Apps Script 편집기에 이 파일 내용 전체를 붙여넣고 저장하세요.
//  2. [배포] → [배포 관리] → 연필(수정) → 버전: [새 버전] → [배포]
//     ※ [새 배포]로 하면 URL이 바뀌니 꼭 [배포 관리]에서 수정하세요.
//
//  【보안 토큰 설정 (필수)】
//  1. 아무도 못 맞힐 긴 문자열을 하나 정하세요 (예: 비밀번호 생성기로 32자 이상).
//  2. Apps Script 왼쪽 [⚙ 프로젝트 설정] → [스크립트 속성] → 속성 추가
//       속성: HELPER_SHEET_TOKEN   값: (정한 문자열)
//  3. .env.local 과 Vercel 환경변수에 같은 값 추가:
//       HELPER_SHEET_TOKEN=(정한 문자열)
//  ※ 토큰이 다르거나 없으면 시트에 저장되지 않고 사이트에 "제출 실패"가 떠요.
//  ※ 이 값은 코드(깃)에 절대 넣지 마세요.
//
//  【시트 공유 설정】
//  스프레드시트 [공유]는 '제한됨'(운영진 계정만)으로 두세요. 링크 공개 금지.
//
//  신청 내용은 SHEET_NAME 탭에 쌓입니다. 탭이 없으면 자동으로 만들어서
//  예전 신청 기록과 섞이지 않아요.
// ════════════════════════════════════════════════════════════

const SHEET_NAME = "앙콘 헬퍼";

const HEADERS = [
  "제출일시",
  "이름",
  "연락처",
  "메일",
  "동반인",
  "동반인 이름",
  "동반인 연락처",
  "동반인 메일",
  "신청날짜",
  "희망분야",
  "좌석위치 (11/7)",
  "좌석위치 (11/8)",
];

function getSheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = book.insertSheet(SHEET_NAME);

  // 탭이 비어있으면 헤더 행 자동 삽입
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    const header = sheet.getRange(1, 1, 1, HEADERS.length);
    header.setFontWeight("bold");
    header.setBackground("#901858");
    header.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// 수식 주입 차단: =, +, -, @ 로 시작하는 값은 글자로 저장 (IMPORTXML 등으로 시트 내용이 외부로 새는 것 방지)
function safe(v) {
  const s = String(v == null ? "" : v).replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 254);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // 사이트 서버만 쓸 수 있도록 비밀 토큰 확인 (스크립트 속성 HELPER_SHEET_TOKEN)
    const expected = PropertiesService.getScriptProperties().getProperty("HELPER_SHEET_TOKEN");
    if (!expected || data.token !== expected) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: "unauthorized" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 동시에 여러 명이 제출해도 행이 겹치지 않게
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      getSheet().appendRow([
        new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
        safe(data.name),
        safe(data.contact),
        safe(data.email),
        safe(data.companionYn),
        safe(data.companionName),
        safe(data.companionContact),
        safe(data.companionEmail),
        safe(data.dates),
        safe(data.roles),
        safe(data.seat7),
        safe(data.seat8),
      ]);
    } finally {
      lock.releaseLock();
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: "failed" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET 요청으로 연결 테스트 가능 (브라우저에서 URL 직접 열기)
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "helper-apply script is running" }))
    .setMimeType(ContentService.MimeType.JSON);
}

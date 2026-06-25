// ════════════════════════════════════════════════════════════
//  EXhOrizon 헬퍼 신청 — Google Apps Script
//
//  【설치 방법】
//  1. Google Sheets에서 새 스프레드시트를 만드세요.
//  2. 상단 메뉴 [확장 프로그램] → [Apps Script] 클릭.
//  3. 기본 코드를 지우고 이 파일 내용 전체를 붙여넣으세요.
//  4. 상단 메뉴 [배포] → [새 배포] → 종류: 웹 앱
//       - 설명: helper-apply (아무 이름)
//       - 다음 사용자로 실행: 나 (본인 계정)
//       - 액세스 권한: 모든 사용자
//     → [배포] 클릭 후 나오는 URL을 복사하세요.
//  5. 프로젝트 루트의 .env.local 파일에 아래처럼 추가하세요:
//       GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/.../exec
//  6. 개발 서버를 재시작하면 연동 완료입니다.
// ════════════════════════════════════════════════════════════

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 시트가 비어있으면 헤더 행 자동 삽입
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "제출일시",
        "이름",
        "연락처",
        "메일",
        "신청날짜",
        "희망분야",
        "좌석위치 (11일)",
        "좌석위치 (12일)",
      ]);

      // 헤더 스타일 (선택)
      const header = sheet.getRange(1, 1, 1, 8);
      header.setFontWeight("bold");
      header.setBackground("#4a148c");
      header.setFontColor("#ffffff");
    }

    sheet.appendRow([
      new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
      data.name   || "",
      data.contact || "",
      data.email  || "",
      data.dates  || "",
      data.roles  || "",
      data.seat11 || "",
      data.seat12 || "",
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET 요청으로 연결 테스트 가능 (브라우저에서 URL 직접 열기)
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "helper-apply script is running" }))
    .setMimeType(ContentService.MimeType.JSON);
}

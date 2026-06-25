import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // .env.local 에 GOOGLE_SCRIPT_URL 값을 설정해야 합니다.
    // 설정 방법은 프로젝트 루트의 scripts/helper-sheet.gs 파일을 참고하세요.
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (!scriptUrl) {
      console.error("GOOGLE_SCRIPT_URL 환경변수가 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "서버 설정 오류" },
        { status: 500 }
      );
    }

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Apps Script 오류: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("helper-apply 제출 오류:", err);
    return NextResponse.json({ error: "제출 실패" }, { status: 500 });
  }
}

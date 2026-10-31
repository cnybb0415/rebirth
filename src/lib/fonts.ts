import { Instrument_Serif } from "next/font/google";

// 메인 화면 제목용 세리프 (영문·숫자). 한글은 Pretendard 그대로
export const displaySerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

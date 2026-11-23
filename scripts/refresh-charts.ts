// GitHub Actions에서 매시 실행: 같은 작업 안에서 띄운 차트 수집기(localhost)로 차트를 받아 Supabase에 저장
import { refreshChartSnapshot } from "../src/lib/chartSnapshot";

refreshChartSnapshot(true).then((r) => {
  console.log(JSON.stringify(r));
  if (r.status !== "updated") process.exit(1);
});

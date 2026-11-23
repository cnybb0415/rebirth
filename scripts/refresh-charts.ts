// GitHub Actions에서 매시 실행: 같은 작업 안에서 띄운 차트 수집기(localhost)로 차트를 받아
// GitHub 인증 토큰을 붙여 사이트(/api/charts/ingest)로 보냄
import { fetchFullChartsData } from "../src/lib/chartsFullData";

const SITE = process.env.SITE_URL ?? "https://www.exo-rebirth.com";

async function oidcToken(): Promise<string> {
  const url = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const auth = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (!url || !auth) throw new Error("OIDC 권한 없음 (permissions: id-token: write 필요)");
  const res = await fetch(`${url}&audience=exo-rebirth-charts`, { headers: { authorization: `Bearer ${auth}` } });
  if (!res.ok) throw new Error(`OIDC 토큰 발급 실패 ${res.status}`);
  return ((await res.json()) as { value: string }).value;
}

async function main() {
  const data = await fetchFullChartsData();
  for (const p of data.providers)
    for (const s of p.sections) console.log(s.label, s.error ?? (s.items.map((i) => `${i.rank}.${i.title}`).join(", ") || "-"));

  const token = await oidcToken();
  for (let i = 1; i <= 3; i++) {
    const res = await fetch(`${SITE}/api/charts/ingest`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(data),
    }).catch((e) => ({ ok: false, status: 0, text: async () => String(e) }) as const);
    const body = await res.text();
    console.log(`ingest ${res.status} ${body}`);
    if (res.ok) return;
    await new Promise((r) => setTimeout(r, 15_000));
  }
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

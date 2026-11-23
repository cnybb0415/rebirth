import { createPublicKey, verify, type JsonWebKey } from "node:crypto";

// GitHub Actions가 발급한 OIDC 토큰 확인 (비밀키 없이 "이 저장소의 워크플로가 보낸 요청"인지 검증)
const ISSUER = "https://token.actions.githubusercontent.com";
const JWKS_URL = `${ISSUER}/.well-known/jwks`;

type Jwk = JsonWebKey & { kid?: string };
let cache: { at: number; keys: Jwk[] } | null = null;

// 모르는 kid로 계속 찔러서 GitHub 공개키를 반복해서 받게 만드는 걸 막기 위해, 강제 갱신은 5분에 한 번만
async function getKeys(force = false): Promise<Jwk[]> {
  const age = cache ? Date.now() - cache.at : Infinity;
  if (cache && (age < 60 * 60_000 && (!force || age < 5 * 60_000))) return cache.keys;
  const res = await fetch(JWKS_URL, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error("jwks");
  const json = (await res.json()) as { keys: Jwk[] };
  cache = { at: Date.now(), keys: json.keys };
  return json.keys;
}

function b64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export type GithubOidcClaims = {
  iss: string;
  aud: string | string[];
  exp: number;
  nbf?: number;
  repository: string;
  repository_id?: string;
  repository_owner_id?: string;
  ref: string;
  workflow_ref?: string;
  event_name?: string;
};

export async function verifyGithubOidc(
  token: string,
  expect: {
    audience: string;
    repository: string;
    repositoryId: string;
    repositoryOwnerId: string;
    ref: string;
    workflowPath: string;
    events: string[];
  }
): Promise<GithubOidcClaims | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  let header: { alg?: string; kid?: string };
  let claims: GithubOidcClaims;
  try {
    header = JSON.parse(b64url(parts[0]).toString("utf8"));
    claims = JSON.parse(b64url(parts[1]).toString("utf8"));
  } catch {
    return null;
  }
  if (header.alg !== "RS256" || !header.kid) return null;

  let keys = await getKeys();
  let jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) {
    keys = await getKeys(true);
    jwk = keys.find((k) => k.kid === header.kid);
  }
  if (!jwk) return null;

  const ok = verify(
    "RSA-SHA256",
    Buffer.from(`${parts[0]}.${parts[1]}`),
    createPublicKey({ key: jwk, format: "jwk" }),
    b64url(parts[2])
  );
  if (!ok) return null;

  const now = Math.floor(Date.now() / 1000);
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (claims.iss !== ISSUER) return null;
  if (!aud.includes(expect.audience)) return null;
  if (typeof claims.exp !== "number" || claims.exp < now - 30) return null;
  if (typeof claims.nbf === "number" && claims.nbf > now + 30) return null;
  if (claims.repository !== expect.repository) return null;
  // 저장소 이름이 바뀌거나 같은 이름으로 다시 만들어져도 원래 저장소만 통과하도록 숫자 ID까지 확인
  if (String(claims.repository_id) !== expect.repositoryId) return null;
  if (String(claims.repository_owner_id) !== expect.repositoryOwnerId) return null;
  if (!claims.event_name || !expect.events.includes(claims.event_name)) return null;
  if (claims.ref !== expect.ref) return null;
  if (!claims.workflow_ref?.startsWith(`${expect.repository}/${expect.workflowPath}@`)) return null;
  return claims;
}

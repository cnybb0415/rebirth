"use client";

import { useState } from "react";
import { chorusDays } from "@/data/chorusSongs";

type VoteResult = { day: number; song_id: string; count: number };

export default function ChorusAdminPage() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [results, setResults] = useState<VoteResult[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [adjusting, setAdjusting] = useState<string | null>(null); // "day-songId"

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/chorus-vote/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok?: boolean; token?: string; error?: string };
      if (!res.ok || !data.token) { setError(data.error ?? "인증 실패"); return; }
      setToken(data.token);
      await fetchResults(data.token);
    } catch {
      setError("서버 오류");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdjust(day: number, songId: string, amount: number) {
    if (!token) return;
    const key = `${day}-${songId}`;
    setAdjusting(key);
    try {
      const res = await fetch("/api/chorus-vote/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ day, songId, amount }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? "조정 실패"); return; }
      await fetchResults(token);
    } catch {
      setError("서버 오류");
    } finally {
      setAdjusting(null);
    }
  }

  async function fetchResults(t: string) {
    const res = await fetch("/api/chorus-vote/results", {
      headers: { "x-admin-token": t },
    });
    if (!res.ok) { setError("결과 조회 실패"); return; }
    const data = (await res.json()) as VoteResult[];
    setResults(data);
  }

  const songLabel = (dayNum: number, songId: string) => {
    const song = chorusDays.find((d) => d.day === dayNum)?.songs.find((s) => s.id === songId);
    return song?.title ?? songId;
  };

  const totalByDay = (dayNum: number) =>
    results?.filter((r) => r.day === dayNum).reduce((acc, r) => acc + r.count, 0) ?? 0;

  if (!token) {
    return (
      <main style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "#f5f5f7" }}>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "320px", background: "#fff", padding: "32px 24px", borderRadius: "12px", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
          <h1 style={{ fontSize: "18px", fontWeight: "bold" }}>떼창 투표 관리자</h1>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" }}
            required
          />
          {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "8px 16px", background: "#1a1a3a", color: "#fff", border: "none", borderRadius: "6px", fontSize: "14px", cursor: "pointer" }}
          >
            {loading ? "확인중..." : "로그인"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100svh", padding: "32px 24px", maxWidth: "640px", margin: "0 auto", background: "#f5f5f7" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>떼창 투표 결과</h1>
        <button
          onClick={() => { if (token) void fetchResults(token); }}
          style={{ padding: "6px 12px", fontSize: "12px", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer" }}
        >
          새로고침
        </button>
      </div>

      {results === null ? (
        <p>불러오는 중...</p>
      ) : results.length === 0 ? (
        <p style={{ color: "#888" }}>아직 투표가 없습니다.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {chorusDays.map((day) => {
            const dayResults = results.filter((r) => r.day === day.day).sort((a, b) => b.count - a.count);
            const total = totalByDay(day.day);
            return (
              <section key={day.day}>
                <h2 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "8px", color: "#1a1a3a" }}>
                  {day.label} — {day.date} <span style={{ color: "#888", fontWeight: "normal" }}>총 {total}표</span>
                </h2>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #ddd" }}>
                      <th style={{ textAlign: "left", padding: "6px 8px", color: "#555" }}>순위</th>
                      <th style={{ textAlign: "left", padding: "6px 8px", color: "#555" }}>곡</th>
                      <th style={{ textAlign: "right", padding: "6px 8px", color: "#555" }}>표수</th>
                      <th style={{ textAlign: "right", padding: "6px 8px", color: "#555" }}>비율</th>
                      <th style={{ padding: "6px 8px" }} />
                    </tr>
                  </thead>
                  <tbody>
                    {dayResults.map((r, i) => (
                      <tr key={r.song_id} style={{ borderBottom: "1px solid #eee", background: i === 0 ? "#f0f4ff" : undefined }}>
                        <td style={{ padding: "6px 8px", color: i === 0 ? "#2060d8" : "#888", fontWeight: i === 0 ? "bold" : undefined }}>
                          {i + 1}
                        </td>
                        <td style={{ padding: "6px 8px" }}>{songLabel(r.day, r.song_id)}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: "bold" }}>{r.count}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", color: "#888" }}>
                          {total > 0 ? `${Math.round((r.count / total) * 100)}%` : "-"}
                        </td>
                        <td style={{ padding: "6px 8px", textAlign: "right" }}>
                          <button
                            onClick={() => void handleAdjust(r.day, r.song_id, 10)}
                            disabled={adjusting === `${r.day}-${r.song_id}`}
                            style={{ padding: "2px 8px", fontSize: "12px", background: "#2060d8", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", opacity: adjusting === `${r.day}-${r.song_id}` ? 0.5 : 1 }}
                          >
                            {adjusting === `${r.day}-${r.song_id}` ? "..." : "+10"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {dayResults.length === 0 && (
                      <tr><td colSpan={4} style={{ padding: "12px 8px", color: "#aaa" }}>아직 투표 없음</td></tr>
                    )}
                  </tbody>
                </table>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

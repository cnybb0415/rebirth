"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";

const ACCENT = "#a3e635";
const MEMBERS = ["SUHO", "LAY", "CHANYEOL", "D.O.", "KAI", "SEHUN"] as const;
type MemberName = (typeof MEMBERS)[number];

const PIXEL: React.CSSProperties = {
  fontFamily: "'PFStarDust', monospace",
  WebkitFontSmoothing: "none",
};

interface Candidate {
  id: number;
  title: string;
  member: string;
  description: string | null;
  image_path: string;
  created_at: string;
  vote_count: number;
  status: string;
}

interface VoteConfig {
  start_at: string;
  end_at: string;
  registration_open: number;
  approval_mode: number;
}

function toLocalDatetimeValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function defaultStart() {
  const d = new Date(); d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function defaultEnd() {
  const d = new Date(); d.setDate(d.getDate() + 3); d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const inputStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.5)",
  border: "1.5px solid rgba(255,255,255,0.2)",
  color: "#fff",
  colorScheme: "dark",
  padding: "7px 10px",
  fontSize: "0.55rem",
  outline: "none",
  boxSizing: "border-box",
  width: "100%",
  fontFamily: "NanumBarunGothic, sans-serif",
};

// ── 비밀번호 게이트 ────────────────────────────────────────
function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/vote/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem("exo_admin_authed", "1");
        if (data.token) sessionStorage.setItem("exo_admin_token", data.token);
        onSuccess();
      } else {
        setError("비밀번호가 올바르지 않습니다.");
      }
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "320px", background: "rgba(0,0,0,0.85)", padding: "32px 24px", ...PIXEL }}>
        <p style={{ fontSize: "0.42rem", letterSpacing: "0.35em", color: `${ACCENT}88`, fontWeight: 700, marginBottom: "12px" }}>
          아바타스타
        </p>
        <h1 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", letterSpacing: "0.08em", textShadow: `2px 2px 0 ${ACCENT}`, marginBottom: "24px" }}>
          관리자
        </h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="비밀번호"
            autoFocus
            style={{ ...inputStyle, letterSpacing: "0.1em" }}
          />
          {error && (
            <p style={{ fontSize: "0.42rem", color: "#ff6b6b", letterSpacing: "0.1em", fontFamily: "NanumBarunGothic, sans-serif" }}>
              ✕ {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "9px", fontSize: "0.48rem", fontWeight: 800, letterSpacing: "0.22em", background: loading ? `${ACCENT}66` : ACCENT, color: "#0d1a00", border: "none", cursor: loading ? "wait" : "pointer", ...PIXEL }}
          >
            {loading ? "확인 중..." : "입장"}
          </button>
        </form>
      </div>
    </div>
  );
}

function adminHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = sessionStorage.getItem("exo_admin_token") ?? "";
  return { "Content-Type": "application/json", "x-admin-token": token, ...extra };
}

// ── 어드민 본체 ────────────────────────────────────────────
function AdminPanel() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [config, setConfig] = useState<VoteConfig | null>(null);
  const [startAt, setStartAt] = useState(defaultStart());
  const [endAt, setEndAt] = useState(defaultEnd());
  const [configMsg, setConfigMsg] = useState<{ msg: string; ok: boolean } | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [togglingReg, setTogglingReg] = useState(false);
  const [togglingApproval, setTogglingApproval] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterMember, setFilterMember] = useState<"ALL" | MemberName>("ALL");
  const [injectCount, setInjectCount] = useState<Record<number, string>>({});
  const [injectingId, setInjectingId] = useState<number | null>(null);

  const fetchAll = useCallback(async () => {
    const [cRes, cfRes] = await Promise.all([
      fetch("/api/vote/admin/candidates", { cache: "no-store" }),
      fetch("/api/vote/config", { cache: "no-store" }),
    ]);
    if (cRes.ok) { const d = await cRes.json(); setCandidates(d.candidates ?? []); }
    if (cfRes.ok) {
      const d = await cfRes.json();
      if (d.config) {
        setConfig(d.config);
        setStartAt(toLocalDatetimeValue(d.config.start_at));
        setEndAt(toLocalDatetimeValue(d.config.end_at));
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id: number) => {
    if (!confirm("삭제하면 해당 캐릭터의 모든 투표도 삭제됩니다.")) return;
    setDeleting(id);
    const res = await fetch(`/api/vote/candidates/${id}`, { method: "DELETE" });
    if (res.ok) setCandidates((p) => p.filter((c) => c.id !== id));
    else alert("삭제 실패");
    setDeleting(null);
  };

  const handleSaveConfig = async () => {
    const startDate = new Date(startAt);
    const endDate = new Date(endAt);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setConfigMsg({ msg: "날짜 형식이 올바르지 않습니다.", ok: false });
      return;
    }
    if (endDate <= startDate) {
      setConfigMsg({ msg: "종료일이 시작일보다 늦어야 합니다.", ok: false });
      return;
    }
    setSavingConfig(true);
    setConfigMsg(null);
    try {
      const res = await fetch("/api/vote/config", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({
          start_at: startDate.toISOString(),
          end_at: endDate.toISOString(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setConfigMsg({ msg: "✓ 저장 완료", ok: true });
        await fetchAll();
      } else {
        setConfigMsg({ msg: data.error ?? "저장 실패", ok: false });
      }
    } catch (e) {
      console.error("Config save error:", e);
      setConfigMsg({ msg: "저장 중 오류가 발생했습니다.", ok: false });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleToggleRegistration = async () => {
    if (!config) return;
    setTogglingReg(true);
    const res = await fetch("/api/vote/config", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ registration_open: config.registration_open !== 1 }),
    });
    if (res.ok) await fetchAll();
    else alert("설정 변경 실패");
    setTogglingReg(false);
  };

  const handleToggleApproval = async () => {
    if (!config) return;
    setTogglingApproval(true);
    const res = await fetch("/api/vote/config", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ approval_mode: config.approval_mode !== 1 }),
    });
    if (res.ok) await fetchAll();
    else alert("설정 변경 실패");
    setTogglingApproval(false);
  };

  const handleInjectVotes = async (id: number) => {
    const count = parseInt(injectCount[id] ?? "0", 10);
    if (!count || count < 1) return;
    setInjectingId(id);
    const res = await fetch(`/api/vote/admin/candidates/${id}`, {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ count }),
    });
    if (res.ok) {
      setInjectCount((p) => ({ ...p, [id]: "" }));
      await fetchAll();
    } else {
      alert("표 추가 실패");
    }
    setInjectingId(null);
  };

  const handleApproveCandidate = async (id: number, status: "approved" | "rejected") => {
    setApprovingId(id);
    const res = await fetch(`/api/vote/admin/candidates/${id}`, {
      method: "PATCH",
      headers: adminHeaders(),
      body: JSON.stringify({ status }),
    });
    if (res.ok) await fetchAll();
    else alert(`${status === "approved" ? "승인" : "거절"} 실패`);
    setApprovingId(null);
  };

  // ── 심사 대기 목록 ───────────────────────────────────────
  const pending = candidates.filter((c) => c.status === "pending");
  const approved = candidates.filter((c) => c.status === "approved");
  const approvalOn = config?.approval_mode === 1;

  // ── 통계 계산 (승인된 캐릭터만) ──────────────────────────
  const total = approved.reduce((s, c) => s + c.vote_count, 0);
  const memberStats = MEMBERS.map((m) => {
    const group = approved.filter((c) => c.member === m);
    return { member: m, count: group.length, votes: group.reduce((s, c) => s + c.vote_count, 0) };
  });
  const maxVotes = Math.max(...memberStats.map((m) => m.votes), 1);

  // ── 필터 적용 (승인된 캐릭터만) ──────────────────────────
  const filtered = filterMember === "ALL"
    ? approved
    : approved.filter((c) => c.member === filterMember);
  const filteredTotal = filtered.reduce((s, c) => s + c.vote_count, 0);

  const regOpen = config?.registration_open !== 0;

  return (
    <div style={{ minHeight: "100vh", padding: "40px 16px 80px", maxWidth: "720px", margin: "0 auto" }}>
      <div style={{ background: "rgba(0,0,0,0.85)", padding: "28px 24px 32px", ...PIXEL }}>

        {/* 헤더 */}
        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "0.42rem", letterSpacing: "0.35em", color: `${ACCENT}77`, fontWeight: 700, marginBottom: "6px" }}>아바타스타</p>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff", letterSpacing: "0.08em", textShadow: `2px 2px 0 ${ACCENT}, 0 0 18px ${ACCENT}55` }}>관리자</h1>
          <div style={{ display: "flex", gap: "3px", marginTop: "8px" }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ width: "5px", height: "4px", background: i % 2 === 0 ? ACCENT : "transparent" }} />
            ))}
          </div>
        </div>

        {/* ── 등록중단 토글 ── */}
        <section style={{ marginBottom: "20px", background: "rgba(0,0,0,0.4)", border: `1.5px solid ${regOpen ? ACCENT + "33" : "#ff4d4d44"}`, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <p style={{ fontSize: "0.45rem", letterSpacing: "0.28em", color: regOpen ? `${ACCENT}aa` : "#ff6b6b", fontWeight: 700, marginBottom: "4px" }}>■ 캐릭터 생성</p>
              <p style={{ fontSize: "0.42rem", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", fontFamily: "NanumBarunGothic, sans-serif" }}>
                {regOpen ? "등록 가능 — 누구나 캐릭터를 생성할 수 있습니다." : "등록 중단 — 캐릭터 생성이 막혀있습니다."}
              </p>
            </div>
            <button
              onClick={handleToggleRegistration}
              disabled={togglingReg || !config}
              style={{ flexShrink: 0, padding: "7px 14px", fontSize: "0.45rem", fontWeight: 800, letterSpacing: "0.15em", border: `1.5px solid ${regOpen ? "#ff4d4d" : ACCENT}`, background: regOpen ? "rgba(255,77,77,0.15)" : `${ACCENT}22`, color: regOpen ? "#ff6b6b" : ACCENT, cursor: togglingReg || !config ? "wait" : "pointer", ...PIXEL }}
            >
              {togglingReg ? "..." : regOpen ? "등록중단" : "등록재개"}
            </button>
          </div>
        </section>

        {/* ── 심사 모드 토글 ── */}
        <section style={{ marginBottom: "20px", background: "rgba(0,0,0,0.4)", border: `1.5px solid ${approvalOn ? "#ffaa3344" : ACCENT + "33"}`, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div>
              <p style={{ fontSize: "0.45rem", letterSpacing: "0.28em", color: approvalOn ? "#ffaa33" : `${ACCENT}aa`, fontWeight: 700, marginBottom: "4px" }}>■ 심사 모드</p>
              <p style={{ fontSize: "0.42rem", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", fontFamily: "NanumBarunGothic, sans-serif" }}>
                {approvalOn
                  ? "ON — 등록 요청이 대기 상태로 저장, 허용한 캐릭터만 공개됩니다."
                  : "OFF — 등록하면 즉시 투표 목록에 노출됩니다."}
              </p>
            </div>
            <button
              onClick={handleToggleApproval}
              disabled={togglingApproval || !config}
              style={{ flexShrink: 0, padding: "7px 14px", fontSize: "0.45rem", fontWeight: 800, letterSpacing: "0.15em", border: `1.5px solid ${approvalOn ? "#ffaa33" : ACCENT}`, background: approvalOn ? "rgba(255,170,51,0.15)" : `${ACCENT}22`, color: approvalOn ? "#ffaa33" : ACCENT, cursor: togglingApproval || !config ? "wait" : "pointer", ...PIXEL }}
            >
              {togglingApproval ? "..." : approvalOn ? "심사OFF" : "심사ON"}
            </button>
          </div>
        </section>

        {/* ── 대기 목록 ── */}
        {(approvalOn || pending.length > 0) && (
          <section style={{ marginBottom: "20px", background: "rgba(0,0,0,0.4)", border: "1.5px solid #ffaa3355", padding: "14px 16px" }}>
            <p style={{ fontSize: "0.45rem", letterSpacing: "0.28em", color: "#ffaa33", fontWeight: 700, marginBottom: pending.length > 0 ? "12px" : "0" }}>
              ■ PENDING {pending.length > 0 && <span style={{ color: "#ffaa33", fontFamily: "NanumBarunGothic, sans-serif" }}>({pending.length})</span>}
            </p>
            {pending.length === 0 ? (
              <p style={{ fontSize: "0.42rem", color: "rgba(255,255,255,0.3)", fontFamily: "NanumBarunGothic, sans-serif", marginTop: "8px" }}>대기 중인 등록 요청이 없습니다.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {pending.map((c) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid rgba(255,170,51,0.15)", paddingBottom: "10px" }}>
                    <div style={{ position: "relative", width: "48px", height: "48px", flexShrink: 0 }}>
                      <Image src={c.image_path} alt={c.title} fill className="object-cover" sizes="48px" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.5rem", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</p>
                      <p style={{ fontSize: "0.42rem", color: `${ACCENT}bb`, marginTop: "2px" }}>{c.member}</p>
                      {c.description && (
                        <p style={{ fontSize: "0.4rem", color: "rgba(255,255,255,0.35)", fontFamily: "NanumBarunGothic, sans-serif", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.description}
                        </p>
                      )}
                      <p style={{ fontSize: "0.38rem", color: "rgba(255,255,255,0.25)", fontFamily: "NanumBarunGothic, sans-serif", marginTop: "2px" }}>
                        {new Date(c.created_at).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 }}>
                      <button
                        onClick={() => handleApproveCandidate(c.id, "approved")}
                        disabled={approvingId === c.id}
                        style={{ padding: "4px 10px", fontSize: "0.4rem", fontWeight: 800, letterSpacing: "0.12em", background: `${ACCENT}22`, border: `1.5px solid ${ACCENT}`, color: ACCENT, cursor: approvingId === c.id ? "wait" : "pointer", ...PIXEL, opacity: approvingId === c.id ? 0.5 : 1 }}
                      >
                        허용
                      </button>
                      <button
                        onClick={() => handleApproveCandidate(c.id, "rejected")}
                        disabled={approvingId === c.id}
                        style={{ padding: "4px 10px", fontSize: "0.4rem", fontWeight: 800, letterSpacing: "0.12em", background: "rgba(255,77,77,0.15)", border: "1.5px solid rgba(255,77,77,0.5)", color: "#ff6b6b", cursor: approvingId === c.id ? "wait" : "pointer", ...PIXEL, opacity: approvingId === c.id ? 0.5 : 1 }}
                      >
                        거절
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── 투표 기간 설정 ── */}
        <section style={{ marginBottom: "20px", background: "rgba(0,0,0,0.4)", border: `1.5px solid ${ACCENT}33`, padding: "14px 16px" }}>
          <p style={{ fontSize: "0.45rem", letterSpacing: "0.28em", color: `${ACCENT}aa`, fontWeight: 700, marginBottom: "12px" }}>■ VOTE PERIOD</p>
          {config ? (
            <p style={{ fontSize: "0.45rem", letterSpacing: "0.05em", color: "rgba(255,255,255,0.5)", marginBottom: "12px", fontFamily: "NanumBarunGothic, sans-serif" }}>
              현재: {new Date(config.start_at).toLocaleString("ko-KR")} → {new Date(config.end_at).toLocaleString("ko-KR")}
            </p>
          ) : (
            <p style={{ fontSize: "0.45rem", color: "#ffaa33", marginBottom: "12px", fontFamily: "NanumBarunGothic, sans-serif" }}>⚠ 투표 기간이 설정되지 않았습니다</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.42rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>START</label>
              <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.42rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>END</label>
              <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} style={inputStyle} />
            </div>
            <button
              onClick={handleSaveConfig}
              disabled={savingConfig}
              style={{ padding: "8px", fontSize: "0.48rem", fontWeight: 800, letterSpacing: "0.22em", background: savingConfig ? `${ACCENT}66` : ACCENT, color: "#0d1a00", border: "none", cursor: savingConfig ? "wait" : "pointer", boxShadow: savingConfig ? "none" : `0 0 12px ${ACCENT}44`, ...PIXEL }}
            >
              {savingConfig ? "SAVING..." : "SAVE"}
            </button>
            {configMsg && (
              <p style={{ fontSize: "0.42rem", letterSpacing: "0.1em", color: configMsg.ok ? ACCENT : "#ff6b6b", fontFamily: "NanumBarunGothic, sans-serif" }}>
                {configMsg.msg}
              </p>
            )}
          </div>
        </section>

        {/* ── 투표 통계 ── */}
        <section style={{ marginBottom: "20px", background: "rgba(0,0,0,0.4)", border: `1.5px solid ${ACCENT}33`, padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "14px" }}>
            <p style={{ fontSize: "0.45rem", letterSpacing: "0.28em", color: `${ACCENT}aa`, fontWeight: 700 }}>■ VOTE STATS</p>
            <span style={{ fontSize: "0.48rem", color: ACCENT, fontWeight: 800, fontFamily: "monospace" }}>
              총 {total}표
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {memberStats.map(({ member, count, votes }) => (
              <div key={member}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                  <span style={{ fontSize: "0.42rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.7)", fontWeight: 700, minWidth: "80px" }}>
                    {member}
                  </span>
                  <span style={{ fontSize: "0.42rem", color: "rgba(255,255,255,0.35)", fontFamily: "NanumBarunGothic, sans-serif" }}>
                    {count}명
                  </span>
                  <span style={{ fontSize: "0.45rem", color: ACCENT, fontWeight: 800, fontFamily: "monospace", minWidth: "40px", textAlign: "right" }}>
                    {votes}표
                  </span>
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(votes / maxVotes) * 100}%`, background: ACCENT, boxShadow: votes > 0 ? `0 0 6px ${ACCENT}88` : "none", transition: "width 0.6s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 캐릭터 목록 ── */}
        <section>
          {/* 헤더 + 멤버 필터 */}
          <div style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
              <p style={{ fontSize: "0.45rem", letterSpacing: "0.28em", color: `${ACCENT}aa`, fontWeight: 700 }}>■ CHARACTERS</p>
              <span style={{ fontSize: "0.42rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", fontFamily: "NanumBarunGothic, sans-serif" }}>
                {filtered.length}명 · {filteredTotal}표
              </span>
            </div>
            {/* 멤버 필터 버튼 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {(["ALL", ...MEMBERS] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMember(m)}
                  style={{
                    padding: "3px 8px",
                    fontSize: "0.38rem",
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    border: `1.5px solid ${filterMember === m ? ACCENT : "rgba(255,255,255,0.18)"}`,
                    background: filterMember === m ? ACCENT : "rgba(0,0,0,0.3)",
                    color: filterMember === m ? "#0d1a00" : "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    ...PIXEL,
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", padding: "32px 0", fontSize: "0.48rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)" }}>LOADING...</p>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: "center", padding: "32px 0", fontSize: "0.48rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)" }}>
              {candidates.length === 0 ? "등록된 캐릭터가 없습니다" : `${filterMember} 캐릭터 없음`}
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.48rem", fontFamily: "NanumBarunGothic, sans-serif" }}>
                <thead>
                  <tr style={{ borderBottom: `1.5px solid ${ACCENT}33` }}>
                    {["이미지", "아바타스타 엑소", "멤버", "등록일", "득표", "표 추가", "삭제"].map((h) => (
                      <th key={h} style={{ padding: "6px 8px", fontSize: "0.38rem", letterSpacing: "0.15em", color: `${ACCENT}88`, fontWeight: 700, textAlign: h === "득표" || h === "삭제" ? "right" : "left", ...PIXEL, whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .sort((a, b) => b.vote_count - a.vote_count)
                    .map((c) => (
                      <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <td style={{ padding: "6px 8px" }}>
                          <div style={{ position: "relative", width: "40px", height: "40px" }}>
                            <Image src={c.image_path} alt={c.title} fill className="object-cover" sizes="40px" />
                          </div>
                        </td>
                        <td style={{ padding: "6px 8px", color: "rgba(255,255,255,0.85)", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.5rem" }}>
                          {c.title}
                        </td>
                        <td style={{ padding: "6px 8px", color: `${ACCENT}cc`, whiteSpace: "nowrap", fontSize: "0.45rem" }}>{c.member}</td>
                        <td style={{ padding: "6px 8px", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", fontSize: "0.42rem" }}>
                          {new Date(c.created_at).toLocaleDateString("ko-KR")}
                        </td>
                        <td style={{ padding: "6px 8px", textAlign: "right", color: ACCENT, fontWeight: 700, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                          {c.vote_count}
                        </td>
                        <td style={{ padding: "6px 8px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "3px", justifyContent: "flex-end" }}>
                            <input
                              type="number"
                              min={1}
                              max={1000}
                              placeholder="n"
                              value={injectCount[c.id] ?? ""}
                              onChange={(e) => setInjectCount((p) => ({ ...p, [c.id]: e.target.value }))}
                              style={{ ...inputStyle, width: "44px", padding: "3px 5px", fontSize: "0.42rem", textAlign: "center" }}
                            />
                            <button
                              onClick={() => handleInjectVotes(c.id)}
                              disabled={injectingId === c.id || !injectCount[c.id]}
                              style={{ padding: "3px 6px", fontSize: "0.38rem", fontWeight: 800, letterSpacing: "0.05em", background: `${ACCENT}22`, border: `1px solid ${ACCENT}88`, color: ACCENT, cursor: injectingId === c.id ? "wait" : "pointer", ...PIXEL, opacity: injectingId === c.id ? 0.5 : 1, whiteSpace: "nowrap" }}
                            >
                              {injectingId === c.id ? "..." : "+표"}
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: "6px 8px", textAlign: "right" }}>
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={deleting === c.id}
                            style={{ padding: "3px 7px", fontSize: "0.38rem", letterSpacing: "0.1em", fontWeight: 700, background: "rgba(255,77,77,0.15)", border: "1px solid rgba(255,77,77,0.4)", color: "#ff6b6b", cursor: deleting === c.id ? "wait" : "pointer", ...PIXEL, opacity: deleting === c.id ? 0.5 : 1 }}
                          >
                            {deleting === c.id ? "..." : "DEL"}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div style={{ marginTop: "28px", textAlign: "center" }}>
          <button
            onClick={() => router.push("/concert/vote")}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.42rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", ...PIXEL }}
          >
            ← 투표 페이지로
          </button>
        </div>

      </div>
    </div>
  );
}

// ── 메인 export ────────────────────────────────────────────
export default function ConcertVoteAdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("exo_admin_authed") === "1") {
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  if (checking) return null;
  if (!authed) return <PasswordGate onSuccess={() => setAuthed(true)} />;
  return <AdminPanel />;
}

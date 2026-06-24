"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

const ACCENT = "#a3e635";
const MEMBERS = ["SUHO", "LAY", "CHANYEOL", "D.O.", "KAI", "SEHUN"] as const;
type MemberName = (typeof MEMBERS)[number];

const DEFAULT_LIMIT = 10;

interface Candidate {
  id: number;
  title: string;
  member: string;
  description: string | null;
  description_ko: string | null;
  description_en: string | null;
  image_path: string;
  vote_rank: number;
  percent: number;
}

interface VoteConfig {
  start_at: string;
  end_at: string;
}

// localStorage로 오늘 투표한 후보 ID 저장/복원 (날짜 바뀌면 자동 초기화)
function todayKey(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

function loadVotedIds(): Set<number> {
  try {
    const raw = localStorage.getItem("exo_vote_voted");
    if (!raw) return new Set();
    const { date, ids } = JSON.parse(raw) as { date: string; ids: number[] };
    if (date !== todayKey()) return new Set(); // 날짜 다르면 초기화
    return new Set(ids);
  } catch {
    return new Set();
  }
}

function saveVotedId(id: number) {
  try {
    const set = loadVotedIds();
    set.add(id);
    localStorage.setItem("exo_vote_voted", JSON.stringify({ date: todayKey(), ids: [...set] }));
  } catch {}
}

type CountdownPhase = "noconfig" | "before" | "active" | "ended";
interface CountdownState { phase: CountdownPhase; d: number; h: number; m: number; s: number; }

function useCountdown(config: VoteConfig | null): CountdownState {
  const [state, setState] = useState<CountdownState>({ phase: "noconfig", d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!config) { setState({ phase: "noconfig", d: 0, h: 0, m: 0, s: 0 }); return; }

    const tick = () => {
      const now = Date.now();
      const start = new Date(config.start_at).getTime();
      const end = new Date(config.end_at).getTime();
      if (now < start) {
        const diff = start - now;
        setState({ phase: "before", d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: 0 });
        return;
      }
      if (now > end) { setState({ phase: "ended", d: 0, h: 0, m: 0, s: 0 }); return; }
      const diff = end - now;
      setState({ phase: "active", d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [config]);

  return state;
}

export function VoteBinderClient() {
  const router = useRouter();
  const t = useTranslations("concert");
  const { locale } = useParams() as { locale: string };
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [config, setConfig] = useState<VoteConfig | null>(null);
  const [activeTab, setActiveTab] = useState<"전체" | MemberName>("전체");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [voting, setVoting] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [votedIds, setVotedIds] = useState<Set<number>>(new Set());
  const [showAll, setShowAll] = useState<Partial<Record<MemberName, boolean>>>({});
  const [openDescId, setOpenDescId] = useState<number | null>(null);

  const { phase, d, h, m, s } = useCountdown(config);
  const isEnded = phase === "ended";
  const isActive = phase === "active";
  const countdown =
    phase === "noconfig" ? t("voteNoConfig")
    : phase === "ended" ? t("voteEnded")
    : phase === "before"
      ? (d > 0 ? t("voteStartsDay", { d, h }) : t("voteStartsHour", { h, m }))
      : (d > 0 ? t("voteRemDay", { d, h, m }) : h > 0 ? t("voteRemHour", { h, m, s }) : t("voteRemMin", { m, s }));

  useEffect(() => {
    setVotedIds(loadVotedIds());
  }, []);

  const fetchResults = useCallback(async () => {
    const res = await fetch("/api/vote/results", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setCandidates(data.results ?? []);
    setConfig(data.config ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchResults();
    const iv = setInterval(fetchResults, 30000);
    return () => clearInterval(iv);
  }, [fetchResults]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleVote = async (candidateId: number) => {
    if (voting !== null || !isActive) return;
    setVoting(candidateId);
    try {
      const res = await fetch("/api/vote/cast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: candidateId }),
      });
      const data = await res.json();
      if (res.ok) {
        saveVotedId(candidateId);
        setVotedIds((prev) => new Set([...prev, candidateId]));
        showToast(t("voteSuccess"), true);
        fetchResults();
      } else {
        showToast(data.error ?? t("voteFail"), false);
      }
    } catch {
      showToast(t("voteNetworkError"), false);
    } finally {
      setVoting(null);
    }
  };

  // ── 탭별 후보 계산 ───────────────────────────────────────

  // 멤버별 탭: 해당 멤버 후보를 득표 순 내림차순
  const byMember = (member: MemberName): Candidate[] =>
    candidates
      .filter((c) => c.member === member)
      .sort((a, b) => b.vote_rank - a.vote_rank);

  // 전체 탭: 각 멤버의 1위 후보만 (득표 0이면 등록순 첫 번째)
  const topPerMember: Candidate[] = MEMBERS.flatMap((m) => {
    const list = byMember(m);
    return list.length > 0 ? [list[0]] : [];
  });

  const displayList: Candidate[] =
    activeTab === "전체"
      ? topPerMember
      : (() => {
          const list = byMember(activeTab);
          const expanded = showAll[activeTab];
          return expanded ? list : list.slice(0, DEFAULT_LIMIT);
        })();

  const hiddenCount =
    activeTab !== "전체"
      ? Math.max(0, byMember(activeTab).length - DEFAULT_LIMIT)
      : 0;

  // ── 카드 렌더 ────────────────────────────────────────────
  const renderCard = (c: Candidate, rank?: number) => {
    const alreadyVoted = votedIds.has(c.id);
    const isVoting = voting === c.id;

    let btnLabel = "VOTE";
    if (isVoting) btnLabel = "...";
    else if (alreadyVoted) btnLabel = "VOTED ✓";
    else if (!isActive) btnLabel = isEnded ? "ENDED" : "WAIT";

    const btnActive = isActive && !alreadyVoted && voting === null;

    return (
      <div
        key={c.id}
        style={{
          background: "rgba(0,0,0,0.45)",
          border: `1.5px solid ${alreadyVoted ? ACCENT + "66" : ACCENT + "28"}`,
          overflow: "hidden",
        }}
      >
        {/* 이미지 */}
        <div
          style={{ position: "relative", width: "100%", aspectRatio: "1/1", cursor: c.description ? "pointer" : "default" }}
          onClick={() => c.description && setOpenDescId(openDescId === c.id ? null : c.id)}
        >
          <Image src={c.image_path} alt={c.title} fill className="object-cover" sizes="200px" />

          {/* 설명 오버레이 */}
          {openDescId === c.id && c.description && (() => {
            const localeDesc = locale === "en"
              ? (c.description_en ?? c.description)
              : (c.description_ko ?? c.description);
            const originalDiffers = locale === "en"
              ? (c.description_en && c.description_en !== c.description)
              : (c.description_ko && c.description_ko !== c.description);
            return (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.85)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  gap: "6px",
                }}
              >
                <p
                  style={{
                    fontSize: "0.48rem",
                    color: "rgba(255,255,255,0.92)",
                    lineHeight: 1.7,
                    textAlign: "center",
                    wordBreak: "keep-all",
                    fontFamily: "NanumBarunGothic, sans-serif",
                    letterSpacing: "0.03em",
                  }}
                >
                  {localeDesc}
                </p>
                {originalDiffers && (
                  <p
                    style={{
                      fontSize: "0.38rem",
                      color: "rgba(255,255,255,0.3)",
                      textAlign: "center",
                      fontFamily: "NanumBarunGothic, sans-serif",
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                      paddingTop: "5px",
                      width: "100%",
                      wordBreak: "break-all",
                    }}
                  >
                    {c.description}
                  </p>
                )}
              </div>
            );
          })()}

          {/* 설명 있음 힌트 (닫혀있을 때) */}
          {c.description && openDescId !== c.id && (
            <div
              style={{
                position: "absolute",
                bottom: "4px",
                right: "4px",
                fontSize: "0.38rem",
                color: "rgba(255,255,255,0.5)",
                background: "rgba(0,0,0,0.55)",
                padding: "1px 4px",
                fontFamily: "'PFStarDust', monospace",
                WebkitFontSmoothing: "none",
                pointerEvents: "none",
              }}
            >
              ☞
            </div>
          )}

          {/* 멤버 배지 (전체 탭에서만) */}
          {activeTab === "전체" && (
            <div
              style={{
                position: "absolute",
                top: "4px",
                left: "4px",
                background: `${ACCENT}dd`,
                color: "#0d1a00",
                fontSize: "0.38rem",
                fontWeight: 800,
                letterSpacing: "0.15em",
                padding: "1px 5px",
                fontFamily: "'PFStarDust', monospace",
                WebkitFontSmoothing: "none",
              }}
            >
              {c.member}
            </div>
          )}

          {/* 순위 배지 (멤버 탭에서만) */}
          {rank !== undefined && (
            <div
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                background: rank === 0 ? ACCENT : "rgba(0,0,0,0.7)",
                color: rank === 0 ? "#0d1a00" : "rgba(255,255,255,0.6)",
                fontSize: "0.4rem",
                fontWeight: 800,
                letterSpacing: "0.1em",
                padding: "1px 5px",
                fontFamily: "'PFStarDust', monospace",
                WebkitFontSmoothing: "none",
              }}
            >
              #{rank + 1}
            </div>
          )}

          {/* 투표 완료 오버레이 */}
          {alreadyVoted && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(163,230,53,0.12)",
                border: `2px solid ${ACCENT}88`,
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        {/* 정보 */}
        <div style={{ padding: "6px 7px 8px" }}>
          <p
            style={{
              fontSize: "0.5rem",
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "0.05em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginBottom: "5px",
              fontFamily: "NanumBarunGothic, sans-serif",
            }}
          >
            {c.title}
          </p>

          {/* 퍼센트 바 */}
          <div style={{ marginBottom: "7px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                fontSize: "0.42rem",
                color: ACCENT,
                fontWeight: 700,
                marginBottom: "2px",
                letterSpacing: "0.05em",
                fontFamily: "'PFStarDust', monospace",
                WebkitFontSmoothing: "none",
              }}
            >
              {c.percent}%
            </div>
            <div style={{ height: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "1px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${c.percent}%`,
                  background: ACCENT,
                  boxShadow: `0 0 4px ${ACCENT}88`,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>

          {/* 투표 버튼 */}
          <button
            onClick={() => handleVote(c.id)}
            disabled={!btnActive}
            style={{
              width: "100%",
              padding: "4px 0",
              fontSize: "0.42rem",
              fontWeight: 800,
              letterSpacing: "0.18em",
              border: `1.5px solid ${btnActive ? ACCENT : alreadyVoted ? ACCENT + "55" : "rgba(255,255,255,0.12)"}`,
              background: btnActive
                ? ACCENT
                : alreadyVoted
                ? `${ACCENT}18`
                : "rgba(255,255,255,0.04)",
              color: btnActive ? "#0d1a00" : alreadyVoted ? ACCENT : "rgba(255,255,255,0.25)",
              cursor: btnActive ? "pointer" : "default",
              transition: "all 0.15s",
              fontFamily: "'PFStarDust', monospace",
              WebkitFontSmoothing: "none",
            }}
          >
            {btnLabel}
          </button>
        </div>
      </div>
    );
  };

  // ── JSX ──────────────────────────────────────────────────
  return (
    <div className="pb-6">
      {/* 카운트다운 */}
      <div
        style={{
          marginBottom: "14px",
          padding: "8px 10px",
          background: "rgba(0,0,0,0.4)",
          border: `1.5px solid ${ACCENT}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "0.42rem", letterSpacing: "0.28em", color: `${ACCENT}88`, fontWeight: 700, fontFamily: "'PFStarDust', monospace", WebkitFontSmoothing: "none" }}>
          ■ VOTE PERIOD
        </span>
        <span
          style={{
            fontSize: "0.62rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: !config ? "rgba(255,255,255,0.3)" : isEnded ? "#ff4d4d" : ACCENT,
            textShadow: isActive ? `0 0 10px ${ACCENT}88` : "none",
            fontFamily: "'PFStarDust', monospace",
            WebkitFontSmoothing: "none",
          }}
        >
          {!config ? "기간 미설정" : countdown}
        </span>
      </div>

      {/* 멤버 탭 */}
      <div style={{ display: "flex", gap: "4px", overflowX: "auto", paddingBottom: "8px", marginBottom: "12px", scrollbarWidth: "none" }}>
        {(["전체", ...MEMBERS] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            style={{
              flexShrink: 0,
              padding: "3px 8px",
              fontSize: "0.5rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              border: `1.5px solid ${activeTab === tab ? ACCENT : "rgba(255,255,255,0.2)"}`,
              background: activeTab === tab ? ACCENT : "rgba(0,0,0,0.3)",
              color: activeTab === tab ? "#0d1a00" : "rgba(255,255,255,0.6)",
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: "'PFStarDust', monospace",
              WebkitFontSmoothing: "none",
            }}
          >
            {tab === "전체" ? t("voteAllTab") : tab}
          </button>
        ))}
      </div>

      {/* 전체 탭 설명 */}
      {activeTab === "전체" && (
        <p style={{ fontSize: "0.42rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", marginBottom: "10px", fontFamily: "'PFStarDust', monospace", WebkitFontSmoothing: "none" }}>
          {t("voteTopHint")}
        </p>
      )}

      {/* 후보자 그리드 */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "32px 0", fontSize: "0.52rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontFamily: "'PFStarDust', monospace", WebkitFontSmoothing: "none" }}>
          LOADING...
        </div>
      ) : displayList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "28px 0", fontSize: "0.52rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", fontFamily: "'PFStarDust', monospace", WebkitFontSmoothing: "none" }}>
          <div style={{ fontSize: "1.4rem", marginBottom: "8px" }}>🔭</div>
          {t("voteEmpty")}
          <br />
          <button
            onClick={() => router.push("/concert/vote/submit")}
            style={{ marginTop: "8px", fontSize: "0.45rem", color: ACCENT, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.15em", fontFamily: "'PFStarDust', monospace", WebkitFontSmoothing: "none" }}
          >
            {t("voteCreateLink")}
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {displayList.map((c, i) =>
              renderCard(c, activeTab !== "전체" ? i : undefined)
            )}
          </div>

          {/* 더 보기 버튼 */}
          {activeTab !== "전체" && hiddenCount > 0 && !showAll[activeTab] && (
            <button
              onClick={() => setShowAll((prev) => ({ ...prev, [activeTab]: true }))}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "6px",
                fontSize: "0.45rem",
                fontWeight: 700,
                letterSpacing: "0.18em",
                border: `1.5px solid ${ACCENT}44`,
                background: "rgba(0,0,0,0.3)",
                color: `${ACCENT}cc`,
                cursor: "pointer",
                fontFamily: "'PFStarDust', monospace",
                WebkitFontSmoothing: "none",
              }}
            >
              더 보기 (+{hiddenCount})
            </button>
          )}
        </>
      )}

      {/* 등록 링크 */}
      <div style={{ marginTop: "16px", textAlign: "center" }}>
        <button
          onClick={() => router.push("/concert/vote/submit")}
          style={{ fontSize: "0.42rem", letterSpacing: "0.2em", color: `${ACCENT}66`, background: "none", border: "none", cursor: "pointer", fontFamily: "'PFStarDust', monospace", WebkitFontSmoothing: "none" }}
        >
          {t("voteCreateLink")}
        </button>
      </div>

      {/* 토스트 */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "96px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "8px 16px",
            fontSize: "0.52rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            background: toast.ok ? ACCENT : "#ff4d4d",
            color: toast.ok ? "#0d1a00" : "#fff",
            boxShadow: `0 0 16px ${toast.ok ? ACCENT : "#ff4d4d"}88`,
            zIndex: 50,
            whiteSpace: "nowrap",
            fontFamily: "'PFStarDust', monospace",
            WebkitFontSmoothing: "none",
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

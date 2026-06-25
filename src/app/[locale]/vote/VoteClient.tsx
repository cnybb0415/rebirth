"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const MEMBERS = ["전체", "수호", "레이", "찬열", "D.O.", "카이", "세훈"] as const;

interface Candidate {
  id: number;
  title: string;
  member: string;
  description: string | null;
  image_path: string;
  created_at: string;
  percent: number;
}

interface VoteConfig {
  start_at: string;
  end_at: string;
}

function useCountdown(endAt: string | null) {
  const [remaining, setRemaining] = useState<string>("");
  const [isEnded, setIsEnded] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (!endAt) return;

    const tick = () => {
      const now = Date.now();
      const end = new Date(endAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setIsEnded(true);
        setRemaining("투표가 종료되었습니다");
        return;
      }

      setIsEnded(false);
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      if (d > 0) setRemaining(`${d}일 ${h}시간 ${m}분 남음`);
      else if (h > 0) setRemaining(`${h}시간 ${m}분 ${s}초 남음`);
      else setRemaining(`${m}분 ${s}초 남음`);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endAt]);

  useEffect(() => {
    if (!endAt) return;
    const now = Date.now();
    const end = new Date(endAt).getTime();
    setIsStarted(now <= end);
  }, [endAt]);

  return { remaining, isEnded, isStarted };
}

export function VoteClient() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [config, setConfig] = useState<VoteConfig | null>(null);
  const [activeTab, setActiveTab] = useState<string>("전체");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [voting, setVoting] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const { remaining, isEnded } = useCountdown(config?.end_at ?? null);

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
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, [fetchResults]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleVote = async (candidateId: number) => {
    if (voting !== null || isEnded) return;
    setVoting(candidateId);

    try {
      const res = await fetch("/api/vote/cast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: candidateId }),
      });
      const data = await res.json();

      if (res.ok) {
        showToast("투표가 완료되었습니다!", true);
        fetchResults();
      } else {
        showToast(data.error ?? "투표에 실패했습니다.", false);
      }
    } catch {
      showToast("네트워크 오류가 발생했습니다.", false);
    } finally {
      setVoting(null);
    }
  };

  const filtered =
    activeTab === "전체" ? candidates : candidates.filter((c) => c.member === activeTab);

  const isVotingActive = config !== null && !isEnded;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      {/* 헤더 */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">EXO 팬 투표</h1>
        <div className="text-sm text-foreground/60">
          {!config ? (
            <span>투표 기간이 설정되지 않았습니다</span>
          ) : isEnded ? (
            <span className="font-medium text-red-500">투표가 종료되었습니다</span>
          ) : (
            <span className="font-medium text-foreground">{remaining}</span>
          )}
        </div>
      </div>

      {/* 멤버 탭 */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {MEMBERS.map((m) => (
          <button
            key={m}
            onClick={() => setActiveTab(m)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === m
                ? "bg-foreground text-background"
                : "bg-foreground/10 text-foreground hover:bg-foreground/20"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* 후보자 그리드 */}
      {loading ? (
        <div className="flex justify-center py-20 text-foreground/40">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="flex justify-center py-20 text-foreground/40">
          후보자가 없습니다.{" "}
          <a href="/ko/vote/submit" className="ml-1 underline">
            후보자를 등록해보세요!
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="overflow-hidden rounded-2xl border border-foreground/10 bg-surface shadow-sm"
            >
              {/* 이미지 */}
              <div className="relative aspect-square w-full overflow-hidden bg-foreground/5">
                <Image
                  src={c.image_path}
                  alt={c.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>

              {/* 정보 */}
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{c.title}</p>
                <p className="mt-0.5 text-xs text-foreground/60">{c.member}</p>

                {/* 퍼센트 바 */}
                <div className="mt-2">
                  <div className="mb-1 flex items-center justify-between text-xs text-foreground/60">
                    <span>{c.percent}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                    <div
                      className="h-full rounded-full bg-foreground transition-all duration-500"
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                </div>

                {/* 투표 버튼 */}
                <button
                  onClick={() => handleVote(c.id)}
                  disabled={!isVotingActive || voting !== null}
                  className={`mt-3 w-full rounded-lg py-1.5 text-sm font-medium transition-colors ${
                    !isVotingActive
                      ? "cursor-not-allowed bg-foreground/10 text-foreground/40"
                      : voting === c.id
                      ? "cursor-wait bg-foreground/20 text-foreground/60"
                      : "bg-foreground text-background hover:bg-foreground/80"
                  }`}
                >
                  {voting === c.id ? "투표 중..." : !isVotingActive ? "투표 종료" : "투표하기"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 후보자 등록 링크 */}
      <div className="mt-10 text-center text-sm text-foreground/50">
        <a href="vote/submit" className="underline hover:text-foreground">
          후보자 등록하기
        </a>
      </div>

      {/* 토스트 */}
      {toast && (
        <div
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium shadow-lg transition-all ${
            toast.ok
              ? "bg-foreground text-background"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

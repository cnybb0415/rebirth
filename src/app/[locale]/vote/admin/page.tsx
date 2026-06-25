"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Candidate {
  id: number;
  title: string;
  member: string;
  description: string | null;
  image_path: string;
  created_at: string;
  vote_count: number;
}

interface VoteConfig {
  start_at: string;
  end_at: string;
}

function toLocalDatetimeValue(isoStr: string): string {
  const d = new Date(isoStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultStart() {
  const d = new Date();
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultEnd() {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function VoteAdminPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [config, setConfig] = useState<VoteConfig | null>(null);
  const [startAt, setStartAt] = useState(defaultStart());
  const [endAt, setEndAt] = useState(defaultEnd());
  const [configMsg, setConfigMsg] = useState<{ msg: string; ok: boolean } | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [cRes, cfRes] = await Promise.all([
      fetch("/api/vote/admin/candidates", { cache: "no-store" }),
      fetch("/api/vote/config", { cache: "no-store" }),
    ]);

    if (cRes.ok) {
      const data = await cRes.json();
      setCandidates(data.candidates ?? []);
    }

    if (cfRes.ok) {
      const data = await cfRes.json();
      if (data.config) {
        setConfig(data.config);
        setStartAt(toLocalDatetimeValue(data.config.start_at));
        setEndAt(toLocalDatetimeValue(data.config.end_at));
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까? 해당 후보자의 모든 투표도 삭제됩니다.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/vote/candidates/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCandidates((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("삭제에 실패했습니다.");
      }
    } finally {
      setDeleting(null);
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    setConfigMsg(null);
    try {
      const res = await fetch("/api/vote/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_at: new Date(startAt).toISOString(),
          end_at: new Date(endAt).toISOString(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setConfigMsg({ msg: "투표 기간이 저장되었습니다.", ok: true });
        fetchAll();
      } else {
        setConfigMsg({ msg: data.error ?? "저장 실패", ok: false });
      }
    } finally {
      setSavingConfig(false);
    }
  };

  const total = candidates.reduce((s, c) => s + c.vote_count, 0);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="mb-8 text-2xl font-bold">투표 관리자</h1>

      {/* 투표 기간 설정 */}
      <section className="mb-10 rounded-2xl border border-foreground/10 bg-surface p-6">
        <h2 className="mb-4 text-base font-semibold">투표 기간 설정</h2>

        {config ? (
          <p className="mb-4 text-sm text-foreground/60">
            현재: {new Date(config.start_at).toLocaleString("ko-KR")} →{" "}
            {new Date(config.end_at).toLocaleString("ko-KR")}
          </p>
        ) : (
          <p className="mb-4 text-sm text-amber-600">
            투표 기간이 설정되지 않았습니다. 아래에서 설정해주세요.
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs text-foreground/60">시작일시</label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/60"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs text-foreground/60">종료일시</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="rounded-xl border border-foreground/20 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/60"
            />
          </div>
          <button
            onClick={handleSaveConfig}
            disabled={savingConfig}
            className="rounded-xl bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:bg-foreground/80 disabled:opacity-60"
          >
            {savingConfig ? "저장 중..." : "저장"}
          </button>
        </div>

        {configMsg && (
          <p className={`mt-3 text-sm ${configMsg.ok ? "text-green-600" : "text-red-600"}`}>
            {configMsg.msg}
          </p>
        )}
      </section>

      {/* 후보자 목록 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">후보자 목록</h2>
          <span className="text-sm text-foreground/60">
            총 {candidates.length}명 · {total}표
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-foreground/40">불러오는 중...</div>
        ) : candidates.length === 0 ? (
          <div className="py-10 text-center text-foreground/40">등록된 후보자가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-foreground/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/10 bg-foreground/5 text-left text-xs text-foreground/60">
                  <th className="px-4 py-3">이미지</th>
                  <th className="px-4 py-3">제목</th>
                  <th className="px-4 py-3">멤버</th>
                  <th className="px-4 py-3">등록일</th>
                  <th className="px-4 py-3 text-right">득표수</th>
                  <th className="px-4 py-3 text-right">삭제</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id} className="border-b border-foreground/10 last:border-0">
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-foreground/5">
                        <Image
                          src={c.image_path}
                          alt={c.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3 font-medium">{c.title}</td>
                    <td className="px-4 py-3 text-foreground/70">{c.member}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-foreground/60">
                      {new Date(c.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      {c.vote_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deleting === c.id}
                        className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        {deleting === c.id ? "삭제 중" : "삭제"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-8 text-center">
        <a
          href="/ko/vote"
          className="text-sm text-foreground/50 underline hover:text-foreground"
        >
          ← 투표 페이지로 돌아가기
        </a>
      </div>
    </main>
  );
}

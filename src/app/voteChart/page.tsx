"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type RankItem = {
  rank: 1 | 2 | 3;
  title: string;
  subtitle: string;
  votes: string;
  description: string;
};

const RANK_ITEMS: RankItem[] = [
  {
    rank: 1,
    title: "1등",
    subtitle: "최대다섯자",
    votes: "123,456표",
    description: "여기에 1등 설명을 적어주세요.",
  },
  {
    rank: 2,
    title: "2등",
    subtitle: "최대다섯자",
    votes: "98,765표",
    description: "여기에 2등 설명을 적어주세요.",
  },
  {
    rank: 3,
    title: "3등",
    subtitle: "최대다섯자",
    votes: "87,654표",
    description: "여기에 3등 설명을 적어주세요.",
  },
];

export default function VoteChartPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRank, setSelectedRank] = useState<1 | 2 | 3>(1);

  const selected = useMemo(
    () => RANK_ITEMS.find((item) => item.rank === selectedRank) ?? RANK_ITEMS[0],
    [selectedRank]
  );

  const goToRank = (rank: 1 | 2 | 3) => {
    setSelectedRank(rank);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-foreground/60">Vote Chart</div>
            <h1 className="mt-1 text-2xl font-bold">현 순위 상황</h1>
          </div>
          {step !== 1 ? (
            <Button variant="ghost" onClick={() => setStep(1)}>
              처음으로
            </Button>
          ) : null}
        </div>

        {step === 1 ? (
          <div className="mt-8">
            <div className="relative overflow-hidden rounded-[28px] border border-foreground/10 bg-gradient-to-br from-[#eef8ff] via-[#e2f1ff] to-[#cfe8ff] p-4 shadow-sm sm:p-8">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(29,120,224,0.18)_0%,rgba(29,120,224,0.18)_10%,transparent_10%,transparent_20%,rgba(29,120,224,0.12)_20%,rgba(29,120,224,0.12)_30%,transparent_30%,transparent_40%,rgba(29,120,224,0.12)_40%,rgba(29,120,224,0.12)_50%,transparent_50%,transparent_60%,rgba(29,120,224,0.1)_60%,rgba(29,120,224,0.1)_70%,transparent_70%,transparent_80%,rgba(29,120,224,0.08)_80%,rgba(29,120,224,0.08)_90%,transparent_90%,transparent_100%)] opacity-30" />
                <div className="absolute left-0 top-0 h-40 w-40 -translate-x-10 -translate-y-10 rotate-12 bg-gradient-to-br from-[#1c6fe0] to-[#4db7ff] opacity-80" />
                <div className="absolute right-6 top-8 h-12 w-12 rotate-12 border-[6px] border-white/80 bg-white/20" />
                <div className="absolute right-0 bottom-0 h-44 w-44 translate-x-12 translate-y-12 rotate-12 bg-gradient-to-br from-[#1c6fe0] to-[#4db7ff] opacity-60" />
                <div className="absolute left-6 bottom-6 h-16 w-16 rotate-12 border-4 border-white/70 bg-white/10" />
              </div>

              <div className="relative mx-auto max-w-3xl">
                <div className="relative rounded-[26px] border-[8px] border-[#1c6fe0] bg-white px-6 py-10 text-center shadow-[0_12px_28px_rgba(24,79,140,0.18)] sm:px-12">
                  <div className="mx-auto mb-5 h-1.5 w-44 rounded-full bg-[#1c6fe0]" />

                  <div className="flex items-center justify-center gap-3">
                    <span className="h-0.5 w-16 bg-[#1c6fe0]" />
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#1c6fe0]" fill="currentColor" aria-hidden>
                      <path d="M4 17h16l-1 3H5l-1-3Zm2-10 4 4 4-7 4 7 4-4-2 9H8L6 7Z" />
                    </svg>
                    <span className="h-0.5 w-16 bg-[#1c6fe0]" />
                  </div>

                  <div className="mt-4 text-base font-semibold text-[#1c6fe0] sm:text-lg">
                    투표 시작부터 지금까지
                  </div>
                  <div className="mt-2 text-4xl font-extrabold tracking-tight text-[#1c6fe0] sm:text-5xl">
                    현 순위 상황
                  </div>
                  <div className="mx-auto mt-4 h-1 w-52 rounded-full bg-[#1c6fe0]" />

                  <div className="relative mt-8">
                    <div className="mx-auto flex max-w-xl items-center justify-center rounded-full border-2 border-[#1c6fe0] bg-[#2a9df4] px-4 py-3 text-sm font-semibold text-white shadow-sm sm:text-base">
                      글에 적힌 네이버 폼 링크로 진행됩니다
                    </div>
                    <div className="mx-auto mt-2 flex max-w-xl items-center justify-center rounded-full border-2 border-[#1c6fe0] bg-[#1c6fe0] px-4 py-2 text-xs font-semibold text-white/95 sm:text-sm">
                      한 IP 당 최대 1회 투표 가능합니다.
                    </div>
                    <div className="absolute left-6 top-1/2 hidden -translate-y-1/2 sm:block">
                      <div className="h-0 w-0 border-y-[18px] border-r-[18px] border-y-transparent border-r-[#1c6fe0]" />
                    </div>
                    <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 sm:block">
                      <div className="h-0 w-0 border-y-[18px] border-l-[18px] border-y-transparent border-l-[#1c6fe0]" />
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button size="lg" onClick={() => setStep(2)} className="rounded-full px-8">
                      순위 보기
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-8">
            <div className="relative overflow-hidden rounded-[28px] border border-foreground/10 bg-[#1f8fe6] p-4 shadow-sm sm:p-8">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15px_15px,rgba(255,255,255,0.45)_2px,transparent_2.5px)] opacity-60" style={{ backgroundSize: "26px 26px" }} />
                <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-br from-[#1476d6] to-transparent opacity-80" />
                <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-bl from-[#1aa2ff] to-transparent opacity-70" />
              </div>

              <div className="relative">
                <div className="mx-auto mb-6 w-full max-w-3xl text-center text-white">
                  <div className="inline-flex items-center gap-3 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold sm:text-sm">
                    <span className="rounded-full bg-white/20 px-3 py-1">더쿠투표 101</span>
                    <span>1 ~ 100등 순위 공개</span>
                  </div>
                </div>

                <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center">
                  <div className="relative w-full">
                    <div className="mx-auto h-0 w-0 border-x-[240px] border-b-[320px] border-x-transparent border-b-white sm:border-x-[280px] sm:border-b-[360px]" />
                    <div className="pointer-events-none absolute left-1/2 top-6 h-0 w-0 -translate-x-1/2 border-x-[200px] border-b-[280px] border-x-transparent border-b-[#dff1ff] sm:border-x-[230px] sm:border-b-[320px]" />
                    <div className="pointer-events-none absolute left-1/2 top-12 h-0 w-0 -translate-x-1/2 border-x-[170px] border-b-[240px] border-x-transparent border-b-[#f7fbff] sm:border-x-[200px] sm:border-b-[280px]" />

                    <div className="absolute left-1/2 top-16 -translate-x-1/2">
                      <div className="mb-2 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#1c6fe0]" fill="currentColor" aria-hidden>
                          <path d="M4 17h16l-1 3H5l-1-3Zm2-10 4 4 4-7 4 7 4-4-2 9H8L6 7Z" />
                        </svg>
                      </div>
                      <button
                        type="button"
                        onClick={() => goToRank(1)}
                        className="flex w-36 flex-col items-center justify-center gap-1 rounded-3xl bg-[#1c6fe0] px-4 py-4 text-white shadow-lg transition hover:-translate-y-0.5"
                      >
                        <div className="text-base font-semibold">1등</div>
                        <div className="text-sm opacity-90">최대다섯자</div>
                      </button>
                    </div>

                    <div className="absolute left-1/2 top-40 flex -translate-x-1/2 gap-4 sm:gap-6">
                      <button
                        type="button"
                        onClick={() => goToRank(2)}
                        className="flex w-30 flex-col items-center justify-center gap-1 rounded-3xl bg-[#1c6fe0] px-3 py-4 text-white shadow-lg transition hover:-translate-y-0.5"
                      >
                        <div className="text-base font-semibold">2등</div>
                        <div className="text-sm opacity-90">최대다섯자</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => goToRank(3)}
                        className="flex w-30 flex-col items-center justify-center gap-1 rounded-3xl bg-[#1c6fe0] px-3 py-4 text-white shadow-lg transition hover:-translate-y-0.5"
                      >
                        <div className="text-base font-semibold">3등</div>
                        <div className="text-sm opacity-90">최대다섯자</div>
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex w-full max-w-2xl items-center justify-center gap-4 text-white">
                    <div className="h-1 w-24 rounded-full bg-white/60" />
                    <div className="text-lg font-semibold">1등 ~ 3등</div>
                    <div className="h-1 w-24 rounded-full bg-white/60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-8">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-[16/9] w-full bg-white">
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-white" />
                    <div
                      className="absolute inset-y-0 left-0 w-[42%] bg-[#0b5bd3]"
                      style={{ clipPath: "polygon(0 0, 100% 0, 72% 100%, 0 100%)" }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 w-[42%] bg-[#116ce2]"
                      style={{ clipPath: "polygon(0 0, 86% 0, 60% 100%, 0 100%)" }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 w-[42%] bg-[#1f86f2]"
                      style={{ clipPath: "polygon(0 20%, 70% 20%, 48% 100%, 0 100%)" }}
                    />
                    <div
                      className="absolute left-0 top-0 h-[48%] w-[42%] bg-[#0a58c7]"
                      style={{ clipPath: "polygon(0 0, 62% 0, 0 62%)" }}
                    />
                    <div
                      className="absolute left-[8%] top-[18%] h-[32%] w-[22%] bg-[#5aa6ff]"
                      style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
                    />

                    <div className="absolute inset-y-0 left-[34%] w-[66%] bg-[radial-gradient(circle_at_28%_28%,rgba(255,255,255,0.18),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.12),transparent_60%),linear-gradient(120deg,#b9874a_0%,#b37a3d_55%,#9c6b36_100%)]" />
                    <div className="absolute inset-y-0 left-[34%] w-[66%] bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.12),transparent_55%)] opacity-60" />

                    <div className="absolute bottom-0 left-0 right-0 h-[24%] bg-white" />
                    <div className="absolute bottom-[24%] left-0 right-0 h-[6px] bg-[#1c6fe0]" />
                    <div
                      className="absolute bottom-0 left-0 h-[24%] w-[42%] bg-[#0b5bd3]"
                      style={{ clipPath: "polygon(0 0, 100% 0, 82% 100%, 0 100%)" }}
                    />
                    <div
                      className="absolute bottom-0 right-0 h-[28%] w-[18%] bg-[#9dd0ff]"
                      style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
                    />
                    <div
                      className="absolute bottom-0 right-[6%] h-[22%] w-[16%] bg-[#66b2ff]"
                      style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
                    />
                  </div>

                  <div className="relative z-10 flex h-full">
                    <div className="relative flex w-[42%] flex-col px-6 py-6 text-white sm:px-8 sm:py-8">
                      <div className="absolute left-4 top-4">
                        <div className="relative h-16 w-16">
                          <div className="absolute inset-0 bg-[#0b5bd3]" style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
                          <div className="absolute inset-[6px] bg-white" style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-[10px] font-semibold text-[#0b5bd3]">
                            <span>더쿠투표</span>
                            <span className="text-sm font-extrabold">101</span>
                          </div>
                        </div>
                      </div>

                      <div className="absolute left-24 top-6 flex items-center">
                        <div className="rounded-full bg-[#2a86f0] px-3 py-1 text-[10px] font-semibold text-white/90">총선 발표식</div>
                        <div className="ml-2 rounded-r-full border border-[#2a86f0] bg-white px-3 py-1 text-[10px] font-semibold text-[#1c6fe0]">
                          생존! {selected.title} 연습생은?
                        </div>
                      </div>

                      <div className="flex flex-1 items-center justify-center">
                        <div className="relative h-[60%] w-[76%]">
                          <div
                            className="absolute inset-0 bg-white"
                            style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
                          />
                          <div
                            className="absolute inset-[8%] bg-[#f5f9ff]"
                            style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#7a5be8]">
                            <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#1c6fe0]" fill="currentColor" aria-hidden>
                              <path d="M4 17h16l-1 3H5l-1-3Zm2-10 4 4 4-7 4 7 4-4-2 9H8L6 7Z" />
                            </svg>
                            <div className="mt-3 text-5xl font-extrabold tracking-tight sm:text-6xl">
                              {selected.title}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        {selected.votes}
                      </div>
                    </div>

                    <div className="relative flex w-[58%] flex-col px-6 py-6 sm:px-8 sm:py-8">
                      <div className="mt-8 text-center text-base font-semibold text-white/95 sm:text-lg">
                        원하는 사진 적용하기
                        <br />
                        배경화면을 바꿔주면 됨
                      </div>
                      <div className="mt-4 text-center text-xs text-white/85 sm:text-sm">
                        * 그림 채우기 옵션으로 선택
                        <br />
                        * 권장사이즈 : 1280 * 720 px
                      </div>

                      <div className="mt-auto flex items-end justify-center gap-6 text-[#1c6fe0]">
                        <div className="text-sm font-semibold">{selected.subtitle}</div>
                        <div className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                          {selected.subtitle}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                순위 목록
              </Button>
              <Button onClick={() => setStep(1)}>처음으로</Button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

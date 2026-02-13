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
    title: "1\uB4F1",
    subtitle: "\uCD5C\uB300\uB2E4\uC12F\uC790",
    votes: "123,456\uD45C",
    description: "\uC5EC\uAE30\uC5D0 1\uB4F1 \uC124\uBA85\uC744 \uC801\uC5B4\uC8FC\uC138\uC694.",
  },
  {
    rank: 2,
    title: "2\uB4F1",
    subtitle: "\uCD5C\uB300\uB2E4\uC12F\uC790",
    votes: "98,765\uD45C",
    description: "\uC5EC\uAE30\uC5D0 2\uB4F1 \uC124\uBA85\uC744 \uC801\uC5B4\uC8FC\uC138\uC694.",
  },
  {
    rank: 3,
    title: "3\uB4F1",
    subtitle: "\uCD5C\uB300\uB2E4\uC12F\uC790",
    votes: "87,654\uD45C",
    description: "\uC5EC\uAE30\uC5D0 3\uB4F1 \uC124\uBA85\uC744 \uC801\uC5B4\uC8FC\uC138\uC694.",
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
            <h1 className="mt-1 text-2xl font-bold">\uD604 \uC21C\uC704 \uC0C1\uD669</h1>
          </div>
          {step !== 1 ? (
            <Button variant="ghost" onClick={() => setStep(1)}>
              \uCC98\uC74C\uC73C\uB85C
            </Button>
          ) : null}
        </div>

        {step === 1 ? (
          <Card className="mt-8 overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="space-y-3">
                <div className="text-sm font-semibold text-foreground/70">\uD22C\uD45C \uC2DC\uC791\uBD80\uD130 \uC9C0\uAE08\uAE4C\uC9C0</div>
                <div className="text-2xl font-bold">\uD604 \uC21C\uC704 \uC0C1\uD669</div>
                <p className="text-sm text-foreground/60">
                  \uC544\uB798 \uBC84\uD2BC\uC744 \uB20C\uB7EC \uC21C\uC704\uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694.
                </p>
              </div>
              <div className="mt-6">
                <Button size="lg" onClick={() => setStep(2)}>
                  \uC21C\uC704 \uBCF4\uAE30
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {RANK_ITEMS.map((item) => (
              <Card key={`rank-${item.rank}`} className="transition hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="p-5">
                  <div className="text-sm text-foreground/60">{item.subtitle}</div>
                  <div className="mt-2 text-2xl font-bold">{item.title}</div>
                  <div className="mt-3 text-sm text-foreground/70">{item.votes}</div>
                  <Button className="mt-5 w-full" variant="outline" onClick={() => goToRank(item.rank)}>
                    {item.title} \uC0C1\uC138 \uBCF4\uAE30
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {step === 3 ? (
          <Card className="mt-8 overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="text-sm text-foreground/60">\uC0C1\uC138 \uC21C\uC704</div>
              <div className="mt-2 text-3xl font-bold">{selected.title}</div>
              <div className="mt-1 text-sm text-foreground/60">{selected.subtitle}</div>
              <div className="mt-4 rounded-2xl border border-foreground/10 bg-white p-4 text-sm text-foreground/70">
                <div className="text-lg font-semibold text-foreground">{selected.votes}</div>
                <p className="mt-2">{selected.description}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  \uC21C\uC704 \uBAA9\uB85D
                </Button>
                <Button onClick={() => setStep(1)}>\uCC98\uC74C\uC73C\uB85C</Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  );
}

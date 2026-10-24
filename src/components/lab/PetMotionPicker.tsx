"use client";

import { useState } from "react";
import { mungchizMembers, petMotions, type LabLang } from "@/data/lab";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PetSprite } from "./PetSprite";

export function PetMotionPicker({ lang }: { lang: LabLang }) {
  const [motionId, setMotionId] = useState(petMotions[0].id);
  const motion = petMotions.find((m) => m.id === motionId) ?? petMotions[0];

  return (
    <div>
      <ul className="grid grid-cols-3 gap-y-2 sm:grid-cols-6">
        {mungchizMembers.map((p) => (
          <li key={p.id} className="flex flex-col items-center gap-0.5">
            <PetSprite memberId={p.id} motion={motion} label={`${p.name} · ${motion.label[lang]}`} />
            <span className="text-xs font-semibold text-foreground/70">{p.name}</span>
          </li>
        ))}
      </ul>

      <Tabs value={motionId} onValueChange={setMotionId} className="mt-4">
        {/* 모바일에선 옆으로 밀어서 고르기 */}
        <TabsList aria-label={lang === "ko" ? "펫 동작 미리보기" : "Pet motion preview"} className="mx-auto w-fit max-w-full border-0 bg-transparent p-0 shadow-none">
          {petMotions.map((m) => (
            <TabsTrigger key={m.id} value={m.id} variant="pill" className="h-8 px-3 text-xs">
              {m.label[lang]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <p className="mt-2 text-center text-xs text-foreground/60" aria-live="polite">
        {motion.when[lang]}
      </p>
    </div>
  );
}

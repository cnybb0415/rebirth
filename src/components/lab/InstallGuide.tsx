"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import type { LabLang } from "@/data/lab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CopyCode } from "./CopyCode";

type Os = "windows" | "mac" | "web";

// 접속한 기기에 맞는 탭을 먼저 열어줌 (애플 기기면 Mac, 나머지는 Windows)
const detectOs = (): Os => (/Mac|iPhone|iPad/i.test(navigator.userAgent) ? "mac" : "windows");
const noopSubscribe = () => () => {};

function Steps({ children }: { children: ReactNode }) {
  return <ol className="space-y-3">{children}</ol>;
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background tabular-nums">
        {n}
      </span>
      <div className="min-w-0 pt-0.5 text-sm leading-relaxed">{children}</div>
    </li>
  );
}

const Note = ({ children }: { children: ReactNode }) => <p className="text-xs text-foreground/60">{children}</p>;
const Code = ({ children }: { children: ReactNode }) => <code className="font-mono text-[0.9em]">{children}</code>;

const COPY = {
  ko: {
    device: "사용하는 기기",
    web: "웹",
    unzip: (f: string) => (
      <>
        받은 <Code>{f}</Code>의 <b>압축을 풀어주세요.</b>
      </>
    ),
    runBat: (
      <>
        풀린 폴더의 <b>install.bat</b>을 더블클릭해주세요.
        <Note>“Windows의 PC 보호” 창이 뜨면 추가 정보 → 실행을 눌러주세요.</Note>
      </>
    ),
    closeOk: (
      <>
        <Code>[OK]</Code>가 나오면 아무 키나 눌러 창을 닫아주세요.
      </>
    ),
    refresh: (
      <>
        ChatGPT 앱 <b>설정 → Pets → 새로고침</b>을 누르고 멤버를 골라주세요.
      </>
    ),
    manualSummary: "자동 설치가 안 되면",
    manualWin: (
      <>
        탐색기 주소창에 아래 경로를 붙여넣어 폴더를 열고, 압축을 푼 폴더의 <b>pets 안 폴더 6개</b>를 그대로 넣어주세요.
      </>
    ),
    noPets: "pets 폴더가 없으면 새로 만들어주세요.",
    macGo: (
      <>
        Finder에서 <b>Cmd + Shift + G</b>를 누르고 아래 경로로 이동해주세요.
      </>
    ),
    macCopy: (
      <>
        압축을 푼 폴더의 <b>pets 안 폴더 6개</b>를 그대로 넣어주세요.
      </>
    ),
    webGo: (
      <>
        chatgpt.com에서 <b>설정 → 개인 맞춤 → Pet</b>으로 이동해주세요.
      </>
    ),
    webUpload: (
      <>
        압축 파일 안의 멤버 이미지(<Code>exo-mungchiz-kai.png</Code> 등)를 올려주세요.
      </>
    ),
    webNote: "화면에 떠다니는 펫은 데스크톱 앱에서만 보여요.",
  },
  en: {
    device: "Your device",
    web: "Web",
    unzip: (f: string) => (
      <>
        <b>Unzip</b> the <Code>{f}</Code> you downloaded.
      </>
    ),
    runBat: (
      <>
        Double-click <b>install.bat</b> in the unzipped folder.
        <Note>If “Windows protected your PC” appears, click More info → Run anyway.</Note>
      </>
    ),
    closeOk: (
      <>
        When <Code>[OK]</Code> appears, press any key to close the window.
      </>
    ),
    refresh: (
      <>
        In the ChatGPT app, go to <b>Settings → Pets → Refresh</b> and pick a member.
      </>
    ),
    manualSummary: "If auto-install doesn't work",
    manualWin: (
      <>
        Paste the path below into the File Explorer address bar to open the folder, then copy in the <b>6 folders inside pets</b>{" "}
        from the unzipped folder.
      </>
    ),
    noPets: "If there's no pets folder, just create one.",
    macGo: (
      <>
        In Finder, press <b>Cmd + Shift + G</b> and go to the path below.
      </>
    ),
    macCopy: (
      <>
        Copy in the <b>6 folders inside pets</b> from the unzipped folder.
      </>
    ),
    webGo: (
      <>
        On chatgpt.com, go to <b>Settings → Personalization → Pet</b>.
      </>
    ),
    webUpload: (
      <>
        Upload a member image from the zip (e.g. <Code>exo-mungchiz-kai.png</Code>).
      </>
    ),
    webNote: "Floating pets only appear in the desktop app.",
  },
};

export function InstallGuide({ fileName, lang }: { fileName: string; lang: LabLang }) {
  const c = COPY[lang];
  const detected = useSyncExternalStore(noopSubscribe, detectOs, () => null);
  const [picked, setPicked] = useState<Os | null>(null);
  const value = picked ?? detected ?? "windows";

  return (
    <Tabs value={value} onValueChange={(v) => setPicked(v as Os)}>
      <TabsList aria-label={c.device} className="w-full justify-between sm:w-fit sm:justify-start">
        <TabsTrigger value="windows" variant="pill" className="flex-1 sm:flex-none">Windows</TabsTrigger>
        <TabsTrigger value="mac" variant="pill" className="flex-1 sm:flex-none">Mac</TabsTrigger>
        <TabsTrigger value="web" variant="pill" className="flex-1 sm:flex-none">{c.web}</TabsTrigger>
      </TabsList>

      <TabsContent value="windows">
        <Steps>
          <Step n={1}>{c.unzip(fileName)}</Step>
          <Step n={2}>{c.runBat}</Step>
          <Step n={3}>{c.closeOk}</Step>
          <Step n={4}>{c.refresh}</Step>
        </Steps>
        <details className="group mt-4 rounded-xl bg-foreground/[0.04] px-3 py-2.5">
          <summary className="cursor-pointer list-none text-xs font-semibold text-foreground/70 [&::-webkit-details-marker]:hidden">
            {c.manualSummary} <span className="inline-block transition-transform group-open:rotate-90" aria-hidden>›</span>
          </summary>
          <div className="mt-2 space-y-1.5 text-xs leading-relaxed text-foreground/70">
            <p>{c.manualWin}</p>
            <CopyCode text="%USERPROFILE%\.codex\pets" lang={lang} />
            <p>{c.noPets}</p>
          </div>
        </details>
      </TabsContent>

      <TabsContent value="mac">
        <Steps>
          <Step n={1}>{c.unzip(fileName)}</Step>
          <Step n={2}>
            {c.macGo}
            <div className="mt-1">
              <CopyCode text="~/.codex/pets" lang={lang} />
            </div>
            <Note>{c.noPets}</Note>
          </Step>
          <Step n={3}>{c.macCopy}</Step>
          <Step n={4}>{c.refresh}</Step>
        </Steps>
      </TabsContent>

      <TabsContent value="web">
        <Steps>
          <Step n={1}>{c.webGo}</Step>
          <Step n={2}>{c.webUpload}</Step>
        </Steps>
        <p className="mt-4 rounded-xl bg-foreground/[0.04] px-3 py-2.5 text-xs text-foreground/70">{c.webNote}</p>
      </TabsContent>
    </Tabs>
  );
}

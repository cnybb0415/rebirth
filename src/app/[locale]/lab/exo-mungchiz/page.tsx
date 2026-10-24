import type { Metadata } from "next";
import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { labItems, labLang } from "@/data/lab";
import { Card, CardContent } from "@/components/ui/card";
import { PetMotionPicker } from "@/components/lab/PetMotionPicker";
import { InstallGuide } from "@/components/lab/InstallGuide";
import { LabContact } from "@/components/lab/LabContact";
import { DownloadWithPromo } from "@/components/lab/DownloadWithPromo";

const item = labItems.find((i) => i.slug === "exo-mungchiz")!;

const Mono = ({ children }: { children: ReactNode }) => <code className="font-mono">{children}</code>;

const COPY = {
  ko: {
    requires: "ChatGPT 데스크톱 앱(Windows · Mac)이 필요해요",
    official: "🔒 공식 파일은 이 페이지에서만 받을 수 있어요",
    download: "펫 파일 받기",
    install: "설치하기",
    faqTitle: "안 될 때",
    faq: [
      {
        q: "목록에 안 보여요",
        a: (
          <>
            설정 → Pets에서 <b>새로고침</b>을 눌러주세요. 그래도 없으면 멤버 폴더 6개가 <Mono>pets</Mono> 바로 아래에 있는지
            확인해주세요. <Mono>pets\exo-mungchiz\pets\…</Mono>처럼 한 번 더 들어가 있으면 안 돼요.
          </>
        ),
      },
      { q: "install.bat이 바로 꺼져요", a: "압축을 먼저 풀고 실행했는지 확인해주세요. 압축 파일 안에서 바로 실행하면 안 돼요." },
      { q: "데스크톱 펫이 웹에 안 보여요", a: "데스크톱 펫은 내 컴퓨터에만 저장돼서 웹과 동기화되지 않아요." },
      {
        q: "펫이 원하는 말을 하게 할 수 있나요?",
        a: "아직은 안 돼요. 펫 위 말풍선은 ChatGPT 작업 상태(진행 중 / 입력 필요 / 완료 등)만 보여줘요.",
      },
    ] as { q: string; a: ReactNode }[],
  },
  en: {
    requires: "Requires the ChatGPT desktop app (Windows · Mac)",
    official: "🔒 The official file is only available on this page",
    download: "Download pet file",
    install: "How to install",
    faqTitle: "Troubleshooting",
    faq: [
      {
        q: "It doesn't show up in the list",
        a: (
          <>
            Press <b>Refresh</b> in Settings → Pets. If it&apos;s still missing, make sure the 6 member folders sit directly inside{" "}
            <Mono>pets</Mono>. They shouldn&apos;t be nested one level deeper, like <Mono>pets\exo-mungchiz\pets\…</Mono>.
          </>
        ),
      },
      { q: "install.bat closes right away", a: "Make sure you unzipped the file first. Running it from inside the zip won't work." },
      { q: "My desktop pet doesn't show up on the web", a: "Desktop pets are stored only on your computer and don't sync with the web." },
      {
        q: "Can I make the pet say what I want?",
        a: "Not yet. The speech bubble only shows ChatGPT's task status (working / needs input / done, etc.).",
      },
    ] as { q: string; a: ReactNode }[],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${item.title} | EXO.zip`, description: item.summary[labLang(locale)] };
}

export default async function ExoMungchizPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = labLang(locale);
  const c = COPY[lang];

  return (
    <main lang={lang} className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/lab" className="inline-flex items-center gap-1 text-sm font-medium text-foreground/60 hover:text-foreground">
        <span aria-hidden>‹</span> EXO.zip
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-balance">{item.title}</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">{item.summary[lang]}</p>

      {/* 미리보기 + 받기 */}
      <Card className="mt-5 overflow-hidden">
        <div className="bg-foreground/[0.03] px-3 pb-4 pt-5">
          <PetMotionPicker lang={lang} />
        </div>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="text-sm">
            <p className="font-semibold">
              {item.file.name} <span className="font-normal text-foreground/50">· {item.file.size}</span>
            </p>
            <p className="mt-0.5 text-xs text-foreground/60">{c.requires}</p>
            <p className="mt-0.5 text-xs font-semibold text-amber-800">{c.official}</p>
          </div>
          <DownloadWithPromo href={item.file.href} fileName={item.file.name} label={c.download} lang={lang} />
        </CardContent>
      </Card>

      {/* 설치 */}
      <section className="mt-8">
        <h2 className="text-lg font-bold">{c.install}</h2>
        <Card className="mt-3">
          <CardContent className="p-4 sm:p-5">
            <InstallGuide fileName={item.file.name} lang={lang} />
          </CardContent>
        </Card>
      </section>

      {/* 자주 묻는 질문 */}
      <section className="mt-8">
        <h2 className="text-lg font-bold">{c.faqTitle}</h2>
        <div className="mt-3 divide-y divide-foreground/10 rounded-2xl border border-foreground/10 bg-white">
          {c.faq.map((f) => (
            <details key={f.q} className="group px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-foreground/40 transition-transform group-open:rotate-90" aria-hidden>
                  ›
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <LabContact lang={lang} />
    </main>
  );
}

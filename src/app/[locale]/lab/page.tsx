import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { labItems, labLang, mungchizMembers, petMotions } from "@/data/lab";
import { PetSprite } from "@/components/lab/PetSprite";
import { LabContact } from "@/components/lab/LabContact";

const COPY = {
  ko: { lead: "이것저것", view: "자료 보기 ›" },
  en: { lead: "A little bit of everything", view: "View ›" },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: "EXO.zip | EXO RE:BIRTH", description: COPY[labLang(locale)].lead };
}

export default async function LabPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = labLang(locale);
  const c = COPY[lang];

  return (
    <main lang={lang} className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-bold">EXO.zip</h1>
      <p className="mt-2 text-sm text-foreground/70">{c.lead}</p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {labItems.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/lab/${item.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/25"
            >
              <div className="flex items-end justify-center gap-1 bg-foreground/[0.03] px-4 pb-3 pt-5" aria-hidden>
                {mungchizMembers.slice(0, 3).map((p, i) => (
                  <PetSprite key={p.id} memberId={p.id} motion={petMotions[[0, 2, 3][i]]} scale={0.85} />
                ))}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap gap-1.5">
                  {item.tags[lang].map((t) => (
                    <span key={t} className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[11px] font-semibold text-foreground/70">
                      {t}
                    </span>
                  ))}
                </div>
                <h2 className="mt-3 text-base font-bold">{item.title}</h2>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-foreground/70">{item.summary[lang]}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-foreground/50">
                  <span>{item.updated} · {item.file.size}</span>
                  <span className="font-semibold text-foreground transition-transform group-hover:translate-x-0.5">{c.view}</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <LabContact lang={lang} />
    </main>
  );
}

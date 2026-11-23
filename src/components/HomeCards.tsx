import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  fetchAllFutureSchedule,
  fetchRawVotes,
  getKSTToday,
  getKSTWeekEnd,
} from "@/components/HomeQuickView";

// 홈 카드 공통 틀: 제목 + 오른쪽 "전체 ›"
export function HomeCard({
  title,
  moreHref,
  moreLabel,
  children,
}: {
  title: ReactNode;
  moreHref?: string;
  moreLabel?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="home-card rounded-[18px] border border-foreground/10 p-[18px]">
      <div className="mb-3.5 flex items-end justify-between">
        <h2 className="text-[17px] font-extrabold">{title}</h2>
        {moreHref ? (
          <Link href={moreHref} className="text-[11px] text-foreground/55 hover:text-foreground">
            {moreLabel} ›
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Row({ lead, title, tag, href }: { lead: string; title: string; tag?: string; href?: string }) {
  const body = (
    <>
      <b className="min-w-[44px] shrink-0 font-extrabold tabular-nums">{lead}</b>
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {tag ? (
        <span className="ml-auto shrink-0 self-center rounded-md bg-foreground/15 px-1.5 py-0.5 text-[10px]">{tag}</span>
      ) : null}
    </>
  );
  const cls = "flex gap-3 border-t border-foreground/10 py-[11px] text-[13px] first:border-t-0 first:pt-0 last:pb-0";
  return href ? (
    <li>
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {body}
      </a>
    </li>
  ) : (
    <li className={cls}>{body}</li>
  );
}

const md = (date: string) => date.slice(5).replace("-", "/");

export async function HomeScheduleCard() {
  const t = await getTranslations("quickview");
  const all = await fetchAllFutureSchedule();
  const today = getKSTToday();
  const weekEnd = getKSTWeekEnd();
  const thisWeek = all.filter((i) => i.date >= today && i.date <= weekEnd);
  const items = (thisWeek.length ? thisWeek : all.filter((i) => i.date > weekEnd)).slice(0, 4);

  return (
    <HomeCard
      title={thisWeek.length ? t("thisWeekSchedule") : t("nextSchedule")}
      moreHref="/schedule"
      moreLabel={t("viewAll").replace(/\s*→$/, "")}
    >
      {items.length ? (
        <ul>
          {items.map((i) => (
            <Row key={i.id} lead={md(i.date)} title={i.title} tag={i.category} />
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-foreground/50">{t("noSchedule")}</p>
      )}
    </HomeCard>
  );
}

function dday(deadline: string): string {
  const m = deadline.match(/(\d{4})[.\-](\d{2})[.\-](\d{2})/);
  if (!m) return "";
  const end = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const [y, mo, d] = getKSTToday().split("-").map(Number);
  const diff = Math.round((end - Date.UTC(y, mo - 1, d)) / 86400000);
  return diff <= 0 ? "D-DAY" : `D-${diff}`;
}

export async function HomeVoteCard() {
  const t = await getTranslations("quickview");
  const now = new Date();
  const votes = (await fetchRawVotes()).filter((v) => {
    const m = v.deadline.match(/(\d{4})[.\-](\d{2})[.\-](\d{2})(?:\s+(\d{2}):(\d{2}))?/);
    if (!m) return false;
    return now <= new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4] ?? "23"}:${m[5] ?? "59"}:00+09:00`);
  });

  return (
    <HomeCard title={t("activeVotes")} moreHref="/vote" moreLabel={t("viewAll").replace(/\s*→$/, "")}>
      {votes.length ? (
        <ul>
          {votes.slice(0, 4).map((v, i) => (
            <Row key={i} lead={dday(v.deadline)} title={v.name} tag={t("voteBtn")} href={v.link || undefined} />
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-foreground/50">{t("noVotes")}</p>
      )}
    </HomeCard>
  );
}

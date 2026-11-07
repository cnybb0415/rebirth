"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import f from "./funding-page.module.css";
import w from "./helper-wizard.module.css";
import x from "./exchange-board.module.css";
import s from "./card-section.module.css";

// 좌석 한 칸: [열, 번호, 배치도 행, 배치도 칸, "앞뒤" 색 코드]
type Seat = [number, number, number, number, string];
type CardData = Record<string, Record<string, Seat[]>>;

const DAYS = [
  { id: "1107", short: "11.7", endsAt: "2026-11-07T23:59:59+09:00" },
  { id: "1108", short: "11.8", endsAt: "2026-11-08T23:59:59+09:00" },
] as const;

// 종이 색 (G 초록 · R 빨강 · W 흰색 · K 검정 · P 분홍 · B 파랑)
const PAPER: Record<string, string> = {
  G: "#14a83c",
  R: "#e40e3c",
  W: "#ffffff",
  K: "#1c1c1c",
  P: "#ff8cc6",
  B: "#2563eb",
};

function TitleBar({ title }: { title: string }) {
  return (
    <div className={f.titleBar}>
      <span className={f.titleIcon} aria-hidden>🃏</span>
      <span className={f.titleText}>{title}</span>
      <div className={f.winBtns} aria-hidden>
        <span className={f.winBtn}>─</span>
        <span className={f.winBtn}>□</span>
        <span className={f.winBtnClose}>✕</span>
      </div>
    </div>
  );
}

export function CardSectionFinder() {
  const t = useTranslations("cardSection");
  const colorName = (c: string) => t(`color.${c}`);

  const [data, setData] = useState<CardData | null>(null);
  const [loadError, setLoadError] = useState(false);
  // 기본 날짜: 오늘이 지난 공연이면 다음 공연
  const [day, setDay] = useState<string>(() => (DAYS.find((d) => Date.now() <= Date.parse(d.endsAt)) ?? DAYS[DAYS.length - 1]).id);
  const [zone, setZone] = useState("");
  const [row, setRow] = useState("");
  const [num, setNum] = useState("");
  const [side, setSide] = useState<0 | 1>(0); // 배치도 미리보기: 0 앞면 · 1 뒷면

  useEffect(() => {
    fetch("/data/card-section.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j: CardData) => setData(j))
      .catch(() => setLoadError(true));
  }, []);

  const zones = useMemo(() => Object.keys(data?.[day] ?? {}).sort((a, b) => +a - +b), [data, day]);
  const seats = useMemo(() => (zone ? data?.[day]?.[zone] ?? [] : []), [data, day, zone]);
  const rows = useMemo(() => [...new Set(seats.map((v) => v[0]))].sort((a, b) => a - b), [seats]);
  const nums = useMemo(
    () => seats.filter((v) => String(v[0]) === row).map((v) => v[1]).sort((a, b) => a - b),
    [seats, row],
  );
  const mine = seats.find((v) => String(v[0]) === row && String(v[1]) === num);

  // 배치도 크기
  const grid = useMemo(() => {
    if (!seats.length) return null;
    const minR = Math.min(...seats.map((v) => v[2]));
    const maxR = Math.max(...seats.map((v) => v[2]));
    const maxC = Math.max(...seats.map((v) => v[3]));
    return { minR, rows: maxR - minR + 1, cols: maxC + 1 };
  }, [seats]);

  const pickDay = (id: string) => {
    setDay(id);
    // 같은 좌석으로 다른 날짜도 바로 볼 수 있게 선택은 유지
  };

  return (
    <div className={`${f.desktop} ${x.board}`}>
      <div className={f.dialog}>
        <TitleBar title={t("windowTitle")} />
        <div className={f.body}>
          <div className={x.tabs} role="tablist" aria-label={t("dayAria")}>
            {DAYS.map((d) => (
              <button
                key={d.id}
                type="button"
                role="tab"
                aria-selected={day === d.id}
                className={`${x.tab} ${day === d.id ? x.tabActive : ""}`}
                onClick={() => pickDay(d.id)}
              >
                {t(`day.${d.id}`)}
              </button>
            ))}
          </div>

          <p className={s.desc}>{t("desc")}</p>

          {loadError ? (
            <p className={x.empty}>{t("loadError")}</p>
          ) : !data ? (
            <p className={x.empty}>{t("loading")}</p>
          ) : (
            <>
              <div className={s.pickers}>
                <label className={s.pick}>
                  <span className={w.label}>{t("zone")}</span>
                  <select className={w.input} value={zone} onChange={(e) => { setZone(e.target.value); setRow(""); setNum(""); }}>
                    <option value="">{t("choose")}</option>
                    {zones.map((z) => <option key={z} value={z}>{t("zoneN", { n: z })}</option>)}
                  </select>
                </label>
                <label className={s.pick}>
                  <span className={w.label}>{t("row")}</span>
                  <select className={w.input} value={row} disabled={!zone} onChange={(e) => { setRow(e.target.value); setNum(""); }}>
                    <option value="">{t("choose")}</option>
                    {rows.map((r) => <option key={r} value={r}>{t("rowN", { n: r })}</option>)}
                  </select>
                </label>
                <label className={s.pick}>
                  <span className={w.label}>{t("num")}</span>
                  <select className={w.input} value={num} disabled={!row} onChange={(e) => setNum(e.target.value)}>
                    <option value="">{t("choose")}</option>
                    {nums.map((n) => <option key={n} value={n}>{t("numN", { n })}</option>)}
                  </select>
                </label>
              </div>

              {mine ? (
                <section className={s.result} aria-live="polite">
                  <p className={s.seatLine}>
                    {t("seatLine", { zone, row, num })}
                  </p>
                  <div className={s.papers}>
                    {[0, 1].map((i) => {
                      const c = mine[4][i];
                      return (
                        <div key={i} className={s.paperBox}>
                          <span className={s.paperSide}>{i === 0 ? t("front") : t("back")}</span>
                          <span className={`${s.paper} ${c === "W" ? s.paperWhite : ""}`} style={{ background: PAPER[c] }} aria-hidden />
                          <span className={s.paperName}>{colorName(c)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className={s.hint}>{t("hint")}</p>
                </section>
              ) : (
                <p className={x.empty}>{zone ? t("pickRest") : t("pickZone")}</p>
              )}

              {grid && (
                <section className={s.mapWrap}>
                  <div className={s.mapHead}>
                    <span className={s.mapTitle}>{t("mapTitle", { zone })}</span>
                    <div className={x.chips} role="group" aria-label={t("mapSideAria")}>
                      {[t("front"), t("back")].map((label, i) => (
                        <button
                          key={label}
                          type="button"
                          className={`${x.chip} ${side === i ? x.chipOn : ""}`}
                          aria-pressed={side === i}
                          onClick={() => setSide(i as 0 | 1)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div
                    className={s.map}
                    style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)`, gridTemplateRows: `repeat(${grid.rows}, auto)` }}
                    aria-hidden
                  >
                    {seats.map((v) => {
                      const isMine = v === mine;
                      return (
                        <span
                          key={`${v[0]}-${v[1]}`}
                          className={`${s.cell} ${isMine ? s.cellMine : ""}`}
                          // 엑셀 배치도와 같은 방향 (위가 뒷열, 아래가 1열)
                          style={{
                            gridRow: v[2] - grid.minR + 1,
                            gridColumn: v[3] + 1,
                            background: PAPER[v[4][side]],
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className={s.stage}>{t("stage")}</div>
                </section>
              )}
            </>
          )}
        </div>
        <div className={f.statusBar}>{t("status")}</div>
      </div>
    </div>
  );
}

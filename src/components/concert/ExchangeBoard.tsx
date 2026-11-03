"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import f from "./funding-page.module.css";
import w from "./helper-wizard.module.css";
import s from "./exchange-board.module.css";
import {
  EXCHANGE_DATES,
  EXCHANGE_LIMITS,
  contactHref,
  isDateOpen,
  normalizeContact,
  type ContactType,
  type ExchangeKind,
  type HaveRow,
  type WantRow,
} from "@/data/ticketExchange";
import type { ExchangePost } from "@/lib/exchangeDb";

// 공지(src/data/announcements.ts)에 있는 앙콘 좌석배치도
const PAGE_SIZE = 20;
const SEAT_MAP_SRC = "/images/concert/notice/encore/01-1 좌배도.jpg";

// 문구는 messages/*.json 의 "exchange"

// 콘서트 티켓 교환 게시판 — 날짜 교환 / 좌석 교환
// 글은 Supabase(ticket_exchanges)에 저장. 완료 표시·삭제는 글 비밀번호로

type Form = {
  seatDate: string; // 좌석 교환: 한 날짜
  haves: HaveRow[]; // 가진 티켓 (+ 로 추가)
  wants: WantRow[]; // 원하는 회차·좌석 (+ 로 추가)
  contactType: ContactType;
  contact: string;
  memo: string;
  password: string;
  agreed: boolean;
};

const NEW_HAVE: HaveRow = { date: "", seat: "", qty: 1 };
const NEW_WANT: WantRow = { date: "", seat: "" };

const EMPTY: Form = {
  seatDate: "",
  haves: [NEW_HAVE],
  wants: [NEW_WANT],
  contactType: "x",
  contact: "",
  memo: "",
  password: "",
  agreed: false,
};

// 서버 오류 코드 → messages 키
const SERVER_ERR: Record<string, string> = {
  contact: "sContact",
  phone: "sPhone",
  too_many: "sTooMany",
  wrong_password: "sWrongPw",
  locked: "sLocked",
  not_found: "sNotFound",
};

function TitleBar({ title }: { title: string }) {
  return (
    <div className={f.titleBar}>
      <span className={f.titleIcon} aria-hidden>🎟️</span>
      <span className={f.titleText}>{title}</span>
      <div className={f.winBtns} aria-hidden>
        <span className={f.winBtn}>─</span>
        <span className={f.winBtn}>□</span>
        <span className={f.winBtnClose}>✕</span>
      </div>
    </div>
  );
}

export function ExchangeBoard() {
  const t = useTranslations("exchange");
  const dateLabel = (id: string) => (t.has(`dates.${id}`) ? t(`dates.${id}`) : id);
  const seatText = (seat: string) => seat.trim() || t("anySeat");
  const serverErr = (code: string | undefined, fallback: string) => t(SERVER_ERR[code ?? ""] ?? fallback);
  const notice = t.raw("notice") as string[];
  const kinds: { id: ExchangeKind; label: string; desc: string }[] = [
    { id: "date", label: t("kindDate"), desc: t("kindDateDesc") },
    { id: "seat", label: t("kindSeat"), desc: t("kindSeatDesc") },
  ];
  const timeAgo = (iso: string) => {
    const m = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));
    if (m < 1) return t("justNow");
    if (m < 60) return t("minutesAgo", { n: m });
    const h = Math.round(m / 60);
    if (h < 24) return t("hoursAgo", { n: h });
    return t("daysAgo", { n: Math.round(h / 24) });
  };
  const openDates = useMemo(() => EXCHANGE_DATES.filter((d) => isDateOpen(d)), []);
  const [kind, setKind] = useState<ExchangeKind>("date");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [openOnly, setOpenOnly] = useState(true);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [items, setItems] = useState<ExchangePost[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [view, setView] = useState<"list" | "write">("list");
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [manage, setManage] = useState<{ id: string; action: "done" | "open" | "delete" } | null>(null);
  const [managePw, setManagePw] = useState("");
  const [manageErr, setManageErr] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (k: ExchangeKind, date: string) => {
    setItems(null);
    setLoadError(false);
    try {
      const res = await fetch(`/api/exchange?kind=${k}${date !== "all" ? `&date=${date}` : ""}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const json = (await res.json()) as { items: ExchangePost[] };
      setItems(json.items);
    } catch {
      setLoadError(true);
      setItems([]);
    }
  }, []);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [kind, dateFilter, openOnly, query]);

  useEffect(() => {
    void load(kind, dateFilter);
  }, [kind, dateFilter, load]);

  useEffect(() => {
    if (!mapOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMapOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mapOpen]);

  const scrollTop = () => windowRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((p) => ({ ...p, [key]: value }));

  const q = query.trim().toLowerCase().replace(/\s/g, "");
  const shown = (items ?? []).filter(
    (it) =>
      (dateFilter === "all" || it.have_dates.includes(dateFilter) || it.want_dates.includes(dateFilter)) &&
      (!openOnly || it.status === "open") &&
      (!q || [...it.haves, ...it.wants].some((r) => (r.seat ?? "").toLowerCase().replace(/\s/g, "").includes(q))),
  );
  const pageItems = shown.slice(0, visible);

  const kindInfo = kinds.find((k) => k.id === kind)!;

  const validate = (): string[] => {
    const e: string[] = [];
    if (kind === "seat") {
      if (!form.seatDate) e.push(t("eSeatDate"));
      if (form.haves.some((h) => !h.seat.trim())) e.push(t("eHaveSeats"));
      if (form.wants.some((x) => !x.seat.trim())) e.push(t("eWantSeats"));
    } else {
      if (form.haves.some((h) => !h.date)) e.push(t("eHaveDates"));
      if (form.wants.some((x) => !x.date)) e.push(t("eWantDates"));
      const haveDates = form.haves.map((h) => h.date);
      if (form.wants.some((x) => x.date && haveDates.includes(x.date))) e.push(t("eSameDate"));
    }
    if (!normalizeContact(form.contactType, form.contact))
      e.push(form.contactType === "x" ? t("eX") : t("eOpenChat"));
    if (!/^\d{6}$/.test(form.password)) e.push(t("ePw"));
    if (!form.agreed) e.push(t("eAgree"));
    return e;
  };

  const startWrite = () => {
    const pre = dateFilter !== "all" ? dateFilter : "";
    setForm({ ...EMPTY, seatDate: pre, haves: [{ ...NEW_HAVE, date: kind === "date" ? pre : "" }] });
    setErrors([]);
    setView("write");
    scrollTop();
  };

  const submit = async () => {
    const e = validate();
    setErrors(e);
    if (e.length) return;
    setSending(true);
    try {
      const res = await fetch("/api/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          seatDate: kind === "seat" ? form.seatDate : undefined,
          haves: form.haves,
          wants: form.wants,
          contactType: form.contactType,
          contact: form.contact,
          memo: form.memo,
          password: form.password,
          website: honeypot,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setErrors([serverErr(j.error, "sPostFail")]);
        return;
      }
      setView("list");
      setDateFilter("all");
      await load(kind, dateFilter);
      scrollTop();
    } catch {
      setErrors([t("sPostNet")]);
    } finally {
      setSending(false);
    }
  };

  const runManage = async () => {
    if (!manage) return;
    setManageErr("");
    try {
      const res = await fetch(`/api/exchange/${manage.id}`, {
        method: manage.action === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: managePw, status: manage.action === "delete" ? undefined : manage.action }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setManageErr(serverErr(j.error, "sManageFail"));
        return;
      }
      setManage(null);
      setManagePw("");
      await load(kind, dateFilter);
    } catch {
      setManageErr(t("sManageFail"));
    }
  };

  return (
    <div className={`${f.desktop} ${s.board}`}>
      <input
        type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden
        value={honeypot} onChange={(e) => setHoneypot(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      <div className={f.dialog} ref={windowRef} style={{ scrollMarginTop: 72 }}>
        <TitleBar title={t("windowTitle")} />
        <div className={f.body}>
          {/* 탭 */}
          <div className={s.tabs} role="tablist" aria-label={t("kindsAria")}>
            {kinds.map((k) => (
              <button
                key={k.id}
                type="button"
                role="tab"
                aria-selected={kind === k.id}
                className={`${s.tab} ${kind === k.id ? s.tabActive : ""}`}
                onClick={() => {
                  setKind(k.id);
                  setView("list");
                  setManage(null);
                }}
              >
                {k.label}
              </button>
            ))}
          </div>
          <div className={s.descRow}>
            <p className={w.text}>{kindInfo.desc}</p>
            <button type="button" className={s.mapBtn} onClick={() => setMapOpen(true)}>
              {t("seatMap")}
            </button>
          </div>

          {view === "list" ? (
            <>
              <div className={s.notice} role="note" aria-label={t("noticeTitle")}>
                <p className={s.noticeTitle}>⚠ {t("noticeTitle")}</p>
                <ul className={s.noticeList}>
                  {notice.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>

              <div className={s.toolbar}>
                <div className={s.chips} style={{ flexBasis: "100%" }} role="group" aria-label={t("dateFilterAria")}>
                  <button type="button" className={`${s.chip} ${dateFilter === "all" ? s.chipOn : ""}`} aria-pressed={dateFilter === "all"} onClick={() => setDateFilter("all")}>
                    {t("all")}
                  </button>
                  {openDates.map((d) => (
                    <button key={d.id} type="button" className={`${s.chip} ${dateFilter === d.id ? s.chipOn : ""}`} aria-pressed={dateFilter === d.id} onClick={() => setDateFilter(d.id)}>
                      {d.short}
                    </button>
                  ))}
                </div>
                <button type="button" className={s.chip} aria-expanded={searchOpen} onClick={() => { setSearchOpen((v) => !v); if (searchOpen) setQuery(""); }}>
                  {t("searchBtn")}
                </button>
                <label className={w.check} style={{ padding: 0, fontSize: 11 }}>
                  <input type="checkbox" checked={openOnly} onChange={() => setOpenOnly((v) => !v)} />
                  {t("openOnly")}
                </label>
              </div>
              {searchOpen && (
                <input
                  className={w.input}
                  type="search"
                  autoFocus
                  maxLength={20}
                  placeholder={t("searchPlaceholder")}
                  aria-label={t("searchBtn")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              )}

              {openDates.length === 0 ? (
                <p className={s.empty}>{t("closed")}</p>
              ) : items === null ? (
                <p className={s.empty}>{t("loading")}</p>
              ) : loadError ? (
                <p className={s.empty}>{t("loadError")}</p>
              ) : shown.length === 0 ? (
                <p className={s.empty}>{q ? t("noResult") : t("empty")}</p>
              ) : (
                <>
                <ul className={s.list}>
                  {pageItems.map((it) => {
                    const done = it.status === "done";
                    const managing = manage?.id === it.id;
                    return (
                      <li key={it.id} className={`${s.card} ${done ? s.cardDone : ""}`}>
                        <div className={s.cardTop}>
                          <span className={`${s.badge} ${done ? s.badgeDone : ""}`}>{done ? t("statusDone") : t("statusOpen")}</span>
                          <span className={s.meta}>{timeAgo(it.created_at)}</span>
                        </div>
                        {it.kind === "seat" ? <p className={s.cardDate}>{dateLabel(it.have_dates[0])}</p> : null}

                        <div className={s.swapBlock}>
                          <span className={s.swapLabel}>{t("have")}</span>
                          <ul className={s.swapList}>
                            {it.haves.map((h, i) => (
                              <li key={i} className={s.have}>
                                {it.kind === "date" ? <b>{dateLabel(h.date)}</b> : null}
                                {it.kind === "date" ? (h.seat.trim() ? ` ${h.seat}` : "") : seatText(h.seat)}
                                <span className={s.qty}> · {t("qty", { n: h.qty })}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={s.swapBlock}>
                          <span className={`${s.swapLabel} ${s.swapLabelWant}`}>{t("want")}</span>
                          <ul className={s.swapList}>
                            {it.wants.map((x, i) => (
                              <li key={i} className={s.want}>
                                {it.kind === "date" ? <b>{dateLabel(x.date)}</b> : null}
                                {it.kind === "date" ? ` ${seatText(x.seat)}` : seatText(x.seat)}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {it.memo ? <p className={s.memo}>{it.memo}</p> : null}

                        <div className={s.cardActions}>
                          {!done ? (
                            <a href={contactHref(it.contact_type, it.contact)} target="_blank" rel="noopener noreferrer nofollow" className={s.contact}>
                              {it.contact_type === "x" ? `X @${it.contact}` : t("openChat")} ↗
                            </a>
                          ) : (
                            <span />
                          )}
                          <span className={s.manageBtns}>
                            <button type="button" className={s.linkBtn} onClick={() => { setManage({ id: it.id, action: done ? "open" : "done" }); setManagePw(""); setManageErr(""); }}>
                              {done ? t("reopen") : t("markDone")}
                            </button>
                            <button type="button" className={s.linkBtn} onClick={() => { setManage({ id: it.id, action: "delete" }); setManagePw(""); setManageErr(""); }}>
                              {t("delete")}
                            </button>
                          </span>
                        </div>

                        {managing ? (
                          <div className={s.managePanel}>
                            <label className={w.label} htmlFor={`pw-${it.id}`}>
                              {t("pwFor", { action: manage.action === "delete" ? t("delete") : manage.action === "done" ? t("markDone") : t("reopen") })}
                            </label>
                            <div className={s.manageRow}>
                              <input
                                id={`pw-${it.id}`} className={`${w.input} ${s.pin}`} type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} autoComplete="off" name={`exchange-pin-${it.id}`} data-1p-ignore data-lpignore="true"
                                placeholder={t("pwShort")} value={managePw} onChange={(e) => setManagePw(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                onKeyDown={(e) => e.key === "Enter" && void runManage()}
                              />
                              <button type="button" className={f.btn} style={{ maxWidth: 80 }} onClick={() => void runManage()}>{t("confirm")}</button>
                              <button type="button" className={s.linkBtn} onClick={() => setManage(null)}>{t("cancel")}</button>
                            </div>
                            {manageErr ? <p className={s.manageErr} role="alert">{manageErr}</p> : null}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                {shown.length > visible && (
                  <button type="button" className={s.addBtn} onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    {t("loadMore", { n: shown.length - visible })}
                  </button>
                )}
                </>
              )}

              {openDates.length > 0 ? (
                <div className={w.navBar}>
                  <button type="button" className={f.btn} onClick={startWrite}>{t("write")}</button>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className={w.fields}>
                {kind === "seat" ? (
                  <fieldset className={w.group}>
                    <legend className={w.legend}>{t("fDate")}<span className={w.req}>*</span></legend>
                    {openDates.map((d) => (
                      <label key={d.id} className={w.check}>
                        <input type="radio" name="seatDate" className={s.radio} checked={form.seatDate === d.id} onChange={() => set("seatDate", d.id)} />
                        {dateLabel(d.id)}
                      </label>
                    ))}
                  </fieldset>
                ) : null}

                {/* 가진 티켓 — 여러 장이면 + 로 추가 */}
                <fieldset className={w.group}>
                  <legend className={w.legend}>{t("fHaves")}<span className={w.req}>*</span></legend>
                  <div className={s.rows}>
                    {form.haves.map((h, i) => (
                      <div key={i} className={s.rowBox}>
                        <div className={s.rowHead}>
                          <span className={s.rowNo}>{t("fTicketN", { n: i + 1 })}</span>
                          {form.haves.length > 1 ? (
                            <button type="button" className={s.linkBtn} onClick={() => set("haves", form.haves.filter((_, j) => j !== i))} aria-label={t("fRemoveTicket", { n: i + 1 })}>
                              {t("fRemove")}
                            </button>
                          ) : null}
                        </div>
                        {kind === "date" ? (
                          <select className={w.input} aria-label={t("fTicketDate", { n: i + 1 })} value={h.date} onChange={(e) => set("haves", form.haves.map((r, j) => (j === i ? { ...r, date: e.target.value } : r)))}>
                            <option value="">{t("fSelectDate")}</option>
                            {openDates.map((d) => <option key={d.id} value={d.id}>{dateLabel(d.id)}</option>)}
                          </select>
                        ) : null}
                        <div className={s.rowLine}>
                          <input
                            className={w.input} aria-label={t("fTicketSeat", { n: i + 1 })} maxLength={EXCHANGE_LIMITS.seat}
                            placeholder={kind === "date" ? t("fSeatOptional") : t("fSeatRequired")}
                            value={h.seat} onChange={(e) => set("haves", form.haves.map((r, j) => (j === i ? { ...r, seat: e.target.value } : r)))}
                          />
                          <select className={`${w.input} ${s.qtySelect}`} aria-label={t("fTicketQty", { n: i + 1 })} value={h.qty} onChange={(e) => set("haves", form.haves.map((r, j) => (j === i ? { ...r, qty: Number(e.target.value) } : r)))}>
                            {Array.from({ length: EXCHANGE_LIMITS.qtyMax }, (_, n) => n + 1).map((n) => <option key={n} value={n}>{t("qty", { n })}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                    {form.haves.length < EXCHANGE_LIMITS.rows ? (
                      <button type="button" className={s.addBtn} onClick={() => set("haves", [...form.haves, { ...NEW_HAVE }])}>{t("fAddTicket")}</button>
                    ) : null}
                  </div>
                </fieldset>

                {/* 원하는 회차·좌석 — 여러 개면 + 로 추가 */}
                <fieldset className={w.group}>
                  <legend className={w.legend}>{kind === "date" ? t("fWantsDate") : t("fWantsSeat")}<span className={w.req}>*</span></legend>
                  <div className={s.rows}>
                    {form.wants.map((x, i) => (
                      <div key={i} className={s.rowBox}>
                        <div className={s.rowHead}>
                          <span className={s.rowNo}>{t("fWantN", { n: i + 1 })}</span>
                          {form.wants.length > 1 ? (
                            <button type="button" className={s.linkBtn} onClick={() => set("wants", form.wants.filter((_, j) => j !== i))} aria-label={t("fRemoveWant", { n: i + 1 })}>
                              {t("fRemove")}
                            </button>
                          ) : null}
                        </div>
                        {kind === "date" ? (
                          <select className={w.input} aria-label={t("fWantDate", { n: i + 1 })} value={x.date} onChange={(e) => set("wants", form.wants.map((r, j) => (j === i ? { ...r, date: e.target.value } : r)))}>
                            <option value="">{t("fSelectShow")}</option>
                            {openDates.filter((d) => !form.haves.some((h) => h.date === d.id)).map((d) => <option key={d.id} value={d.id}>{dateLabel(d.id)}</option>)}
                          </select>
                        ) : null}
                        <input
                          className={w.input} aria-label={t("fWantSeat", { n: i + 1 })} maxLength={EXCHANGE_LIMITS.seat}
                          placeholder={kind === "date" ? t("fWantSeatOptional") : t("fWantSeatRequired")}
                          value={x.seat} onChange={(e) => set("wants", form.wants.map((r, j) => (j === i ? { ...r, seat: e.target.value } : r)))}
                        />
                      </div>
                    ))}
                    {form.wants.length < EXCHANGE_LIMITS.rows ? (
                      <button type="button" className={s.addBtn} onClick={() => set("wants", [...form.wants, { ...NEW_WANT }])}>{t("fAddWant")}</button>
                    ) : null}
                  </div>
                </fieldset>

                <fieldset className={w.group}>
                  <legend className={w.legend}>{t("fContact")}<span className={w.req}>*</span></legend>
                  <div className={s.contactTypes}>
                    <label className={w.check}>
                      <input type="radio" name="contactType" className={s.radio} checked={form.contactType === "x"} onChange={() => set("contactType", "x")} />
                      {t("fContactX")}
                    </label>
                    <label className={w.check}>
                      <input type="radio" name="contactType" className={s.radio} checked={form.contactType === "openchat"} onChange={() => set("contactType", "openchat")} />
                      {t("fContactOpen")}
                    </label>
                  </div>
                  <input
                    className={w.input} aria-label={t("fContactAria")} maxLength={EXCHANGE_LIMITS.contact}
                    inputMode={form.contactType === "openchat" ? "url" : "text"} autoCapitalize="off" autoCorrect="off"
                    placeholder={form.contactType === "x" ? "@exol_1234" : "https://open.kakao.com/o/…"}
                    value={form.contact} onChange={(e) => set("contact", e.target.value)}
                  />
                </fieldset>

                <label>
                  <span className={w.label}>{t("fMemo")}</span>
                  <textarea className={`${w.input} ${s.textarea}`} rows={3} maxLength={EXCHANGE_LIMITS.memo} placeholder={t("fMemoPlaceholder")} value={form.memo} onChange={(e) => set("memo", e.target.value)} />
                  <span className={s.memoWarn}>{t("fMemoWarn")}</span>
                </label>

                <label>
                  <span className={w.label}>{t("fPw")}<span className={w.req}>*</span></span>
                  <input className={`${w.input} ${s.pin}`} type="text" inputMode="numeric" pattern="[0-9]*" autoComplete="off" name="exchange-pin" data-1p-ignore data-lpignore="true" maxLength={6} placeholder="••••••" value={form.password} onChange={(e) => set("password", e.target.value.replace(/\D/g, "").slice(0, 6))} />
                  <span className={w.subLabel} style={{ display: "block", marginTop: 6 }}>{t("fPwHint")}</span>
                </label>

                <label className={w.check}>
                  <input type="checkbox" checked={form.agreed} onChange={() => set("agreed", !form.agreed)} />
                  {t("fAgree")}
                </label>
              </div>

              {errors.length > 0 ? (
                <div className={w.errors} role="alert">
                  <span className={w.errIcon} aria-hidden>!</span>
                  <ul className={w.errList}>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
                </div>
              ) : null}

              <div className={w.navBar}>
                <button type="button" className={`${f.btn} ${w.navBtn}`} onClick={() => { setView("list"); setErrors([]); }} disabled={sending}>
                  {t("backToList")}
                </button>
                <button type="button" className={`${f.btn} ${w.navBtn}`} onClick={() => void submit()} disabled={sending}>
                  {sending ? t("submitting") : t("submit")}
                </button>
              </div>
            </>
          )}
        </div>
        <div className={f.statusBar}>
          {view === "list" ? t("listStatus", { kind: kindInfo.label, n: items ? shown.length : 0 }) : t("writeStatus", { kind: kindInfo.label })}
        </div>
      </div>

      {mapOpen ? (
        <div className={w.overlay} onClick={() => setMapOpen(false)}>
          <div className={f.dialog} style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={t("seatMap")}>
            <div className={f.titleBar}>
              <span className={f.titleIcon} aria-hidden>🗺️</span>
              <span className={f.titleText}>{t("seatMap")}.jpg</span>
              <div className={f.winBtns}>
                <span className={f.winBtn} aria-hidden>─</span>
                <span className={f.winBtn} aria-hidden>□</span>
                <button type="button" className={`${f.winBtnClose} ${w.closeBtn}`} onClick={() => setMapOpen(false)} aria-label={t("close")} autoFocus>✕</button>
              </div>
            </div>
            <div className={f.imageBody}>
              <div className={f.imageCanvas}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={SEAT_MAP_SRC} alt={t("seatMapAlt")} className={f.noticeImg} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

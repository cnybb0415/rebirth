"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import f from "./funding-page.module.css";
import w from "./helper-wizard.module.css";
import s from "./exchange-board.module.css";
import {
  EXCHANGE_CATEGORIES,
  EXCHANGE_LIMITS,
  PHOTO_CATEGORIES,
  contactHref,
  hasMoney,
  maxShowDate,
  minShowDate,
  normalizeContact,
  type ContactType,
  type ExchangeCategory,
  type ItemRow,
  type TicketHave,
  type TicketWant,
} from "@/data/exchange";
import type { ExchangePost } from "@/lib/exchangeDb";

// 교환 게시판 — 포토카드 / 굿즈 / 티켓 / 기타
// 글은 Supabase(exchange_posts), 사진은 exchange-photos 버킷. 완료 표시·삭제는 글 비밀번호로
// 문구는 messages/*.json 의 "exchange"

const PAGE_SIZE = 20;

type Photo = { path: string; url: string };

type Form = {
  etcLabel: string;
  eventName: string;
  haves: string[]; // 포토카드·굿즈·기타
  wants: string[];
  tHaves: TicketHave[]; // 티켓
  tWants: TicketWant[];
  photos: Photo[];
  contactType: ContactType;
  contact: string;
  memo: string;
  password: string;
  agreed: boolean;
};

const NEW_T_HAVE: TicketHave = { date: "", seat: "", qty: 1 };
const NEW_T_WANT: TicketWant = { date: "", seat: "" };

const EMPTY: Form = {
  etcLabel: "",
  eventName: "",
  haves: [""],
  wants: [""],
  tHaves: [NEW_T_HAVE],
  tWants: [NEW_T_WANT],
  photos: [],
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
  money: "eMoney",
  date: "sDate",
  too_many: "sTooMany",
  wrong_password: "sWrongPw",
  locked: "sLocked",
  not_found: "sNotFound",
  photo_missing: "sPhotoMissing",
  too_big: "sPhotoBig",
  not_image: "sPhoto",
};

const isTicketPost = (it: ExchangePost): it is ExchangePost & { haves: TicketHave[]; wants: TicketWant[] } =>
  it.category === "ticket";

// 큰 사진은 올리기 전에 브라우저에서 줄임 (서버에서 한 번 더 줄이고 사진 정보를 지움)
async function shrink(file: File): Promise<Blob> {
  if (file.size < 1.5 * 1024 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob ?? file;
  } catch {
    return file;
  }
}

function TitleBar({ title }: { title: string }) {
  return (
    <div className={f.titleBar}>
      <span className={f.titleIcon} aria-hidden>🔁</span>
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
  const locale = useLocale();
  const serverErr = (code: string | undefined, fallback: string) => t(SERVER_ERR[code ?? ""] ?? fallback);
  const notice = t.raw("notice") as string[];
  const catLabel = (c: ExchangeCategory) => t(`cat.${c}`);
  const dateText = (ymd: string) => {
    if (!ymd) return t("anyDate");
    const d = new Date(`${ymd}T12:00:00+09:00`);
    return d.toLocaleDateString(locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : locale === "zh" ? "zh-CN" : "en-US", {
      timeZone: "Asia/Seoul",
      year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };
  const timeAgo = (iso: string) => {
    const m = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));
    if (m < 1) return t("justNow");
    if (m < 60) return t("minutesAgo", { n: m });
    const h = Math.round(m / 60);
    if (h < 24) return t("hoursAgo", { n: h });
    return t("daysAgo", { n: Math.round(h / 24) });
  };

  const [category, setCategory] = useState<ExchangeCategory>("photocard");
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
  const [uploading, setUploading] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [manage, setManage] = useState<{ id: string; action: "done" | "open" | "delete" } | null>(null);
  const [managePw, setManagePw] = useState("");
  const [manageErr, setManageErr] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (c: ExchangeCategory) => {
    setItems(null);
    setLoadError(false);
    try {
      const res = await fetch(`/api/exchange?category=${c}`, { cache: "no-store" });
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
  }, [category, openOnly, query]);

  useEffect(() => {
    void load(category);
  }, [category, load]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const scrollTop = () => windowRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((p) => ({ ...p, [key]: value }));

  const norm = (v: string | null | undefined) => (v ?? "").toLowerCase().replace(/\s/g, "");
  const q = norm(query);
  const searchText = (it: ExchangePost) =>
    norm(
      [
        it.event_name,
        it.etc_label,
        it.memo,
        ...(isTicketPost(it)
          ? [...it.haves.map((h) => h.seat), ...it.wants.map((x) => x.seat)]
          : [...(it.haves as ItemRow[]), ...(it.wants as ItemRow[])].map((r) => r.text)),
      ].join(" "),
    );
  const shown = (items ?? []).filter((it) => (!openOnly || it.status === "open") && (!q || searchText(it).includes(q)));
  const pageItems = shown.slice(0, visible);
  const isTicket = category === "ticket";
  const canPhoto = PHOTO_CATEGORIES.includes(category);

  const validate = (): string[] => {
    const e: string[] = [];
    const texts = [
      form.memo,
      form.etcLabel,
      form.eventName,
      ...(isTicket ? [...form.tHaves.map((h) => h.seat), ...form.tWants.map((x) => x.seat)] : [...form.haves, ...form.wants]),
    ];
    // 돈 거래 표현은 다른 오류보다 먼저 보이게
    if (texts.some(hasMoney)) e.push(t("eMoney"));
    if (category === "etc" && !form.etcLabel.trim()) e.push(t("eEtcLabel"));
    if (isTicket) {
      if (!form.eventName.trim()) e.push(t("eEvent"));
      if (form.tHaves.some((h) => !h.date)) e.push(t("eHaveDates"));
      if (form.tWants.some((x) => !x.date && !x.seat.trim())) e.push(t("eWantTicket"));
    } else if ([...form.haves, ...form.wants].some((v) => !v.trim())) {
      e.push(t("eItems"));
    }
    if (!normalizeContact(form.contactType, form.contact)) e.push(form.contactType === "x" ? t("eX") : t("eOpenChat"));
    if (!/^\d{6}$/.test(form.password)) e.push(t("ePw"));
    if (!form.agreed) e.push(t("eAgree"));
    return e;
  };

  const startWrite = () => {
    setForm(EMPTY);
    setErrors([]);
    setView("write");
    scrollTop();
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = EXCHANGE_LIMITS.photos - form.photos.length;
    const list = Array.from(files).slice(0, Math.max(0, room));
    setUploading(true);
    setErrors([]);
    try {
      for (const file of list) {
        const body = new FormData();
        body.append("file", await shrink(file));
        const res = await fetch("/api/exchange/photo", { method: "POST", body });
        const j = (await res.json().catch(() => ({}))) as { path?: string; url?: string; error?: string };
        if (!res.ok || !j.path || !j.url) {
          setErrors([serverErr(j.error, "sPhoto")]);
          break;
        }
        const photo = { path: j.path, url: j.url };
        setForm((p) => ({ ...p, photos: [...p.photos, photo].slice(0, EXCHANGE_LIMITS.photos) }));
      }
    } catch {
      setErrors([t("sPhoto")]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
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
          category,
          etcLabel: category === "etc" ? form.etcLabel : undefined,
          eventName: isTicket ? form.eventName : undefined,
          haves: isTicket ? form.tHaves : form.haves.map((text) => ({ text })),
          wants: isTicket ? form.tWants : form.wants.map((text) => ({ text })),
          photos: canPhoto ? form.photos.map((p) => p.path) : [],
          contactType: form.contactType,
          contact: form.contact,
          memo: form.memo,
          password: form.password,
          agreed: form.agreed,
          website: honeypot,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setErrors([serverErr(j.error, "sPostFail")]);
        return;
      }
      setView("list");
      await load(category);
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
      await load(category);
    } catch {
      setManageErr(t("sManageFail"));
    }
  };

  // 물건 줄 (가진 것 / 원하는 것) 입력
  const itemRows = (key: "haves" | "wants", legend: string) => (
    <fieldset className={w.group}>
      <legend className={w.legend}>{legend}<span className={w.req}>*</span></legend>
      <div className={s.rows}>
        {form[key].map((v, i) => (
          <div key={i} className={s.rowLine}>
            <input
              className={w.input}
              aria-label={`${legend} ${t("fItemN", { n: i + 1 })}`}
              maxLength={EXCHANGE_LIMITS.item}
              placeholder={t(`fItemPh.${category === "ticket" ? "etc" : category}`)}
              value={v}
              onChange={(e) => set(key, form[key].map((r, j) => (j === i ? e.target.value : r)))}
            />
            {form[key].length > 1 ? (
              <button type="button" className={s.linkBtn} onClick={() => set(key, form[key].filter((_, j) => j !== i))} aria-label={t("fRemoveN", { n: i + 1 })}>
                {t("fRemove")}
              </button>
            ) : null}
          </div>
        ))}
        {form[key].length < EXCHANGE_LIMITS.rows ? (
          <button type="button" className={s.addBtn} onClick={() => set(key, [...form[key], ""])}>{t("fAdd")}</button>
        ) : null}
      </div>
    </fieldset>
  );

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
            {EXCHANGE_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={category === c}
                className={`${s.tab} ${category === c ? s.tabActive : ""}`}
                onClick={() => {
                  setCategory(c);
                  setView("list");
                  setManage(null);
                  setErrors([]);
                }}
              >
                {catLabel(c)}
              </button>
            ))}
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
                  maxLength={30}
                  placeholder={t("searchPlaceholder")}
                  aria-label={t("searchBtn")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              )}

              {items === null ? (
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
                          {it.event_name ? <p className={s.cardDate}>{it.event_name}</p> : null}
                          {it.etc_label ? <p className={s.cardDate}>{it.etc_label}</p> : null}

                          {it.photos.length ? (
                            <div className={s.photos}>
                              {it.photos.map((src, i) => (
                                <button key={src} type="button" className={s.photoBtn} onClick={() => setLightbox(src)} aria-label={t("photoOpen")}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={src} alt={t("photoAlt", { n: i + 1 })} loading="lazy" />
                                </button>
                              ))}
                            </div>
                          ) : null}

                          <div className={s.swapBlock}>
                            <span className={s.swapLabel}>{t("have")}</span>
                            <ul className={s.swapList}>
                              {isTicketPost(it)
                                ? it.haves.map((h, i) => (
                                    <li key={i} className={s.have}>
                                      <b>{dateText(h.date)}</b>
                                      {h.seat.trim() ? ` ${h.seat}` : ""}
                                      <span className={s.qty}> · {t("qty", { n: h.qty })}</span>
                                    </li>
                                  ))
                                : (it.haves as ItemRow[]).map((h, i) => <li key={i} className={s.have}>{h.text}</li>)}
                            </ul>
                          </div>
                          <div className={s.swapBlock}>
                            <span className={`${s.swapLabel} ${s.swapLabelWant}`}>{t("want")}</span>
                            <ul className={s.swapList}>
                              {isTicketPost(it)
                                ? it.wants.map((x, i) => (
                                    <li key={i} className={s.want}>
                                      <b>{dateText(x.date)}</b> {x.seat.trim() || t("anySeat")}
                                    </li>
                                  ))
                                : (it.wants as ItemRow[]).map((x, i) => <li key={i} className={s.want}>{x.text}</li>)}
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

              <div className={w.navBar}>
                <button type="button" className={f.btn} onClick={startWrite}>{t("write")}</button>
              </div>
            </>
          ) : (
            <>
              <div className={w.fields}>
                {category === "etc" ? (
                  <label>
                    <span className={w.label}>{t("fEtcLabel")}<span className={w.req}>*</span></span>
                    <input className={w.input} maxLength={EXCHANGE_LIMITS.etcLabel} placeholder={t("fEtcLabelPh")} value={form.etcLabel} onChange={(e) => set("etcLabel", e.target.value)} />
                  </label>
                ) : null}

                {isTicket ? (
                  <>
                    <label>
                      <span className={w.label}>{t("fEvent")}<span className={w.req}>*</span></span>
                      <input className={w.input} maxLength={EXCHANGE_LIMITS.event} placeholder={t("fEventPh")} value={form.eventName} onChange={(e) => set("eventName", e.target.value)} />
                    </label>

                    {/* 가진 티켓 — 여러 장이면 + 로 추가 */}
                    <fieldset className={w.group}>
                      <legend className={w.legend}>{t("fHaveTickets")}<span className={w.req}>*</span></legend>
                      <div className={s.rows}>
                        {form.tHaves.map((h, i) => (
                          <div key={i} className={s.rowBox}>
                            <div className={s.rowHead}>
                              <span className={s.rowNo}>{t("fTicketN", { n: i + 1 })}</span>
                              {form.tHaves.length > 1 ? (
                                <button type="button" className={s.linkBtn} onClick={() => set("tHaves", form.tHaves.filter((_, j) => j !== i))} aria-label={t("fRemoveN", { n: i + 1 })}>
                                  {t("fRemove")}
                                </button>
                              ) : null}
                            </div>
                            <input
                              type="date" className={w.input} aria-label={`${t("fTicketN", { n: i + 1 })} ${t("fDate")}`}
                              min={minShowDate()} max={maxShowDate()} value={h.date}
                              onChange={(e) => set("tHaves", form.tHaves.map((r, j) => (j === i ? { ...r, date: e.target.value } : r)))}
                            />
                            <div className={s.rowLine}>
                              <input
                                className={w.input} aria-label={`${t("fTicketN", { n: i + 1 })} ${t("fSeatPh")}`} maxLength={EXCHANGE_LIMITS.seat}
                                placeholder={t("fSeatPh")} value={h.seat}
                                onChange={(e) => set("tHaves", form.tHaves.map((r, j) => (j === i ? { ...r, seat: e.target.value } : r)))}
                              />
                              <select className={`${w.input} ${s.qtySelect}`} aria-label={`${t("fTicketN", { n: i + 1 })} ${t("fQty")}`} value={h.qty} onChange={(e) => set("tHaves", form.tHaves.map((r, j) => (j === i ? { ...r, qty: Number(e.target.value) } : r)))}>
                                {Array.from({ length: EXCHANGE_LIMITS.qtyMax }, (_, n) => n + 1).map((n) => <option key={n} value={n}>{t("qty", { n })}</option>)}
                              </select>
                            </div>
                          </div>
                        ))}
                        {form.tHaves.length < EXCHANGE_LIMITS.rows ? (
                          <button type="button" className={s.addBtn} onClick={() => set("tHaves", [...form.tHaves, { ...NEW_T_HAVE }])}>{t("fAdd")}</button>
                        ) : null}
                      </div>
                    </fieldset>

                    {/* 원하는 날짜·좌석 — 비우면 무관 */}
                    <fieldset className={w.group}>
                      <legend className={w.legend}>{t("fWantTickets")}<span className={w.req}>*</span></legend>
                      <p className={w.subLabel}>{t("fWantDateHint")}</p>
                      <div className={s.rows}>
                        {form.tWants.map((x, i) => (
                          <div key={i} className={s.rowBox}>
                            <div className={s.rowHead}>
                              <span className={s.rowNo}>{t("fWantN", { n: i + 1 })}</span>
                              {form.tWants.length > 1 ? (
                                <button type="button" className={s.linkBtn} onClick={() => set("tWants", form.tWants.filter((_, j) => j !== i))} aria-label={t("fRemoveN", { n: i + 1 })}>
                                  {t("fRemove")}
                                </button>
                              ) : null}
                            </div>
                            <input
                              type="date" className={w.input} aria-label={`${t("fWantN", { n: i + 1 })} ${t("fDate")}`}
                              min={minShowDate()} max={maxShowDate()} value={x.date}
                              onChange={(e) => set("tWants", form.tWants.map((r, j) => (j === i ? { ...r, date: e.target.value } : r)))}
                            />
                            <input
                              className={w.input} aria-label={`${t("fWantN", { n: i + 1 })} ${t("fWantSeatPh")}`} maxLength={EXCHANGE_LIMITS.seat}
                              placeholder={t("fWantSeatPh")} value={x.seat}
                              onChange={(e) => set("tWants", form.tWants.map((r, j) => (j === i ? { ...r, seat: e.target.value } : r)))}
                            />
                          </div>
                        ))}
                        {form.tWants.length < EXCHANGE_LIMITS.rows ? (
                          <button type="button" className={s.addBtn} onClick={() => set("tWants", [...form.tWants, { ...NEW_T_WANT }])}>{t("fAdd")}</button>
                        ) : null}
                      </div>
                    </fieldset>
                  </>
                ) : (
                  <>
                    {itemRows("haves", t("fHaves"))}
                    {itemRows("wants", t("fWants"))}
                  </>
                )}

                {canPhoto ? (
                  <fieldset className={w.group}>
                    <legend className={w.legend}>{t("fPhotos")}</legend>
                    <p className={w.subLabel}>{t("fPhotoHint")}</p>
                    <div className={s.photos}>
                      {form.photos.map((p, i) => (
                        <div key={p.path} className={s.photoBtn}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.url} alt={t("photoAlt", { n: i + 1 })} />
                          <button
                            type="button"
                            className={s.photoRemove}
                            onClick={() => set("photos", form.photos.filter((_, j) => j !== i))}
                            aria-label={t("fRemovePhoto", { n: i + 1 })}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {form.photos.length < EXCHANGE_LIMITS.photos ? (
                        <button type="button" className={`${s.photoBtn} ${s.photoAdd}`} onClick={() => fileRef.current?.click()} disabled={uploading}>
                          {uploading ? "…" : t("fAddPhoto")}
                        </button>
                      ) : null}
                    </div>
                    {uploading ? <p className={w.subLabel}>{t("uploading")}</p> : null}
                    <input
                      ref={fileRef} type="file" accept="image/*" multiple hidden
                      onChange={(e) => void addPhotos(e.target.files)}
                    />
                  </fieldset>
                ) : null}

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
                  <textarea className={`${w.input} ${s.textarea}`} rows={3} maxLength={EXCHANGE_LIMITS.memo} placeholder={t("fMemoPh")} value={form.memo} onChange={(e) => set("memo", e.target.value)} />
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
                <button type="button" className={`${f.btn} ${w.navBtn}`} onClick={() => void submit()} disabled={sending || uploading}>
                  {sending ? t("submitting") : t("submit")}
                </button>
              </div>
            </>
          )}
        </div>
        <div className={f.statusBar}>
          {view === "list" ? t("listStatus", { kind: catLabel(category), n: items ? shown.length : 0 }) : t("writeStatus", { kind: catLabel(category) })}
        </div>
      </div>

      {lightbox ? (
        <div className={w.overlay} onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label={t("photoOpen")}>
          <div className={f.dialog} style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className={f.titleBar}>
              <span className={f.titleIcon} aria-hidden>🖼️</span>
              <span className={f.titleText}>photo.webp</span>
              <div className={f.winBtns}>
                <span className={f.winBtn} aria-hidden>─</span>
                <span className={f.winBtn} aria-hidden>□</span>
                <button type="button" className={`${f.winBtnClose} ${w.closeBtn}`} onClick={() => setLightbox(null)} aria-label={t("close")} autoFocus>✕</button>
              </div>
            </div>
            <div className={f.imageBody}>
              <div className={f.imageCanvas}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lightbox} alt="" className={f.noticeImg} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

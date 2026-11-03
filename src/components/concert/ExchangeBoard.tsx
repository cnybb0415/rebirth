"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import f from "./funding-page.module.css";
import w from "./helper-wizard.module.css";
import s from "./exchange-board.module.css";
import {
  EXCHANGE_DATES,
  EXCHANGE_KINDS,
  EXCHANGE_LIMITS,
  EXCHANGE_NOTICE,
  EXCHANGE_NOTICE_TITLE,
  contactHref,
  findDate,
  isDateOpen,
  normalizeContact,
  type ContactType,
  type ExchangeKind,
} from "@/data/ticketExchange";
import type { ExchangePost } from "@/lib/exchangeDb";

// 콘서트 티켓 교환 게시판 — 날짜 교환 / 좌석 교환
// 글은 Supabase(ticket_exchanges)에 저장. 완료 표시·삭제는 글 비밀번호로

type Form = {
  haveDate: string;
  wantDates: string[];
  haveSeat: string;
  wantSeat: string;
  qty: number;
  contactType: ContactType;
  contact: string;
  memo: string;
  password: string;
  agreed: boolean;
};

const EMPTY: Form = {
  haveDate: "",
  wantDates: [],
  haveSeat: "",
  wantSeat: "",
  qty: 1,
  contactType: "x",
  contact: "",
  memo: "",
  password: "",
  agreed: false,
};

const SERVER_ERR: Record<string, string> = {
  contact: "연락처 형식을 확인해 주십시오. X 아이디 또는 open.kakao.com 오픈채팅 링크만 가능합니다.",
  phone: "전화번호는 공개 게시판에 올릴 수 없습니다. X 아이디나 오픈채팅을 이용해 주십시오.",
  too_many: "짧은 시간에 글을 너무 많이 올렸습니다. 잠시 후 다시 시도해 주십시오.",
  wrong_password: "비밀번호가 맞지 않습니다.",
  not_found: "이미 삭제된 글입니다.",
};

const dateLabel = (id: string) => findDate(id)?.label ?? id;

function timeAgo(iso: string): string {
  const m = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.round(h / 24)}일 전`;
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

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
  const openDates = useMemo(() => EXCHANGE_DATES.filter((d) => isDateOpen(d)), []);
  const [kind, setKind] = useState<ExchangeKind>("date");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [openOnly, setOpenOnly] = useState(true);
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
  const windowRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (k: ExchangeKind) => {
    setItems(null);
    setLoadError(false);
    try {
      const res = await fetch(`/api/exchange?kind=${k}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const json = (await res.json()) as { items: ExchangePost[] };
      setItems(json.items);
    } catch {
      setLoadError(true);
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load(kind);
  }, [kind, load]);

  const scrollTop = () => windowRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((p) => ({ ...p, [key]: value }));

  const shown = (items ?? []).filter(
    (it) =>
      (dateFilter === "all" || it.have_date === dateFilter || (kind === "date" && it.want_dates.includes(dateFilter))) &&
      (!openOnly || it.status === "open"),
  );

  const kindInfo = EXCHANGE_KINDS.find((k) => k.id === kind)!;

  const validate = (): string[] => {
    const e: string[] = [];
    if (!form.haveDate) e.push(kind === "date" ? "가지고 있는 날짜를 선택해 주십시오." : "날짜를 선택해 주십시오.");
    if (kind === "date" && form.wantDates.length === 0) e.push("교환하고 싶은 날짜를 하나 이상 선택해 주십시오.");
    if (kind === "seat") {
      if (!form.haveSeat.trim()) e.push("지금 가진 좌석(구역)을 입력해 주십시오.");
      if (!form.wantSeat.trim()) e.push("원하는 구역을 입력해 주십시오.");
    }
    if (!normalizeContact(form.contactType, form.contact))
      e.push(form.contactType === "x" ? "X 아이디를 확인해 주십시오. (예: @exol_1234)" : "오픈채팅 링크를 확인해 주십시오. (https://open.kakao.com/o/…)");
    if (form.password.length < 4 || form.password.length > 20) e.push("비밀번호는 4~20자로 정해 주십시오.");
    if (!form.agreed) e.push("안내 확인과 교환 글 여부에 동의해 주십시오.");
    return e;
  };

  const startWrite = () => {
    setForm({ ...EMPTY, haveDate: dateFilter !== "all" ? dateFilter : "" });
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
          haveDate: form.haveDate,
          wantDates: kind === "date" ? form.wantDates : [],
          haveSeat: form.haveSeat,
          wantSeat: kind === "seat" ? form.wantSeat : "",
          qty: form.qty,
          contactType: form.contactType,
          contact: form.contact,
          memo: form.memo,
          password: form.password,
          website: honeypot,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setErrors([SERVER_ERR[j.error ?? ""] ?? "글을 올리지 못했습니다. 입력한 내용을 확인한 뒤 다시 시도해 주십시오."]);
        return;
      }
      setView("list");
      setDateFilter("all");
      await load(kind);
      scrollTop();
    } catch {
      setErrors(["글을 올리지 못했습니다. 잠시 후 다시 시도해 주십시오."]);
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
        setManageErr(SERVER_ERR[j.error ?? ""] ?? "처리하지 못했습니다.");
        return;
      }
      setManage(null);
      setManagePw("");
      await load(kind);
    } catch {
      setManageErr("처리하지 못했습니다.");
    }
  };

  return (
    <div className={f.desktop}>
      <input
        type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden
        value={honeypot} onChange={(e) => setHoneypot(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      <div className={f.dialog} ref={windowRef} style={{ scrollMarginTop: 72 }}>
        <TitleBar title="티켓교환.exe — EXO PLANET #6" />
        <div className={f.body}>
          {/* 탭 */}
          <div className={s.tabs} role="tablist" aria-label="교환 종류">
            {EXCHANGE_KINDS.map((k) => (
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
          <p className={w.text}>{kindInfo.desc}</p>

          {view === "list" ? (
            <>
              <div className={s.notice} role="note" aria-label={EXCHANGE_NOTICE_TITLE}>
                <p className={s.noticeTitle}>⚠ {EXCHANGE_NOTICE_TITLE}</p>
                <ul className={s.noticeList}>
                  {EXCHANGE_NOTICE.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>

              <div className={s.toolbar}>
                <div className={s.chips} role="group" aria-label="날짜">
                  <button type="button" className={`${s.chip} ${dateFilter === "all" ? s.chipOn : ""}`} aria-pressed={dateFilter === "all"} onClick={() => setDateFilter("all")}>
                    전체
                  </button>
                  {openDates.map((d) => (
                    <button key={d.id} type="button" className={`${s.chip} ${dateFilter === d.id ? s.chipOn : ""}`} aria-pressed={dateFilter === d.id} onClick={() => setDateFilter(d.id)}>
                      {d.short}
                    </button>
                  ))}
                </div>
                <label className={w.check} style={{ padding: 0, fontSize: 11 }}>
                  <input type="checkbox" checked={openOnly} onChange={() => setOpenOnly((v) => !v)} />
                  모집중만
                </label>
              </div>

              {openDates.length === 0 ? (
                <p className={s.empty}>공연이 모두 끝나 교환 게시판을 닫았습니다.</p>
              ) : items === null ? (
                <p className={s.empty}>불러오는 중…</p>
              ) : loadError ? (
                <p className={s.empty}>목록을 불러오지 못했습니다. 잠시 후 다시 열어 주십시오.</p>
              ) : shown.length === 0 ? (
                <p className={s.empty}>아직 올라온 글이 없습니다.</p>
              ) : (
                <ul className={s.list}>
                  {shown.map((it) => {
                    const done = it.status === "done";
                    const managing = manage?.id === it.id;
                    return (
                      <li key={it.id} className={`${s.card} ${done ? s.cardDone : ""}`}>
                        <div className={s.cardTop}>
                          <span className={`${s.badge} ${done ? s.badgeDone : ""}`}>{done ? "교환완료" : "모집중"}</span>
                          <span className={s.meta}>{it.qty}매 · {timeAgo(it.created_at)}</span>
                        </div>

                        {it.kind === "date" ? (
                          <div className={s.swap}>
                            <span className={s.have}>{dateLabel(it.have_date)}</span>
                            <span className={s.arrow} aria-label="에서">→</span>
                            <span className={s.want}>{it.want_dates.map(dateLabel).join(" · ")}</span>
                          </div>
                        ) : (
                          <>
                            <p className={s.meta}>{dateLabel(it.have_date)}</p>
                            <div className={s.swap}>
                              <span className={s.have}>{it.have_seat}</span>
                              <span className={s.arrow} aria-label="에서">→</span>
                              <span className={s.want}>{it.want_seat}</span>
                            </div>
                          </>
                        )}
                        {it.kind === "date" && it.have_seat ? <p className={s.meta}>좌석 {it.have_seat}</p> : null}
                        {it.memo ? <p className={s.memo}>{it.memo}</p> : null}

                        <div className={s.cardActions}>
                          {!done ? (
                            <a href={contactHref(it.contact_type, it.contact)} target="_blank" rel="noopener noreferrer nofollow" className={s.contact}>
                              {it.contact_type === "x" ? `X @${it.contact}` : "오픈채팅 열기"} ↗
                            </a>
                          ) : (
                            <span />
                          )}
                          <span className={s.manageBtns}>
                            <button type="button" className={s.linkBtn} onClick={() => { setManage({ id: it.id, action: done ? "open" : "done" }); setManagePw(""); setManageErr(""); }}>
                              {done ? "다시 모집" : "교환 완료"}
                            </button>
                            <button type="button" className={s.linkBtn} onClick={() => { setManage({ id: it.id, action: "delete" }); setManagePw(""); setManageErr(""); }}>
                              삭제
                            </button>
                          </span>
                        </div>

                        {managing ? (
                          <div className={s.managePanel}>
                            <label className={w.label} htmlFor={`pw-${it.id}`}>
                              글 비밀번호 ({manage.action === "delete" ? "삭제" : manage.action === "done" ? "교환 완료" : "다시 모집"})
                            </label>
                            <div className={s.manageRow}>
                              <input
                                id={`pw-${it.id}`} className={w.input} type="password" autoComplete="off"
                                value={managePw} onChange={(e) => setManagePw(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && void runManage()}
                              />
                              <button type="button" className={f.btn} style={{ maxWidth: 80 }} onClick={() => void runManage()}>확인</button>
                              <button type="button" className={s.linkBtn} onClick={() => setManage(null)}>취소</button>
                            </div>
                            {manageErr ? <p className={s.manageErr} role="alert">{manageErr}</p> : null}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}

              {openDates.length > 0 ? (
                <div className={w.navBar}>
                  <button type="button" className={f.btn} onClick={startWrite}>+ 글쓰기</button>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className={w.fields}>
                <fieldset className={w.group}>
                  <legend className={w.legend}>{kind === "date" ? "가지고 있는 날짜" : "날짜"}<span className={w.req}>*</span></legend>
                  {openDates.map((d) => (
                    <label key={d.id} className={w.check}>
                      <input
                        type="radio" name="haveDate" className={s.radio} checked={form.haveDate === d.id}
                        onChange={() => setForm((p) => ({ ...p, haveDate: d.id, wantDates: p.wantDates.filter((x) => x !== d.id) }))}
                      />
                      {d.label}
                    </label>
                  ))}
                </fieldset>

                {kind === "date" ? (
                  <fieldset className={w.group}>
                    <legend className={w.legend}>교환하고 싶은 날짜 (여러 개 가능)<span className={w.req}>*</span></legend>
                    {openDates.filter((d) => d.id !== form.haveDate).map((d) => (
                      <label key={d.id} className={w.check}>
                        <input type="checkbox" checked={form.wantDates.includes(d.id)} onChange={() => set("wantDates", toggle(form.wantDates, d.id))} />
                        {d.label}
                      </label>
                    ))}
                  </fieldset>
                ) : null}

                <label>
                  <span className={w.label}>
                    {kind === "date" ? "가진 좌석 (선택)" : "지금 가진 좌석"}
                    {kind === "seat" ? <span className={w.req}>*</span> : null}
                  </span>
                  <input className={w.input} maxLength={EXCHANGE_LIMITS.seat} placeholder="예: 2층 B구역 10열" value={form.haveSeat} onChange={(e) => set("haveSeat", e.target.value)} />
                </label>

                {kind === "seat" ? (
                  <label>
                    <span className={w.label}>가고 싶은 구역<span className={w.req}>*</span></span>
                    <input className={w.input} maxLength={EXCHANGE_LIMITS.seat} placeholder="예: 1층 플로어, A·B구역" value={form.wantSeat} onChange={(e) => set("wantSeat", e.target.value)} />
                  </label>
                ) : null}

                <label>
                  <span className={w.label}>매수<span className={w.req}>*</span></span>
                  <select className={w.input} value={form.qty} onChange={(e) => set("qty", Number(e.target.value))}>
                    {Array.from({ length: EXCHANGE_LIMITS.qtyMax }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}매</option>
                    ))}
                  </select>
                </label>

                <fieldset className={w.group}>
                  <legend className={w.legend}>연락 방법<span className={w.req}>*</span></legend>
                  <div className={s.contactTypes}>
                    <label className={w.check}>
                      <input type="radio" name="contactType" className={s.radio} checked={form.contactType === "x"} onChange={() => set("contactType", "x")} />
                      X(트위터) 아이디
                    </label>
                    <label className={w.check}>
                      <input type="radio" name="contactType" className={s.radio} checked={form.contactType === "openchat"} onChange={() => set("contactType", "openchat")} />
                      오픈채팅 링크
                    </label>
                  </div>
                  <input
                    className={w.input} aria-label="연락처" maxLength={EXCHANGE_LIMITS.contact}
                    inputMode={form.contactType === "openchat" ? "url" : "text"} autoCapitalize="off" autoCorrect="off"
                    placeholder={form.contactType === "x" ? "@exol_1234" : "https://open.kakao.com/o/…"}
                    value={form.contact} onChange={(e) => set("contact", e.target.value)}
                  />
                </fieldset>

                <label>
                  <span className={w.label}>메모 (선택)</span>
                  <textarea className={`${w.input} ${s.textarea}`} rows={3} maxLength={EXCHANGE_LIMITS.memo} placeholder="연석 교환 희망, 시야 좋은 구역 우선 등" value={form.memo} onChange={(e) => set("memo", e.target.value)} />
                </label>

                <label>
                  <span className={w.label}>글 비밀번호 (4~20자)<span className={w.req}>*</span></span>
                  <input className={w.input} type="password" autoComplete="new-password" maxLength={20} value={form.password} onChange={(e) => set("password", e.target.value)} />
                  <span className={w.subLabel} style={{ display: "block", marginTop: 6 }}>교환 완료 표시와 삭제할 때 사용합니다.</span>
                </label>

                <label className={w.check}>
                  <input type="checkbox" checked={form.agreed} onChange={() => set("agreed", !form.agreed)} />
                  안내를 확인했으며, 판매·양도가 아닌 교환 글입니다
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
                  &lt; 목록
                </button>
                <button type="button" className={`${f.btn} ${w.navBtn}`} onClick={() => void submit()} disabled={sending}>
                  {sending ? "올리는 중..." : "올리기"}
                </button>
              </div>
            </>
          )}
        </div>
        <div className={f.statusBar}>
          {view === "list" ? `${kindInfo.label} · ${items ? shown.length : 0}건` : `${kindInfo.label} 글쓰기`}
        </div>
      </div>
    </div>
  );
}

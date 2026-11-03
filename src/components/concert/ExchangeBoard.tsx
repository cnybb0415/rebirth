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
  type HaveRow,
  type WantRow,
} from "@/data/ticketExchange";
import type { ExchangePost } from "@/lib/exchangeDb";

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

const SERVER_ERR: Record<string, string> = {
  contact: "연락처 형식을 확인해 주십시오. X 아이디 또는 open.kakao.com 오픈채팅 링크만 가능합니다.",
  phone: "전화번호는 공개 게시판에 올릴 수 없습니다. X 아이디나 오픈채팅을 이용해 주십시오.",
  too_many: "짧은 시간에 글을 너무 많이 올렸습니다. 잠시 후 다시 시도해 주십시오.",
  wrong_password: "비밀번호가 맞지 않습니다. 5번 틀리면 30분 동안 잠깁니다.",
  locked: "비밀번호를 여러 번 틀려 30분 동안 잠겼습니다. 잠시 후 다시 시도해 주십시오.",
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

const seatText = (seat: string) => seat.trim() || "구역 무관";

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
      (dateFilter === "all" || it.have_dates.includes(dateFilter) || it.want_dates.includes(dateFilter)) &&
      (!openOnly || it.status === "open"),
  );

  const kindInfo = EXCHANGE_KINDS.find((k) => k.id === kind)!;

  const validate = (): string[] => {
    const e: string[] = [];
    if (kind === "seat") {
      if (!form.seatDate) e.push("날짜를 선택해 주십시오.");
      if (form.haves.some((h) => !h.seat.trim())) e.push("가진 좌석(구역)을 모두 입력해 주십시오.");
      if (form.wants.some((x) => !x.seat.trim())) e.push("원하는 구역을 모두 입력해 주십시오.");
    } else {
      if (form.haves.some((h) => !h.date)) e.push("가진 티켓의 날짜를 모두 선택해 주십시오.");
      if (form.wants.some((x) => !x.date)) e.push("원하는 회차를 모두 선택해 주십시오.");
      const haveDates = form.haves.map((h) => h.date);
      if (form.wants.some((x) => x.date && haveDates.includes(x.date))) e.push("원하는 회차는 가진 티켓과 다른 날짜여야 합니다.");
    }
    if (!normalizeContact(form.contactType, form.contact))
      e.push(form.contactType === "x" ? "X 아이디를 확인해 주십시오. (예: @exol_1234)" : "오픈채팅 링크를 확인해 주십시오. (https://open.kakao.com/o/…)");
    if (!/^\d{6}$/.test(form.password)) e.push("비밀번호는 숫자 6자리로 정해 주십시오.");
    if (!form.agreed) e.push("안내 확인과 교환 글 여부에 동의해 주십시오.");
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
    <div className={`${f.desktop} ${s.board}`}>
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
                          <span className={s.meta}>{timeAgo(it.created_at)}</span>
                        </div>
                        {it.kind === "seat" ? <p className={s.cardDate}>{dateLabel(it.have_dates[0])}</p> : null}

                        <div className={s.swapBlock}>
                          <span className={s.swapLabel}>보유</span>
                          <ul className={s.swapList}>
                            {it.haves.map((h, i) => (
                              <li key={i} className={s.have}>
                                {it.kind === "date" ? <b>{dateLabel(h.date)}</b> : null}
                                {it.kind === "date" ? (h.seat.trim() ? ` ${h.seat}` : "") : seatText(h.seat)}
                                <span className={s.qty}> · {h.qty}매</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={s.swapBlock}>
                          <span className={`${s.swapLabel} ${s.swapLabelWant}`}>희망</span>
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
                                id={`pw-${it.id}`} className={w.input} type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} autoComplete="off"
                                placeholder="숫자 6자리" value={managePw} onChange={(e) => setManagePw(e.target.value.replace(/\D/g, "").slice(0, 6))}
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
                {kind === "seat" ? (
                  <fieldset className={w.group}>
                    <legend className={w.legend}>날짜<span className={w.req}>*</span></legend>
                    {openDates.map((d) => (
                      <label key={d.id} className={w.check}>
                        <input type="radio" name="seatDate" className={s.radio} checked={form.seatDate === d.id} onChange={() => set("seatDate", d.id)} />
                        {d.label}
                      </label>
                    ))}
                  </fieldset>
                ) : null}

                {/* 가진 티켓 — 여러 장이면 + 로 추가 */}
                <fieldset className={w.group}>
                  <legend className={w.legend}>가진 티켓<span className={w.req}>*</span></legend>
                  <div className={s.rows}>
                    {form.haves.map((h, i) => (
                      <div key={i} className={s.rowBox}>
                        <div className={s.rowHead}>
                          <span className={s.rowNo}>티켓 {i + 1}</span>
                          {form.haves.length > 1 ? (
                            <button type="button" className={s.linkBtn} onClick={() => set("haves", form.haves.filter((_, j) => j !== i))} aria-label={`티켓 ${i + 1} 빼기`}>
                              빼기
                            </button>
                          ) : null}
                        </div>
                        {kind === "date" ? (
                          <select className={w.input} aria-label={`티켓 ${i + 1} 날짜`} value={h.date} onChange={(e) => set("haves", form.haves.map((r, j) => (j === i ? { ...r, date: e.target.value } : r)))}>
                            <option value="">날짜 선택</option>
                            {openDates.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                          </select>
                        ) : null}
                        <div className={s.rowLine}>
                          <input
                            className={w.input} aria-label={`티켓 ${i + 1} 좌석`} maxLength={EXCHANGE_LIMITS.seat}
                            placeholder={kind === "date" ? "좌석 (선택) 예: 2층 B구역" : "좌석 예: 3층 C구역 4열"}
                            value={h.seat} onChange={(e) => set("haves", form.haves.map((r, j) => (j === i ? { ...r, seat: e.target.value } : r)))}
                          />
                          <select className={`${w.input} ${s.qtySelect}`} aria-label={`티켓 ${i + 1} 매수`} value={h.qty} onChange={(e) => set("haves", form.haves.map((r, j) => (j === i ? { ...r, qty: Number(e.target.value) } : r)))}>
                            {Array.from({ length: EXCHANGE_LIMITS.qtyMax }, (_, n) => n + 1).map((n) => <option key={n} value={n}>{n}매</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                    {form.haves.length < EXCHANGE_LIMITS.rows ? (
                      <button type="button" className={s.addBtn} onClick={() => set("haves", [...form.haves, { ...NEW_HAVE }])}>+ 티켓 추가</button>
                    ) : null}
                  </div>
                </fieldset>

                {/* 원하는 회차·좌석 — 여러 개면 + 로 추가 */}
                <fieldset className={w.group}>
                  <legend className={w.legend}>{kind === "date" ? "원하는 회차·좌석" : "원하는 구역"}<span className={w.req}>*</span></legend>
                  <div className={s.rows}>
                    {form.wants.map((x, i) => (
                      <div key={i} className={s.rowBox}>
                        <div className={s.rowHead}>
                          <span className={s.rowNo}>희망 {i + 1}</span>
                          {form.wants.length > 1 ? (
                            <button type="button" className={s.linkBtn} onClick={() => set("wants", form.wants.filter((_, j) => j !== i))} aria-label={`희망 ${i + 1} 빼기`}>
                              빼기
                            </button>
                          ) : null}
                        </div>
                        {kind === "date" ? (
                          <select className={w.input} aria-label={`희망 ${i + 1} 회차`} value={x.date} onChange={(e) => set("wants", form.wants.map((r, j) => (j === i ? { ...r, date: e.target.value } : r)))}>
                            <option value="">회차 선택</option>
                            {openDates.filter((d) => !form.haves.some((h) => h.date === d.id)).map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                          </select>
                        ) : null}
                        <input
                          className={w.input} aria-label={`희망 ${i + 1} 좌석`} maxLength={EXCHANGE_LIMITS.seat}
                          placeholder={kind === "date" ? "원하는 좌석 (선택) 예: 1층, 플로어" : "원하는 구역 예: 1층 플로어"}
                          value={x.seat} onChange={(e) => set("wants", form.wants.map((r, j) => (j === i ? { ...r, seat: e.target.value } : r)))}
                        />
                      </div>
                    ))}
                    {form.wants.length < EXCHANGE_LIMITS.rows ? (
                      <button type="button" className={s.addBtn} onClick={() => set("wants", [...form.wants, { ...NEW_WANT }])}>+ 희망 추가</button>
                    ) : null}
                  </div>
                </fieldset>

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
                  <textarea className={`${w.input} ${s.textarea}`} rows={3} maxLength={EXCHANGE_LIMITS.memo} placeholder="자유" value={form.memo} onChange={(e) => set("memo", e.target.value)} />
                  <span className={s.memoWarn}>※ 금전 요구 금지</span>
                </label>

                <label>
                  <span className={w.label}>글 비밀번호 (숫자 6자리)<span className={w.req}>*</span></span>
                  <input className={w.input} type="password" inputMode="numeric" pattern="[0-9]*" autoComplete="new-password" maxLength={6} placeholder="••••••" value={form.password} onChange={(e) => set("password", e.target.value.replace(/\D/g, "").slice(0, 6))} />
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

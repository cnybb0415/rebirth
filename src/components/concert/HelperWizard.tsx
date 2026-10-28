"use client";

import { useEffect, useRef, useState } from "react";
import f from "./funding-page.module.css";
import s from "./helper-wizard.module.css";
import { HELPER_DATES, HELPER_PRIVACY, HELPER_ROLES, type HelperDate, type HelperRole } from "@/data/helperRecruit";

type DateId = HelperDate["id"];

interface FormState {
  name: string;
  contact: string;
  email: string;
  hasCompanion: boolean;
  companionName: string;
  companionContact: string;
  companionEmail: string;
  dates: DateId[];
  roles: string[];
  seats: Partial<Record<DateId, string>>;
  agreed: boolean;
}

const EMPTY: FormState = {
  name: "", contact: "", email: "",
  hasCompanion: false, companionName: "", companionContact: "", companionEmail: "",
  dates: [], roles: [], seats: {}, agreed: false,
};

const STEPS = ["시작", "신청인 정보", "날짜 · 역할", "확인"] as const;

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function TitleBar({ icon, title, onClose }: { icon: string; title: string; onClose?: () => void }) {
  return (
    <div className={f.titleBar}>
      <span className={f.titleIcon} aria-hidden>{icon}</span>
      <span className={f.titleText}>{title}</span>
      <div className={f.winBtns} aria-hidden={!onClose}>
        <span className={f.winBtn} aria-hidden>─</span>
        <span className={f.winBtn} aria-hidden>□</span>
        {onClose ? (
          <button type="button" className={`${f.winBtnClose} ${s.closeBtn}`} onClick={onClose} aria-label="닫기">✕</button>
        ) : (
          <span className={f.winBtnClose} aria-hidden>✕</span>
        )}
      </div>
    </div>
  );
}

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label>
      <span className={s.label}>
        {label}
        {required && <span className={s.req}>*</span>}
      </span>
      {children}
    </label>
  );
}

function Check({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <label className={s.check}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

export function HelperWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [guide, setGuide] = useState<HelperRole | null>(null);
  const [honeypot, setHoneypot] = useState(""); // 사람은 못 보는 칸. 봇이 채우면 서버가 저장하지 않음
  const windowRef = useRef<HTMLDivElement>(null);

  // 단계가 바뀌면 창 맨 위로 (긴 단계에서 아래쪽 버튼을 눌렀을 때)
  const goTo = (n: number) => {
    setStep(n);
    windowRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((p) => ({ ...p, [key]: value }));

  const needsSeat = HELPER_ROLES.some((r) => r.needsSeat && form.roles.includes(r.id));
  const seatDates = HELPER_DATES.filter((d) => form.dates.includes(d.id));
  const pickedDates = seatDates.map((d) => d.label).join(", ");
  const pickedRoles = HELPER_ROLES.filter((r) => form.roles.includes(r.id)).map((r) => r.label).join(", ");

  useEffect(() => {
    if (!guide) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setGuide(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [guide]);

  const validate = (n: number): string[] => {
    const errs: string[] = [];
    if (n === 1) {
      if (!form.name.trim()) errs.push("이름을 입력해 주세요.");
      if (form.contact.replace(/\D/g, "").length < 10) errs.push("연락처를 정확히 입력해 주세요.");
      if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.push("메일 주소를 정확히 입력해 주세요.");
      if (form.hasCompanion) {
        if (!form.companionName.trim()) errs.push("동반인 이름을 입력해 주세요.");
        if (form.companionContact.replace(/\D/g, "").length < 10) errs.push("동반인 연락처를 정확히 입력해 주세요.");
        if (!/^\S+@\S+\.\S+$/.test(form.companionEmail.trim())) errs.push("동반인 메일 주소를 정확히 입력해 주세요.");
      }
    }
    if (n === 2) {
      if (form.dates.length === 0) errs.push("참여할 날짜를 선택해 주세요.");
      if (form.roles.length === 0) errs.push("희망 역할을 선택해 주세요.");
      if (needsSeat) {
        for (const d of seatDates) if (!form.seats[d.id]?.trim()) errs.push(`${d.label} 좌석 위치를 입력해 주세요.`);
      }
    }
    if (n === 3 && !form.agreed) errs.push("개인정보 수집 및 이용에 동의해 주세요.");
    return errs;
  };

  const next = () => {
    const errs = validate(step);
    setErrors(errs);
    if (errs.length === 0) goTo(step + 1);
  };

  const back = () => {
    setErrors([]);
    goTo(Math.max(0, step - 1));
  };

  const submit = async () => {
    const errs = validate(3);
    setErrors(errs);
    if (errs.length > 0) return;
    setStatus("sending");
    const seat = (id: DateId) => (needsSeat && form.dates.includes(id) ? form.seats[id]?.trim() ?? "" : "");
    try {
      const res = await fetch("/api/helper-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submittedAt: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
          name: form.name.trim(),
          contact: form.contact.trim(),
          email: form.email.trim(),
          companionYn: form.hasCompanion ? "있음" : "없음",
          companionName: form.hasCompanion ? form.companionName.trim() : "",
          companionContact: form.hasCompanion ? form.companionContact.trim() : "",
          companionEmail: form.hasCompanion ? form.companionEmail.trim() : "",
          dates: pickedDates,
          roles: pickedRoles,
          seat7: seat("d7"),
          seat8: seat("d8"),
          website: honeypot,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      windowRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    } catch {
      setStatus("error");
    }
  };

  const pct = status === "done" ? 100 : Math.round((step / STEPS.length) * 100);

  return (
    <div className={f.desktop}>
      <input
        type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden
        value={honeypot} onChange={(e) => setHoneypot(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      <div className={f.dialog} ref={windowRef} style={{ scrollMarginTop: 72 }}>
        <TitleBar icon="🛸" title="헬퍼지원.exe — 설치 마법사" />
        <div className={f.body}>
          {/* 진행 막대 */}
          <div className={f.progressSection}>
            <div className={f.progressTrack} aria-hidden>
              <div className={f.progressFill} style={{ width: `${pct}%` }} />
            </div>
            <div className={f.progressMeta}>
              <span className={f.progressLabel}>
                {status === "done" ? "COMPLETE" : `STEP ${step + 1} / ${STEPS.length} · ${STEPS[step]}`}
              </span>
              <span className={f.progressPct}>{pct}%</span>
            </div>
          </div>

          <hr className={f.divider} />

          {status === "done" ? (
            <div className={s.done}>
              <span className={s.doneIcon} aria-hidden>🛸</span>
              <p className={s.stepTitle}>신청이 완료되었습니다!</p>
              <p className={s.text}>
                헬퍼 신청이 접수되었어요.
                <br />
                확인 후 입력하신 메일로 연락드릴게요 ♥
              </p>
            </div>
          ) : (
            <>
              {step === 0 && (
                <>
                  <div className={s.stepHead}>
                    <span className={s.stepNo}>HELPER RECRUIT</span>
                    <p className={s.stepTitle}>EXO PLANET #6 EXhOrizon Encore 헬퍼 모집</p>
                  </div>
                  <p className={s.text}>
                    EXO PLANET #6 EXhOrizon Encore 이벤트를 도와주실 헬퍼를 모집합니다!
                    <br />
                    아래 공지를 먼저 확인하고 <b>다음</b>을 눌러 신청을 시작해 주세요.
                  </p>
                  {HELPER_ROLES.map((r) => (
                    <fieldset key={r.id} className={s.group}>
                      <legend className={s.legend}>{r.label}</legend>
                      <dl className={s.roleInfo}>
                        <dt>모집 인원</dt><dd>{r.summary.headcount}</dd>
                        <dt>참여 조건</dt><dd>{r.summary.condition}</dd>
                        <dt>집합 시간</dt><dd>{r.summary.meet}</dd>
                      </dl>
                      <button type="button" className={`${s.guideBtn} ${s.guideBtnWide}`} onClick={() => setGuide(r)}>
                        📋 공지 자세히 보기
                      </button>
                    </fieldset>
                  ))}
                  <p className={s.text} style={{ fontSize: 11, opacity: 0.75 }}>
                    모집 날짜 · {HELPER_DATES.map((d) => d.label).join(" / ")}
                    <br />
                    많은 지원 부탁 드립니다 ♥
                  </p>
                </>
              )}

              {step === 1 && (
                <>
                  <div className={s.stepHead}>
                    <span className={s.stepNo}>STEP 2</span>
                    <p className={s.stepTitle}>신청인 정보를 입력해 주세요</p>
                  </div>
                  <div className={s.fields}>
                    <Field label="이름" required>
                      <input className={s.input} autoComplete="name" placeholder="엑소엘" value={form.name}
                        onChange={(e) => set("name", e.target.value)} />
                    </Field>
                    <Field label="연락처" required>
                      <input className={s.input} type="tel" inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000"
                        value={form.contact} onChange={(e) => set("contact", formatPhone(e.target.value))} />
                    </Field>
                    <Field label="메일 주소" required>
                      <input className={s.input} type="email" autoComplete="email" placeholder="exol@email.com"
                        value={form.email} onChange={(e) => set("email", e.target.value)} />
                    </Field>
                    <fieldset className={s.group}>
                      <legend className={s.legend}>동반인</legend>
                      <Check checked={form.hasCompanion} label="동반인과 함께 신청할게요"
                        onChange={() => setForm((p) => ({ ...p, hasCompanion: !p.hasCompanion, companionName: "", companionContact: "", companionEmail: "" }))} />
                      {form.hasCompanion && (
                        <div className={s.subFields}>
                          <Field label="동반인 이름" required>
                            <input className={s.input} placeholder="엑소엘" value={form.companionName}
                              onChange={(e) => set("companionName", e.target.value)} />
                          </Field>
                          <Field label="동반인 연락처" required>
                            <input className={s.input} type="tel" inputMode="numeric" placeholder="010-0000-0000"
                              value={form.companionContact} onChange={(e) => set("companionContact", formatPhone(e.target.value))} />
                          </Field>
                          <Field label="동반인 메일 주소" required>
                            <input className={s.input} type="email" placeholder="exol@email.com"
                              value={form.companionEmail} onChange={(e) => set("companionEmail", e.target.value)} />
                          </Field>
                        </div>
                      )}
                    </fieldset>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className={s.stepHead}>
                    <span className={s.stepNo}>STEP 3</span>
                    <p className={s.stepTitle}>참여할 날짜와 역할을 골라주세요</p>
                  </div>
                  <div className={s.fields}>
                    <fieldset className={s.group}>
                      <legend className={s.legend}>참여 날짜 (중복 선택 가능)<span className={s.req}>*</span></legend>
                      {HELPER_DATES.map((d) => (
                        <Check key={d.id} checked={form.dates.includes(d.id)} label={d.label}
                          onChange={() => set("dates", toggle(form.dates, d.id))} />
                      ))}
                    </fieldset>
                    <fieldset className={s.group}>
                      <legend className={s.legend}>희망 역할 (중복 선택 가능)<span className={s.req}>*</span></legend>
                      {HELPER_ROLES.map((r) => (
                        <div key={r.id} className={s.roleRow}>
                          <Check checked={form.roles.includes(r.id)} label={r.label}
                            onChange={() => set("roles", toggle(form.roles, r.id))} />
                          <button type="button" className={s.guideBtn} onClick={() => setGuide(r)}>안내</button>
                        </div>
                      ))}
                    </fieldset>
                    {needsSeat && seatDates.length > 0 && (
                      <fieldset className={s.group}>
                        <legend className={s.legend}>날짜별 좌석 위치<span className={s.req}>*</span></legend>
                        <div className={s.subFields}>
                          <span className={s.subLabel}>경광봉 도우미는 1~2층 좌석 티켓 소지자만 참여할 수 있어요.</span>
                          {seatDates.map((d) => (
                            <label key={d.id}>
                              <span className={s.subLabel} style={{ display: "block" }}>{d.label}</span>
                              <input className={s.input} placeholder="예: 1층 4구역" value={form.seats[d.id] ?? ""}
                                onChange={(e) => set("seats", { ...form.seats, [d.id]: e.target.value })} />
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    )}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className={s.stepHead}>
                    <span className={s.stepNo}>STEP 4</span>
                    <p className={s.stepTitle}>입력한 내용을 확인해 주세요</p>
                  </div>
                  <dl className={s.summary}>
                    <dt>이름</dt><dd>{form.name}</dd>
                    <dt>연락처</dt><dd>{form.contact}</dd>
                    <dt>메일</dt><dd>{form.email}</dd>
                    {form.hasCompanion && (<><dt>동반인</dt><dd>{form.companionName} · {form.companionContact}</dd></>)}
                    <dt>날짜</dt><dd>{pickedDates}</dd>
                    <dt>역할</dt><dd>{pickedRoles}</dd>
                    {needsSeat && (
                      <><dt>좌석</dt><dd>{seatDates.map((d) => `${d.label} ${form.seats[d.id] ?? ""}`).join(" / ")}</dd></>
                    )}
                  </dl>
                  <div className={s.privacy}>
                    <b>개인정보 수집 및 이용 동의</b>
                    <br />
                    {HELPER_PRIVACY.map((line) => (<span key={line}>{line}<br /></span>))}
                    <Check checked={form.agreed} label="위 내용에 동의합니다" onChange={() => set("agreed", !form.agreed)} />
                  </div>
                </>
              )}

              {errors.length > 0 && (
                <div className={s.errors} role="alert">
                  <span className={s.errIcon} aria-hidden>!</span>
                  <ul className={s.errList}>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
                </div>
              )}
              {status === "error" && (
                <div className={s.errors} role="alert">
                  <span className={s.errIcon} aria-hidden>!</span>
                  <p className={s.errList}>제출 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.</p>
                </div>
              )}

              <div className={s.navBar}>
                {step > 0 && (
                  <button type="button" className={`${f.btn} ${s.navBtn}`} onClick={back} disabled={status === "sending"}>
                    &lt; 뒤로
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <button type="button" className={`${f.btn} ${s.navBtn}`} onClick={next}>다음 &gt;</button>
                ) : (
                  <button type="button" className={`${f.btn} ${s.navBtn} ${!form.agreed || status === "sending" ? s.btnDisabled : ""}`}
                    onClick={submit} disabled={status === "sending"}>
                    {status === "sending" ? "설치 중..." : "신청하기"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        <div className={f.statusBar}>
          {status === "done" ? "신청 완료 · 감사합니다 ♥" : "EXO PLANET #6 — EXhOrizon dot · HELPER RECRUIT"}
        </div>
      </div>

      {guide && (
        <div className={s.overlay} onClick={() => setGuide(null)}>
          <div className={f.dialog} style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${guide.label} 안내`}>
            <TitleBar icon="📋" title={`${guide.label}.png`} onClose={() => setGuide(null)} />
            <div className={f.imageBody}>
              <div className={f.imageCanvas}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={guide.guideImage} alt={`${guide.label} 안내`} className={f.noticeImg} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

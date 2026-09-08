"use client";

import { useState, useEffect, useRef } from "react";
import s from "./funding-page.module.css";

export type FundingConfig = {
  percent: number;
  deadline: string;
  form_url: string;
  notice_images: { src: string; alt?: string }[];
};

function parseDeadlineKST(deadline: string): Date | null {
  if (!deadline) return null;
  const m = deadline.match(/(\d{4})[-./](\d{2})[-./](\d{2})(?:[\sT](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return null;
  const [, y, mo, d, h = "23", mi = "59", sec = "00"] = m;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${sec}+09:00`);
}

type Remaining = { days: number; hours: number; minutes: number; seconds: number; expired: boolean };

function calcRemaining(deadline: Date): Remaining {
  const diff = deadline.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    expired: false,
  };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

function CountdownDisplay({ deadline }: { deadline: string }) {
  const deadlineDate = parseDeadlineKST(deadline);
  const [rem, setRem] = useState<Remaining | null>(deadlineDate ? calcRemaining(deadlineDate) : null);

  useEffect(() => {
    if (!deadlineDate) return;
    setRem(calcRemaining(deadlineDate));
    const id = setInterval(() => setRem(calcRemaining(deadlineDate)), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline]);

  return (
    <div className={s.countdownWrap}>
      <div className={s.countdownLabel}>남은 시간  TIME LEFT</div>
      {!deadlineDate ? (
        <div className={s.countdownSpecial}>TBD</div>
      ) : rem?.expired ? (
        <div className={s.countdownSpecial}>종료됨</div>
      ) : rem ? (
        <div className={s.clockRow}>
          <div className={s.clockCell}>
            <span className={s.clockNum}>{pad(rem.days)}</span>
            <span className={s.clockSub}>DAY</span>
          </div>
          <span className={s.clockSep}>:</span>
          <div className={s.clockCell}>
            <span className={s.clockNum}>{pad(rem.hours)}</span>
            <span className={s.clockSub}>HR</span>
          </div>
          <span className={s.clockSep}>:</span>
          <div className={s.clockCell}>
            <span className={s.clockNum}>{pad(rem.minutes)}</span>
            <span className={s.clockSub}>MIN</span>
          </div>
          <span className={s.clockSep}>:</span>
          <div className={s.clockCell}>
            <span className={s.clockNum}>{pad(rem.seconds)}</span>
            <span className={s.clockSub}>SEC</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CurvedTrack({ pct }: { pct: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(200);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.offsetWidth);
    const ro = new ResizeObserver(() => setW(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mid = 60; // vertical center of track

  // Simple S-curve flowing from left to right
  const d = [
    `M 0,${mid+10}`,
    `C ${w*0.15},${mid+10} ${w*0.25},${mid-28} ${w*0.40},${mid-22}`,
    `C ${w*0.55},${mid-16} ${w*0.60},${mid+28} ${w*0.75},${mid+22}`,
    `C ${w*0.88},${mid+16} ${w},${mid-6} ${w},${mid-6}`,
  ].join(" ");

  return (
    <div ref={ref} className={s.track}>
      <svg className={s.trackSvg} width={w} height={120} style={{ overflow: "visible" }}>
        {/* 얇은 배경 선 */}
        <path d={d} className={s.trackPath} />
        {/* 중간 중간 점들 */}
        <path d={d} className={s.trackDots} />
        <circle cx={0}  cy={mid+10} r={4} className={s.trackDot} />
        <circle cx={w}  cy={mid-6}  r={4} className={s.trackDot} />
      </svg>
      <span
        className={s.trackRocket}
        style={{
          offsetPath: `path('${d}')`,
          offsetDistance: `${pct}%`,
        } as React.CSSProperties}
      >🚀</span>
    </div>
  );
}

function TitleBar({ icon, title }: { icon: string; title: string }) {
  return (
    <div className={s.titleBar}>
      <span className={s.titleIcon}>{icon}</span>
      <span className={s.titleText}>{title}</span>
      <div className={s.winBtns}>
        <span className={s.winBtn}>─</span>
        <span className={s.winBtn}>□</span>
        <span className={s.winBtnClose}>✕</span>
      </div>
    </div>
  );
}

export function FundingPage({ config }: { config: FundingConfig }) {
  const images = config.notice_images ?? [];
  const [imgIdx, setImgIdx] = useState(0);
  const pct = Math.min(100, Math.max(0, config.percent));

  return (
    <div className={s.desktop}>

      {/* ── Download.exe dialog ── */}
      <div className={s.dialog}>
        <TitleBar icon="📥" title="앙콘 이벤트.ZIP — Download" />
        <div className={s.body}>

          {/* File name */}
          <div style={{ textAlign: "center" }}>
            <div className={s.fileLabel}>FUNDING</div>
            <div className={s.fileName}>앙콘 이벤트.ZIP</div>
          </div>

          {/* Icon row: source → curved track → destination */}
          <div className={s.iconRow}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/concert/funding/funding_back01.png"
              alt="source"
              className={s.sideImg}
            />
            <CurvedTrack pct={pct} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/concert/funding/funding_back02.png"
              alt="destination"
              className={s.sideImg}
            />
          </div>

          {/* Progress bar */}
          <div className={s.progressSection}>
            <div className={s.progressTrack}>
              <div className={s.progressFill} style={{ width: `${pct}%` }} />
            </div>
            <div className={s.progressMeta}>
              <span className={s.progressLabel}>PROGRESS</span>
              <span className={s.progressPct}>{pct}%</span>
            </div>
          </div>

          <hr className={s.divider} />

          {/* Countdown */}
          <CountdownDisplay deadline={config.deadline} />

          <hr className={s.divider} />

          {/* Payment + Form buttons */}
          <div className={s.btnRow}>
            <button
              className={s.btn}
              onClick={() => {
                window.location.href = "supertoss://send?bank=토스뱅크&accountNo=100159180057";
                setTimeout(() => { window.location.href = "supertoss://send?"; }, 2000);
              }}
            >
              TOSS
            </button>
            <a
              href="https://paypal.me/EXOREBIRTH"
              target="_blank"
              rel="noopener noreferrer"
              className={s.btn}
            >
              PAYPAL
            </a>
            {config.form_url ? (
              <a
                href={config.form_url}
                target="_blank"
                rel="noopener noreferrer"
                className={s.btn}
              >
                FORM
              </a>
            ) : (
              <span className={s.btnCancel}>FORM</span>
            )}
          </div>

        </div>
      </div>

      {/* ── Notice images dialog (별도 창) ── */}
      {images.length > 0 && (
        <div className={s.dialog}>
          <TitleBar icon="📋" title="NOTICE.png — 모금 공지" />
          <div className={s.imageBody}>
            <div className={s.imageCanvas}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={imgIdx}
                src={images[imgIdx]?.src}
                alt={images[imgIdx]?.alt ?? `모금 공지 ${imgIdx + 1}`}
                className={s.noticeImg}
              />
            </div>
            {images.length > 1 && (
              <div className={s.navRow}>
                <button
                  className={s.navBtn}
                  onClick={() => setImgIdx(i => Math.max(0, i - 1))}
                  disabled={imgIdx === 0}
                >◄ PREV</button>
                <span className={s.pageInfo}>{imgIdx + 1} / {images.length}</span>
                <button
                  className={s.navBtn}
                  onClick={() => setImgIdx(i => Math.min(images.length - 1, i + 1))}
                  disabled={imgIdx === images.length - 1}
                >NEXT ►</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

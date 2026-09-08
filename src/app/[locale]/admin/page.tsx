"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { chorusDays } from "@/data/chorusSongs";
import { ScheduleCalendar, type ScheduleItem as CalItem, type ScheduleCategory } from "@/components/ScheduleCalendar";
import s from "./admin.module.css";

// ── 메뉴 구조 ────────────────────────────────────────────
type AdminSection = {
  id: string;
  icon: string;
  label: string;
  desc: string;
  ready: boolean;
};

type AdminGroup = {
  group: string;
  items: AdminSection[];
};

const MENU: AdminGroup[] = [
  {
    group: "사이트",
    items: [
      { id: "home",      icon: "🏠", label: "대시보드",  desc: "사이트 전체 현황 요약",           ready: true },
      { id: "stats",     icon: "📊", label: "방문 현황", desc: "방문자 · 페이지별 통계",          ready: false },
      { id: "notice",    icon: "📢", label: "공지사항",  desc: "일반 공지 작성 및 관리",          ready: false },
      { id: "schedule",  icon: "📅", label: "스케줄",    desc: "캘린더 일정 추가 · 수정 · 삭제",  ready: true },
      { id: "streaming", icon: "▶",  label: "스트리밍",  desc: "스트리밍 링크 · 카테고리 관리",   ready: false },
      { id: "vote",      icon: "🗳", label: "투표 관리", desc: "진행중 투표 항목 추가 · 수정 · 삭제", ready: true },
    ],
  },
  {
    group: "콘서트",
    items: [
      { id: "chorus-vote",    icon: "🎤", label: "떼창 투표", desc: "후보곡 득표 현황",          ready: true },
      { id: "concert-cheer",  icon: "📣", label: "응원법",    desc: "응원법 곡 · 영상 관리",     ready: false },
      { id: "concert-notice", icon: "📋", label: "공지",      desc: "콘서트 공지 작성 및 관리",  ready: true },
      { id: "concert-fund",   icon: "💰", label: "모금",      desc: "달성률 · 마감일 · 공지 이미지 관리",  ready: true },
    ],
  },
  {
    group: "서포트",
    items: [
      { id: "support-fund",    icon: "💛", label: "서포트 펀딩", desc: "후원 · 펀딩 현황",            ready: false },
      { id: "support-recruit", icon: "👥", label: "모집",        desc: "스태프 · 봉사자 모집 관리",   ready: false },
    ],
  },
];

// ── Auth ─────────────────────────────────────────────────
function useAdminAuth() {
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/chorus-vote/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok?: boolean; token?: string; error?: string };
      if (!res.ok || !data.ok || !data.token) {
        setError(data.error ?? "비밀번호가 올바르지 않습니다.");
        return;
      }
      setToken(data.token);
      setAuthed(true);
    } catch { setError("서버 오류"); }
    finally { setLoading(false); }
  }

  return { authed, token, password, setPassword, error, loading, login };
}

// ── Main ─────────────────────────────────────────────────
export default function AdminHubPage() {
  const { authed, token, password, setPassword, error, loading, login } = useAdminAuth();
  const [active, setActive] = useState<string>("home");
  const router = useRouter();
  const locale = useLocale();
  const allSections = MENU.flatMap((g) => g.items);

  if (!authed) {
    return (
      <div className={s.loginWrap}>
        <form onSubmit={login} className={s.loginBox}>
          <div className={s.loginLogo}>EXO RE:BIRTH</div>
          <p className={s.loginSub}>관리자 대시보드</p>
          <input
            className={s.input}
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
          {error && <p className={s.errorMsg}>{error}</p>}
          <button className={s.loginBtn} type="submit" disabled={loading}>
            {loading ? "확인중..." : "로그인"}
          </button>
        </form>
      </div>
    );
  }

  const activeSection = allSections.find((sec) => sec.id === active);

  function handleNav(sec: AdminSection) {
    if (!sec.ready) return;
    setActive(sec.id);
  }

  return (
    <div className={s.layout}>
      {/* ── 사이드바 ── */}
      <aside className={s.sidebar}>
        <div className={s.sidebarHeader}>
          <span className={s.sidebarLogo}>EXO RE:BIRTH</span>
          <span className={s.sidebarAdminBadge}>ADMIN</span>
        </div>
        <nav className={s.sidebarNav}>
          {MENU.map((group) => (
            <div key={group.group} className={s.navGroup}>
              <p className={s.navGroupLabel}>{group.group}</p>
              {group.items.map((sec) => (
                <button
                  key={sec.id}
                  className={`${s.navItem} ${active === sec.id ? s.navItemActive : ""} ${!sec.ready ? s.navItemDisabled : ""}`}
                  onClick={() => handleNav(sec)}
                  title={!sec.ready ? "준비 중" : sec.desc}
                >
                  <span className={s.navIcon}>{sec.icon}</span>
                  <span className={s.navLabel}>{sec.label}</span>
                  {!sec.ready && <span className={s.navBadge}>준비중</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className={s.sidebarFooter}>
          <button className={s.siteLink} onClick={() => router.push(`/${locale}`)}>
            ← 사이트로 돌아가기
          </button>
        </div>
      </aside>

      {/* ── 메인 ── */}
      <main className={s.main}>
        <div className={s.topBar}>
          <div>
            <h1 className={s.pageTitle}>{activeSection?.label ?? "대시보드"}</h1>
            <p className={s.pageDesc}>{activeSection?.desc ?? ""}</p>
          </div>
        </div>
        <div className={s.content}>
          {active === "home"           && <DashboardHome token={token!} onNav={setActive} />}
          {active === "chorus-vote"    && <ChorusVotePanel token={token!} />}
          {active === "concert-notice" && <ConcertNoticePanel token={token!} />}
          {active === "schedule"       && <SchedulePanel token={token!} />}
          {active === "vote"           && <VoteItemPanel token={token!} />}
          {active === "concert-fund"  && <FundingAdminPanel token={token!} />}
          {!["home","chorus-vote","concert-notice","schedule","vote","concert-fund"].includes(active) && (
            <div className={s.comingSoon}>
              <span className={s.comingSoonIcon}>🚧</span>
              <p className={s.comingSoonText}>준비 중입니다</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── 대시보드 홈 ──────────────────────────────────────────
function songLabelDash(dayNum: number, songId: string) {
  return chorusDays.find(d => d.day === dayNum)?.songs.find(s => s.id === songId)?.title ?? songId;
}

function DashboardHome({ token, onNav }: { token: string; onNav: (id: string) => void }) {
  const [sched, setSched]   = useState<{ total: number; pub: number } | null>(null);
  const [notices, setNotices] = useState<{ total: number; pub: number } | null>(null);
  const [votes, setVotes]   = useState<number | null>(null);
  const [upcoming, setUpcoming] = useState<{ date: string; title: string; city?: string; country?: string }[]>([]);
  const [voteTop, setVoteTop] = useState<{ day: number; song: string; count: number }[]>([]);

  useEffect(() => {
    const h = { "x-admin-token": token };
    const today = new Date().toISOString().slice(0, 10);

    fetch("/api/admin/schedule", { headers: h })
      .then(r => r.ok ? r.json() : [])
      .then((items: { date: string; title: string; city?: string; country?: string; published: boolean }[]) => {
        setSched({ total: items.length, pub: items.filter(i => i.published).length });
        setUpcoming(items.filter(i => i.date >= today && i.published).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4));
      });

    fetch("/api/admin/notices", { headers: h })
      .then(r => r.ok ? r.json() : [])
      .then((items: { published: boolean }[]) =>
        setNotices({ total: items.length, pub: items.filter(i => i.published).length })
      );

    fetch("/api/chorus-vote/results", { headers: h })
      .then(r => r.ok ? r.json() : [])
      .then((results: { day: number; song_id: string; count: number }[]) => {
        setVotes(results.reduce((a, v) => a + v.count, 0));
        const tops = [1, 2].flatMap(day => {
          const top = [...results.filter(v => v.day === day)].sort((a, b) => b.count - a.count)[0];
          return top ? [{ day, song: songLabelDash(day, top.song_id), count: top.count }] : [];
        });
        setVoteTop(tops);
      });
  }, [token]);

  const today = new Date();
  const DOW = ["일", "월", "화", "수", "목", "금", "토"];
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${DOW[today.getDay()]}요일`;

  return (
    <div className={s.dashboard}>
      <div className={s.dashGreeting}>
        <p className={s.dashDate}>{dateStr}</p>
        <h2 className={s.dashTitle}>EXO RE:BIRTH 관리자 대시보드</h2>
      </div>

      <div className={s.statGrid}>
        <button className={s.statCard} onClick={() => onNav("schedule")}>
          <span className={s.statIcon}>📅</span>
          <span className={s.statValue}>{sched?.total ?? "—"}</span>
          <span className={s.statLabel}>스케줄</span>
          <span className={s.statSub}>{sched ? `${sched.pub}개 공개` : "로딩 중"}</span>
        </button>
        <button className={s.statCard} onClick={() => onNav("concert-notice")}>
          <span className={s.statIcon}>📋</span>
          <span className={s.statValue}>{notices?.total ?? "—"}</span>
          <span className={s.statLabel}>공지사항</span>
          <span className={s.statSub}>{notices ? `${notices.pub}개 공개` : "로딩 중"}</span>
        </button>
        <button className={s.statCard} onClick={() => onNav("chorus-vote")}>
          <span className={s.statIcon}>🗳</span>
          <span className={s.statValue}>{votes !== null ? votes.toLocaleString() : "—"}</span>
          <span className={s.statLabel}>총 투표수</span>
          <span className={s.statSub}>떼창 투표</span>
        </button>
      </div>

      <div className={s.dashRow}>
        <div className={s.dashCard}>
          <div className={s.dashCardHeader}>
            <h3 className={s.dashCardTitle}>다가오는 일정</h3>
            <button className={s.dashCardLink} onClick={() => onNav("schedule")}>전체 보기 →</button>
          </div>
          {upcoming.length === 0
            ? <p className={s.dashEmpty}>공개된 예정 일정이 없습니다</p>
            : upcoming.map((ev, i) => (
              <div key={i} className={s.upcomingRow}>
                <span className={s.upcomingDate}>{ev.date}</span>
                <div className={s.upcomingInfo}>
                  <span className={s.upcomingTitle}>{ev.title}</span>
                  {(ev.city || ev.country) && (
                    <span className={s.upcomingVenue}>{[ev.city, ev.country].filter(Boolean).join(" · ")}</span>
                  )}
                </div>
              </div>
            ))
          }
        </div>

        <div className={s.dashCard}>
          <div className={s.dashCardHeader}>
            <h3 className={s.dashCardTitle}>떼창 투표 TOP</h3>
            <button className={s.dashCardLink} onClick={() => onNav("chorus-vote")}>상세 보기 →</button>
          </div>
          {voteTop.length === 0
            ? <p className={s.dashEmpty}>투표 데이터를 불러오는 중...</p>
            : voteTop.map(v => (
              <div key={v.day} className={s.voteTopRow}>
                <span className={s.voteTopDay}>Day {v.day}</span>
                <span className={s.voteTopSong}>{v.song}</span>
                <span className={s.voteTopCount}>{v.count.toLocaleString()}표</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ── 공지 패널 ─────────────────────────────────────────────
type Notice = {
  id: string;
  title: string;
  title_en?: string | null;
  title_zh?: string | null;
  title_ja?: string | null;
  date: string;
  published: boolean;
  content?: unknown;
  images?: unknown;
  actions?: unknown;
  ticket_links?: unknown;
};

type NoticeImage = { src: string; alt: string };

type NoticeForm = {
  title: string;
  title_en: string;
  title_zh: string;
  title_ja: string;
  date: string;
  published: boolean;
  contentText: string;
  images: NoticeImage[];
  actionsText: string;
  ticketMobile: string;
  ticketDesktop: string;
};

function noticeToForm(n: Notice): NoticeForm {
  const content = n.content as string[] | null ?? [];
  const images = n.images as NoticeImage[] | null ?? [];
  const actions = n.actions as Array<{ label: string; href: string }> | null ?? [];
  const tl = n.ticket_links as { mobile?: string; desktop?: string } | null;
  return {
    title: n.title, title_en: n.title_en ?? "",
    title_zh: n.title_zh ?? "", title_ja: n.title_ja ?? "",
    date: n.date, published: n.published,
    contentText: content.join("\n"),
    images,
    actionsText: actions.map(a => `${a.label} | ${a.href}`).join("\n"),
    ticketMobile: tl?.mobile ?? "", ticketDesktop: tl?.desktop ?? "",
  };
}

function formToNoticePayload(f: NoticeForm, id: string): Record<string, unknown> {
  const content = f.contentText.split("\n").map(l => l.trim()).filter(Boolean);
  const actions = f.actionsText.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
    const [label, ...rest] = l.split("|").map(s => s.trim());
    return { label, href: rest.join("|").trim() };
  });
  const ticket_links = f.ticketMobile
    ? { mobile: f.ticketMobile, desktop: f.ticketDesktop || f.ticketMobile }
    : null;
  return {
    id, title: f.title,
    title_en: f.title_en || null, title_zh: f.title_zh || null, title_ja: f.title_ja || null,
    date: f.date, published: f.published,
    content: content.length ? content : null,
    images: f.images.length ? f.images : null,
    actions: actions.length ? actions : null,
    ticket_links,
  };
}

const EMPTY_NOTICE_FORM: NoticeForm = {
  title: "", title_en: "", title_zh: "", title_ja: "",
  date: new Date().toISOString().slice(0, 10),
  published: true,
  contentText: "", images: [], actionsText: "",
  ticketMobile: "", ticketDesktop: "",
};

function ConcertNoticePanel({ token }: { token: string }) {
  const [items, setItems] = useState<Notice[] | null>(null);
  const [err, setErr] = useState("");
  const [form, setForm] = useState<NoticeForm | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  const headers = { "x-admin-token": token, "Content-Type": "application/json" };

  const load = async () => {
    setErr("");
    const res = await fetch("/api/admin/notices", { headers: { "x-admin-token": token } });
    if (!res.ok) { setErr("불러오기 실패"); return; }
    setItems(await res.json() as Notice[]);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form) return;
    setSaving(true);
    const id = editId ?? crypto.randomUUID();
    const payload = formToNoticePayload(form, id);
    const method = editId ? "PATCH" : "POST";
    const res = await fetch("/api/admin/notices", { method, headers, body: JSON.stringify(payload) });
    setSaving(false);
    if (!res.ok) { setErr("저장 실패"); return; }
    setForm(null); setEditId(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch("/api/admin/notices", { method: "DELETE", headers, body: JSON.stringify({ id }) });
    load();
  }

  function startEdit(n: Notice) {
    setEditId(n.id);
    setForm(noticeToForm(n));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!form) return;
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadErr("");
    const newImgs: NoticeImage[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "concert");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-token": token },
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setUploadErr(d.error ?? "업로드 실패");
        continue;
      }
      const { url } = await res.json() as { url: string };
      newImgs.push({ src: url, alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") });
    }
    setForm(f => f ? { ...f, images: [...f.images, ...newImgs] } : f);
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div className={s.crudPanel}>
      <div className={s.crudTop}>
        <button className={s.loadBtn} onClick={load}>새로고침</button>
        <button className={s.addBtn} onClick={() => { setForm({ ...EMPTY_NOTICE_FORM }); setEditId(null); }}>+ 새 공지</button>
      </div>
      {err && <p className={s.crudErr}>{err}</p>}

      {form && (
        <div className={s.formCard}>
          <h3 className={s.formTitle}>{editId ? "공지 수정" : "새 공지"}</h3>
          <div className={s.formGrid}>
            <label className={s.formLabel}>제목 (한국어)</label>
            <input className={s.formInput} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <label className={s.formLabel}>제목 (영어)</label>
            <input className={s.formInput} value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })} />
            <label className={s.formLabel}>제목 (중국어)</label>
            <input className={s.formInput} value={form.title_zh} onChange={e => setForm({ ...form, title_zh: e.target.value })} />
            <label className={s.formLabel}>제목 (일본어)</label>
            <input className={s.formInput} value={form.title_ja} onChange={e => setForm({ ...form, title_ja: e.target.value })} />
            <label className={s.formLabel}>날짜</label>
            <input className={s.formInput} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} placeholder="예: 2026.09.05" />
            <label className={s.formLabel}>공개</label>
            <label className={s.toggleLabel}>
              <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
              <span>{form.published ? "공개" : "비공개"}</span>
            </label>
          </div>

          <div className={s.formSection}>
            <p className={s.formSectionTitle}>본문</p>
            <p className={s.formHint}>한 줄 = 한 단락 (빈 줄은 간격)</p>
            <textarea className={s.formTextarea} rows={5} value={form.contentText} onChange={e => setForm({ ...form, contentText: e.target.value })} placeholder={"첫 번째 단락\n두 번째 단락\n\n빈 줄은 여백"} />
          </div>

          <div className={s.formSection}>
            <p className={s.formSectionTitle}>이미지</p>
            {uploadErr && <p className={s.crudErr}>{uploadErr}</p>}
            {form.images.length > 0 && (
              <div className={s.imageGrid}>
                {form.images.map((img, i) => (
                  <div key={i} className={s.imageCard}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.src} alt={img.alt} className={s.imageThumb} />
                    <input
                      className={s.imageAltInput}
                      value={img.alt}
                      placeholder="설명 텍스트"
                      onChange={e => {
                        const updated = form.images.map((im, j) => j === i ? { ...im, alt: e.target.value } : im);
                        setForm({ ...form, images: updated });
                      }}
                    />
                    <button
                      className={s.imageRemove}
                      onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                      title="삭제"
                    >✕</button>
                    <div className={s.imageOrder}>
                      {i > 0 && (
                        <button onClick={() => {
                          const arr = [...form.images];
                          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                          setForm({ ...form, images: arr });
                        }}>↑</button>
                      )}
                      {i < form.images.length - 1 && (
                        <button onClick={() => {
                          const arr = [...form.images];
                          [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                          setForm({ ...form, images: arr });
                        }}>↓</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <label className={s.uploadLabel}>
              <input type="file" accept="image/*" multiple hidden onChange={handleImageUpload} disabled={uploading} />
              {uploading ? "업로드 중..." : "+ 이미지 추가"}
            </label>
            <p className={s.formHint} style={{ marginTop: 6 }}>JPG · PNG · WEBP · GIF 지원 / 여러 장 동시 선택 가능</p>
          </div>

          <div className={s.formSection}>
            <p className={s.formSectionTitle}>버튼 (actions)</p>
            <p className={s.formHint}>한 줄 = 버튼 하나: 라벨 | 링크</p>
            <textarea className={s.formTextarea} rows={3} value={form.actionsText} onChange={e => setForm({ ...form, actionsText: e.target.value })} placeholder={"TOSS | https://toss.me/...\nPAYPAL | https://paypal.me/..."} />
          </div>

          <div className={s.formSection}>
            <p className={s.formSectionTitle}>티켓 링크 (선택)</p>
            <div className={s.formGrid}>
              <label className={s.formLabel}>모바일 URL</label>
              <input className={s.formInput} value={form.ticketMobile} onChange={e => setForm({ ...form, ticketMobile: e.target.value })} placeholder="https://m.melon.com/..." />
              <label className={s.formLabel}>PC URL</label>
              <input className={s.formInput} value={form.ticketDesktop} onChange={e => setForm({ ...form, ticketDesktop: e.target.value })} placeholder="https://www.melon.com/..." />
            </div>
          </div>

          <div className={s.formActions}>
            <button className={s.cancelBtn} onClick={() => { setForm(null); setEditId(null); }}>취소</button>
            <button className={s.saveBtn} onClick={save} disabled={saving}>{saving ? "저장중..." : "저장"}</button>
          </div>
        </div>
      )}

      {items !== null && (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr><th>날짜</th><th>제목</th><th>이미지</th><th>공개</th><th>작업</th></tr>
            </thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={5} className={s.tableEmpty}>공지사항 없음</td></tr>}
              {items.map(n => {
                const imgs = n.images as Array<unknown> | null;
                return (
                  <tr key={n.id}>
                    <td className={s.tdDate}>{n.date}</td>
                    <td className={s.tdTitle}>{n.title}</td>
                    <td className={s.tdDate}>{imgs?.length ?? 0}장</td>
                    <td><span className={n.published ? s.badgeOn : s.badgeOff}>{n.published ? "공개" : "비공개"}</span></td>
                    <td className={s.tdActions}>
                      <button className={s.editBtn} onClick={() => startEdit(n)}>수정</button>
                      <button className={s.delBtn} onClick={() => remove(n.id)}>삭제</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {items === null && !form && (
        <div className={s.comingSoon}>
          <span className={s.comingSoonIcon}>📋</span>
          <p className={s.comingSoonText}>로딩 중...</p>
        </div>
      )}
    </div>
  );
}

// ── 스케줄 패널 ───────────────────────────────────────────
type SchedItem = {
  id: string;
  date: string;
  time?: string | null;
  title: string;
  category: string;
  city?: string | null;
  country?: string | null;
  venue?: string | null;
  published: boolean;
};

const CATEGORIES: ScheduleCategory[] = ["공연", "앨범", "기념일", "영상", "티켓팅"];

const COUNTRIES = [
  "KOREA", "JAPAN", "CHINA", "TAIWAN", "HONG KONG",
  "SINGAPORE", "MALAYSIA", "THAILAND", "PHILIPPINES", "INDONESIA",
  "VIETNAM", "USA", "UK", "FRANCE", "GERMANY", "AUSTRALIA",
];

const EMPTY_SCHED: Omit<SchedItem, "id"> = {
  date: new Date().toISOString().slice(0, 10),
  time: "", title: "", category: "공연",
  city: "", country: "KOREA", venue: "", published: true,
};

function SchedulePanel({ token }: { token: string }) {
  const [items, setItems] = useState<SchedItem[] | null>(null);
  const [err, setErr] = useState("");
  const [form, setForm] = useState<Omit<SchedItem, "id"> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"calendar" | "list">("calendar");

  const headers = { "x-admin-token": token, "Content-Type": "application/json" };

  const load = async () => {
    setErr("");
    const res = await fetch("/api/admin/schedule", { headers: { "x-admin-token": token } });
    if (!res.ok) { setErr("불러오기 실패"); return; }
    setItems(await res.json() as SchedItem[]);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form) return;
    setSaving(true);
    const method = editId ? "PATCH" : "POST";
    const body = editId ? { id: editId, ...form } : { id: crypto.randomUUID(), ...form };
    const res = await fetch("/api/admin/schedule", { method, headers, body: JSON.stringify(body) });
    setSaving(false);
    if (!res.ok) { setErr("저장 실패"); return; }
    setForm(null); setEditId(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch("/api/admin/schedule", { method: "DELETE", headers, body: JSON.stringify({ id }) });
    load();
  }

  function startEdit(n: SchedItem) {
    setEditId(n.id);
    setForm({ date: n.date, time: n.time ?? "", title: n.title, category: n.category, city: n.city ?? "", country: n.country ?? "", venue: n.venue ?? "", published: n.published });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 캘린더 컴포넌트 형식으로 변환
  const calItems = useMemo<CalItem[]>(() =>
    (items ?? [])
      .filter(i => CATEGORIES.includes(i.category as ScheduleCategory))
      .map(i => ({
        id: i.id, date: i.date,
        time: i.time ?? undefined,
        title: i.title,
        category: i.category as ScheduleCategory,
        city: i.city ?? undefined,
        country: i.country ?? undefined,
        venue: i.venue ?? undefined,
      })),
    [items]
  );

  return (
    <div className={s.crudPanel}>
      {/* 툴바 */}
      <div className={s.schedTop}>
        <div className={s.schedTopLeft}>
          <button className={s.loadBtn} onClick={load}>새로고침</button>
          <button className={s.addBtn} onClick={() => { setForm({ ...EMPTY_SCHED }); setEditId(null); }}>+ 새 일정</button>
        </div>
        <div className={s.viewToggle}>
          <button className={view === "calendar" ? s.viewActive : s.viewInactive} onClick={() => setView("calendar")}>달력</button>
          <button className={view === "list" ? s.viewActive : s.viewInactive} onClick={() => setView("list")}>목록</button>
        </div>
      </div>
      {err && <p className={s.crudErr}>{err}</p>}

      {/* 폼 */}
      {form && (
        <div className={s.formCard}>
          <h3 className={s.formTitle}>{editId ? "일정 수정" : "새 일정"}</h3>
          <div className={s.formGrid}>
            <label className={s.formLabel}>날짜</label>
            <input className={s.formInput} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <label className={s.formLabel}>시간</label>
            <input className={s.formInput} placeholder="예: 19:00" value={form.time ?? ""} onChange={e => setForm({ ...form, time: e.target.value })} />
            <label className={s.formLabel}>제목</label>
            <input className={s.formInput} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <label className={s.formLabel}>카테고리</label>
            <select className={s.formSelect} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className={s.formLabel}>도시</label>
            <input className={s.formInput} value={form.city ?? ""} onChange={e => setForm({ ...form, city: e.target.value })} />
            <label className={s.formLabel}>국가</label>
            <select className={s.formSelect} value={form.country ?? ""} onChange={e => setForm({ ...form, country: e.target.value })}>
              <option value="">— 선택 —</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="기타">기타 (직접 입력)</option>
            </select>
            {(form.country === "기타" || (form.country && !COUNTRIES.includes(form.country))) && (
              <>
                <label className={s.formLabel}>국가 직접 입력</label>
                <input className={s.formInput} value={form.country === "기타" ? "" : (form.country ?? "")} onChange={e => setForm({ ...form, country: e.target.value })} />
              </>
            )}
            <label className={s.formLabel}>공연장</label>
            <input className={s.formInput} value={form.venue ?? ""} onChange={e => setForm({ ...form, venue: e.target.value })} />
            <label className={s.formLabel}>공개</label>
            <label className={s.toggleLabel}>
              <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
              <span>{form.published ? "공개" : "비공개"}</span>
            </label>
          </div>
          <div className={s.formActions}>
            <button className={s.cancelBtn} onClick={() => { setForm(null); setEditId(null); }}>취소</button>
            <button className={s.saveBtn} onClick={save} disabled={saving}>{saving ? "저장중..." : "저장"}</button>
          </div>
        </div>
      )}

      {/* 캘린더 뷰 */}
      {view === "calendar" && items !== null && (
        <>
          <div className={s.calendarWrap}>
            <ScheduleCalendar items={calItems} />
          </div>
          {/* 캘린더 아래 전체 일정 관리 */}
          <div className={s.calendarManage}>
            <p className={s.calendarManageTitle}>전체 일정 관리</p>
            <div className={s.calendarItemList}>
              {items.length === 0 && <p className={s.dashEmpty}>등록된 일정이 없습니다</p>}
              {items.map(n => (
                <div key={n.id} className={s.calendarItem}>
                  <div className={s.calendarItemInfo}>
                    <span className={s.catBadge}>{n.category}</span>
                    <span className={s.calendarItemDate}>{n.date}{n.time ? ` ${n.time}` : ""}</span>
                    <span className={s.calendarItemTitle}>{n.title}</span>
                    {n.venue && <span className={s.calendarItemVenue}>{[n.city, n.country].filter(Boolean).join(" · ")}</span>}
                  </div>
                  <div className={s.calendarItemActions}>
                    <span className={n.published ? s.badgeOn : s.badgeOff}>{n.published ? "공개" : "비공개"}</span>
                    <button className={s.editBtn} onClick={() => startEdit(n)}>수정</button>
                    <button className={s.delBtn} onClick={() => remove(n.id)}>삭제</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 목록 뷰 */}
      {view === "list" && items !== null && (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr><th>날짜</th><th>시간</th><th>카테고리</th><th>제목</th><th>장소</th><th>공개</th><th>작업</th></tr>
            </thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={7} className={s.tableEmpty}>일정 없음</td></tr>}
              {items.map(n => (
                <tr key={n.id}>
                  <td className={s.tdDate}>{n.date}</td>
                  <td className={s.tdDate}>{n.time ?? "-"}</td>
                  <td><span className={s.catBadge}>{n.category}</span></td>
                  <td className={s.tdTitle}>{n.title}</td>
                  <td className={s.tdVenue}>{[n.city, n.country].filter(Boolean).join(", ")}</td>
                  <td><span className={n.published ? s.badgeOn : s.badgeOff}>{n.published ? "공개" : "비공개"}</span></td>
                  <td className={s.tdActions}>
                    <button className={s.editBtn} onClick={() => startEdit(n)}>수정</button>
                    <button className={s.delBtn} onClick={() => remove(n.id)}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {items === null && !form && (
        <div className={s.comingSoon}>
          <span className={s.comingSoonIcon}>📅</span>
          <p className={s.comingSoonText}>로딩 중...</p>
        </div>
      )}
    </div>
  );
}

// ── 모금 패널 ─────────────────────────────────────────────
type FundingForm = {
  percent: number;
  deadline: string;
  form_url: string;
};

function FundingAdminPanel({ token }: { token: string }) {
  const [form, setForm] = useState<FundingForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);

  const headers = { "x-admin-token": token, "Content-Type": "application/json" };

  async function load() {
    setErr("");
    const res = await fetch("/api/admin/funding", { headers: { "x-admin-token": token } });
    if (!res.ok) { setErr("불러오기 실패"); return; }
    const data = await res.json() as FundingForm;
    setForm({
      percent: data.percent ?? 0,
      deadline: data.deadline ?? "",
      form_url: data.form_url ?? "",
    });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form) return;
    setSaving(true); setSaved(false); setErr("");
    const res = await fetch("/api/admin/funding", {
      method: "PATCH", headers, body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setErr("저장 실패"); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!form) {
    return (
      <div className={s.comingSoon}>
        <span className={s.comingSoonIcon}>💰</span>
        <p className={s.comingSoonText}>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className={s.crudPanel}>
      <div className={s.crudTop}>
        <button className={s.loadBtn} onClick={load}>새로고침</button>
        {saved && <span style={{ fontSize: "0.8rem", color: "var(--foreground)", opacity: 0.6 }}>✓ 저장됨 (최대 30초 후 반영)</span>}
      </div>
      {err && <p className={s.crudErr}>{err}</p>}

      <div className={s.formCard}>
        <h3 className={s.formTitle}>모금 설정</h3>
        <div className={s.formGrid}>
          {/* Percent */}
          <label className={s.formLabel}>달성률 (%)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="range" min={0} max={100} step={1}
              value={form.percent}
              onChange={e => setForm({ ...form, percent: Number(e.target.value) })}
              style={{ flex: 1 }}
            />
            <input
              type="number" min={0} max={100}
              value={form.percent}
              onChange={e => setForm({ ...form, percent: Math.min(100, Math.max(0, Number(e.target.value))) })}
              className={s.formInput}
              style={{ width: 64 }}
            />
            <span style={{ fontSize: "0.85rem" }}>%</span>
          </div>

          {/* Deadline */}
          <label className={s.formLabel}>마감 날짜</label>
          <input
            className={s.formInput}
            value={form.deadline}
            onChange={e => setForm({ ...form, deadline: e.target.value })}
            placeholder="예: 2026-09-30 23:59"
          />

          {/* Form URL */}
          <label className={s.formLabel}>구글폼 URL</label>
          <input
            className={s.formInput}
            value={form.form_url}
            onChange={e => setForm({ ...form, form_url: e.target.value })}
            placeholder="https://forms.gle/..."
          />
        </div>

        {/* Notice images info */}
        <div className={s.formSection}>
          <p className={s.formSectionTitle}>모금 공지 이미지</p>
          <p className={s.formHint}>
            공지 이미지는 서버 파일에서 자동으로 로드됩니다.<br />
            <code style={{ fontSize: "0.78rem" }}>public/images/concert/funding/</code> 폴더에<br />
            파일명에 <strong>한국어</strong> / <strong>중국어</strong> / <strong>영어</strong> 또는 <strong>_ko</strong> / <strong>_zh</strong> / <strong>_en</strong> 포함 시 해당 언어 페이지에 자동 표시됩니다.
          </p>
        </div>

        <div className={s.formActions}>
          <button className={s.saveBtn} onClick={save} disabled={saving}>{saving ? "저장중..." : "저장"}</button>
        </div>
      </div>
    </div>
  );
}

// ── 투표 항목 패널 ────────────────────────────────────────
type VoteDbItem = {
  id: string;
  category: string;
  organizer: string;
  name: string;
  vote_page: string;
  deadline: string;
  link: string;
  candidate: string;
  rank: string;
  percent: string;
  published: boolean;
};

type VoteForm = Omit<VoteDbItem, "id">;

const VOTE_CATEGORIES = ["시상식", "음악방송", "기타"];

const EMPTY_VOTE_FORM: VoteForm = {
  category: "시상식", organizer: "", name: "", vote_page: "",
  deadline: "", link: "", candidate: "", rank: "", percent: "", published: true,
};

function parseVoteCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current); current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function deadlineIsActive(deadline: string): boolean {
  if (!deadline) return false;
  const m = deadline.match(/(\d{4})[-.](\d{2})[-.](\d{2})(?:\s+(\d{2}):(\d{2}))?/);
  if (!m) return false;
  return new Date() <= new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4] ?? "23"}:${m[5] ?? "59"}:00+09:00`);
}

function VoteItemPanel({ token }: { token: string }) {
  const [items, setItems] = useState<VoteDbItem[] | null>(null);
  const [err, setErr] = useState("");
  const [form, setForm] = useState<VoteForm | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const csvRef = useRef<HTMLInputElement>(null);

  const headers = { "x-admin-token": token, "Content-Type": "application/json" };

  const load = async () => {
    setErr("");
    const res = await fetch("/api/admin/vote-items", { headers: { "x-admin-token": token } });
    if (!res.ok) { setErr("불러오기 실패"); return; }
    setItems(await res.json() as VoteDbItem[]);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form) return;
    setSaving(true); setErr("");
    const method = editId ? "PATCH" : "POST";
    const body = editId ? { id: editId, ...form } : { id: crypto.randomUUID(), ...form };
    const res = await fetch("/api/admin/vote-items", { method, headers, body: JSON.stringify(body) });
    setSaving(false);
    if (!res.ok) { setErr("저장 실패"); return; }
    setForm(null); setEditId(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch("/api/admin/vote-items", { method: "DELETE", headers, body: JSON.stringify({ id }) });
    load();
  }

  async function togglePublished(item: VoteDbItem) {
    await fetch("/api/admin/vote-items", {
      method: "PATCH", headers,
      body: JSON.stringify({ id: item.id, published: !item.published }),
    });
    load();
  }

  function startEdit(item: VoteDbItem) {
    setEditId(item.id);
    setForm({
      category: item.category, organizer: item.organizer, name: item.name,
      vote_page: item.vote_page, deadline: item.deadline, link: item.link,
      candidate: item.candidate, rank: item.rank, percent: item.percent,
      published: item.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startDuplicate(item: VoteDbItem) {
    setEditId(null);
    setForm({
      category: item.category, organizer: item.organizer, name: item.name,
      vote_page: item.vote_page, deadline: item.deadline, link: item.link,
      candidate: item.candidate, rank: item.rank, percent: item.percent,
      published: item.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return;

    const parsed: VoteDbItem[] = [];
    for (const line of lines.slice(1)) {
      const cols = parseVoteCSVLine(line);
      const [category, organizer, name, vote_page, deadline, link, candidate, rank, percent] = cols.map(c => c.trim());
      if (!name) continue;
      parsed.push({
        id: crypto.randomUUID(),
        category: category ?? "", organizer: organizer ?? "", name,
        vote_page: vote_page ?? "", deadline: deadline ?? "", link: link ?? "",
        candidate: candidate ?? "", rank: rank ?? "", percent: percent ?? "",
        published: true,
      });
    }

    if (parsed.length === 0) { setImportMsg("파싱된 항목 없음"); return; }
    if (!confirm(`${parsed.length}개 항목을 가져오시겠습니까?\n(기존 항목은 유지됩니다)`)) {
      e.target.value = ""; return;
    }

    setImporting(true); setImportMsg("");
    let ok = 0;
    for (const item of parsed) {
      const res = await fetch("/api/admin/vote-items", {
        method: "POST", headers, body: JSON.stringify(item),
      });
      if (res.ok) ok++;
    }
    setImporting(false);
    setImportMsg(`✓ ${ok}/${parsed.length}개 가져오기 완료`);
    e.target.value = "";
    load();
  }

  return (
    <div className={s.crudPanel}>
      <div className={s.crudTop}>
        <button className={s.loadBtn} onClick={load}>새로고침</button>
        <button className={s.addBtn} onClick={() => { setForm({ ...EMPTY_VOTE_FORM }); setEditId(null); }}>+ 새 투표</button>
        <label className={s.loadBtn} style={{ cursor: "pointer" }} title="CSV 파일로 일괄 가져오기">
          {importing ? "가져오는 중..." : "CSV 가져오기"}
          <input ref={csvRef} type="file" accept=".csv" hidden onChange={handleCSVImport} disabled={importing} />
        </label>
      </div>
      {err && <p className={s.crudErr}>{err}</p>}
      {importMsg && <p style={{ fontSize: "0.8rem", color: "var(--foreground)", opacity: 0.6, margin: "4px 0" }}>{importMsg}</p>}

      {form && (
        <div className={s.formCard}>
          <h3 className={s.formTitle}>{editId ? "투표 수정" : form && (form.name || form.organizer) ? "투표 복사 · 새 등록" : "새 투표 추가"}</h3>
          <div className={s.formGrid}>
            <label className={s.formLabel}>카테고리</label>
            <select className={s.formSelect} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {VOTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className={s.formLabel}>투표 주최</label>
            <input className={s.formInput} value={form.organizer} onChange={e => setForm({ ...form, organizer: e.target.value })} placeholder="예: [35th SMA] 서울가요대상" />
            <label className={s.formLabel}>투표 이름 *</label>
            <input className={s.formInput} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="예: The Best Award (본상) 1차" />
            <label className={s.formLabel}>투표 페이지</label>
            <input className={s.formInput} value={form.vote_page} onChange={e => setForm({ ...form, vote_page: e.target.value })} placeholder="예: 아이돌챔프" />
            <label className={s.formLabel}>마감 날짜</label>
            <input className={s.formInput} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} placeholder="예: 2026-09-10 23:59" />
            <label className={s.formLabel}>링크</label>
            <input className={s.formInput} value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://..." />
            <label className={s.formLabel}>후보</label>
            <input className={s.formInput} value={form.candidate} onChange={e => setForm({ ...form, candidate: e.target.value })} placeholder="예: EXO(엑소)" />
            <label className={s.formLabel}>순위</label>
            <input className={s.formInput} value={form.rank} onChange={e => setForm({ ...form, rank: e.target.value })} placeholder="예: 1" />
            <label className={s.formLabel}>퍼센트</label>
            <input className={s.formInput} value={form.percent} onChange={e => setForm({ ...form, percent: e.target.value })} placeholder="예: 42.3" />
            <label className={s.formLabel}>공개</label>
            <label className={s.toggleLabel}>
              <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
              <span>{form.published ? "공개" : "비공개"}</span>
            </label>
          </div>
          <div className={s.formActions}>
            <button className={s.cancelBtn} onClick={() => { setForm(null); setEditId(null); }}>취소</button>
            <button className={s.saveBtn} onClick={save} disabled={saving || !form.name}>{saving ? "저장중..." : "저장"}</button>
          </div>
        </div>
      )}

      {items !== null && (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>카테고리</th>
                <th>투표 주최</th>
                <th>투표 이름</th>
                <th>페이지</th>
                <th>후보</th>
                <th>순위</th>
                <th>마감날짜 ↑</th>
                <th>상태</th>
                <th>공개</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={10} className={s.tableEmpty}>등록된 투표 없음</td></tr>}
              {items.map(item => (
                <tr key={item.id}>
                  <td><span className={s.catBadge}>{item.category}</span></td>
                  <td className={s.tdDate} style={{ maxWidth: 140, whiteSpace: "normal" }}>{item.organizer || "-"}</td>
                  <td className={s.tdTitle}>{item.name}</td>
                  <td className={s.tdDate}>{item.vote_page || "-"}</td>
                  <td className={s.tdDate}>{item.candidate || "-"}</td>
                  <td className={s.tdDate} style={{ textAlign: "center" }}>
                    {item.rank ? `${item.rank}위${item.percent ? ` (${item.percent}%)` : ""}` : "-"}
                  </td>
                  <td className={s.tdDate}>{item.deadline || "-"}</td>
                  <td><span className={deadlineIsActive(item.deadline) ? s.badgeOn : s.badgeOff}>{deadlineIsActive(item.deadline) ? "진행중" : "종료"}</span></td>
                  <td>
                    <button
                      className={item.published ? s.badgeOn : s.badgeOff}
                      style={{ cursor: "pointer", border: "none", background: "none", padding: 0 }}
                      onClick={() => togglePublished(item)}
                      title="클릭하여 전환"
                    >
                      {item.published ? "공개" : "비공개"}
                    </button>
                  </td>
                  <td className={s.tdActions}>
                    <button className={s.editBtn} onClick={() => startEdit(item)}>수정</button>
                    <button className={s.loadBtn} onClick={() => startDuplicate(item)} title="이 항목 복사해서 새로 등록">복사</button>
                    <button className={s.delBtn} onClick={() => remove(item.id)}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {items === null && !form && (
        <div className={s.comingSoon}>
          <span className={s.comingSoonIcon}>🗳</span>
          <p className={s.comingSoonText}>로딩 중...</p>
        </div>
      )}
    </div>
  );
}

// ── 도넛 SVG ─────────────────────────────────────────────
type DonutSlice = { label: string; value: number; color: string };

// 도넛용 (밝은 계열 포함)
const DONUT_COLORS = [
  "#2b5af5", "#6ea8fe", "#93c5fd", "#bfdbfe",
  "#dbeafe", "#1e40af", "#3b82f6", "#60a5fa", "#a3c4fc",
];
// 바 차트용 (흰 배경에서도 뚜렷한 파란 계열)
const BAR_COLORS = [
  "#1d4ed8", "#2563eb", "#3b82f6", "#4b90f7",
  "#5a9ef8", "#6aaaf8", "#79b6f9", "#89c2fa", "#98cdfb",
];

function DonutChart({ slices, total }: { slices: DonutSlice[]; total: number }) {
  const r = 54;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const paths = slices.map((sl, i) => {
    const pct = total > 0 ? sl.value / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const el = (
      <circle
        key={i}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={sl.color}
        strokeWidth={22}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        style={{ transition: "stroke-dasharray 0.4s ease" }}
      />
    );
    offset += dash;
    return el;
  });

  return (
    <svg viewBox="0 0 140 140" className={s.donutSvg}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e8f5" strokeWidth={22} />
      {paths}
      <text x={cx} y={cy - 6} textAnchor="middle" className={s.donutTotal}>{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" className={s.donutLabel}>총 투표</text>
    </svg>
  );
}

// ── 떼창 투표 패널 ────────────────────────────────────────
type VoteResult = { day: number; song_id: string; count: number };

function ChorusVotePanel({ token }: { token: string }) {
  const [results, setResults] = useState<VoteResult[] | null>(null);
  const [loadErr, setLoadErr] = useState("");

  async function fetchResults() {
    setLoadErr("");
    const res = await fetch("/api/chorus-vote/results", { headers: { "x-admin-token": token } });
    if (!res.ok) { setLoadErr("결과 조회 실패"); return; }
    setResults(await res.json() as VoteResult[]);
  }

  const totalByDay = (d: number) =>
    results?.filter((r) => r.day === d).reduce((a, r) => a + r.count, 0) ?? 0;

  const songLabel = (dayNum: number, songId: string) =>
    chorusDays.find((d) => d.day === dayNum)?.songs.find((s) => s.id === songId)?.title ?? songId;

  return (
    <div className={s.votePanel}>
      <div className={s.votePanelHeader}>
        <button className={s.loadBtn} onClick={fetchResults}>
          {results ? "새로고침" : "결과 불러오기"}
        </button>
      </div>

      {loadErr && <p style={{ color: "red", fontSize: "13px" }}>{loadErr}</p>}

      {results === null && (
        <div className={s.comingSoon}>
          <span className={s.comingSoonIcon}>🗳</span>
          <p className={s.comingSoonText}>버튼을 눌러 결과를 불러오세요</p>
        </div>
      )}

      {results !== null && (
        <div className={s.dayGrid}>
          {chorusDays.map((day) => {
            const dayResults = results.filter((r) => r.day === day.day).sort((a, b) => b.count - a.count);
            const total = totalByDay(day.day);
            const maxCount = dayResults[0]?.count ?? 0;
            const slices: DonutSlice[] = dayResults.map((r, i) => ({
              label: songLabel(r.day, r.song_id),
              value: r.count,
              color: DONUT_COLORS[i % DONUT_COLORS.length],
            }));

            return (
              <section key={day.day} className={s.dayCard}>
                <div className={s.dayCardHeader}>
                  <span className={s.dayCardTitle}>Day {day.day} — {day.label}</span>
                  <span className={s.dayCardTotal}>총 {total}표</span>
                </div>

                {/* 도넛 + 범례 */}
                <div className={s.donutRow}>
                  <DonutChart slices={slices} total={total} />
                  <ul className={s.donutLegend}>
                    {slices.slice(0, 5).map((sl, i) => (
                      <li key={i} className={s.legendItem}>
                        <span className={s.legendDot} style={{ background: sl.color }} />
                        <span className={s.legendName}>{sl.label}</span>
                        <span className={s.legendVal}>{sl.value}</span>
                      </li>
                    ))}
                    {slices.length > 5 && (
                      <li className={s.legendMore}>외 {slices.length - 5}곡…</li>
                    )}
                  </ul>
                </div>

                {/* 바 차트 */}
                <div className={s.songRows}>
                  {dayResults.map((r, i) => (
                    <div key={r.song_id} className={`${s.songRow} ${i === 0 ? s.songRowTop : ""}`}>
                      <span className={s.songRank}>{i + 1}</span>
                      <div className={s.songBarWrap}>
                        <div className={s.songName}>{songLabel(r.day, r.song_id)}</div>
                        <div className={s.barTrack}>
                          <div
                            className={s.barFill}
                            style={{
                              width: maxCount ? `${(r.count / maxCount) * 100}%` : "0%",
                              background: BAR_COLORS[i % BAR_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                      <span className={s.songCount}>{r.count}</span>
                      <span className={s.songPct}>{total ? `${Math.round((r.count / total) * 100)}%` : "-"}</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

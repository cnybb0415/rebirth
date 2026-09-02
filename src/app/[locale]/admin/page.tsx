"use client";

import { useState, useEffect, useMemo } from "react";
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
    ],
  },
  {
    group: "콘서트",
    items: [
      { id: "chorus-vote",    icon: "🎤", label: "떼창 투표", desc: "후보곡 득표 현황",          ready: true },
      { id: "concert-cheer",  icon: "📣", label: "응원법",    desc: "응원법 곡 · 영상 관리",     ready: false },
      { id: "concert-notice", icon: "📋", label: "공지",      desc: "콘서트 공지 작성 및 관리",  ready: true },
      { id: "concert-fund",   icon: "💰", label: "펀딩",      desc: "펀딩 현황 · 링크 관리",     ready: false },
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
          {!["home","chorus-vote","concert-notice","schedule"].includes(active) && (
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

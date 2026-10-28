"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { diarySpreads, diaryPagesMobile, AUTO_FLIP_AFTER_MS, type DiaryPage } from "@/data/diary";
import { createDiaryCurl, type DiaryCurl } from "./pageCurl";
import s from "./diary.module.css";

type Layout = {
  pages: DiaryPage[];
  /** 이미지 가로/세로 비율 */
  aspect: number;
  /** 말려 넘어가는 종이 영역(uv): [책등 x, 위 y, 바깥쪽 x, 아래 y] */
  paper: [number, number, number, number];
  /** 말리는 원통 반지름(높이 1 기준) */
  radius: number;
  /** 이 가로 비율보다 왼쪽을 누르거나 끌면 이전 장 */
  prevZone: number;
  /** 마우스를 올리면 모서리가 살짝 들리는 영역(이 x, y 이상) */
  peekZone: [number, number];
};

const LAYOUTS = {
  // 가로: 펼침면 양쪽. 오른쪽 장이 가운데 책등을 넘어 왼쪽으로 넘어감
  landscape: {
    pages: diarySpreads,
    aspect: 1536 / 1024,
    paper: [0.5, 0.02, 0.962, 0.965],
    radius: 0.085,
    prevZone: 0.5,
    peekZone: [0.78, 0.68],
  },
  // 세로: 한 장씩. 책등이 왼쪽 끝이라 넘어간 장은 화면 왼쪽 밖으로 빠짐
  portrait: {
    pages: diaryPagesMobile,
    aspect: 1024 / 1536,
    paper: [0.058, 0.012, 0.955, 0.968],
    radius: 0.06,
    prevZone: 0.35,
    peekZone: [0.66, 0.74],
  },
} satisfies Record<string, Layout>;

type Mode = keyof typeof LAYOUTS;

const PORTRAIT_QUERY = "(orientation: portrait)";
const subscribeOrientation = (cb: () => void) => {
  const mq = window.matchMedia(PORTRAIT_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getMode = (): Mode => (window.matchMedia(PORTRAIT_QUERY).matches ? "portrait" : "landscape");

export function DiaryClient() {
  // 서버에서는 화면 방향을 알 수 없으니 배경만 그리고, 브라우저에서 방향에 맞는 책을 그림(가로↔세로 깜빡임 방지)
  const mode = useSyncExternalStore(subscribeOrientation, getMode, () => null);
  const [pos, setPos] = useState({ spread: 0, portrait: 0 });
  const [autoFlip, setAutoFlip] = useState(true);

  // 가로 펼침면 번호와 세로 장 번호를 함께 기억해서, 화면을 돌려도 보던 내용이 이어지게 함
  const handleIndex = useCallback((m: Mode, i: number) => {
    setPos((prev) => {
      if (m === "portrait") return { spread: diaryPagesMobile[i].spread, portrait: i };
      const keep = diaryPagesMobile[prev.portrait]?.spread === i;
      return { spread: i, portrait: keep ? prev.portrait : diaryPagesMobile.findIndex((p) => p.spread === i) };
    });
  }, []);
  const stopAutoFlip = useCallback(() => setAutoFlip(false), []);

  return (
    <div className={s.wrap} data-mode={mode ?? undefined}>
      {mode && (
        <DiaryBook
          key={mode}
          mode={mode}
          layout={LAYOUTS[mode]}
          initialIndex={mode === "portrait" ? pos.portrait : pos.spread}
          autoFlip={autoFlip}
          onIndex={handleIndex}
          onInteract={stopAutoFlip}
        />
      )}
    </div>
  );
}

const TURN_MS = 1600;
const PEEK_T = 0.12;
// 모서리를 이 정도 이상 끌고 놓으면 끝까지 넘김
const COMMIT_T = 0.28;

type Drag = {
  id: number;
  x0: number;
  side: "prev" | "next";
  dragging: boolean;
  /** 잡은 순간의 진행도와 가로 위치 — 잡은 곳에서 상대적으로 따라오게 해서 종이가 튀지 않음 */
  baseT: number;
  fx0: number;
};

function DiaryBook({
  mode,
  layout,
  initialIndex,
  autoFlip,
  onIndex,
  onInteract,
}: {
  mode: Mode;
  layout: Layout;
  initialIndex: number;
  autoFlip: boolean;
  onIndex: (mode: Mode, i: number) => void;
  onInteract: () => void;
}) {
  const { pages } = layout;
  const bookRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const curlRef = useRef<DiaryCurl | null>(null);
  const indexRef = useRef(initialIndex);
  const busyRef = useRef(false);
  const peekRef = useRef(false);
  const dragRef = useRef<Drag | null>(null);
  const [index, setIndex] = useState(initialIndex);
  const [glReady, setGlReady] = useState(false);
  // GPU 컨텍스트를 잃으면(모바일 앱 전환 등) 캔버스를 새로 만들어 다시 그림
  const [glKey, setGlKey] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const book = bookRef.current;
    if (!canvas || !book) return;
    const curl = createDiaryCurl({
      canvas,
      srcs: pages.map((p) => p.src),
      aspect: layout.aspect,
      page: layout.paper,
      radius: layout.radius,
      onLost: () => {
        setGlReady(false);
        setGlKey((k) => k + 1);
      },
    });
    if (!curl) return; // WebGL 미지원 → 이미지 디졸브로 동작
    curlRef.current = curl;
    curl.resize();
    void curl.show(indexRef.current).then(() => setGlReady(true));
    const ro = new ResizeObserver(() => curl.resize());
    ro.observe(book);
    return () => {
      ro.disconnect();
      curl.destroy();
      curlRef.current = null;
    };
  }, [glKey, layout, pages]);

  const settle = useCallback(
    (to: number) => {
      indexRef.current = to;
      setIndex(to);
      onIndex(mode, to);
      busyRef.current = false;
      peekRef.current = false;
      void curlRef.current?.show(to);
    },
    [mode, onIndex]
  );

  const turn = useCallback(
    async (dir: 1 | -1) => {
      const cur = indexRef.current;
      const to = cur + dir;
      if (busyRef.current || to < 0 || to >= pages.length) return;
      busyRef.current = true;
      const curl = curlRef.current;
      if (curl) {
        const ms = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : TURN_MS;
        await curl.ensure(to);
        if (dir === 1) {
          curl.setPair(cur, to);
          await curl.tweenT(1, ms);
        } else {
          curl.setPair(to, cur);
          curl.setT(1);
          await curl.tweenT(0, ms);
        }
      }
      settle(to);
    },
    [pages.length, settle]
  );

  // 첫 장에서 잠시 머물다 두 번째 장으로 한 번만 자동으로 넘어감
  useEffect(() => {
    if (!autoFlip) return;
    const id = setTimeout(() => {
      if (indexRef.current !== 0) return;
      onInteract();
      void turn(1);
    }, AUTO_FLIP_AFTER_MS);
    return () => clearTimeout(id);
  }, [autoFlip, onInteract, turn]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      onInteract();
      void turn(e.key === "ArrowRight" ? 1 : -1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onInteract, turn]);

  const fracOf = (e: React.PointerEvent) => {
    const r = bookRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  // 마우스를 오른쪽 아래 모서리에 올리면 종이 끝이 살짝 들림
  const setPeek = (on: boolean) => {
    const curl = curlRef.current;
    const cur = indexRef.current;
    if (!curl || busyRef.current || peekRef.current === on || cur >= pages.length - 1) return;
    peekRef.current = on;
    if (on) {
      void curl.ensure(cur + 1).then(() => {
        if (!peekRef.current || busyRef.current) return;
        curl.setPair(cur, cur + 1);
        void curl.tweenT(PEEK_T, 260);
      });
    } else {
      void curl.tweenT(0, 260);
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (busyRef.current) return;
    const { x } = fracOf(e);
    onInteract();
    dragRef.current = {
      id: e.pointerId,
      x0: e.clientX,
      side: x >= layout.prevZone ? "next" : "prev",
      dragging: false,
      baseT: 0,
      fx0: x,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const curl = curlRef.current;
    if (!drag || drag.id !== e.pointerId) {
      if (e.pointerType === "mouse") {
        const { x, y } = fracOf(e);
        setPeek(x > layout.peekZone[0] && y > layout.peekZone[1]);
      }
      return;
    }
    const cur = indexRef.current;
    const target = drag.side === "next" ? cur + 1 : cur - 1;
    if (!curl || target < 0 || target >= pages.length) return;
    if (!drag.dragging) {
      if (Math.abs(e.clientX - drag.x0) < 6) return;
      drag.dragging = true;
      busyRef.current = true;
      peekRef.current = false;
      void curl.ensure(target);
      if (drag.side === "next") {
        curl.setPair(cur, target);
        drag.baseT = curl.getT(); // 모서리가 살짝 들린 상태였으면 거기서부터 이어짐
      } else {
        // 되돌아올 땐 이전 장이 다 넘어간 상태(t=1)에서 거꾸로 말려 돌아옴
        curl.setPair(target, cur);
        curl.setT(1);
        drag.baseT = 1;
      }
    }
    curl.setT(curl.tFromDrag(drag.baseT, drag.fx0, fracOf(e).x));
  };

  const onPointerUp = async (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag || drag.id !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    const curl = curlRef.current;
    const cur = indexRef.current;

    if (!drag.dragging) {
      peekRef.current = false;
      void turn(drag.side === "next" ? 1 : -1);
      return;
    }
    if (!curl) return;
    const t = curl.getT();
    if (drag.side === "next") {
      if (t >= COMMIT_T) {
        await curl.tweenT(1, TURN_MS * (1 - t));
        settle(cur + 1);
      } else {
        await curl.tweenT(0, 320);
        busyRef.current = false;
        void curl.show(cur);
      }
    } else if (t <= 1 - COMMIT_T) {
      await curl.tweenT(0, TURN_MS * t);
      settle(cur - 1);
    } else {
      await curl.tweenT(1, 320);
      busyRef.current = false;
      void curl.show(cur);
    }
  };

  return (
    <>
      <div className={s.stage}>
        <div
          ref={bookRef}
          className={s.book}
          style={{ "--ar": layout.aspect } as React.CSSProperties}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={(e) => { if (e.pointerType === "mouse") setPeek(false); }}
          role="group"
          aria-roledescription="다이어리"
          aria-label={pages[index].alt}
        >
          {!glReady &&
            pages.map((page, i) => {
              if (Math.abs(i - index) > 1) return null;
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={page.src}
                  className={`${s.page} ${i === index ? s.pageActive : ""}`}
                  src={page.src}
                  alt=""
                  aria-hidden
                  draggable={false}
                />
              );
            })}
          <canvas
            key={glKey}
            ref={canvasRef}
            className={`${s.canvas} ${glReady ? s.canvasReady : ""}`}
            aria-hidden
          />
        </div>
      </div>

      <div className={s.dots} aria-hidden>
        {pages.map((p, i) => (
          <span key={p.src} className={`${s.dot} ${i === index ? s.dotOn : ""}`} />
        ))}
      </div>
    </>
  );
}

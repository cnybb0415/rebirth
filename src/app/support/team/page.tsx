"use client";

import { useState } from "react";

const sections = [
  {
    id: "common",
    label: "공통",
    images: ["/images/support/team/%EC%8B%A0%EA%B7%9C%20%ED%8C%80%EC%9B%90%20%EB%AA%A8%EC%A7%91.png"],
    links: [
      {
        label: "EXO RE:BIRTH",
        href: "https://x.com/EXO_REBIRTH?s=20",
      },
    ],
  },
  {
    id: "operation",
    label: "운영팀",
    images: [],
    links: [
      {
        label: "개발팀",
        href: "https://x.com/EXOREBIRTH_DEV?s=20",
      },
    ],
  },
  { id: "design", label: "디자인팀", images: [], links: [] },
  {
    id: "streaming",
    label: "음원팀",
    images: [],
    links: [
      {
        label: "음원팀",
        href: "https://x.com/EXOL_strrm?s=20",
      },
    ],
  },
] as const;

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M7 3h4.3l3.2 4.3L18.7 3H22l-5.6 7.1L22 21h-4.3l-3.7-5-3.9 5H2l6.6-8.3L3 3h4.3l3.5 4.7L14.3 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SupportTeamPage() {
  const [activeId, setActiveId] = useState(sections[0].id);
  const activeSection = sections.find((section) => section.id === activeId) ?? sections[0];

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-bold">팀 소개</h1>

        <div className="mt-6 rounded-2xl border border-foreground/10 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveId(section.id)}
                className={
                  "rounded-full border px-4 py-2 text-sm font-semibold transition " +
                  (section.id === activeId
                    ? "border-foreground/30 bg-foreground/5 text-foreground"
                    : "border-foreground/10 bg-white text-foreground/70 hover:bg-foreground/5")
                }
              >
                {section.label}
              </button>
            ))}
          </div>

          <section className="mt-6">
            <div className="text-base font-semibold">{activeSection.label}</div>
            {activeSection.links.length ? (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                {activeSection.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground"
                  >
                    <XIcon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            ) : null}
            {activeSection.images.length ? (
              <div className="mt-4 space-y-3">
                {activeSection.images.map((src) => (
                  <div key={src} className="overflow-hidden rounded-xl border border-foreground/10 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`${activeSection.label} 이미지`} className="h-auto w-full" loading="lazy" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-foreground/70">준비중입니다.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import s from "./notice-tabs.module.css";
import type { AnnouncementItem } from "@/data/announcements";

interface Props {
  item: AnnouncementItem;
  accentColor: string;
  locale: string;
}

export function NoticeImageTabs({ item, accentColor, locale }: Props) {
  // localizedImages 있으면 언어 탭, 없으면 images 배열 탭
  const hasLocalized = item.localizedImages && item.localizedImages.length > 0;

  const tabs = hasLocalized
    ? item.localizedImages!.map((li) => ({
        label: li.label,
        images: li.images,
        content: li.content,
      }))
    : item.images
    ? [{ label: "전체", images: item.images, content: item.content }]
    : [];

  // 언어 기반 기본 탭 인덱스
  const defaultIdx = hasLocalized
    ? Math.max(
        0,
        item.localizedImages!.findIndex((li) =>
          locale === "en"
            ? li.label === "English"
            : locale === "zh"
            ? li.label === "中文"
            : locale === "ja"
            ? li.label === "日本語"
            : li.label === "한국어"
        )
      )
    : 0;

  const [active, setActive] = useState(defaultIdx);

  const currentTab = tabs[active];
  const currentImages = currentTab?.images ?? [];
  const currentContent = currentTab?.content ?? item.content;

  return (
    <div className={s.wrap}>
      {/* 설명 텍스트 */}
      {currentContent.length > 0 && (
        <p className={s.desc}>
          {currentContent.map((line, i) =>
            typeof line === "string" ? (
              <span key={i}>{line}</span>
            ) : (
              <span key={i} style={line.emphasis ? { color: accentColor } : undefined}>
                {line.text}
              </span>
            )
          )}
        </p>
      )}

      {/* 탭 바 */}
      {tabs.length > 1 && (
        <div className={s.tabBar}>
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              className={`${s.tab} ${i === active ? s.tabActive : ""}`}
              style={i === active ? { color: accentColor, borderBottomColor: accentColor } : undefined}
              onClick={() => setActive(i)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* 스크롤 스냅 이미지 */}
      {currentImages.length > 0 && (
        <div className={s.imgWrap}>
          {currentImages.map((img) => (
            <div key={img.src} className={s.imgItem}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt} className={s.img} />
            </div>
          ))}
        </div>
      )}

      {/* 액션 버튼 */}
      {item.actions && item.actions.length > 0 && (
        <div className={s.actions}>
          {item.actions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={s.actionBtn}
              style={{ borderColor: accentColor, color: accentColor }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {action.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

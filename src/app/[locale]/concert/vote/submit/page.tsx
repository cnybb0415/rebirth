"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

const ACCENT = "#a3e635";
const MEMBERS = ["SUHO", "LAY", "CHANYEOL", "D.O.", "KAI", "SEHUN"] as const;

const PIXEL: React.CSSProperties = {
  fontFamily: "'PFStarDust', monospace",
  WebkitFontSmoothing: "none",
};

export default function ConcertVoteSubmitPage() {
  const router = useRouter();
  const t = useTranslations("concert");
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [member, setMember] = useState<string>(MEMBERS[0]);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [regBlocked, setRegBlocked] = useState(false);

  useEffect(() => {
    fetch("/api/vote/config", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.config && d.config.registration_open === 0) setRegBlocked(true);
      })
      .catch(() => {});
  }, []);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("jpg / png / webp 파일만 가능합니다.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("파일 크기는 5MB 이하여야 합니다.");
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("이미지를 선택해주세요."); return; }
    if (!title.trim()) { setError("제목을 입력해주세요."); return; }

    setLoading(true);
    setError(null);

    const form = new FormData();
    form.append("image", file);
    form.append("title", title.trim());
    form.append("member", member);
    form.append("description", description.trim());

    try {
      const res = await fetch("/api/vote/candidates", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "등록 실패"); setLoading(false); return; }
      router.push("/concert/vote");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  if (regBlocked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "360px", background: "rgba(0,0,0,0.85)", padding: "32px 24px", textAlign: "center", ...PIXEL }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🚫</div>
          <p style={{ fontSize: "0.55rem", fontWeight: 800, color: "#ff6b6b", letterSpacing: "0.12em", marginBottom: "8px" }}>
            {t("submitBlocked")}
          </p>
          <p style={{ fontSize: "0.45rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", marginBottom: "20px", fontFamily: "NanumBarunGothic, sans-serif" }}>
            {t("submitBlockedDesc")}
          </p>
          <button
            onClick={() => router.push("/concert/vote")}
            style={{ background: "none", border: `1.5px solid rgba(255,255,255,0.2)`, cursor: "pointer", fontSize: "0.42rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", padding: "6px 14px", ...PIXEL }}
          >
            {t("submitBlockedBack")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "48px 16px 80px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(0,0,0,0.82)",
          padding: "28px 24px 32px",
          alignSelf: "flex-start",
          ...PIXEL,
        }}
      >
        {/* 헤더 */}
        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              fontSize: "0.45rem",
              letterSpacing: "0.35em",
              color: `${ACCENT}88`,
              fontWeight: 700,
              marginBottom: "6px",
            }}
          >
            {t("submitTitle")}
          </p>
          <h1
            style={{
              fontSize: "1.4rem",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "0.08em",
              textShadow: `2px 2px 0 ${ACCENT}, 0 0 18px ${ACCENT}55`,
            }}
          >
            {t("submitHeading")}
          </h1>
          <div style={{ display: "flex", gap: "3px", marginTop: "10px" }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: "5px",
                  height: "4px",
                  background: i % 2 === 0 ? ACCENT : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* 이미지 업로드 */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.48rem",
                letterSpacing: "0.25em",
                color: `${ACCENT}cc`,
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              ■ IMAGE *
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${preview ? ACCENT + "88" : "rgba(255,255,255,0.2)"}`,
                background: "rgba(0,0,0,0.4)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: preview ? "8px" : "32px 16px",
                transition: "border-color 0.15s",
                minHeight: "120px",
              }}
            >
              {preview ? (
                <div style={{ position: "relative", width: "120px", height: "120px" }}>
                  <Image src={preview} alt="미리보기" fill className="object-cover" />
                </div>
              ) : (
                <>
                  <div style={{ fontSize: "1.8rem", marginBottom: "8px", opacity: 0.4 }}>+</div>
                  <p style={{ fontSize: "0.45rem", letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)" }}>
                    {t("submitClickToSelect")}
                  </p>
                  <p style={{ fontSize: "0.38rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", marginTop: "4px" }}>
                    jpg · png · webp · max 5MB
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* 제목 */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.48rem",
                letterSpacing: "0.25em",
                color: `${ACCENT}cc`,
                fontWeight: 700,
                marginBottom: "6px",
              }}
            >
              ■ 아바타스타 엑소 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="260412 EXO PLANET #6 - EXhOrizon in SEOUL"
              maxLength={100}
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.5)",
                border: `1.5px solid rgba(255,255,255,0.2)`,
                color: "#fff",
                padding: "8px 10px",
                fontSize: "0.55rem",
                letterSpacing: "0.05em",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "NanumBarunGothic, sans-serif",
              }}
            />
          </div>

          {/* 멤버 */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.48rem",
                letterSpacing: "0.25em",
                color: `${ACCENT}cc`,
                fontWeight: 700,
                marginBottom: "6px",
              }}
            >
              ■ MEMBER *
            </label>
            <select
              value={member}
              onChange={(e) => setMember(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.5)",
                border: `1.5px solid rgba(255,255,255,0.2)`,
                color: "#fff",
                padding: "8px 10px",
                fontSize: "0.55rem",
                letterSpacing: "0.05em",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "NanumBarunGothic, sans-serif",
              }}
            >
              {MEMBERS.map((m) => (
                <option key={m} value={m} style={{ background: "#0a0c1c" }}>{m}</option>
              ))}
            </select>
          </div>

          {/* 설명 */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.48rem",
                letterSpacing: "0.25em",
                color: `${ACCENT}66`,
                fontWeight: 700,
                marginBottom: "6px",
              }}
            >
              ■ NOTE {t("submitNoteOptional")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("submitNotePlaceholder")}
              rows={3}
              maxLength={300}
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.5)",
                border: `1.5px solid rgba(255,255,255,0.2)`,
                color: "#fff",
                padding: "8px 10px",
                fontSize: "0.55rem",
                letterSpacing: "0.05em",
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
                fontFamily: "NanumBarunGothic, sans-serif",
              }}
            />
          </div>

          {/* 에러 */}
          {error && (
            <div
              style={{
                padding: "8px 10px",
                background: "rgba(255,77,77,0.15)",
                border: "1.5px solid rgba(255,77,77,0.4)",
                fontSize: "0.48rem",
                letterSpacing: "0.08em",
                color: "#ff6b6b",
              }}
            >
              ✕ {error}
            </div>
          )}

          {/* 제출 */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "0.55rem",
              fontWeight: 800,
              letterSpacing: "0.25em",
              background: loading ? `${ACCENT}66` : ACCENT,
              color: "#0d1a00",
              border: "none",
              cursor: loading ? "wait" : "pointer",
              marginTop: "4px",
              boxShadow: loading ? "none" : `0 0 16px ${ACCENT}55`,
              transition: "all 0.15s",
              fontFamily: "'PFStarDust', monospace",
              WebkitFontSmoothing: "none",
            }}
          >
            {loading ? "UPLOADING..." : "SUBMIT"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/concert/vote")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.42rem",
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.35)",
              textAlign: "center",
              fontFamily: "'PFStarDust', monospace",
              WebkitFontSmoothing: "none",
            }}
          >
            {t("submitCancel")}
          </button>
        </form>
      </div>
    </div>
  );
}

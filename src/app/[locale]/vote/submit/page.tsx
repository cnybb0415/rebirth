"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const MEMBERS = ["SUHO", "LAY", "CHANYEOL", "D.O.", "KAI", "SEHUN"] as const;

export default function VoteSubmitPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [member, setMember] = useState<string>(MEMBERS[0]);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (f: File | null) => {
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(f.type)) {
      setError("jpg, png, webp 파일만 업로드 가능합니다.");
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
      if (!res.ok) { setError(data.error ?? "등록에 실패했습니다."); return; }
      router.push("/ko/vote");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="mb-8 text-2xl font-bold">후보자 등록</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* 이미지 업로드 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">이미지 *</label>
          <div
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-foreground/20 bg-foreground/5 p-6 transition hover:border-foreground/40"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <div className="relative h-40 w-40 overflow-hidden rounded-xl">
                <Image src={preview} alt="미리보기" fill className="object-cover" />
              </div>
            ) : (
              <>
                <div className="text-3xl text-foreground/30">+</div>
                <p className="text-sm text-foreground/50">클릭하여 이미지 선택</p>
                <p className="text-xs text-foreground/40">jpg / png / webp, 최대 5MB</p>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* 제목 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">파일명 / 제목 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: EXO 카이 직캠 20240901"
            className="w-full rounded-xl border border-foreground/20 bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground/60"
            maxLength={100}
          />
        </div>

        {/* 멤버 선택 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">멤버 *</label>
          <select
            value={member}
            onChange={(e) => setMember(e.target.value)}
            className="w-full rounded-xl border border-foreground/20 bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground/60"
          >
            {MEMBERS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* 설명 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">설명 (선택)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="간단한 설명을 입력하세요"
            rows={3}
            className="w-full resize-none rounded-xl border border-foreground/20 bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground/60"
            maxLength={300}
          />
        </div>

        {/* 에러 */}
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        {/* 제출 */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background transition hover:bg-foreground/80 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "등록 중..." : "후보자 등록"}
        </button>

        <a
          href="/ko/vote"
          className="text-center text-sm text-foreground/50 underline hover:text-foreground"
        >
          취소
        </a>
      </form>
    </main>
  );
}

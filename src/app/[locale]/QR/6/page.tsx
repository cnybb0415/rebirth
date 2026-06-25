import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "카드섹션 (DAY3) | EXO RE:BIRTH",
};

export default function QR6Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-foreground/10 bg-white p-6 shadow-sm">
          <div className="mb-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/40">DAY3</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Card Section Guide</h1>
          </div>
          <div className="overflow-hidden rounded-xl border border-foreground/10">
            <Image
              src="/images/QR/카드섹션/카드섹션_막콘__CN JP.png"
              alt="카드섹션 막콘 안내"
              width={800}
              height={1200}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </main>
    </div>
  );
}

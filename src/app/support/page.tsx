import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const supportItems = [
  { id: "team", label: "팀 소개", href: "/support/team" },
  { id: "fund", label: "모금 공지", href: "/support/fund" },
  { id: "id-donation", label: "아이디 기부", href: "/support/id-donation" },
  { id: "helper", label: "헬퍼 지원", href: "/support/helper" },
] as const;

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-bold">서포트</h1>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {supportItems.map((item) => (
            <Link key={item.id} href={item.href} className="block">
              <Card className="transition hover:shadow-md">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="text-sm font-semibold">{item.label}</div>
                  <span className="text-foreground/60" aria-hidden>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

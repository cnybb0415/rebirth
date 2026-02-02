import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupportFundPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-bold">모금공지</h1>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>모금 공지</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/support/fund/%EB%AA%A8%EA%B8%88%EA%B3%B5%EC%A7%80.png"
                  alt="모금공지"
                  className="h-auto w-full"
                  loading="lazy"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <a href="#" className="inline-flex">
            <button
              type="button"
              className="rounded-2xl border border-foreground/15 bg-white px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:border-foreground/35 hover:shadow-md"
            >
              입금 폼 작성
            </button>
          </a>
        </div>
      </main>
    </div>
  );
}

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { StreamingLinksGrid } from "@/components/StreamingLinksGrid";
import { QuickActionsBar } from "@/components/QuickActionsBar";

export default function LinksPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">원클릭 / 바로가기</h1>
          <Link href="/">
            <Button variant="outline">메인으로</Button>
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>원클릭 바로가기</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActionsBar
                actions={siteConfig.actions}
                albumLinks={siteConfig.albumPurchaseLinks}
                oneClickStreamingLinks={siteConfig.oneClickStreamingLinks}
                containerVariant="none"
                gridClassName="grid-cols-2 gap-2 sm:grid-cols-3"
                buttonVariant="outline"
                buttonClassName="rounded-2xl"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>음원사이트 바로가기</CardTitle>
            </CardHeader>
            <CardContent>
              <StreamingLinksGrid
                links={siteConfig.streamingLinks}
                youtubeUrl={siteConfig.youtube.url}
                columnsClassName="grid-cols-2 gap-2 sm:grid-cols-3"
                buttonVariant="secondary"
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

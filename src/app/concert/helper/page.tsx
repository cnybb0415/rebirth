import { BinderPage, BinderHeading } from "@/components/concert/BinderPage";

export default function ConcertHelperPage() {
  return (
    <BinderPage activeTab="helper" pixelFontFamily="'Mulmaru', 'PFStarDust', monospace">
      <BinderHeading
        emoji="🛸"
        title="헬퍼모집"
        subtitle="HELPER RECRUIT"
        accentColor="#b97fff"
      />
      <p
        style={{
          fontSize: "0.75rem",
          color: "rgba(255,255,255,0.75)",
          letterSpacing: "0.05em",
          lineHeight: 1.8,
          paddingTop: "8px",
          textAlign: "center",
        }}
      >
        참여해주신 엑소엘분들 감사합니다 ♥
      </p>
    </BinderPage>
  );
}

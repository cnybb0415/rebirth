import { BinderPage, BinderHeading } from "@/components/concert/BinderPage";
import { HelperForm } from "@/components/concert/HelperForm";

export default function ConcertHelperPage() {
  return (
    <BinderPage activeTab="helper" pixelFontFamily="'Mulmaru', 'PFStarDust', monospace">
      <BinderHeading
        emoji="🛸"
        title="헬퍼모집"
        subtitle="HELPER RECRUIT"
        accentColor="#b97fff"
      />
      <HelperForm />
    </BinderPage>
  );
}

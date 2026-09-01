import { setRequestLocale } from "next-intl/server";
import { IpodVoteClient } from "./IpodVoteClient";
import s from "../../concert/encore/encore.module.css"; // pageBg 재사용

export default async function ConcertChorusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <div className={s.pageBg} aria-hidden />
      <div
        style={{
          position: "relative",
          zIndex: 11,
          height: "calc(100svh - 60px)",
          marginBottom: "-96px",
          paddingTop: "clamp(8px, 1vh, 24px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          overflowX: "hidden",
          overflowY: "clip",
        }}
      >
        <IpodVoteClient />
      </div>
    </>
  );
}

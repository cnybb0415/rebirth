import { setRequestLocale } from "next-intl/server";
import { SetlistIpodClient } from "../SetlistIpodClient";
import s from "../../../concert/encore/encore.module.css";

export default async function SetlistPage({
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
        <SetlistIpodClient />
      </div>
    </>
  );
}

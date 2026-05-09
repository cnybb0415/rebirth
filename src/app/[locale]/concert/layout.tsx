export default function ConcertLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage:
          "url('/images/concert/design/pixel%20art%20space%20wallpapers.jfif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="min-h-screen bg-black/55">{children}</div>
    </div>
  );
}

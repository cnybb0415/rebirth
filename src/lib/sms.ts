export type SmsPlatform = "ios" | "android" | "other";

export function detectSmsPlatform(userAgent?: string): SmsPlatform {
  const ua = userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : "");
  if (/iPad|iPhone|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export function buildSmsHref({
  to,
  body,
  platform,
}: {
  to: string;
  body: string;
  platform: SmsPlatform;
}): string {
  const smsTo = to.trim();
  const encodedTo = encodeURIComponent(smsTo);
  const encodedBody = encodeURIComponent(body ?? "");

  // Commonly supported formats:
  // - Android: sms:<to>?body=<encoded>
  // - iOS: sms:<to>&body=<encoded>
  return platform === "ios"
    ? `sms:${encodedTo}&body=${encodedBody}`
    : `sms:${encodedTo}?body=${encodedBody}`;
}

export function openSms({ to, body }: { to: string; body: string }) {
  const platform = detectSmsPlatform();
  const href = buildSmsHref({ to, body, platform });
  window.location.href = href;
}

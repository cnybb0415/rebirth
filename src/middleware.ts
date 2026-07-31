import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const i18nMiddleware = createMiddleware(routing);

const BLOCKED_PATHS = new Set([
  "/wordpress/wp-admin/setup-config.php",
  "/wp-admin/setup-config.php",
]);

const AI_BOT_PATTERN =
  /ClaudeBot|Claude-Web|anthropic-ai|GPTBot|ChatGPT-User|OAI-SearchBot|CCBot|Google-Extended|PerplexityBot|YouBot|Meta-ExternalAgent|AmazonBot|Bytespider|Diffbot|ImagesiftBot|Omgili|Applebot-Extended|cohere-ai/i;

export function middleware(request: NextRequest) {
  if (BLOCKED_PATHS.has(request.nextUrl.pathname)) {
    return new NextResponse("Not Found", { status: 404 });
  }
  const ua = request.headers.get("user-agent") ?? "";
  if (AI_BOT_PATTERN.test(ua)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  return i18nMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|images|.*\\..*).*)",
  ],
};

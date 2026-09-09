import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "noai, noimageai" },
        ],
      },
    ];
  },
  reactCompiler: true,
  serverExternalPackages: ["@libsql/client"],
  outputFileTracingExcludes: {
    "*": ["./public/images/**", "./public/font/**"],
  },
  // 모금 공지 페이지는 배포된 서버리스 함수 안에서 런타임에
  // public/images/concert/funding 폴더를 fs.readdirSync로 직접 읽어서
  // locale별 공지 이미지를 찾는데, 위 outputFileTracingExcludes가 모든
  // 라우트에서 public/images/**를 통째로 빼버려서 이 폴더도 함께 제외되고
  // 있었음 — 그래서 로컬(next dev/build)에서는 보이는데 실제 배포본에서는
  // 이미지가 하나도 안 뜨던 것. 이 라우트만 다시 포함시켜서 되돌림.
  outputFileTracingIncludes: {
    // 라우트 글롭은 picomatch로 매칭되는데 [ ]가 문자 클래스로 해석되므로
    // 동적 세그먼트 [locale]은 리터럴로 매칭시키려면 대괄호를 이스케이프해야 함
    "/\\[locale\\]/concert/funding": ["./public/images/concert/funding/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);

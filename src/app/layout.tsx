import type { Metadata } from "next";
import localFont from "next/font/local";

import { AppShell } from "@/components/app-shell";

import "./globals.css";

const maplestory = localFont({
  src: [
    {
      path: "./fonts/maplestory-light.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/maplestory-bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-maplestory",
});

const indexingEnabled = process.env.ENABLE_INDEXING === "true";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "YBrary",
    template: "%s | YBrary",
  },
  description: "Projects, Books & Films by Y. 프로젝트와 책, 영화 기록을 모은 개인 아카이브입니다.",
  applicationName: "YBrary",
  robots: {
    index: indexingEnabled,
    follow: true,
  },
};

const themeScript = `(function(){try{var k="ybrary-theme";var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark")t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={maplestory.variable} data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

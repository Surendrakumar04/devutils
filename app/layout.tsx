import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { DarkModeScript } from "@/components/DarkModeScript";

export const metadata: Metadata = {
  metadataBase: new URL("https://jsonwiz.dev"),
  title: {
    default: "JsonWiz — Free JSON Formatter & Validator",
    template: "%s | JsonWiz",
  },
  description: "Free, fast JSON tools that run 100% in your browser. Format, validate, repair and explore JSON. Your data never leaves your device.",
  openGraph: {
    siteName: "JsonWiz",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <DarkModeScript />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3489070977549568"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}

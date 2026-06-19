import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { DarkModeScript } from "@/components/DarkModeScript";

export const metadata: Metadata = {
  metadataBase: new URL("https://devutils.tools"),
  title: {
    default: "DevUtils — Free Developer Tools",
    template: "%s | DevUtils",
  },
  description: "Free, fast developer utilities that run 100% in your browser. Your data never leaves your device.",
  openGraph: {
    siteName: "DevUtils",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <DarkModeScript />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}

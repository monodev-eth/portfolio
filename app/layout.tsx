import type { Metadata, Viewport } from "next";
import { Play, Hanken_Grotesk } from "next/font/google";
import { PROFILE } from "@/lib/profile";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Self-hosted at build time — no external request, no layout shift.
const play = Play({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-play", display: "swap" });
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${PROFILE.displayName} / ${PROFILE.name}`,
  description: PROFILE.summary,
  openGraph: {
    title: `${PROFILE.displayName} / ${PROFILE.name}`,
    description: PROFILE.summary,
    type: "website",
    images: [{ url: PROFILE.avatar, alt: PROFILE.name }],
  },
  twitter: {
    card: "summary",
    title: `${PROFILE.displayName} / ${PROFILE.name}`,
    description: PROFILE.summary,
    images: [PROFILE.avatar],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05060f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${play.variable} ${hanken.variable}`}>
      <body>{children}</body>
    </html>
  );
}

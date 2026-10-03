import type { Metadata, Viewport } from "next";
import { Navbar, Footer } from "@/components/chrome";
import { SITE_URL } from "@/components/site";
import "@/generated/fox-shared.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fox Macro Recorder | Record and replay clicks in Chrome",
    template: "%s | Fox Macro Recorder",
  },
  description:
    "A tiny pixel fox that records your clicks on any web page and plays them back, with loops and random delays. Everything stays in your browser.",
  icons: { icon: "/icons/icon48.png", apple: "/icons/icon128.png" },
  openGraph: { images: "/assets/store/promo-marquee-1400x560.png", siteName: "Fox Macro Recorder" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#FFF1E8" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/assets/fonts/tiny5.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

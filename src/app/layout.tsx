import "./globals.css";
import type { Metadata, Viewport } from "next";
import { PullToRefresh } from "@/components/PullToRefresh";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  manifest: "/manifest.json",
  title: "Shift Calendar",
  description: "ปฏิทินจัดการเวร แลกเวร และวันลา",
  openGraph: {
    title: "Shift Calendar",
    description: "จัดการเวรได้ง่ายขึ้น",
    images: [{ url: "/og.png", width: 1200, height: 628, alt: "Shift Calendar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shift Calendar",
    description: "จัดการเวรได้ง่ายขึ้น",
    images: ["/og.png"],
  },
  icons: {
    apple: "/images/home.png",
  },

  appleWebApp: {
    capable: true,
    title: "Shift Calendar",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff8df" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-dvh">
        <PullToRefresh />
        {children}
      </body>
    </html>
  );
}

import "./globals.css";
import type { Metadata, Viewport } from "next";
import { PullToRefresh } from "@/components/PullToRefresh";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "Rak auan kub",
  icons: {
    apple: "/images/home.png",
  },

  appleWebApp: {
    capable: true,
    title: "Rak auan kub",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
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

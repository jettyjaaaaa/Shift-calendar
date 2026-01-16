import "./globals.css";
import type { Metadata, Viewport } from "next";


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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-zinc-50 text-zinc-900">{children}</body>
    </html>
  );
}

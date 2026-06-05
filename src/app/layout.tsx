import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "MYSTERIUM — Escape Room Warszawa | ul. Ogrodowa",
    template: "%s | MYSTERIUM",
  },
  description:
    "Mysterium — stacjonarny escape room w Warszawie przy ul. Ogrodowej. Pokoje zagadek i mobilna Skrzynia na eventy. Rezerwuj przez LockMe!",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    title: "MYSTERIUM — Escape Room Warszawa",
    siteName: "MYSTERIUM",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="noise-bg">
        <div className="hex-bg" aria-hidden />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "MYSTERIUM — Escape Room Nowy Dwór Mazowiecki",
    template: "%s | MYSTERIUM",
  },
  description:
    "Mysterium — escape room w Nowym Dworze Mazowieckim przy ul. Warszawskiej 40. Pokój „Pułapka” oraz mobilna Skrzynia na eventy. Rezerwuj online!",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    title: "MYSTERIUM — Escape Room Nowy Dwór Mazowiecki",
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

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MYSTERIUM — Escape Room Warszawa | ul. Ogrodowa",
  description:
    "Mysterium — stacjonarny escape room w Warszawie przy ul. Ogrodowej. Pokoje zagadek i mobilna Skrzynia na eventy. Rezerwuj przez LockMe!",
  openGraph: {
    title: "MYSTERIUM — Escape Room Warszawa",
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

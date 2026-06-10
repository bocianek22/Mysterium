import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteUrl, siteLogo } from "@/lib/seo";
import NoZoom from "@/components/NoZoom";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#040C14",
};

const TITLE = "MYSTERIUM — Escape Room Nowy Dwór Mazowiecki";
const DESC =
  "Mysterium — escape room w Nowym Dworze Mazowieckim (ul. Warszawska 40). Pokój „Pułapka” oraz mobilna Skrzynia na eventy, urodziny i integracje. Rezerwuj online!";

export async function generateMetadata(): Promise<Metadata> {
  const base = siteUrl();
  const logo = (await siteLogo(base)) || `${base}/logo.png`;
  return {
    metadataBase: new URL(base),
    applicationName: "MYSTERIUM",
    title: { default: TITLE, template: "%s | MYSTERIUM" },
    description: DESC,
    keywords: [
      "escape room", "escape room Nowy Dwór Mazowiecki", "pokój zagadek", "Mysterium",
      "escape room Warszawa okolice", "urodziny", "integracje firmowe", "wieczór panieński", "wieczór kawalerski", "bony podarunkowe",
    ],
    icons: { icon: logo, shortcut: logo, apple: logo },
    openGraph: {
      title: TITLE,
      description: DESC,
      url: base,
      siteName: "MYSTERIUM",
      locale: "pl_PL",
      type: "website",
      images: [{ url: logo, width: 512, height: 512, alt: "MYSTERIUM Escape Room" }],
    },
    twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: [logo] },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="noise-bg">
        <NoZoom />
        <div className="hex-bg" aria-hidden />
        {children}
      </body>
    </html>
  );
}

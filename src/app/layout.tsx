import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteUrl, siteLogo } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import NoZoom from "@/components/NoZoom";
import PWARegister from "@/components/site/PWARegister";
import Analytics from "@/components/site/Analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

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
  const verification = await prisma.siteSettings.findUnique({ where: { id: "main" }, select: { googleSiteVerification: true } }).then((s) => s?.googleSiteVerification?.trim()).catch(() => undefined);
  return {
    metadataBase: new URL(base),
    applicationName: "MYSTERIUM",
    ...(verification ? { verification: { google: verification } } : {}),
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = await prisma.siteSettings.findUnique({ where: { id: "main" }, select: { gaMeasurementId: true } }).then((s) => s?.gaMeasurementId?.trim() || null).catch(() => null);
  return (
    <html lang="pl">
      <body className="noise-bg">
        <NoZoom />
        <PWARegister />
        {gaId && <Analytics gaId={gaId} />}
        <VercelAnalytics />
        <div className="hex-bg" aria-hidden />
        {children}
      </body>
    </html>
  );
}

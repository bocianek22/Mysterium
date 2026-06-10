import { siteLogo, siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

// Osobny manifest dla panelu — instaluje się jako oddzielna aplikacja
// ("Mysterium Panel") startująca w /admin, niezależnie od PWA strony publicznej.
export async function GET() {
  const logo = (await siteLogo()) || `${siteUrl()}/logo.png`;
  const manifest = {
    id: "/admin",
    name: "Mysterium Panel",
    short_name: "Panel",
    description: "Panel zarządzania Mysterium — rezerwacje, grafik, klienci.",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: "#040C14",
    theme_color: "#0d1b2a",
    lang: "pl",
    orientation: "portrait-primary",
    icons: [
      { src: logo, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: logo, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: logo, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "content-type": "application/manifest+json", "cache-control": "no-store" },
  });
}

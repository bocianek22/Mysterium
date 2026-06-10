import type { MetadataRoute } from "next";
import { siteLogo, siteUrl } from "@/lib/seo";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const logo = (await siteLogo()) || `${siteUrl()}/logo.png`;
  return {
    name: "MYSTERIUM — Escape Room",
    short_name: "Mysterium",
    description: "Escape room w Nowym Dworze Mazowieckim — rezerwuj online.",
    start_url: "/pl",
    display: "standalone",
    background_color: "#040C14",
    theme_color: "#040C14",
    lang: "pl",
    icons: [
      { src: logo, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: logo, sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}

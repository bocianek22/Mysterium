"use client";
import { useEffect } from "react";
import type { Locale } from "@/lib/i18n";

// Ustawia <html lang="..."> zgodnie z aktualnym językiem (dostępność + SEO)
export default function HtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}

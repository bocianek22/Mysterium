"use client";
import { useEffect, useRef } from "react";

// Wstawia dowolny kod osadzenia (iframe/skrypt np. widget opinii Lockme)
// i wykonuje zawarte <script> (React sam ich nie uruchamia przez innerHTML).
export default function EmbedHtml({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html;
    el.querySelectorAll("script").forEach((old) => {
      const s = document.createElement("script");
      Array.from(old.attributes).forEach((a) => s.setAttribute(a.name, a.value));
      s.text = old.textContent || "";
      old.replaceWith(s);
    });
  }, [html]);
  return <div ref={ref} className="lockme-embed" />;
}

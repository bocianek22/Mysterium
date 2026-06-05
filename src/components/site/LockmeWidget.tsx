"use client";
import { useEffect, useRef } from "react";

// Renderuje dowolny kod osadzenia widżetu (iframe i/lub script).
// Skrypty wstawione przez innerHTML nie wykonują się — dlatego tworzymy je ręcznie.
export default function LockmeWidget({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = code;

    const scripts = Array.from(el.querySelectorAll("script"));
    scripts.forEach((old) => {
      const s = document.createElement("script");
      for (const attr of Array.from(old.attributes)) {
        s.setAttribute(attr.name, attr.value);
      }
      s.text = old.textContent || "";
      old.replaceWith(s);
    });

    return () => {
      el.innerHTML = "";
    };
  }, [code]);

  return <div ref={ref} className="lockme-embed w-full" />;
}

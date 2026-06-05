"use client";
import { useState } from "react";
import type { FaqItem } from "@prisma/client";
import type { Locale, Dict } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import SectionHeader from "./SectionHeader";

export default function Faq({
  locale,
  t,
  items,
}: {
  locale: Locale;
  t: Dict;
  items: FaqItem[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  if (items.length === 0) return null;

  return (
    <section className="px-6 md:px-[60px] py-20 md:py-[120px] relative z-[1]" id="faq" style={{ background: "var(--navy-dd)" }}>
      <SectionHeader label={t.faq.label} title={t.faq.title} />
      <div className="max-w-[800px] mx-auto mt-[60px]">
        {items.map((item, i) => {
          const isOpen = open === item.id;
          return (
            <div key={item.id} className={`reveal reveal-d${(i % 5) + 1}`} style={{ borderBottom: "1px solid rgba(201,168,76,.08)" }}>
              <button
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="w-full py-[22px] flex justify-between items-center text-left font-serif text-[13px] tracking-[1px] transition-colors"
                style={{ color: isOpen ? "var(--gold)" : "var(--text)" }}
              >
                {pick(item, "question", locale)}
                <span className="text-lg flex-shrink-0 transition-transform" style={{ color: "var(--gold)", transform: isOpen ? "rotate(45deg)" : "none" }}>
                  +
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-300 text-[15px] leading-[1.9]"
                style={{ maxHeight: isOpen ? 300 : 0, color: "var(--muted)", paddingBottom: isOpen ? 20 : 0 }}
              >
                {pick(item, "answer", locale)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

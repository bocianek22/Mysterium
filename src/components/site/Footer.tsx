import type { Locale, Dict } from "@/lib/i18n";

export default function Footer({
  locale,
  t,
  phone,
  email,
  address,
  instagram,
  facebook,
}: {
  locale: Locale;
  t: Dict;
  phone: string;
  email: string;
  address?: string;
  instagram?: string | null;
  facebook?: string | null;
}) {
  return (
    <footer
      className="px-6 md:px-[60px] py-10 md:py-[60px] relative z-[1]"
      style={{
        background: "var(--navy-dd)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-10 md:gap-[60px] max-w-[1100px] mx-auto mb-10">
        <div>
          <div className="font-display text-gold-grad text-lg mb-3">MYSTERIUM</div>
          <p className="text-[13px] leading-[1.8]" style={{ color: "var(--dim)" }}>
            {t.footer.tagline}
            {address && (<><br />📍 {address}</>)}
            <br />
            {email}
          </p>
          {(instagram || facebook) && (
            <div className="flex gap-3 mt-4">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex items-center justify-center rounded-full no-underline" style={{ width: 38, height: 38, border: "1px solid var(--border)", color: "var(--gold)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex items-center justify-center rounded-full no-underline" style={{ width: 38, height: 38, border: "1px solid var(--border)", color: "var(--gold)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h2.5l.5-3H14V9z" /></svg>
                </a>
              )}
            </div>
          )}
        </div>
        <div>
          <h4 className="font-serif text-[10px] tracking-[3px] uppercase mb-[18px]" style={{ color: "var(--gold)" }}>
            {t.footer.nav}
          </h4>
          <ul className="list-none flex flex-col gap-[10px]">
            {[
              ["/pokoje", t.nav.rooms],
              ["/mobilna", t.nav.mobile],
              ["/eventy", t.nav.events],
              ["/bony", t.nav.vouchers],
              ["/cennik", t.nav.pricing],
              ["/blog", t.nav.blog],
              ["/hall-of-fame", t.hall.label],
              ["/o-nas", t.nav.about],
              ["/kontakt", t.nav.contact],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={`/${locale}${href}`} className="text-sm no-underline transition-colors" style={{ color: "var(--dim)" }}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-[10px] tracking-[3px] uppercase mb-[18px]" style={{ color: "var(--gold)" }}>
            {t.footer.info}
          </h4>
          <ul className="list-none flex flex-col gap-[10px]">
            <li>
              <a href={`/${locale}/polityka-prywatnosci`} className="text-sm no-underline" style={{ color: "var(--dim)" }}>
                {t.footer.privacy}
              </a>
            </li>
            <li>
              <a href={`/${locale}/rezerwacja`} className="text-sm no-underline" style={{ color: "var(--dim)" }}>
                LockMe
              </a>
            </li>
            <li>
              <a href="/sitemap.xml" className="text-sm no-underline" style={{ color: "var(--dim)" }}>
                {t.footer.sitemap}
              </a>
            </li>
            <li>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-sm no-underline" style={{ color: "var(--dim)" }}>
                {phone}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div
        className="pt-7 max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-center"
        style={{ borderTop: "1px solid rgba(201,168,76,.06)" }}
      >
        <p className="text-xs" style={{ color: "var(--dim)" }}>
          © {new Date().getFullYear()} Mysterium. {t.footer.rights}
        </p>
        <div>
          <a href={`/${locale}/polityka-prywatnosci`} className="text-xs no-underline ml-4" style={{ color: "var(--gold-l)" }}>
            {t.footer.privacy}
          </a>
        </div>
      </div>
    </footer>
  );
}

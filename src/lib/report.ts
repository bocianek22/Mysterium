// Eksport PDF pod księgowość — generujemy gotowy do druku dokument A4 (HTML),
// który przeglądarka zapisuje jako PDF ("Zapisz jako PDF"). Bez zależności zewnętrznych.

const esc = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
};

export function reportHtml(opts: {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: (string | number | null | undefined)[][];
  totals?: (string | number | null | undefined)[];
  alignRight?: number[]; // indeksy kolumn wyrównane do prawej
}): string {
  const { title, subtitle, columns, rows, totals } = opts;
  const right = new Set(opts.alignRight || []);
  const now = new Date().toLocaleString("pl-PL");
  const cell = (v: unknown, i: number, tag = "td") => `<${tag} style="${right.has(i) ? "text-align:right;" : ""}">${esc(v)}</${tag}>`;
  const head = `<tr>${columns.map((c, i) => cell(c, i, "th")).join("")}</tr>`;
  const body = rows.map((r) => `<tr>${r.map((v, i) => cell(v, i)).join("")}</tr>`).join("");
  const foot = totals ? `<tr class="tot">${totals.map((v, i) => cell(v, i)).join("")}</tr>` : "";

  return `<!doctype html><html lang="pl"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Arial, sans-serif; color: #15202b; font-size: 12px; margin: 0; }
  .wrap { padding: 8px; }
  header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #0d1b2a; padding-bottom: 10px; margin-bottom: 16px; }
  .brand { font-size: 20px; font-weight: 700; letter-spacing: 1px; color: #0d1b2a; }
  .brand small { display:block; font-size: 10px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; color: #8a6d1f; }
  h1 { font-size: 16px; margin: 0; color: #0d1b2a; }
  .meta { text-align: right; font-size: 10px; color: #667; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #0d1b2a; color: #c9a84c; text-align: left; padding: 7px 8px; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; }
  td { padding: 6px 8px; border-bottom: 1px solid #e3e6ea; }
  tr:nth-child(even) td { background: #f7f8fa; }
  .tot td { font-weight: 700; border-top: 2px solid #0d1b2a; background: #fff !important; }
  .toolbar { margin-bottom: 14px; }
  .btn { display: inline-block; background: #c9a84c; color: #1a1206; padding: 9px 18px; border-radius: 6px; border: 0; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; }
  footer { margin-top: 24px; font-size: 9px; color: #99a; text-align: center; }
  @media print { .toolbar { display: none; } body { font-size: 11px; } }
</style></head>
<body><div class="wrap">
  <div class="toolbar"><button class="btn" onclick="window.print()">⬇ Pobierz PDF / Drukuj</button></div>
  <header>
    <div>
      <div class="brand">MYSTERIUM<small>Escape Room</small></div>
      <h1 style="margin-top:8px">${esc(title)}</h1>
      ${subtitle ? `<div style="font-size:11px;color:#667;margin-top:2px">${esc(subtitle)}</div>` : ""}
    </div>
    <div class="meta">Wygenerowano<br>${esc(now)}</div>
  </header>
  <table><thead>${head}</thead><tbody>${body}${foot}</tbody></table>
  <footer>Mysterium — raport wygenerowany z panelu administracyjnego. Dokument do celów wewnętrznych/księgowych.</footer>
</div>
<script>setTimeout(function(){ try { window.print(); } catch(e){} }, 350);</script>
</body></html>`;
}

export function htmlResponse(html: string) {
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

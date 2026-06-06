// Budowanie CSV pod polski Excel: separator ";" + BOM UTF-8.
export function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    if (/[";\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [headers.map(esc).join(";"), ...rows.map((r) => r.map(esc).join(";"))];
  return "﻿" + lines.join("\r\n");
}

export function csvResponse(filename: string, content: string) {
  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

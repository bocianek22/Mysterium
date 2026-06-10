import { getSession, canFinance } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { htmlResponse } from "@/lib/report";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const esc = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s || !canFinance(s.role)) return new Response("Forbidden", { status: 403 });
  const v = await prisma.voucher.findUnique({ where: { id: params.id } });
  if (!v) return new Response("Not found", { status: 404 });
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });

  let qr = "";
  try { const QRCode = (await import("qrcode")).default; qr = await QRCode.toDataURL(v.code, { width: 360, margin: 1, color: { dark: "#0d1b2a", light: "#ffffff" } }); } catch {}

  const value = v.amount ? `${v.amount.toLocaleString("pl-PL")} zł` : "Bon na grę";
  const valid = v.validUntil ? `Ważny do: ${esc(v.validUntil)}` : "";
  const phone = settings?.phone || "";
  const logo = settings?.logoUrl || "";

  const html = `<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>Bon ${esc(v.code)}</title>
<style>
  @page { size: A5 landscape; margin: 0; }
  * { box-sizing: border-box; }
  body { margin:0; font-family:-apple-system,"Segoe UI",Arial,sans-serif; }
  .card { width: 210mm; max-width:100%; aspect-ratio: 1.6/1; background: radial-gradient(ellipse at 70% 20%, #15304a, #040c14 70%); color:#e8dcc8; position:relative; overflow:hidden; padding: 32px 36px; }
  .card::after{ content:""; position:absolute; inset:10px; border:1px solid rgba(201,168,76,.4); pointer-events:none; }
  .brand { font-family:"Cinzel",serif; letter-spacing:3px; font-size:13px; color:#c9a84c; text-transform:uppercase; }
  .logo { height:42px; margin-bottom:6px; }
  h1 { font-size:34px; margin:18px 0 4px; background:linear-gradient(135deg,#f5e4b0,#c9a84c); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
  .sub { color:#9a8b75; font-size:13px; }
  .value { font-size:40px; font-weight:700; color:#c9a84c; margin-top:14px; }
  .code { margin-top:10px; font-family:monospace; font-size:22px; letter-spacing:2px; color:#e8dcc8; background:rgba(201,168,76,.1); display:inline-block; padding:6px 14px; border-radius:6px; border:1px solid rgba(201,168,76,.3); }
  .qr { position:absolute; right:34px; bottom:30px; width:120px; height:120px; background:#fff; border-radius:8px; padding:6px; }
  .foot { position:absolute; left:36px; bottom:30px; font-size:11px; color:#9a8b75; }
  .toolbar { padding:10px; text-align:center; }
  .btn { background:#c9a84c; color:#1a1206; padding:9px 18px; border:0; border-radius:6px; font-weight:600; cursor:pointer; }
  @media print { .toolbar { display:none; } }
</style></head>
<body>
  <div class="toolbar"><button class="btn" onclick="window.print()">⬇ Drukuj / Zapisz PDF</button></div>
  <div class="card">
    ${logo ? `<img class="logo" src="${esc(logo)}" alt="">` : `<div class="brand">Mysterium</div>`}
    <div class="brand">Bon podarunkowy</div>
    <h1>${esc(v.titlePl || "Bon podarunkowy")}</h1>
    <div class="sub">Mysterium — Escape Room</div>
    <div class="value">${esc(value)}</div>
    <div class="code">${esc(v.code)}</div>
    ${qr ? `<img class="qr" src="${qr}" alt="QR">` : ""}
    <div class="foot">${valid}${valid && phone ? " · " : ""}${phone ? "tel. " + esc(phone) : ""}</div>
  </div>
  <script>setTimeout(function(){try{window.print()}catch(e){}},400);</script>
</body></html>`;
  return htmlResponse(html);
}

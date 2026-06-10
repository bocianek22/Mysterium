// Płatności online — wspólna warstwa dla Stripe i Przelewy24.
// Klucze trzymamy w zmiennych środowiskowych (sekrety), wybór operatora w ustawieniach.
import crypto from "crypto";
import { prisma } from "./prisma";
import { sendMail } from "./notify";
import { siteUrl } from "./seo";

export type Provider = "STRIPE" | "P24";

export async function paymentSettings() {
  const s = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  return {
    enabled: !!s?.paymentsEnabled,
    provider: (s?.paymentProvider === "P24" ? "P24" : "STRIPE") as Provider,
    voucherSale: !!s?.voucherSaleEnabled,
  };
}

// Bazowy adres dla URL-i zwrotnych/webhooków — preferujemy skonfigurowany adres,
// nagłówek Host traktujemy jako fallback (ochrona przed spoofingiem przy webhookach).
export function resolveOrigin(headers: Headers): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const host = headers.get("x-forwarded-host") || headers.get("host") || "localhost:3000";
  const proto = headers.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`;
}

export function zl(grosze: number) {
  return (grosze / 100).toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł";
}

// ── Stripe ──────────────────────────────────────────────────────────────
function stripeKeys() {
  return { secret: process.env.STRIPE_SECRET_KEY || "", webhook: process.env.STRIPE_WEBHOOK_SECRET || "" };
}

async function stripeCheckout(p: { id: string; amount: number; currency: string; description?: string | null; buyerEmail?: string | null }, urls: { success: string; cancel: string }) {
  const { secret } = stripeKeys();
  if (!secret) throw new Error("Brak STRIPE_SECRET_KEY");
  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("success_url", urls.success);
  body.set("cancel_url", urls.cancel);
  if (p.buyerEmail) body.set("customer_email", p.buyerEmail);
  body.set("client_reference_id", p.id);
  body.set("metadata[paymentId]", p.id);
  body.set("payment_method_types[0]", "card");
  body.set("payment_method_types[1]", "blik");
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", p.currency.toLowerCase());
  body.set("line_items[0][price_data][unit_amount]", String(p.amount));
  body.set("line_items[0][price_data][product_data][name]", p.description || "Mysterium");

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j?.error?.message || "Błąd Stripe");
  return { url: j.url as string, ref: j.id as string };
}

// Weryfikacja podpisu webhooka Stripe (t=...,v1=...).
export function stripeVerify(rawBody: string, sigHeader: string | null): boolean {
  const { webhook } = stripeKeys();
  if (!webhook || !sigHeader) return false;
  const parts = Object.fromEntries(sigHeader.split(",").map((kv) => kv.split("=") as [string, string]));
  const t = parts["t"]; const v1 = parts["v1"];
  if (!t || !v1) return false;
  const expected = crypto.createHmac("sha256", webhook).update(`${t}.${rawBody}`).digest("hex");
  try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1)); } catch { return false; }
}

// ── Przelewy24 ──────────────────────────────────────────────────────────
function p24Keys() {
  return {
    merchantId: process.env.P24_MERCHANT_ID || "",
    posId: process.env.P24_POS_ID || process.env.P24_MERCHANT_ID || "",
    crc: process.env.P24_CRC || "",
    apiKey: process.env.P24_API_KEY || "",
    host: process.env.P24_SANDBOX === "true" ? "https://sandbox.przelewy24.pl" : "https://secure.przelewy24.pl",
  };
}

function p24Sign(obj: Record<string, unknown>) {
  return crypto.createHash("sha384").update(JSON.stringify(obj)).digest("hex");
}

async function p24Register(p: { id: string; amount: number; currency: string; description?: string | null; buyerEmail?: string | null }, urls: { return: string; status: string }) {
  const k = p24Keys();
  if (!k.merchantId || !k.crc || !k.apiKey) throw new Error("Brak konfiguracji Przelewy24");
  const sign = p24Sign({ sessionId: p.id, merchantId: Number(k.merchantId), amount: p.amount, currency: p.currency, crc: k.crc });
  const payload = {
    merchantId: Number(k.merchantId),
    posId: Number(k.posId),
    sessionId: p.id,
    amount: p.amount,
    currency: p.currency,
    description: p.description || "Mysterium",
    email: p.buyerEmail || "klient@mysterium.pl",
    country: "PL",
    language: "pl",
    urlReturn: urls.return,
    urlStatus: urls.status,
    sign,
  };
  const auth = Buffer.from(`${k.posId}:${k.apiKey}`).toString("base64");
  const res = await fetch(`${k.host}/api/v1/transaction/register`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await res.json();
  if (!res.ok || !j?.data?.token) throw new Error(j?.error || "Błąd Przelewy24");
  return { url: `${k.host}/trnRequest/${j.data.token}`, ref: j.data.token as string };
}

// Weryfikacja powiadomienia P24 i potwierdzenie transakcji.
export async function p24VerifyNotification(body: any): Promise<boolean> {
  const k = p24Keys();
  const expectedSign = p24Sign({ merchantId: Number(k.merchantId), posId: Number(k.posId), sessionId: body.sessionId, amount: body.amount, originAmount: body.originAmount, currency: body.currency, orderId: body.orderId, methodId: body.methodId, statement: body.statement, crc: k.crc });
  if (body.sign !== expectedSign) return false;
  // Potwierdzenie (verify)
  const verifySign = p24Sign({ sessionId: body.sessionId, orderId: body.orderId, amount: body.amount, currency: body.currency, crc: k.crc });
  const auth = Buffer.from(`${k.posId}:${k.apiKey}`).toString("base64");
  const res = await fetch(`${k.host}/api/v1/transaction/verify`, {
    method: "PUT",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ merchantId: Number(k.merchantId), posId: Number(k.posId), sessionId: body.sessionId, amount: body.amount, currency: body.currency, orderId: body.orderId, sign: verifySign }),
  });
  const j = await res.json().catch(() => ({}));
  return res.ok && j?.data?.status === "success";
}

// ── Wspólne ─────────────────────────────────────────────────────────────
export async function startCheckout(paymentId: string, origin: string): Promise<string> {
  const p = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!p) throw new Error("Nie znaleziono płatności");
  if (p.status === "PAID") throw new Error("Płatność już opłacona");
  const ret = `${origin}/pl/platnosc/status?id=${p.id}`;
  if (p.provider === "P24") {
    const { url, ref } = await p24Register(p, { return: ret, status: `${origin}/api/pay/webhook/p24` });
    await prisma.payment.update({ where: { id: p.id }, data: { providerRef: ref } });
    return url;
  }
  const { url, ref } = await stripeCheckout(p, { success: ret, cancel: `${origin}/pl/platnosc/status?id=${p.id}` });
  await prisma.payment.update({ where: { id: p.id }, data: { providerRef: ref } });
  return url;
}

// Oznacza płatność jako opłaconą i realizuje (bon / event). Idempotentne (odporne na wyścig webhooków).
export async function markPaidAndFulfill(paymentId: string) {
  // Atomowe przejęcie: tylko jeden webhook przejdzie z PENDING/FAILED → PAID.
  const claimed = await prisma.payment.updateMany({ where: { id: paymentId, status: { not: "PAID" } }, data: { status: "PAID", paidAt: new Date() } });
  if (claimed.count === 0) return;
  const p = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!p) return;
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (p.purpose === "VOUCHER") {
    const code = "MYS-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    const voucher = await prisma.voucher.create({
      data: { code, titlePl: "Bon podarunkowy", titleEn: "Gift voucher", amount: p.amount / 100, status: "SOLD", buyerName: p.buyerName || null },
    });
    await prisma.payment.update({ where: { id: p.id }, data: { voucherId: voucher.id } });
    if (p.buyerEmail) {
      const subject = settings?.voucherEmailSubject?.trim() || "Twój bon podarunkowy Mysterium 🎁";
      const tpl = settings?.voucherEmailBody?.trim() || "Dziękujemy za zakup!\n\nKod bonu: {code}\nWartość: {amount}\n\nBon zrealizujesz przy rezerwacji. Do zobaczenia w Mysterium!";
      const pdfUrl = `${siteUrl()}/api/voucher-pdf/${code}`;
      const text = tpl.replace(/\{code\}/g, code).replace(/\{amount\}/g, zl(p.amount)) + `\n\nPobierz bon (PDF do druku): ${pdfUrl}`;
      await sendMail({ to: p.buyerEmail, subject, text });
    }
  } else if (p.buyerEmail) {
    const subject = settings?.payEmailSubject?.trim() || "Potwierdzenie płatności — Mysterium";
    const tpl = settings?.payEmailBody?.trim() || "Dziękujemy! Otrzymaliśmy płatność {amount}{description}.";
    const text = tpl.replace(/\{amount\}/g, zl(p.amount)).replace(/\{description\}/g, p.description ? ` (${p.description})` : "");
    await sendMail({ to: p.buyerEmail, subject, text });
  }
}

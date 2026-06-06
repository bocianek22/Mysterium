// Warstwa powiadomień: Telegram (zalecane, darmowe) + e-mail (Resend).
// Wszystkie funkcje są „bezpieczne" — nigdy nie rzucają, logują błędy.

import { prisma } from "./prisma";

type NotifyType = "reservation" | "message" | "schedule" | "test";

async function settings() {
  return prisma.siteSettings.findUnique({ where: { id: "main" } });
}

export async function sendTelegram(text: string, chatIdOverride?: string | null): Promise<boolean> {
  try {
    const s = await settings();
    if (!s?.telegramEnabled || !s.telegramBotToken) return false;
    const chatId = chatIdOverride || s.telegramChatId;
    if (!chatId) return false;
    const res = await fetch(`https://api.telegram.org/bot${s.telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    return res.ok;
  } catch (e) {
    console.error("[notify] telegram", e);
    return false;
  }
}

export async function sendEmail(subject: string, text: string): Promise<boolean> {
  try {
    const s = await settings();
    if (!s?.emailNotifyEnabled || !process.env.RESEND_API_KEY) return false;
    const to = s.email;
    if (!to) return false;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Mysterium <onboarding@resend.dev>",
        to: [to],
        subject,
        text,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error("[notify] email", e);
    return false;
  }
}

const ICON: Record<NotifyType, string> = {
  reservation: "📅",
  message: "✉️",
  schedule: "🗓️",
  test: "🔔",
};

// Wysyła powiadomienie na włączone kanały z respektowaniem przełączników.
export async function notify(opts: {
  type: NotifyType;
  title: string;
  lines?: string[];
}): Promise<void> {
  const s = await settings();
  if (!s) return;
  if (opts.type === "reservation" && !s.notifyOnReservation) return;
  if (opts.type === "message" && !s.notifyOnMessage) return;
  if (opts.type === "schedule" && !s.notifyOnSchedule) return;

  const body = (opts.lines || []).filter(Boolean).join("\n");
  const tgText = `${ICON[opts.type]} <b>${escapeHtml(opts.title)}</b>${body ? "\n" + escapeHtml(body) : ""}`;
  const mailText = `${opts.title}\n\n${body}`;

  await Promise.allSettled([
    sendTelegram(tgText),
    sendEmail(`Mysterium — ${opts.title}`, mailText),
  ]);
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

import { NextResponse } from "next/server";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Wyciąga listę czatów/grup, w których bot widział ostatnie wiadomości (getUpdates),
// żeby właściciel mógł jednym kliknięciem wstawić ID grupy w ustawieniach.
export async function GET() {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  const token = settings?.telegramBotToken?.trim();
  if (!token) return NextResponse.json({ error: "Najpierw wpisz token bota i zapisz ustawienia." }, { status: 400 });

  let data: any;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, { cache: "no-store" });
    data = await res.json();
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Telegramem." }, { status: 502 });
  }
  if (!data?.ok) {
    return NextResponse.json({ error: data?.description || "Telegram odrzucił token (sprawdź poprawność)." }, { status: 400 });
  }

  // Zbierz unikalne czaty z różnych typów aktualizacji
  const chats = new Map<string, { id: string; title: string; type: string }>();
  for (const u of data.result || []) {
    const msg = u.message || u.channel_post || u.my_chat_member || u.edited_message;
    const chat = msg?.chat;
    if (!chat) continue;
    const id = String(chat.id);
    if (chats.has(id)) continue;
    const title = chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(" ") || chat.username || id;
    chats.set(id, { id, type: chat.type, title });
  }

  const list = [...chats.values()];
  return NextResponse.json({
    chats: list,
    hint: list.length === 0
      ? "Brak wiadomości. Napisz na grupie /start@twój_bot (z oznaczeniem) i spróbuj ponownie. Jeśli dalej pusto — wyłącz Privacy Mode u @BotFather i dodaj bota ponownie."
      : null,
  });
}

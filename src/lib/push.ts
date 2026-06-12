// Web Push — powiadomienia dla zespołu. Klucze VAPID trzymane w ustawieniach
// (generowane raz z panelu), więc nie wymaga konfiguracji env.
import webpush from "web-push";
import { prisma } from "./prisma";

let configured = false;

async function configure(): Promise<boolean> {
  const s = await prisma.siteSettings.findUnique({ where: { id: "main" }, select: { vapidPublicKey: true, vapidPrivateKey: true, email: true, pushEnabled: true } });
  if (!s?.pushEnabled || !s.vapidPublicKey || !s.vapidPrivateKey) return false;
  if (!configured) {
    webpush.setVapidDetails(`mailto:${s.email || "kontakt@mysterium.pl"}`, s.vapidPublicKey, s.vapidPrivateKey);
    configured = true;
  }
  return true;
}

export function generateVapidKeys() {
  return webpush.generateVAPIDKeys(); // { publicKey, privateKey }
}

export type PushPayload = { title: string; body?: string; url?: string };

// Wysyła powiadomienie do wszystkich subskrypcji (lub konkretnego usera).
export async function sendPush(payload: PushPayload, userId?: string): Promise<void> {
  try {
    if (!(await configure())) return;
    const subs = await prisma.pushSub.findMany({ where: userId ? { userId } : {} });
    if (!subs.length) return;
    const data = JSON.stringify({ title: payload.title, body: payload.body || "", url: payload.url || "/admin" });
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, data);
        } catch (e: any) {
          // Subskrypcja wygasła / cofnięta — usuń
          if (e?.statusCode === 404 || e?.statusCode === 410) {
            await prisma.pushSub.delete({ where: { id: s.id } }).catch(() => {});
          }
        }
      })
    );
  } catch {
    // nigdy nie rzucamy — push jest „best effort"
  }
}

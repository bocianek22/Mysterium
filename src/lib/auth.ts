import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const COOKIE_NAME = "mysterium_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me"
);

export type Role = "OWNER" | "ADMIN" | "EMPLOYEE" | "CODE" | "RECEPCJA" | "KSIEGOWA" | "TECHNIK";

export const ROLE_LABELS: Record<string, string> = {
  OWNER: "Właściciel",
  ADMIN: "Admin",
  EMPLOYEE: "Pracownik",
  RECEPCJA: "Recepcja",
  KSIEGOWA: "Księgowa",
  TECHNIK: "Technik",
  CODE: "Kod (kiosk)",
};

export function roleLabel(role?: string) {
  return (role && ROLE_LABELS[role]) || "Pracownik";
}

export type SessionPayload = {
  sub: string; // user id
  email: string;
  role: Role;
  name?: string;
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function destroySession() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: (payload.role as Role) || "EMPLOYEE",
      name: payload.name as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return user;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function isManager(role?: Role) {
  return role === "OWNER" || role === "ADMIN";
}

export function isOwner(role?: Role) {
  return role === "OWNER";
}

// Kto widzi finanse (Finanse, Faktury, eksporty finansowe): zarządzający + Księgowa.
export function canFinance(role?: Role) {
  return isManager(role) || role === "KSIEGOWA";
}

// Kto obsługuje rezerwacje: zarządzający + Recepcja.
export function canReservations(role?: Role) {
  return isManager(role) || role === "RECEPCJA";
}

// Kto ma dostęp do bazy klientów (mini-CRM): zarządzający + Recepcja.
export function canCustomers(role?: Role) {
  return isManager(role) || role === "RECEPCJA";
}

// Kto może dodawać wydatki: zarządzający + Księgowa + Technik.
export function canExpenses(role?: Role) {
  return isManager(role) || role === "KSIEGOWA" || role === "TECHNIK";
}

// Role „biurowe" o ograniczonym dostępie (nie pełni zarządzający, nie obsługa gier).
export function isOffice(role?: Role) {
  return role === "RECEPCJA" || role === "KSIEGOWA" || role === "TECHNIK";
}

// Kto może wyświetlać ekran kodu QR (RCP): zarządzający + rola „Kod" (kiosk).
export function canShowCode(role?: Role) {
  return isManager(role) || role === "CODE";
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireManager(): Promise<SessionPayload> {
  const session = await requireSession();
  if (!isManager(session.role)) throw new Error("FORBIDDEN");
  return session;
}

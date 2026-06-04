import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const COOKIE_NAME = "mysterium_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me"
);

export type Role = "OWNER" | "ADMIN" | "EMPLOYEE";

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

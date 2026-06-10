import { SignJWT, jwtVerify } from "jose";

// Token dostępu klienta do jego rezerwacji (magic link, bez hasła).
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");

export async function signCustomerToken(email: string): Promise<string> {
  return new SignJWT({ email: email.trim().toLowerCase(), kind: "customer" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyCustomerToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.kind !== "customer" || !payload.email) return null;
    return payload.email as string;
  } catch {
    return null;
  }
}

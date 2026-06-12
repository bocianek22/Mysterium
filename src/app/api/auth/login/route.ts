import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyCredentials, createSession } from "@/lib/auth";
import { clientIp, loginLockSeconds, recordLoginFailure, recordLoginSuccess } from "@/lib/rateLimit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const locked = await loginLockSeconds(ip);
    if (locked > 0) {
      const mins = Math.ceil(locked / 60);
      return NextResponse.json(
        { error: `Zbyt wiele prób logowania. Spróbuj ponownie za ${mins} min.` },
        { status: 429, headers: { "Retry-After": String(locked) } }
      );
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
    }
    const user = await verifyCredentials(parsed.data.email, parsed.data.password);
    if (!user) {
      await recordLoginFailure(ip);
      return NextResponse.json(
        { error: "Błędny e-mail lub hasło" },
        { status: 401 }
      );
    }
    await recordLoginSuccess(ip);
    await createSession({
      sub: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name ?? undefined,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

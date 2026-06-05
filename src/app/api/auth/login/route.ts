import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyCredentials, createSession } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
    }
    const user = await verifyCredentials(parsed.data.email, parsed.data.password);
    if (!user) {
      return NextResponse.json(
        { error: "Błędny e-mail lub hasło" },
        { status: 401 }
      );
    }
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

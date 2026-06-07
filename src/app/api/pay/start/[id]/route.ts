import { NextRequest, NextResponse } from "next/server";
import { startCheckout } from "@/lib/payments";

export const dynamic = "force-dynamic";

function origin(req: NextRequest) {
  const h = req.headers;
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`;
}

// Rozpoczyna płatność dla istniejącego zlecenia (link na event/wycenę).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const url = await startCheckout(params.id, origin(req));
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Nie udało się rozpocząć płatności" }, { status: 400 });
  }
}

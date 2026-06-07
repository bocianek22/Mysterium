import { NextRequest, NextResponse } from "next/server";
import { startCheckout, resolveOrigin } from "@/lib/payments";

export const dynamic = "force-dynamic";

// Rozpoczyna płatność dla istniejącego zlecenia (link na event/wycenę).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const url = await startCheckout(params.id, resolveOrigin(req.headers));
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Nie udało się rozpocząć płatności" }, { status: 400 });
  }
}

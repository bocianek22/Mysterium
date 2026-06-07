import { NextRequest, NextResponse } from "next/server";
import { stripeVerify, markPaidAndFulfill } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!stripeVerify(raw, req.headers.get("stripe-signature"))) {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }
  try {
    const event = JSON.parse(raw);
    if (event.type === "checkout.session.completed") {
      const session = event.data?.object || {};
      const paymentId = session.metadata?.paymentId || session.client_reference_id;
      // Akceptuj tylko realnie opłacone sesje (pomijamy unpaid/async-pending).
      if (paymentId && session.payment_status === "paid") await markPaidAndFulfill(paymentId);
    }
  } catch {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }
  return NextResponse.json({ received: true });
}

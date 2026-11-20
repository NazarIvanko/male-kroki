import { NextRequest, NextResponse } from "next/server";
import { grantAccess, verifyStripeSignature } from "@/lib/payments";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyStripeSignature(raw, req.headers.get("stripe-signature"))) {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }
  const event = JSON.parse(raw);
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const s = event.data.object;
    if (s.payment_status === "paid" && s.client_reference_id) {
      await grantAccess(s.client_reference_id, s.amount_total, "stripe", s.id);
    }
  }
  return NextResponse.json({ received: true });
}

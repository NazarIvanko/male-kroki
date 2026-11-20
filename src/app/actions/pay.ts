"use server";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { createCheckout, grantAccess } from "@/lib/payments";
import { PRICE, stripeEnabled } from "@/lib/config";

export async function startCheckout() {
  const u = await requireUser();
  if (!stripeEnabled()) redirect("/app/premium");
  const url = await createCheckout(u);
  redirect(url);
}

/** Demo only — simulates a successful BLIK payment when Stripe isn't configured. */
export async function demoPay() {
  const u = await requireUser();
  if (stripeEnabled()) redirect("/app/premium");
  await grantAccess(u.id, PRICE, "demo", null);
  redirect("/app/premium?demo=1");
}

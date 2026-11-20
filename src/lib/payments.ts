import "server-only";
import crypto from "node:crypto";
import { db } from "./db";
import { ACCESS_DAYS, PRICE, appUrl } from "./config";

async function stripe(path: string, init?: { method?: string; body?: URLSearchParams }) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: init?.body,
  });
  const json = await r.json();
  if (!r.ok) throw new Error(json?.error?.message || "Stripe error");
  return json;
}

/** Stripe Checkout page with BLIK + card, prices in PLN. Stripe e-mails the receipt/invoice itself. */
export async function createCheckout(user: { id: string; email: string }) {
  const b = new URLSearchParams({
    mode: "payment",
    "payment_method_types[0]": "blik",
    "payment_method_types[1]": "card",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "pln",
    "line_items[0][price_data][unit_amount]": String(PRICE),
    "line_items[0][price_data][product_data][name]": `Małe Kroki — pełny dostęp na ${ACCESS_DAYS} dni`,
    customer_email: user.email,
    client_reference_id: user.id,
    "invoice_creation[enabled]": "true",
    locale: "pl",
    success_url: `${appUrl()}/app/premium?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/app/premium?anulowano=1`,
  });
  const s = await stripe("checkout/sessions", { method: "POST", body: b });
  return s.url as string;
}

async function nextReceiptNo() {
  const year = new Date().getFullYear();
  const n = (await db.payment.count({ where: { receiptNo: { startsWith: `MK/${year}/` } } })) + 1;
  return `MK/${year}/${String(n).padStart(5, "0")}`;
}

/** Records a paid payment once (idempotent by providerRef) and extends access. */
export async function grantAccess(userId: string, amount: number, method: string, providerRef: string | null) {
  if (providerRef && (await db.payment.findUnique({ where: { providerRef } }))) return;
  const u = await db.user.findUnique({ where: { id: userId } });
  if (!u) return;
  const from = u.premiumUntil && u.premiumUntil > new Date() ? u.premiumUntil : new Date();
  const until = new Date(from.getTime() + ACCESS_DAYS * 86400000);
  await db.$transaction([
    db.payment.create({ data: { userId, amount, method, status: "paid", providerRef, receiptNo: await nextReceiptNo() } }),
    db.user.update({ where: { id: userId }, data: { premiumUntil: until } }),
  ]);
}

/** Called on return from Stripe (so it works even before the webhook is configured). */
export async function confirmCheckout(sessionId: string, userId: string) {
  const s = await stripe(`checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=payment_intent`);
  if (s.client_reference_id !== userId || s.payment_status !== "paid") return false;
  const method = s.payment_intent?.payment_method_types?.[0] ?? "blik";
  await grantAccess(userId, s.amount_total, method, s.id);
  return true;
}

export function verifyStripeSignature(raw: string, header: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = parts.t;
  if (!t || Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${raw}`).digest("hex");
  return header
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .some((p) => {
      const sig = Buffer.from(p.slice(3), "hex");
      const exp = Buffer.from(expected, "hex");
      return sig.length === exp.length && crypto.timingSafeEqual(sig, exp);
    });
}

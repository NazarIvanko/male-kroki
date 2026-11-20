import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";
import { appUrl } from "@/lib/config";

export async function GET(req: NextRequest) {
  const fail = () => NextResponse.redirect(`${appUrl()}/logowanie?e=google`);
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (!code || !state || state !== req.cookies.get("g_state")?.value) return fail();

  // Token comes straight from Google over HTTPS, so the id_token can be decoded without re-verifying.
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${appUrl()}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!r.ok) return fail();
  const { id_token } = await r.json();
  const claims = decodeJwt(id_token) as { sub: string; email?: string; email_verified?: boolean; name?: string; given_name?: string };
  if (!claims.email || !claims.email_verified) return fail();

  const email = claims.email.toLowerCase();
  let user = await db.user.findFirst({ where: { OR: [{ googleId: claims.sub }, { email }] } });
  if (!user) {
    user = await db.user.create({
      data: { email, name: claims.given_name || claims.name || "Rodzic", googleId: claims.sub, consentAt: new Date() },
    });
  } else if (!user.googleId) {
    user = await db.user.update({ where: { id: user.id }, data: { googleId: claims.sub } });
  }
  await createSession(user.id);
  const res = NextResponse.redirect(`${appUrl()}/app`);
  res.cookies.delete("g_state");
  return res;
}

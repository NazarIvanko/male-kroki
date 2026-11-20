import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { appUrl, googleEnabled } from "@/lib/config";

export async function GET() {
  if (!googleEnabled()) return NextResponse.redirect(`${appUrl()}/logowanie`);
  const state = crypto.randomBytes(16).toString("hex");
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${appUrl()}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${p}`);
  res.cookies.set("g_state", state, { httpOnly: true, sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}

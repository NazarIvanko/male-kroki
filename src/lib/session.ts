import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

const COOKIE = "mk_session";
const key = () => new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (!payload.sub) return null;
    return await db.user.findUnique({ where: { id: payload.sub } });
  } catch {
    return null;
  }
}

export async function requireUser() {
  const u = await currentUser();
  if (!u) redirect("/logowanie");
  return u;
}

export async function requireAdmin() {
  const u = await requireUser();
  if (u.role !== "ADMIN") redirect("/app");
  return u;
}

export function isPremium(u: { premiumUntil: Date | null; role: string }) {
  return u.role === "ADMIN" || (!!u.premiumUntil && u.premiumUntil > new Date());
}

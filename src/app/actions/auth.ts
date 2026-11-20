"use server";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";
import { sendMail } from "@/lib/mail";
import { appUrl } from "@/lib/config";

export type FormState = { error?: string; ok?: string; values?: Record<string, string> } | undefined;

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function register(_: FormState, f: FormData): Promise<FormState> {
  const name = str(f, "name");
  const email = str(f, "email").toLowerCase();
  const password = String(f.get("password") ?? "");
  const values = { name, email };
  const err = (error: string) => ({ error, values });
  if (!name) return err("Podaj swoje imię.");
  if (!emailOk(email)) return err("Nieprawidłowy adres e-mail.");
  if (password.length < 8) return err("Hasło musi mieć co najmniej 8 znaków.");
  if (f.get("adult") !== "on") return err("Konto może założyć tylko osoba dorosła (rodzic lub opiekun).");
  if (f.get("consent") !== "on") return err("Potrzebujemy Twojej zgody na przetwarzanie danych.");
  if (await db.user.findUnique({ where: { email } })) return err("Konto z tym adresem już istnieje. Zaloguj się.");

  const user = await db.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10), consentAt: new Date() },
  });
  await createSession(user.id);
  redirect("/app");
}

export async function login(_: FormState, f: FormData): Promise<FormState> {
  const email = str(f, "email").toLowerCase();
  const password = String(f.get("password") ?? "");
  const user = await db.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Nieprawidłowy e-mail lub hasło.", values: { email } };
  }
  await createSession(user.id);
  redirect(user.role === "ADMIN" ? "/admin" : "/app");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

const hash = (t: string) => crypto.createHash("sha256").update(t).digest("hex");

export async function requestReset(_: FormState, f: FormData): Promise<FormState> {
  const email = str(f, "email").toLowerCase();
  const user = emailOk(email) ? await db.user.findUnique({ where: { email } }) : null;
  if (user) {
    const token = crypto.randomBytes(32).toString("base64url");
    await db.resetToken.create({
      data: { tokenHash: hash(token), userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    await sendMail(
      user.email,
      "Małe Kroki — ustaw nowe hasło",
      `Cześć ${user.name}!\n\nAby ustawić nowe hasło, kliknij link (ważny 1 godzinę):\n${appUrl()}/reset-hasla/${token}\n\nJeśli to nie Ty, zignoruj tę wiadomość.`
    );
  }
  // Same answer whether or not the account exists (doesn't reveal who is registered)
  return { ok: "Jeśli konto istnieje, wysłaliśmy link do zmiany hasła. Sprawdź skrzynkę." };
}

export async function resetPassword(_: FormState, f: FormData): Promise<FormState> {
  const token = String(f.get("token") ?? "");
  const password = String(f.get("password") ?? "");
  if (password.length < 8) return { error: "Hasło musi mieć co najmniej 8 znaków." };
  const rt = await db.resetToken.findUnique({ where: { tokenHash: hash(token) } });
  if (!rt || rt.usedAt || rt.expiresAt < new Date()) return { error: "Link wygasł lub został już użyty. Poproś o nowy." };
  await db.$transaction([
    db.user.update({ where: { id: rt.userId }, data: { passwordHash: await bcrypt.hash(password, 10) } }),
    db.resetToken.update({ where: { id: rt.id }, data: { usedAt: new Date() } }),
  ]);
  await createSession(rt.userId);
  redirect("/app");
}

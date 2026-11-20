"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser, isPremium, destroySession } from "@/lib/session";

async function canOpen(userId: string, dayId: string) {
  const [u, d] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.day.findUnique({ where: { id: dayId } }),
  ]);
  return !!u && !!d && d.published && (d.isFree || isPremium(u));
}

export async function toggleDone(dayId: string) {
  const u = await requireUser();
  if (!(await canOpen(u.id, dayId))) return;
  const key = { userId_dayId: { userId: u.id, dayId } };
  const existing = await db.progress.findUnique({ where: key });
  if (existing) await db.progress.delete({ where: key });
  else await db.progress.create({ data: { userId: u.id, dayId } });
  revalidatePath("/app", "layout");
}

export async function toggleFavorite(dayId: string) {
  const u = await requireUser();
  const key = { userId_dayId: { userId: u.id, dayId } };
  const existing = await db.favorite.findUnique({ where: key });
  if (existing) await db.favorite.delete({ where: key });
  else await db.favorite.create({ data: { userId: u.id, dayId } });
  revalidatePath("/app", "layout");
}

export async function saveChild(f: FormData) {
  const u = await requireUser();
  const childName = String(f.get("childName") ?? "").trim().slice(0, 30) || null;
  const childAge = String(f.get("childAge") ?? "") || null;
  await db.user.update({ where: { id: u.id }, data: { childName, childAge } });
  revalidatePath("/app", "layout");
}

export async function deleteAccount(f: FormData) {
  const u = await requireUser();
  if (String(f.get("confirm") ?? "").trim().toUpperCase() !== "USUŃ") return;
  if (u.role === "ADMIN") return;
  await db.user.delete({ where: { id: u.id } }); // cascades: progress, favorites, payments, tokens
  await destroySession();
  redirect("/?usunieto=1");
}

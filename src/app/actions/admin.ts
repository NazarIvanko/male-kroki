"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export type AdminState = { error?: string } | undefined;

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const AUDIO_TYPES: Record<string, string> = { "audio/mpeg": ".mp3", "audio/mp4": ".m4a", "audio/x-m4a": ".m4a", "audio/wav": ".wav", "audio/ogg": ".ogg", "audio/webm": ".webm" };

// Local disk storage. In production swap for Supabase Storage / S3 (same function signature).
async function saveAudio(file: File) {
  const ext = AUDIO_TYPES[file.type];
  if (!ext) throw new Error("Obsługiwane formaty audio: MP3, M4A, WAV, OGG.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Plik audio może mieć maksymalnie 20 MB.");
  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${crypto.randomUUID()}${ext}`;
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
async function removeAudio(url: string | null) {
  if (url?.startsWith("/uploads/")) await unlink(path.join(UPLOAD_DIR, path.basename(url))).catch(() => {});
}

export async function saveDay(_: AdminState, f: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = String(f.get("id") ?? "");
  const number = Number(f.get("number"));
  const title = String(f.get("title") ?? "").trim();
  const body = String(f.get("body") ?? "").replace(/\r/g, "").trim();
  if (!Number.isInteger(number) || number < 1) return { error: "Numer dnia musi być liczbą większą od zera." };
  if (!title) return { error: "Tytuł jest wymagany." };
  if (!body) return { error: "Dodaj przynajmniej jeden krok." };
  const clash = await db.day.findUnique({ where: { number } });
  if (clash && clash.id !== id) return { error: `Dzień ${number} już istnieje.` };

  const data = {
    number,
    title,
    body,
    summary: String(f.get("summary") ?? "").trim(),
    category: String(f.get("category") ?? "Zabawa").trim() || "Zabawa",
    emoji: String(f.get("emoji") ?? "🌱").trim() || "🌱",
    minutes: Math.max(1, Number(f.get("minutes")) || 15),
    isFree: f.get("isFree") === "on",
    published: f.get("published") === "on",
  };

  const existing = id ? await db.day.findUnique({ where: { id } }) : null;
  let audioUrl = existing?.audioUrl ?? null;
  try {
    const file = f.get("audio");
    if (file instanceof File && file.size > 0) {
      await removeAudio(audioUrl);
      audioUrl = await saveAudio(file);
    } else if (f.get("removeAudio") === "on") {
      await removeAudio(audioUrl);
      audioUrl = null;
    }
  } catch (e) {
    return { error: (e as Error).message };
  }

  if (existing) await db.day.update({ where: { id }, data: { ...data, audioUrl } });
  else await db.day.create({ data: { ...data, audioUrl } });
  revalidatePath("/", "layout");
  redirect("/admin?zapisano=1");
}

export async function deleteDay(id: string) {
  await requireAdmin();
  const d = await db.day.findUnique({ where: { id } });
  if (!d) return;
  await removeAudio(d.audioUrl);
  await db.day.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin");
}

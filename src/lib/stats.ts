import "server-only";
import { db } from "./db";

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export async function userStats(userId: string) {
  const [progress, total] = await Promise.all([
    db.progress.findMany({ where: { userId }, include: { day: true }, orderBy: { completedAt: "desc" } }),
    db.day.count({ where: { published: true } }),
  ]);
  const minutes = progress.reduce((s, p) => s + p.day.minutes, 0);

  // streak = consecutive calendar days (ending today or yesterday) with at least one completed activity
  const days = new Set(progress.map((p) => dayKey(p.completedAt)));
  let streak = 0;
  const d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (days.has(dayKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return { done: progress.length, total, minutes, streak, doneIds: new Set(progress.map((p) => p.dayId)) };
}

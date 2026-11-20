import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser, isPremium } from "@/lib/session";
import { userStats } from "@/lib/stats";
import { DayTile } from "@/components/DayTile";

export default async function Favs() {
  const u = await requireUser();
  const [favs, s] = await Promise.all([
    db.favorite.findMany({
      where: { userId: u.id, day: { published: true } },
      include: { day: true },
      orderBy: { day: { number: "asc" } },
    }),
    userStats(u.id),
  ]);
  return (
    <>
      <h1>Ulubione</h1>
      {favs.length === 0 ? (
        <div className="card stack">
          <p>Nie masz jeszcze ulubionych aktywności.</p>
          <Link href="/app/dni" className="btn soft">Przeglądaj plan</Link>
        </div>
      ) : (
        <div className="grid">
          {favs.map((f) => (
            <DayTile key={f.id} day={f.day} done={s.doneIds.has(f.dayId)} locked={!f.day.isFree && !isPremium(u)} />
          ))}
        </div>
      )}
    </>
  );
}

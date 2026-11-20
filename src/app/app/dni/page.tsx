import { db } from "@/lib/db";
import { requireUser, isPremium } from "@/lib/session";
import { userStats } from "@/lib/stats";
import { DayTile } from "@/components/DayTile";

export default async function Days() {
  const u = await requireUser();
  const premium = isPremium(u);
  const [s, days] = await Promise.all([
    userStats(u.id),
    db.day.findMany({ where: { published: true }, orderBy: { number: "asc" } }),
  ]);
  return (
    <>
      <h1>Plan aktywności</h1>
      <p className="muted">15 minut dziennie. Róbcie w swoim tempie — można wracać i powtarzać.</p>
      <div className="grid">
        {days.map((d) => (
          <DayTile key={d.id} day={d} done={s.doneIds.has(d.id)} locked={!d.isFree && !premium} />
        ))}
      </div>
    </>
  );
}

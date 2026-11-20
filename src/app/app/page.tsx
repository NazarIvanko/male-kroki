import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser, isPremium } from "@/lib/session";
import { userStats } from "@/lib/stats";
import { DayTile } from "@/components/DayTile";

export default async function Dashboard() {
  const u = await requireUser();
  const premium = isPremium(u);
  const [s, days] = await Promise.all([
    userStats(u.id),
    db.day.findMany({ where: { published: true }, orderBy: { number: "asc" } }),
  ]);
  const next = days.find((d) => !s.doneIds.has(d.id));
  const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
  const who = u.childName ? ` i ${u.childName}` : "";

  return (
    <div className="stack" style={{ maxWidth: 640 }}>
      <h1>Cześć, {u.name}{who}! 👋</h1>
      <div className="card stack">
        <div className="row spread">
          <b>Postęp programu</b>
          <span className="muted small">{s.done} / {s.total} dni</span>
        </div>
        <div className="bar" aria-label={`${pct}%`}><i style={{ width: `${pct}%` }} /></div>
        <div className="stats">
          <div className="stat"><b>🔥 {s.streak}</b><span>dni z rzędu</span></div>
          <div className="stat"><b>{s.done}</b><span>ukończone</span></div>
          <div className="stat"><b>{s.minutes}</b><span>minut razem</span></div>
        </div>
      </div>

      {next ? (
        <>
          <h2 style={{ marginTop: 24 }}>Na dziś</h2>
          <DayTile day={next} done={false} locked={!next.isFree && !premium} />
        </>
      ) : (
        <div className="card">
          <h2>🎉 Ukończyliście cały program!</h2>
          <p className="muted">Wkrótce dodamy nowe aktywności.</p>
        </div>
      )}

      {!premium && (
        <div className="card stack" style={{ background: "var(--brand-soft)" }}>
          <b>Pierwsze 3 dni są za darmo.</b>
          <p className="small" style={{ margin: 0 }}>
            Odblokuj cały program na rok — jedna płatność BLIK, bez subskrypcji.
          </p>
          <Link href="/app/premium" className="btn">Odblokuj pełny dostęp</Link>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser, isPremium } from "@/lib/session";
import { toggleDone, toggleFavorite } from "@/app/actions/progress";
import { Submit } from "@/components/Submit";

export default async function DayPage({ params }: { params: Promise<{ n: string }> }) {
  const u = await requireUser();
  const number = Number((await params).n);
  const day = Number.isInteger(number) ? await db.day.findUnique({ where: { number } }) : null;
  if (!day || !day.published) notFound();

  const [done, fav, prev, next] = await Promise.all([
    db.progress.findUnique({ where: { userId_dayId: { userId: u.id, dayId: day.id } } }),
    db.favorite.findUnique({ where: { userId_dayId: { userId: u.id, dayId: day.id } } }),
    db.day.findFirst({ where: { number: { lt: number }, published: true }, orderBy: { number: "desc" } }),
    db.day.findFirst({ where: { number: { gt: number }, published: true }, orderBy: { number: "asc" } }),
  ]);
  const locked = !day.isFree && !isPremium(u);

  return (
    <article className="stack" style={{ maxWidth: 640 }}>
      <Link href="/app/dni" className="small muted">← Wszystkie dni</Link>
      <div className="row">
        <span style={{ fontSize: "2.6rem" }} aria-hidden>{day.emoji}</span>
        <div>
          <p className="small muted" style={{ margin: 0, fontWeight: 700 }}>
            Dzień {day.number} · {day.category} · {day.minutes} min
          </p>
          <h1 style={{ margin: 0 }}>{day.title}</h1>
        </div>
      </div>
      <p className="muted">{day.summary}</p>

      {locked ? (
        <div className="card stack" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem" }}>🔒</div>
          <b>Ten dzień jest w pełnej wersji</b>
          <p className="small muted">Odblokuj wszystkie aktywności, nagrania audio i nowe dni dodawane co miesiąc.</p>
          <Link href="/app/premium" className="btn">Odblokuj za pomocą BLIK</Link>
        </div>
      ) : (
        <>
          {day.audioUrl && (
            <div className="card stack">
              <b>🎧 Posłuchajcie razem</b>
              <audio controls preload="none" src={day.audioUrl} />
            </div>
          )}
          <div className="card">
            <ol className="steps">
              {day.body.split("\n").filter(Boolean).map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>
          <div className="row">
            <form action={toggleDone.bind(null, day.id)} style={{ flex: 1 }}>
              <Submit className={`btn block ${done ? "ghost" : "green"}`}>
                {done ? "✓ Ukończone — cofnij" : "Oznacz jako ukończone"}
              </Submit>
            </form>
            <form action={toggleFavorite.bind(null, day.id)}>
              <Submit className="btn ghost" pending="…">{fav ? "❤️ W ulubionych" : "🤍 Do ulubionych"}</Submit>
            </form>
          </div>
        </>
      )}

      <div className="row spread" style={{ marginTop: 16 }}>
        {prev ? <Link className="btn ghost sm" href={`/app/dni/${prev.number}`}>← Dzień {prev.number}</Link> : <span />}
        {next && <Link className="btn ghost sm" href={`/app/dni/${next.number}`}>Dzień {next.number} →</Link>}
      </div>
    </article>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";
import { pln } from "@/lib/config";

export default async function Admin({ searchParams }: { searchParams: Promise<{ zapisano?: string }> }) {
  const { zapisano } = await searchParams;
  const [days, users, premium, revenue, done] = await Promise.all([
    db.day.findMany({ orderBy: { number: "asc" }, include: { _count: { select: { progress: true, favorites: true } } } }),
    db.user.count({ where: { role: "USER" } }),
    db.user.count({ where: { role: "USER", premiumUntil: { gt: new Date() } } }),
    db.payment.aggregate({ _sum: { amount: true }, where: { status: "paid", method: { not: "demo" } } }),
    db.progress.count(),
  ]);

  return (
    <div className="stack">
      {zapisano && <div className="alert ok">Zapisano zmiany.</div>}
      <div className="stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
        <div className="stat"><b>{users}</b><span>użytkowników</span></div>
        <div className="stat"><b>{premium}</b><span>z pełnym dostępem</span></div>
        <div className="stat"><b>{pln(revenue._sum.amount ?? 0)}</b><span>przychód</span></div>
        <div className="stat"><b>{done}</b><span>ukończonych aktywności</span></div>
      </div>

      <div className="row spread" style={{ marginTop: 16 }}>
        <h1 style={{ margin: 0 }}>Dni programu</h1>
        <Link href="/admin/dni/nowy" className="btn">+ Dodaj dzień</Link>
      </div>
      <div className="card table-wrap" style={{ padding: 8 }}>
        <table>
          <thead><tr><th>Nr</th><th>Tytuł</th><th>Dostęp</th><th>Audio</th><th>Ukończeń</th><th></th></tr></thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.id} style={{ opacity: d.published ? 1 : 0.5 }}>
                <td>{d.number}</td>
                <td>{d.emoji} {d.title}{!d.published && <span className="badge" style={{ marginLeft: 6 }}>szkic</span>}</td>
                <td><span className={`badge ${d.isFree ? "free" : "premium"}`}>{d.isFree ? "darmowy" : "płatny"}</span></td>
                <td>{d.audioUrl ? "🎧" : "—"}</td>
                <td>{d._count.progress}</td>
                <td><Link href={`/admin/dni/${d.id}`}>Edytuj</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

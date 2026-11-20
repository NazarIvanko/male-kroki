import Link from "next/link";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { Logo } from "@/components/Logo";
import { ACCESS_DAYS, PRICE, pln } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ usunieto?: string }> }) {
  const { usunieto } = await searchParams;
  const [u, preview] = await Promise.all([
    currentUser(),
    db.day.findMany({ where: { published: true }, orderBy: { number: "asc" }, take: 6 }),
  ]);

  return (
    <>
      <header className="topbar">
        <div className="wrap">
          <Logo />
          <div className="row" style={{ gap: 8 }}>
            {u ? (
              <Link href="/app" className="btn sm">Moje konto</Link>
            ) : (
              <>
                <Link href="/logowanie" className="btn ghost sm">Zaloguj</Link>
                <Link href="/rejestracja" className="btn sm">Zacznij</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="wrap">
        {usunieto && <div className="alert ok" style={{ marginTop: 16 }}>Twoje konto i dane zostały usunięte.</div>}
        <section className="hero">
          <div className="stack">
            <span className="badge free">Dla rodzin z dziećmi 4–8 lat</span>
            <h1>15 minut dziennie, które zbliżają</h1>
            <p className="muted" style={{ fontSize: "1.1rem" }}>
              Każdego dnia nowa, prosta aktywność do zrobienia razem z dzieckiem: liczenie, czytanie, eksperymenty i rozmowy
              o emocjach. Bez przygotowań, z tym co macie w domu.
            </p>
            <div className="row">
              <Link href="/rejestracja" className="btn">Wypróbuj 3 dni za darmo</Link>
              <a href="#cennik" className="btn ghost">Cennik</a>
            </div>
          </div>
          <div className="hero-art" aria-hidden>👨‍👧</div>
        </section>

        <section className="stack" style={{ marginTop: 24 }}>
          <h2>Jak to działa</h2>
          <div className="grid">
            <div className="card"><b>1. Otwórz dzień</b><p className="muted small" style={{ margin: 0 }}>Krótka instrukcja krok po kroku i nagranie audio.</p></div>
            <div className="card"><b>2. Zróbcie to razem</b><p className="muted small" style={{ margin: 0 }}>10–20 minut wspólnej zabawy, bez ekranu dla dziecka.</p></div>
            <div className="card"><b>3. Odhacz i zbieraj serie</b><p className="muted small" style={{ margin: 0 }}>Postępy zapisują się na koncie — na telefonie i komputerze.</p></div>
          </div>
        </section>

        <section className="stack" style={{ marginTop: 40 }}>
          <h2>Przykładowe dni</h2>
          <div className="grid">
            {preview.map((d) => (
              <div key={d.id} className="card day">
                <div className="em" aria-hidden>{d.emoji}</div>
                <div>
                  <p className="small" style={{ fontWeight: 700 }}>Dzień {d.number} · {d.category}</p>
                  <h3>{d.title}</h3>
                  <p>{d.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="cennik" className="card stack" style={{ marginTop: 40, maxWidth: 520 }}>
          <h2>Cennik</h2>
          <div className="price">{pln(PRICE)}</div>
          <p className="muted" style={{ margin: 0 }}>jednorazowo za {ACCESS_DAYS} dni pełnego dostępu · płatność BLIK lub kartą · bez subskrypcji</p>
          <Link href="/rejestracja" className="btn">Zacznij od 3 darmowych dni</Link>
        </section>
      </main>

      <footer className="site">
        <div className="wrap row spread">
          <span>© {new Date().getFullYear()} Małe Kroki · projekt demonstracyjny</span>
          <Link href="/prywatnosc">Polityka prywatności</Link>
        </div>
      </footer>
    </>
  );
}

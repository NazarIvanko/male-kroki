import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser, isPremium } from "@/lib/session";
import { saveChild, deleteAccount } from "@/app/actions/progress";
import { logout } from "@/app/actions/auth";
import { pln } from "@/lib/config";
import { Submit } from "@/components/Submit";

export default async function Account() {
  const u = await requireUser();
  const payments = await db.payment.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="stack" style={{ maxWidth: 640 }}>
      <h1>Konto</h1>

      <section className="card stack">
        <h2>Twoje dane</h2>
        <p style={{ margin: 0 }}><b>{u.name}</b> · {u.email}</p>
        <p className="small muted" style={{ margin: 0 }}>
          Dostęp: {isPremium(u) ? (u.role === "ADMIN" ? "administrator" : `pełny do ${u.premiumUntil!.toLocaleDateString("pl-PL")}`) : "wersja darmowa (3 dni)"}
          {!isPremium(u) && <> · <Link href="/app/premium">Odblokuj</Link></>}
        </p>
      </section>

      <section className="card stack">
        <h2>Profil dziecka</h2>
        <p className="small muted" style={{ margin: 0 }}>Opcjonalnie. Zapisujemy tylko imię lub pseudonim i przedział wieku — nic więcej.</p>
        <form action={saveChild} className="stack">
          <div><label htmlFor="childName">Imię lub pseudonim</label><input id="childName" name="childName" type="text" maxLength={30} defaultValue={u.childName ?? ""} /></div>
          <div>
            <label htmlFor="childAge">Wiek</label>
            <select id="childAge" name="childAge" defaultValue={u.childAge ?? ""}>
              <option value="">— nie podawaj —</option>
              <option value="3-4">3–4 lata</option>
              <option value="5-6">5–6 lat</option>
              <option value="7-8">7–8 lat</option>
              <option value="9+">9+ lat</option>
            </select>
          </div>
          <Submit className="btn soft">Zapisz</Submit>
        </form>
      </section>

      <section className="card stack">
        <h2>Płatności i paragony</h2>
        {payments.length === 0 ? (
          <p className="muted small" style={{ margin: 0 }}>Brak płatności.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Data</th><th>Kwota</th><th>Metoda</th><th></th></tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.createdAt.toLocaleDateString("pl-PL")}</td>
                    <td>{pln(p.amount)}</td>
                    <td>{p.method.toUpperCase()}</td>
                    <td><Link href={`/app/konto/paragon/${p.id}`}>Potwierdzenie</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card stack">
        <h2>Prywatność (RODO)</h2>
        <p className="small muted" style={{ margin: 0 }}>Możesz w każdej chwili pobrać swoje dane lub trwale usunąć konto.</p>
        <a className="btn ghost" href="/app/konto/eksport">Pobierz moje dane (JSON)</a>
        {u.role !== "ADMIN" && (
          <details>
            <summary style={{ cursor: "pointer", color: "var(--danger)", fontWeight: 600 }}>Usuń konto</summary>
            <form action={deleteAccount} className="stack" style={{ marginTop: 12 }}>
              <p className="small" style={{ margin: 0 }}>Usuniemy konto, postępy i ulubione. Tego nie można cofnąć. Wpisz <b>USUŃ</b>, aby potwierdzić.</p>
              <input name="confirm" type="text" autoComplete="off" aria-label="Potwierdzenie" />
              <Submit className="btn danger">Usuń konto na zawsze</Submit>
            </form>
          </details>
        )}
      </section>

      {u.role === "ADMIN" && <Link href="/admin" className="btn soft block">Panel administratora</Link>}
      <form action={logout}><Submit className="btn ghost block">Wyloguj się</Submit></form>
    </div>
  );
}

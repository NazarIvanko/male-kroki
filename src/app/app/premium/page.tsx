import Link from "next/link";
import { requireUser, isPremium } from "@/lib/session";
import { confirmCheckout } from "@/lib/payments";
import { startCheckout, demoPay } from "@/app/actions/pay";
import { ACCESS_DAYS, PRICE, pln, stripeEnabled } from "@/lib/config";
import { Submit } from "@/components/Submit";

export default async function Premium({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  let u = await requireUser();
  if (sp.session_id && stripeEnabled()) {
    if (await confirmCheckout(sp.session_id, u.id)) u = await requireUser();
  }
  const premium = isPremium(u);
  const stripe = stripeEnabled();

  if (premium) {
    return (
      <div className="card stack" style={{ maxWidth: 520 }}>
        <div style={{ fontSize: "2.6rem" }}>🎉</div>
        <h1>Masz pełny dostęp!</h1>
        <p className="muted">
          {u.role === "ADMIN" ? "Konto administratora." : `Ważny do ${u.premiumUntil!.toLocaleDateString("pl-PL")}.`}
          {sp.demo && " (Płatność testowa w trybie demo.)"}
        </p>
        <div className="row">
          <Link href="/app/dni" className="btn">Przejdź do planu</Link>
          <Link href="/app/konto" className="btn ghost">Paragony</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="stack" style={{ maxWidth: 520 }}>
      <h1>Pełny dostęp</h1>
      {sp.anulowano && <div className="alert err">Płatność została anulowana. Możesz spróbować ponownie.</div>}
      <div className="card stack">
        <div className="price">{pln(PRICE)}</div>
        <p className="muted" style={{ margin: 0 }}>jednorazowo · dostęp na {ACCESS_DAYS} dni · bez automatycznego odnawiania</p>
        <ul>
          <li>Wszystkie dni programu i nowe aktywności co miesiąc</li>
          <li>Nagrania audio do słuchania z dzieckiem</li>
          <li>Statystyki i historia postępów</li>
        </ul>
        {stripe ? (
          <form action={startCheckout}>
            <Submit>Zapłać BLIK-iem lub kartą</Submit>
          </form>
        ) : (
          <>
            <div className="alert ok small">
              Tryb demo: płatności Stripe nie są jeszcze podłączone. Przycisk poniżej symuluje udaną płatność BLIK.
            </div>
            <form action={demoPay}>
              <Submit>Symuluj płatność BLIK</Submit>
            </form>
          </>
        )}
        <p className="small muted" style={{ margin: 0 }}>
          Płatności obsługuje Stripe (BLIK, karty). Potwierdzenie i fakturę otrzymasz e-mailem.
        </p>
      </div>
    </div>
  );
}

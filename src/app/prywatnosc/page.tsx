import { Logo } from "@/components/Logo";

export default function Privacy() {
  return (
    <main className="narrow" style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}><Logo /></div>
      <div className="card stack">
        <h1>Polityka prywatności</h1>
        <div className="alert err small">
          Wzór do projektu demonstracyjnego. Przed uruchomieniem produkcyjnym tekst musi zostać sprawdzony i uzupełniony przez prawnika.
        </div>
        <h2>Kto jest administratorem danych</h2>
        <p>[Nazwa firmy, adres, NIP, e-mail kontaktowy].</p>
        <h2>Jakie dane zbieramy</h2>
        <ul>
          <li>Rodzic/opiekun: imię, e-mail, hasło (zaszyfrowane), historia płatności.</li>
          <li>Dziecko (opcjonalnie): wyłącznie imię lub pseudonim i przedział wieku. Nie zbieramy nazwisk, zdjęć ani lokalizacji dzieci.</li>
          <li>Postępy w programie: ukończone dni i ulubione aktywności.</li>
        </ul>
        <h2>Konto zakłada dorosły</h2>
        <p>Z usługi korzysta rodzic lub opiekun prawny, który wyraża zgodę na przetwarzanie danych w imieniu dziecka (art. 8 RODO).</p>
        <h2>Twoje prawa</h2>
        <p>W ustawieniach konta możesz pobrać wszystkie swoje dane i trwale usunąć konto. Masz też prawo do sprostowania danych i wniesienia skargi do Prezesa UODO.</p>
        <h2>Płatności</h2>
        <p>Płatności obsługuje Stripe Payments Europe Ltd. Nie przechowujemy danych kart ani kodów BLIK.</p>
      </div>
    </main>
  );
}

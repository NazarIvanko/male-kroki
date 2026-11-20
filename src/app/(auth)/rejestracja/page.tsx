import Link from "next/link";
import { RegisterForm } from "@/components/AuthForms";
import { GoogleButton } from "@/components/GoogleButton";

export default function Page() {
  return (
    <>
      <h1>Załóż konto rodzica</h1>
      <p className="muted small">Konto zakłada dorosły. Nie zbieramy danych osobowych dzieci — wystarczy imię lub pseudonim.</p>
      <GoogleButton />
      <RegisterForm />
      <p className="small muted">Masz już konto? <Link href="/logowanie">Zaloguj się</Link></p>
    </>
  );
}

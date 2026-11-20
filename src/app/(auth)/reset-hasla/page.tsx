import Link from "next/link";
import { RequestResetForm } from "@/components/AuthForms";

export default function Page() {
  const demo = !process.env.RESEND_API_KEY;
  return (
    <>
      <h1>Reset hasła</h1>
      <p className="muted">Podaj e-mail, a wyślemy link do ustawienia nowego hasła.</p>
      {demo && <p className="alert ok small">Tryb demo: zamiast e-maila link pojawi się w logach serwera.</p>}
      <RequestResetForm />
      <p className="small"><Link href="/logowanie">← Wróć do logowania</Link></p>
    </>
  );
}

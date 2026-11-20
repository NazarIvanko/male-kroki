import Link from "next/link";
import { LoginForm } from "@/components/AuthForms";
import { GoogleButton } from "@/components/GoogleButton";

export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return (
    <>
      <h1>Witaj ponownie</h1>
      {e && <div className="alert err">Logowanie przez Google nie powiodło się. Spróbuj ponownie.</div>}
      <GoogleButton />
      <LoginForm />
      <p className="small muted">Nie masz konta? <Link href="/rejestracja">Załóż je za darmo</Link></p>
    </>
  );
}

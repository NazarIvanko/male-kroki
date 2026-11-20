"use client";
import Link from "next/link";
import { useActionState } from "react";
import { login, register, requestReset, resetPassword, type FormState } from "@/app/actions/auth";
import { Submit } from "./Submit";

function Msg({ s }: { s: FormState }) {
  if (s?.error) return <div className="alert err" role="alert">{s.error}</div>;
  if (s?.ok) return <div className="alert ok" role="status">{s.ok}</div>;
  return null;
}

export function LoginForm() {
  const [s, act] = useActionState(login, undefined);
  return (
    <form action={act} className="stack">
      <Msg s={s} />
      <div><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required defaultValue={s?.values?.email} key={s?.values?.email} /></div>
      <div><label htmlFor="password">Hasło</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
      <Submit>Zaloguj się</Submit>
      <p className="small"><Link href="/reset-hasla">Nie pamiętasz hasła?</Link></p>
    </form>
  );
}

export function RegisterForm() {
  const [s, act] = useActionState(register, undefined);
  return (
    <form action={act} className="stack">
      <Msg s={s} />
      <div><label htmlFor="name">Imię rodzica / opiekuna</label><input id="name" name="name" type="text" autoComplete="given-name" required defaultValue={s?.values?.name} key={`n${s?.values?.name}`} /></div>
      <div><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required defaultValue={s?.values?.email} key={`e${s?.values?.email}`} /></div>
      <div><label htmlFor="password">Hasło (min. 8 znaków)</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required /></div>
      <label className="check"><input type="checkbox" name="adult" /> Jestem osobą pełnoletnią i rodzicem lub opiekunem dziecka.</label>
      <label className="check"><input type="checkbox" name="consent" /> <span>Zgadzam się na przetwarzanie moich danych zgodnie z <Link href="/prywatnosc" target="_blank">polityką prywatności</Link>.</span></label>
      <Submit>Załóż konto</Submit>
    </form>
  );
}

export function RequestResetForm() {
  const [s, act] = useActionState(requestReset, undefined);
  return (
    <form action={act} className="stack">
      <Msg s={s} />
      <div><label htmlFor="email">E-mail konta</label><input id="email" name="email" type="email" required /></div>
      <Submit>Wyślij link</Submit>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [s, act] = useActionState(resetPassword, undefined);
  return (
    <form action={act} className="stack">
      <Msg s={s} />
      <input type="hidden" name="token" value={token} />
      <div><label htmlFor="password">Nowe hasło (min. 8 znaków)</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required /></div>
      <Submit>Zapisz hasło</Submit>
    </form>
  );
}

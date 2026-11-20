"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/app", label: "Dziś", ico: "🏠" },
  { href: "/app/dni", label: "Plan", ico: "🗓️" },
  { href: "/app/ulubione", label: "Ulubione", ico: "❤️" },
  { href: "/app/konto", label: "Konto", ico: "👤" },
];

export function AppNav({ admin }: { admin: boolean }) {
  const path = usePathname();
  const on = (h: string) => (h === "/app" ? path === "/app" : path.startsWith(h));
  return (
    <>
      <nav className="topnav" aria-label="Menu">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className={on(i.href) ? "on" : ""}>{i.label}</Link>
        ))}
        {admin && <Link href="/admin">Panel</Link>}
      </nav>
      <nav className="tabbar" aria-label="Menu">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className={on(i.href) ? "on" : ""}>
            <span className="ico" aria-hidden>{i.ico}</span>
            {i.label}
          </Link>
        ))}
      </nav>
    </>
  );
}

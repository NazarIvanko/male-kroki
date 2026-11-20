import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      <header className="topbar">
        <div className="wrap">
          <div className="row" style={{ gap: 8 }}><Logo href="/admin" /><span className="badge">Panel</span></div>
          <nav className="topnav" style={{ display: "flex" }}>
            <Link href="/admin">Treści</Link>
            <Link href="/app">Aplikacja →</Link>
          </nav>
        </div>
      </header>
      <main className="wrap" style={{ padding: "24px 16px 64px" }}>{children}</main>
    </>
  );
}

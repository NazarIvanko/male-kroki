import { requireUser } from "@/lib/session";
import { Logo } from "@/components/Logo";
import { AppNav } from "@/components/AppNav";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const u = await requireUser();
  return (
    <>
      <header className="topbar">
        <div className="wrap">
          <Logo href="/app" />
          <AppNav admin={u.role === "ADMIN"} />
        </div>
      </header>
      <main className="wrap app-main">{children}</main>
    </>
  );
}

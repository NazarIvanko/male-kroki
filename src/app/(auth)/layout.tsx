import { Logo } from "@/components/Logo";
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="narrow">
      <div style={{ marginBottom: 24 }}><Logo /></div>
      <div className="card stack">{children}</div>
    </main>
  );
}

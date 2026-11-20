import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { pln } from "@/lib/config";
import { PrintButton } from "@/components/PrintButton";

export default async function Receipt({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser();
  const p = await db.payment.findUnique({ where: { id: (await params).id } });
  if (!p || p.userId !== u.id) notFound();
  return (
    <div className="card stack" style={{ maxWidth: 520 }}>
      <h1>Potwierdzenie płatności</h1>
      <p className="muted small" style={{ margin: 0 }}>Nr {p.receiptNo}</p>
      <table>
        <tbody>
          <tr><th>Data</th><td>{p.createdAt.toLocaleString("pl-PL")}</td></tr>
          <tr><th>Klient</th><td>{u.name}, {u.email}</td></tr>
          <tr><th>Usługa</th><td>Małe Kroki — dostęp do programu</td></tr>
          <tr><th>Kwota</th><td><b>{pln(p.amount)}</b></td></tr>
          <tr><th>Metoda</th><td>{p.method.toUpperCase()}</td></tr>
          <tr><th>Status</th><td>{p.status === "paid" ? "Opłacono" : p.status}</td></tr>
        </tbody>
      </table>
      <p className="small muted" style={{ margin: 0 }}>
        To potwierdzenie płatności, nie faktura VAT. Fakturę wystawia sprzedawca (np. automatycznie przez Stripe lub system Fakturownia).
      </p>
      <PrintButton />
    </div>
  );
}

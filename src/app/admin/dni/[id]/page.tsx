import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { deleteDay } from "@/app/actions/admin";
import { DayForm } from "@/components/DayForm";
import { Submit } from "@/components/Submit";

export default async function EditDay({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "nowy";
  const day = isNew ? undefined : await db.day.findUnique({ where: { id } });
  if (!isNew && !day) notFound();
  const last = await db.day.findFirst({ orderBy: { number: "desc" } });

  return (
    <div className="stack" style={{ maxWidth: 720 }}>
      <Link href="/admin" className="small muted">← Wszystkie dni</Link>
      <h1>{isNew ? "Nowy dzień" : `Edycja: dzień ${day!.number}`}</h1>
      <DayForm day={day ?? undefined} nextNumber={(last?.number ?? 0) + 1} />
      {day && (
        <form action={deleteDay.bind(null, day.id)}>
          <Submit className="btn danger">Usuń ten dzień</Submit>
        </form>
      )}
    </div>
  );
}

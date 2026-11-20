import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";

export async function GET() {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const data = await db.user.findUnique({
    where: { id: u.id },
    select: {
      email: true, name: true, createdAt: true, consentAt: true, childName: true, childAge: true, premiumUntil: true,
      progress: { select: { completedAt: true, day: { select: { number: true, title: true } } } },
      favorites: { select: { createdAt: true, day: { select: { number: true, title: true } } } },
      payments: { select: { createdAt: true, amount: true, currency: true, method: true, status: true, receiptNo: true } },
    },
  });
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="male-kroki-moje-dane.json"',
    },
  });
}

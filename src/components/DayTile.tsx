import Link from "next/link";
import type { Day } from "@prisma/client";

export function DayTile({ day, done, locked }: { day: Day; done: boolean; locked: boolean }) {
  return (
    <Link href={`/app/dni/${day.number}`} className={`card day${done ? " done" : ""}${locked ? " locked" : ""}`}>
      <div className="em" aria-hidden>{locked ? "🔒" : done ? "✅" : day.emoji}</div>
      <div style={{ minWidth: 0 }}>
        <p className="small" style={{ fontWeight: 700 }}>
          Dzień {day.number} · {day.category} · {day.minutes} min
        </p>
        <h3>{day.title}</h3>
        <p>{day.summary}</p>
      </div>
    </Link>
  );
}

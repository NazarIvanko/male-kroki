"use client";
import { useActionState } from "react";
import type { Day } from "@prisma/client";
import { saveDay } from "@/app/actions/admin";
import { Submit } from "./Submit";

export function DayForm({ day, nextNumber }: { day?: Day; nextNumber: number }) {
  const [s, act] = useActionState(saveDay, undefined);
  return (
    <form action={act} className="card stack">
      {s?.error && <div className="alert err" role="alert">{s.error}</div>}
      <input type="hidden" name="id" value={day?.id ?? ""} />
      <div className="row" style={{ alignItems: "flex-end" }}>
        <div style={{ width: 110 }}><label htmlFor="number">Dzień nr</label><input id="number" name="number" type="number" min={1} defaultValue={day?.number ?? nextNumber} required /></div>
        <div style={{ width: 90 }}><label htmlFor="emoji">Ikona</label><input id="emoji" name="emoji" type="text" defaultValue={day?.emoji ?? "🌱"} /></div>
        <div style={{ width: 110 }}><label htmlFor="minutes">Minuty</label><input id="minutes" name="minutes" type="number" min={1} defaultValue={day?.minutes ?? 15} /></div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label htmlFor="category">Kategoria</label>
          <input id="category" name="category" type="text" list="cats" defaultValue={day?.category ?? "Zabawa"} />
          <datalist id="cats"><option>Emocje</option><option>Matematyka</option><option>Język</option><option>Nauka</option><option>Logika</option><option>Zabawa</option></datalist>
        </div>
      </div>
      <div><label htmlFor="title">Tytuł</label><input id="title" name="title" type="text" defaultValue={day?.title} required /></div>
      <div><label htmlFor="summary">Krótki opis</label><input id="summary" name="summary" type="text" defaultValue={day?.summary} /></div>
      <div>
        <label htmlFor="body">Kroki (każdy w nowej linii)</label>
        <textarea id="body" name="body" defaultValue={day?.body} required />
      </div>
      <div className="stack">
        <label htmlFor="audio">Nagranie audio (MP3/M4A/WAV, do 20 MB)</label>
        {day?.audioUrl && (
          <>
            <audio controls src={day.audioUrl} preload="none" />
            <label className="check"><input type="checkbox" name="removeAudio" /> Usuń obecne nagranie</label>
          </>
        )}
        <input id="audio" name="audio" type="file" accept="audio/*" />
      </div>
      <label className="check"><input type="checkbox" name="isFree" defaultChecked={day?.isFree ?? false} /> Darmowy (dostępny bez płatności)</label>
      <label className="check"><input type="checkbox" name="published" defaultChecked={day?.published ?? true} /> Opublikowany (widoczny dla użytkowników)</label>
      <Submit>Zapisz</Submit>
    </form>
  );
}

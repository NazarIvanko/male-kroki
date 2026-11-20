"use client";
export function PrintButton() {
  return <button className="btn ghost" onClick={() => window.print()}>Drukuj / zapisz PDF</button>;
}

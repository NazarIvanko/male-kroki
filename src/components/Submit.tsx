"use client";
import { useFormStatus } from "react-dom";

export function Submit({ children, className = "btn block", pending = "Chwileczkę…" }: { children: React.ReactNode; className?: string; pending?: string }) {
  const { pending: p } = useFormStatus();
  return (
    <button className={className} disabled={p} type="submit">
      {p ? pending : children}
    </button>
  );
}

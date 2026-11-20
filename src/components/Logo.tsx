import Link from "next/link";
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="logo">
      <span aria-hidden>👣</span> Małe <span>Kroki</span>
    </Link>
  );
}

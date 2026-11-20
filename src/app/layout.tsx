import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const font = Nunito({ subsets: ["latin", "latin-ext"], variable: "--font" });

export const metadata: Metadata = {
  title: "Małe Kroki — 15 minut dziennie razem z dzieckiem",
  description: "Codzienne aktywności edukacyjne dla rodzin z dziećmi 4–8 lat.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#e2683c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={font.variable}>
      <body>{children}</body>
    </html>
  );
}

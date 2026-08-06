import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import DemoGate from "./components/DemoGate";
import Analytics from "./components/Analytics";

const fraunces = Fraunces({
  subsets: ["latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["italic"],
  weight: ["700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Metis",
  description: "Asystent bezpiecznej komunikacji w sprawie o opiekę nad dziećmi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${fraunces.variable} ${plusJakartaSans.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <Analytics />
        <DemoGate>{children}</DemoGate>
      </body>
    </html>
  );
}

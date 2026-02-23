import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "AI Olympics — Winter 2026",
  description: "5 AI models. 6 events. One champion. Watch them compete live.",
  openGraph: {
    title: "AI Olympics — Winter 2026",
    description: "5 AI models. 6 events. One champion.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={pixelFont.variable}>
      <body
        className="scanlines"
        style={{
          background: "#000",
          color: "#fff",
          fontFamily: "'Press Start 2P', monospace",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DevCompanion AI — Autonomous Bug-to-Verified-Fix Loop",
  description: "An autonomous, deterministic MCP server with millisecond-precise replay and event-sourced proof. Don't trust the agent. Audit it.",
  keywords: ["MCP", "AI Agents", "XState", "Autonomous Coding", "Amazon Hackathon"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} min-h-full flex flex-col selection:bg-emerald-500/30`}
      >
        {children}
      </body>
    </html>
  );
}
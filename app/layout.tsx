import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GilangAI Generator",
  description: "AI content generator untuk bisnis dan kreator.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

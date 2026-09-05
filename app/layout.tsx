import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gilang AI — AI Creative Studio",
  description: "Workspace AI untuk membuat konten, foto, dan video.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

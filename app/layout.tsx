import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "National Automobile Olympiad 2026",
  description: "Official support — National Automobile Olympiad 2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

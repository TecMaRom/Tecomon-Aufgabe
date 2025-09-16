import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Widgets Dashboard",
  description: "Frontend dashboard for weather widgets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parcarna",
  description: "Discover your personality through arcana, creativity, and play.",
  icons: {
    icon: "/assets/favicon.svg",
    shortcut: "/assets/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

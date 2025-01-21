import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ポケポケ風3Dカード",
  description: "ポケポケで使われているカードのUIを再現しました。",
  openGraph: {
    title: "ポケポケ風3Dカード",
    description: "ポケポケで使われているカードのUIを再現しました。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ポケポケ風3Dカード",
    description: "ポケポケで使われているカードのUIを再現しました。",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen overflow-hidden">{children}</body>
    </html>
  );
}

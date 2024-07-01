import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from 'sonner'

import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solana Wallet",
  description: "A wallet for Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="text-xl bg-slate-800 text-white">
      <body className={montserrat.className}>
        <Toaster position="top-right" richColors />
        <main className="min-h-screen mx-auto p-4 max-w-xl">{children}</main>
      </body>
    </html>
  );
}

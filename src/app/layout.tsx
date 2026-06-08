import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "KulkasPintar AI - Smart Fridge Inventory & Recipe Generator",
  description: "Reduce food waste. Track inventory. Cook smarter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full`}>
      <body className="h-full flex flex-col overflow-hidden bg-[#FAF9F5] text-slate-850 antialiased">
        {children}
      </body>
    </html>
  );
}


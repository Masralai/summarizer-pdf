import type { Metadata } from "next";
import { Syne, Geist_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Summarizer PDF | Precision Analysis",
  description: "High-precision PDF summarization using advanced algorithms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${syne.variable} ${geistMono.variable} antialiased bg-background text-foreground selection:bg-[#0F766E]/30 selection:text-[#0F766E] font-sans`}
      >
        {children}
      </body>
    </html>
  );
}

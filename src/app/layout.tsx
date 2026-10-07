import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-hind",
});

export const metadata: Metadata = {
  title: "Tour Plan (ট্যুর প্ল্যান) — ভ্রমণ ম্যাপ ও ট্যুর প্র্যাঙ্ক",
  description:
    "বাংলাদেশের যে জেলাগুলোতে ভ্রমণ করেছেন সেগুলো নির্বাচন করে নিজের পার্সোনালাইজড ভ্রমণ ম্যাপ তৈরি করুন অথবা বন্ধুদের ট্যুর ক্যান্সেলের স্ট্যাম্প পেপার বানান।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} antialiased`}>
      <body className="font-sans min-h-screen bg-[#faf7f2] text-foreground">
        {children}
      </body>
    </html>
  );
}

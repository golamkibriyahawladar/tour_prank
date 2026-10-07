import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-hind",
});

export const metadata: Metadata = {
  title: "দেশ ঘুরি — বাংলাদেশ ভ্রমণ ম্যাপ ও বিশ্ব মানচিত্র",
  description:
    "বাংলাদেশের যে জেলাগুলোতে ভ্রমণ করেছেন সেগুলো নির্বাচন করে নিজের পার্সোনালাইজড ভ্রমণ ম্যাপ তৈরি করুন এবং এইচডি কোয়ালিটি ছবি ডাউনলোড করুন।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} antialiased`}>
      <body className="font-sans min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-foreground">
        {children}
      </body>
    </html>
  );
}

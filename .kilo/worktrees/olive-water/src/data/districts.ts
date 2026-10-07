import rawDistricts from "./bangladesh_districts.json";
import rawMeta from "./bangladesh_meta.json";
import { District, Division } from "@/types";

export const BANGLADESH_WIDTH = rawDistricts.w; // 600
export const BANGLADESH_HEIGHT = rawDistricts.h; // 872

export const BN_NAMES: Record<string, string> = rawMeta.BN || {};
export const DIV_BN: Record<string, string> = rawMeta.DIV_BN || {};

export const DIVISIONS: Division[] = [
  { key: "Dhaka", nameEn: "Dhaka", nameBn: "ঢাকা" },
  { key: "Chattogram", nameEn: "Chattogram", nameBn: "চট্টগ্রাম" },
  { key: "Sylhet", nameEn: "Sylhet", nameBn: "সিলেট" },
  { key: "Barishal", nameEn: "Barishal", nameBn: "বরিশাল" },
  { key: "Khulna", nameEn: "Khulna", nameBn: "খুলনা" },
  { key: "Rajshahi", nameEn: "Rajshahi", nameBn: "রাজশাহী" },
  { key: "Rangpur", nameEn: "Rangpur", nameBn: "রংপুর" },
  { key: "Mymensingh", nameEn: "Mymensingh", nameBn: "ময়মনসিংহ" },
];

export const DISTRICTS: District[] = (rawDistricts.f as any[]).map((d) => ({
  n: d.n,
  dv: d.dv,
  d: d.d,
  c: d.c as [number, number],
  nameBn: BN_NAMES[d.n] || d.n,
  divisionBn: DIV_BN[d.dv] || d.dv,
}));

export const DISTRICTS_BY_DIVISION = DIVISIONS.reduce<Record<string, District[]>>((acc, div) => {
  acc[div.key] = DISTRICTS.filter((d) => d.dv === div.key);
  return acc;
}, {});

export function toBanglaNum(n: number | string): string {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/\d/g, (digit) => bnDigits[parseInt(digit, 10)]);
}

export function getTravelerTitle(count: number): { title: string; desc: string; badge: string } {
  if (count === 0) {
    return {
      title: "ভ্রমণ শুরু করুন",
      desc: "যেসব জেলায় গিয়েছেন সেগুলো নির্বাচন করুন",
      badge: "নতুন পরিব্রাজক",
    };
  }
  if (count <= 5) {
    return {
      title: "শখের ভ্রমণকারী",
      desc: "ভ্রমণের চমৎকার এক সূচনা! সামনে আরও অনেক সুন্দর জায়গা অপেক্ষা করছে।",
      badge: "শখের ট্রাভেলার",
    };
  }
  if (count <= 15) {
    return {
      title: "অভিযাত্রী (Explorer)",
      desc: "বেশ কিছু জেলা ঘুরে ফেলেছেন! দেশের রূপ দেখার আগ্রহ সত্যি প্রশংসনীয়।",
      badge: "অভিযাত্রী",
    };
  }
  if (count <= 30) {
    return {
      title: "দেশপ্রেমী ট্রাভেলার",
      desc: "অসাধারণ! বাংলাদেশের প্রায় অর্ধেকের কাছাকাছি সৌন্দর্য আপনার পদচিহ্নে মুগ্ধ।",
      badge: "ঘুরনপাক ট্রাভেলার",
    };
  }
  if (count <= 50) {
    return {
      title: "মাস্টার এক্সপ্লোরার",
      desc: "বিস্ময়কর সাফল্য! দেশের অধিকাংশ জেলা আপনার পদতলে।",
      badge: "মাস্টার ট্রাভেলার",
    };
  }
  return {
    title: "বাংলাদেশ বিজয়ী (Legend)",
    desc: "অবিশ্বাস্য! আপনি সম্পূর্ণ বাংলাদেশ ঘুরেছেন। আপনার জন্য স্যালুট!",
    badge: "লিজেন্ডারি ট্রাভেলার",
  };
}

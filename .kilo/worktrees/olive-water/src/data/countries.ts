import rawWorld from "./world_countries.json";
import { WorldCountry } from "@/types";

export const WORLD_WIDTH = rawWorld.w || 1000;
export const WORLD_HEIGHT = rawWorld.h || 444.7;

export const CONTINENTS = [
  { key: "as", nameEn: "Asia", nameBn: "এশিয়া" },
  { key: "eu", nameEn: "Europe", nameBn: "ইউরোপ" },
  { key: "af", nameEn: "Africa", nameBn: "আফ্রিকা" },
  { key: "na", nameEn: "North America", nameBn: "উত্তর আমেরিকা" },
  { key: "sa", nameEn: "South America", nameBn: "দক্ষিণ আমেরিকা" },
  { key: "oc", nameEn: "Oceania", nameBn: "ওশেনিয়া" },
];

export const COUNTRIES: WorldCountry[] = (rawWorld.f as any[]).map((c) => ({
  i: c.i,
  n: c.n,
  b: c.b,
  ct: c.ct,
  d: c.d,
}));

export const COUNTRIES_BY_CONTINENT = CONTINENTS.reduce<Record<string, WorldCountry[]>>((acc, cont) => {
  acc[cont.key] = COUNTRIES.filter((c) => c.ct === cont.key);
  return acc;
}, {});

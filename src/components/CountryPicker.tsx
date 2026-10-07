"use client";

import React, { useState, useMemo } from "react";
import { COUNTRIES, CONTINENTS } from "@/data/countries";
import { toBanglaNum } from "@/data/districts";
import { MapTheme } from "@/types";
import { Search, Check, X, Square } from "lucide-react";

interface Props {
  selectedCountries: Set<string>;
  onToggleCountry: (code: string) => void;
  onClearAll: () => void;
  theme: MapTheme;
}

export default function CountryPicker({
  selectedCountries,
  onToggleCountry,
  onClearAll,
  theme,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.b.includes(q) ||
        c.n.toLowerCase().includes(q) ||
        c.i.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-sm flex flex-col h-[740px]">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h2 className="text-lg font-bold text-foreground">যেসব দেশে গিয়েছি</h2>
          <p className="text-xs text-muted-foreground mt-0.5">দেশ নির্বাচন করুন</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
          <span>{toBanglaNum(selectedCountries.size)}</span>
          <span>/</span>
          <span>১৯৪</span>
        </div>
      </div>

      <div className="relative mt-3.5 mb-2.5">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="দেশ খুঁজুন (বাংলা বা English)..."
          className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-border bg-muted/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-end text-xs py-1.5 mb-2 px-1">
        <button
          onClick={onClearAll}
          className="text-muted-foreground hover:text-rose-600 hover:underline font-medium flex items-center gap-1"
        >
          <Square className="w-3.5 h-3.5" /> সব মুছুন
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
        {CONTINENTS.map((cont) => {
          const contCountries = filteredCountries.filter((c) => c.ct === cont.key);
          if (contCountries.length === 0) return null;

          const totalInCont = COUNTRIES.filter((c) => c.ct === cont.key).length;
          const selectedInCont = contCountries.filter((c) => selectedCountries.has(c.i)).length;

          return (
            <div key={cont.key} className="space-y-2">
              <div className="flex items-center justify-between sticky top-0 bg-white/95 py-1 z-10 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                    {cont.nameBn}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {toBanglaNum(selectedInCont)}/{toBanglaNum(totalInCont)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {contCountries.map((country) => {
                  const isSelected = selectedCountries.has(country.i);
                  return (
                    <button
                      key={country.i}
                      onClick={() => onToggleCountry(country.i)}
                      style={
                        isSelected
                          ? {
                              backgroundColor: theme.v1,
                              color: "#ffffff",
                              borderColor: theme.v1,
                            }
                          : {}
                      }
                      className={`text-xs px-2.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1 border select-none ${
                        isSelected
                          ? "shadow-sm scale-[1.02]"
                          : "bg-muted/40 hover:bg-muted border-border/80 text-foreground/80 hover:text-foreground"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                      <span>{country.b}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

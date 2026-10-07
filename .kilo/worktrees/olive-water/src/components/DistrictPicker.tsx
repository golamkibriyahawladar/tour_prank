"use client";

import React, { useState, useMemo } from "react";
import { DISTRICTS, DIVISIONS, toBanglaNum } from "@/data/districts";
import { MapTheme } from "@/types";
import { Search, Check, X, CheckSquare, Square } from "lucide-react";

interface Props {
  selectedDistricts: Set<string>;
  onToggleDistrict: (name: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onSelectDivision: (divisionKey: string, selectAll: boolean) => void;
  theme: MapTheme;
}

export default function DistrictPicker({
  selectedDistricts,
  onToggleDistrict,
  onSelectAll,
  onClearAll,
  onSelectDivision,
  theme,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredDistricts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DISTRICTS;
    return DISTRICTS.filter(
      (d) =>
        d.nameBn.includes(q) ||
        d.n.toLowerCase().includes(q) ||
        d.dv.toLowerCase().includes(q) ||
        d.divisionBn.includes(q)
    );
  }, [search]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-border rounded-2xl p-5 shadow-sm flex flex-col h-[740px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h2 className="text-lg font-bold text-foreground">যেসব জেলায় গিয়েছি</h2>
          <p className="text-xs text-muted-foreground mt-0.5">ক্লিক করে জেলা চিহ্নিত করুন</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span>{toBanglaNum(selectedDistricts.size)}</span>
          <span>/</span>
          <span>৬৪</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mt-3.5 mb-2.5">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="জেলা খুঁজুন (বাংলা বা English)..."
          className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-border bg-muted/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
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

      {/* Quick Action Tools */}
      <div className="flex items-center justify-between text-xs py-1.5 mb-2 px-1">
        <button
          onClick={onSelectAll}
          className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
        >
          <CheckSquare className="w-3.5 h-3.5" /> সব বাছাই করুন
        </button>
        <button
          onClick={onClearAll}
          className="text-muted-foreground hover:text-rose-600 hover:underline font-medium flex items-center gap-1"
        >
          <Square className="w-3.5 h-3.5" /> সব মুছুন
        </button>
      </div>

      {/* Division Groups Scrollable */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
        {DIVISIONS.map((div) => {
          const divDistricts = filteredDistricts.filter((d) => d.dv === div.key);
          if (divDistricts.length === 0) return null;

          const totalInDiv = DISTRICTS.filter((d) => d.dv === div.key).length;
          const selectedInDiv = divDistricts.filter((d) => selectedDistricts.has(d.n)).length;
          const allSelectedInDiv = selectedInDiv === totalInDiv;

          return (
            <div key={div.key} className="space-y-2">
              <div className="flex items-center justify-between sticky top-0 bg-white/95 dark:bg-zinc-900/95 py-1 z-10 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                    {div.nameBn} বিভাগ
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {toBanglaNum(selectedInDiv)}/{toBanglaNum(totalInDiv)}
                  </span>
                </div>
                <button
                  onClick={() => onSelectDivision(div.key, !allSelectedInDiv)}
                  className="text-[11px] font-medium text-muted-foreground hover:text-emerald-600 transition"
                >
                  {allSelectedInDiv ? "মুছুন" : "সব বাছাই"}
                </button>
              </div>

              {/* District Chips */}
              <div className="flex flex-wrap gap-1.5">
                {divDistricts.map((district) => {
                  const isSelected = selectedDistricts.has(district.n);
                  return (
                    <button
                      key={district.n}
                      onClick={() => onToggleDistrict(district.n)}
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
                      <span>{district.nameBn}</span>
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

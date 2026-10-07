"use client";

import React, { useState, useMemo } from "react";
import { DISTRICTS, toBanglaNum } from "@/data/districts";
import { CANCEL_EXCUSES, POPULAR_CANCEL_PLANS, FUNNY_QUOTES, PUNISHMENTS } from "@/data/memeQuotes";
import { Search, X, Check, Dices, AlertTriangle, UserX, Skull, MessageSquareQuote, Gavel } from "lucide-react";

interface Props {
  canceledDistricts: Set<string>;
  onToggleDistrict: (name: string) => void;
  onClearAll: () => void;
  onSelectPreset: (districts: string[]) => void;
  victimName: string;
  setVictimName: (name: string) => void;
  culpritFriends: string;
  setCulpritFriends: (names: string) => void;
  selectedExcuses: Set<string>;
  onToggleExcuse: (id: string) => void;
  dialogueText: string;
  setDialogueText: (d: string) => void;
  punishmentText: string;
  setPunishmentText: (p: string) => void;
  onRandomizeQuote: () => void;
}

export default function CanceledTourPicker({
  canceledDistricts,
  onToggleDistrict,
  onClearAll,
  onSelectPreset,
  victimName,
  setVictimName,
  culpritFriends,
  setCulpritFriends,
  selectedExcuses,
  onToggleExcuse,
  dialogueText,
  setDialogueText,
  punishmentText,
  setPunishmentText,
  onRandomizeQuote,
}: Props) {
  const [search, setSearch] = useState("");
  const [isCustomDialogue, setIsCustomDialogue] = useState(false);

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

  const handleDropdownDialogueChange = (val: string) => {
    if (val === "custom") {
      setIsCustomDialogue(true);
    } else {
      setIsCustomDialogue(false);
      setDialogueText(val);
    }
  };

  return (
    <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm flex flex-col h-[740px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h2 className="text-lg font-bold text-red-600 flex items-center gap-1.5">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>ক্যান্সেল ট্যুরের হিসাব</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">যেখানে যাওয়ার কথা ছিল কিন্তু দোস্তরা ধোঁকা দিল</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-red-50 text-red-800 border border-red-200">
          <span>{toBanglaNum(canceledDistricts.size)}</span>
          <span>টি বাতিল</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar mt-3">
        {/* Preset Popular Cancels */}
        <div>
          <span className="text-xs font-bold text-foreground block mb-2">🔥 যেসব প্ল্যান বেশি ক্যান্সেল হয় (ক্লিক করুন):</span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_CANCEL_PLANS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onSelectPreset(preset.districts)}
                className="text-xs px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-semibold transition active:scale-95 flex items-center gap-1"
              >
                <span>💔</span>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs: Victim Name & Culprit Friends */}
        <div className="bg-muted/30 p-3 rounded-xl border border-border space-y-3">
          <div>
            <label className="text-xs font-bold text-foreground flex items-center gap-1 mb-1">
              <UserX className="w-3.5 h-3.5 text-muted-foreground" />
              <span>আপনার নাম (ভুক্তভোগী):</span>
            </label>
            <input
              type="text"
              value={victimName}
              onChange={(e) => setVictimName(e.target.value)}
              placeholder="যেমন: সাকিব"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-red-600 flex items-center gap-1 mb-1">
              <Skull className="w-3.5 h-3.5" />
              <span>কালপ্রিট দোস্তদের নাম (কার কার জন্য ক্যান্সেল হলো):</span>
            </label>
            <input
              type="text"
              value={culpritFriends}
              onChange={(e) => setCulpritFriends(e.target.value)}
              placeholder="যেমন: তানভীর, আকাশ, রাফি"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-red-300 bg-background focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Dialogue System: Dropdown + Custom Field + Randomize Button */}
        <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-amber-900 flex items-center gap-1">
              <MessageSquareQuote className="w-4 h-4 text-amber-600" />
              <span>পোস্টারের পাঞ্চলাইন / ডায়ালগ:</span>
            </label>
            <button
              onClick={() => {
                setIsCustomDialogue(false);
                onRandomizeQuote();
              }}
              className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded-full transition"
              title="এলোমেলো ডায়ালগ আনুন"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>🎲 ডায়ালগ বদলান</span>
            </button>
          </div>

          {/* Dialogue Select Dropdown */}
          <select
            value={isCustomDialogue ? "custom" : dialogueText}
            onChange={(e) => handleDropdownDialogueChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
          >
            {FUNNY_QUOTES.map((q, idx) => (
              <option key={idx} value={q}>
                {q}
              </option>
            ))}
            <option value="custom">✍️ নিজের ডায়ালগ লিখুন (Custom)...</option>
          </select>

          {/* Custom Dialogue Textarea if custom is active */}
          {isCustomDialogue && (
            <textarea
              rows={2}
              value={dialogueText}
              onChange={(e) => setDialogueText(e.target.value)}
              placeholder="আপনার বন্ধুদের উদ্দেশ্যে নিজের ডায়ালগ বা ট্রল লিখুন..."
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 bg-background focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium resize-none"
            />
          )}
        </div>

        {/* Punishment Selector */}
        <div className="bg-red-50/40 p-3 rounded-xl border border-red-200 space-y-1.5">
          <label className="text-xs font-bold text-red-900 flex items-center gap-1">
            <Gavel className="w-3.5 h-3.5 text-red-600" />
            <span>কালপ্রিটদের শাস্তি নির্ধারণ:</span>
          </label>
          <select
            value={punishmentText}
            onChange={(e) => setPunishmentText(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
          >
            {PUNISHMENTS.map((p, idx) => (
              <option key={idx} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Excuses Checklist (All visible) */}
        <div>
          <span className="text-xs font-bold text-foreground block mb-2">
            🤦‍♂️ ক্যান্সেলের মূল অজুহাতসমূহ (ক্লিক করে সব বেছে নিন):
          </span>

          <div className="flex flex-wrap gap-1.5">
            {CANCEL_EXCUSES.map((excuse) => {
              const isSelected = selectedExcuses.has(excuse.id);
              return (
                <button
                  key={excuse.id}
                  onClick={() => onToggleExcuse(excuse.id)}
                  className={`text-xs px-2.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1 border select-none ${
                    isSelected
                      ? "bg-red-600 text-white border-red-600 shadow-sm scale-[1.02]"
                      : "bg-muted/40 hover:bg-muted border-border/80 text-foreground/80 hover:text-foreground"
                  }`}
                >
                  <span>{excuse.icon}</span>
                  <span>{excuse.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search District */}
        <div className="pt-2 border-t border-border">
          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="জেলা খুঁজুন..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-border bg-muted/30 focus:bg-background focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-muted-foreground">ক্যান্সেল হওয়া জেলা সিলেক্ট করুন:</span>
            <button
              onClick={onClearAll}
              className="text-muted-foreground hover:text-red-600 hover:underline text-[11px]"
            >
              সব ক্লিয়ার
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto custom-scrollbar p-1">
            {filteredDistricts.map((district) => {
              const isSelected = canceledDistricts.has(district.n);
              return (
                <button
                  key={district.n}
                  onClick={() => onToggleDistrict(district.n)}
                  className={`text-xs px-2.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1 border select-none ${
                    isSelected
                      ? "bg-red-700 text-white border-red-700 shadow-sm scale-[1.02]"
                      : "bg-muted/40 hover:bg-muted border-border/80 text-foreground/80 hover:text-foreground"
                  }`}
                >
                  {isSelected ? <Check className="w-3 h-3 stroke-[2.5]" /> : <span>✕</span>}
                  <span>{district.nameBn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import CanceledTourPicker from "@/components/CanceledTourPicker";
import CanceledTourMap from "@/components/CanceledTourMap";
import { THEMES } from "@/data/themes";
import { FUNNY_QUOTES, PUNISHMENTS } from "@/data/memeQuotes";
import { MapTheme } from "@/types";
import { Skull, AlertTriangle } from "lucide-react";

export default function CancelPage() {
  const [theme, setTheme] = useState<MapTheme>(THEMES[0]);
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  // Canceled Tour State
  const [canceledDistricts, setCanceledDistricts] = useState<Set<string>>(() => {
    return new Set<string>(["Rangamati", "Cox's Bazar"]);
  });
  const [victimName, setVictimName] = useState("আমি");
  const [culpritFriends, setCulpritFriends] = useState("শাকিব, তানভীর, ইমন");
  const [selectedExcuses, setSelectedExcuses] = useState<Set<string>>(() => {
    return new Set<string>(["ammu", "taka", "ghost"]);
  });
  const [dialogueText, setDialogueText] = useState(FUNNY_QUOTES[0]);
  const [punishmentText, setPunishmentText] = useState(PUNISHMENTS[0]);

  // Sync with localStorage
  useEffect(() => {
    try {
      const savedCancels = localStorage.getItem("deshghuri.cancels");
      if (savedCancels) setCanceledDistricts(new Set(JSON.parse(savedCancels)));

      const savedName = localStorage.getItem("deshghuri.name");
      if (savedName) setUserName(savedName);
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("deshghuri.cancels", JSON.stringify([...canceledDistricts]));
    } catch (e) {}
  }, [canceledDistricts]);

  useEffect(() => {
    try {
      localStorage.setItem("deshghuri.name", userName);
    } catch (e) {}
  }, [userName]);

  const handleToggleCanceledDistrict = (name: string) => {
    setCanceledDistricts((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleClearAllCancels = () => {
    setCanceledDistricts(new Set());
  };

  const handleSelectCancelPreset = (presetDistricts: string[]) => {
    setCanceledDistricts((prev) => {
      const next = new Set(prev);
      presetDistricts.forEach((d) => next.add(d));
      return next;
    });
  };

  const handleToggleExcuse = (id: string) => {
    setSelectedExcuses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRandomizeQuote = () => {
    const nextIdx = Math.floor(Math.random() * FUNNY_QUOTES.length);
    setDialogueText(FUNNY_QUOTES[nextIdx]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] dark:bg-zinc-950 text-foreground">
      {/* Top Navigation */}
      <Navbar
        activeTab="canceled"
        setActiveTab={() => {}}
        theme={theme}
        setTheme={setTheme}
        userName={userName}
        setUserName={setUserName}
        userPhoto={userPhoto}
        setUserPhoto={setUserPhoto}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
      />

      {/* Hero Banner for Canceled Tour */}
      <section className="relative overflow-hidden py-10 px-4 sm:px-6 border-b border-border/60 bg-gradient-to-b from-white/90 to-[#faf7f2] dark:from-zinc-900/40 dark:to-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 mb-4 border border-red-300 dark:border-red-800 animate-bounce">
            <Skull className="w-3.5 h-3.5" />
            মিথ্যা প্রতিশ্রুতির মানচিত্র · বন্ধুদের ট্রল মোড 🔥
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.25]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-red-500">
              কতগুলো ট্যুর
            </span>{" "}
            ক্যান্সেল হইছে দোস্তদের জন্য? 💔
          </h1>

          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            সাজেক, কক্সবাজার বা সিলেটে যাওয়ার কথা দিয়ে যারা শেষ রাতে ফোন বন্ধ করে রাখছে—তাদের নাম লিখে ক্যান্সেল ম্যাপ তৈরি করে ফেসবুকে মেনশন দিন! 😂
          </p>
        </div>
      </section>

      {/* Main Interactive Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Picker Panel */}
          <div className="lg:col-span-5 w-full">
            <CanceledTourPicker
              canceledDistricts={canceledDistricts}
              onToggleDistrict={handleToggleCanceledDistrict}
              onClearAll={handleClearAllCancels}
              onSelectPreset={handleSelectCancelPreset}
              victimName={victimName}
              setVictimName={setVictimName}
              culpritFriends={culpritFriends}
              setCulpritFriends={setCulpritFriends}
              selectedExcuses={selectedExcuses}
              onToggleExcuse={handleToggleExcuse}
              dialogueText={dialogueText}
              setDialogueText={setDialogueText}
              punishmentText={punishmentText}
              setPunishmentText={setPunishmentText}
              onRandomizeQuote={handleRandomizeQuote}
            />
          </div>

          {/* Right Canvas Map Preview & Export */}
          <div className="lg:col-span-7 w-full flex justify-center">
            <CanceledTourMap
              canceledDistricts={canceledDistricts}
              onToggleDistrict={handleToggleCanceledDistrict}
              victimName={victimName}
              culpritFriends={culpritFriends}
              selectedExcuses={selectedExcuses}
              dialogueText={dialogueText}
              punishmentText={punishmentText}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs py-5 px-4 sm:px-6 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="font-semibold text-foreground">দেশ ঘুরি</span>
          <span>•</span>
          <span>ভ্রমণ ও পর্যটন মানচিত্র</span>
        </div>
      </footer>
    </div>
  );
}

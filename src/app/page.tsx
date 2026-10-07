"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import DistrictPicker from "@/components/DistrictPicker";
import CountryPicker from "@/components/CountryPicker";
import BangladeshCanvasMap from "@/components/BangladeshCanvasMap";
import WorldCanvasMap from "@/components/WorldCanvasMap";
import CanceledTourPicker from "@/components/CanceledTourPicker";
import CanceledTourMap from "@/components/CanceledTourMap";
import { THEMES } from "@/data/themes";
import { DISTRICTS, DIVISIONS, toBanglaNum, getTravelerTitle } from "@/data/districts";
import { COUNTRIES } from "@/data/countries";
import { CANCEL_EXCUSES, FUNNY_QUOTES, PUNISHMENTS } from "@/data/memeQuotes";
import { MapTheme } from "@/types";
import confetti from "canvas-confetti";
import { Compass, Trophy, Map, Globe, Heart, Skull, AlertOctagon } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"bangladesh" | "canceled" | "world">("bangladesh");
  const [theme, setTheme] = useState<MapTheme>(THEMES[0]);
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  // Bangladesh Travel State
  const [selectedDistricts, setSelectedDistricts] = useState<Set<string>>(() => {
    return new Set<string>(["Dhaka"]);
  });

  // World Travel State
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(() => {
    return new Set<string>(["BGD"]);
  });

  // Canceled Tour Meme State
  const [canceledDistricts, setCanceledDistricts] = useState<Set<string>>(() => {
    return new Set<string>(["Rangamati", "Cox's Bazar"]); // Classic Sajek & Cox's Bazar
  });
  const [victimName, setVictimName] = useState("আমি");
  const [culpritFriends, setCulpritFriends] = useState("শাকিব, তানভীর, ইমন");
  const [selectedExcuses, setSelectedExcuses] = useState<Set<string>>(() => {
    return new Set<string>(["ammu", "taka", "ghost"]);
  });
  const [dialogueText, setDialogueText] = useState(FUNNY_QUOTES[0]);
  const [punishmentText, setPunishmentText] = useState(PUNISHMENTS[0]);

  // Local storage persistence & URL tab param
  useEffect(() => {
    try {
      const savedDistricts = localStorage.getItem("deshghuri.districts");
      if (savedDistricts) setSelectedDistricts(new Set(JSON.parse(savedDistricts)));

      const savedCountries = localStorage.getItem("deshghuri.countries");
      if (savedCountries) setSelectedCountries(new Set(JSON.parse(savedCountries)));

      const savedCancels = localStorage.getItem("deshghuri.cancels");
      if (savedCancels) setCanceledDistricts(new Set(JSON.parse(savedCancels)));

      const savedName = localStorage.getItem("deshghuri.name");
      if (savedName) setUserName(savedName);

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        if (tab === "world") setActiveTab("world");
        else if (tab === "canceled") setActiveTab("canceled");
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("deshghuri.districts", JSON.stringify([...selectedDistricts]));
    } catch (e) {}
  }, [selectedDistricts]);

  useEffect(() => {
    try {
      localStorage.setItem("deshghuri.cancels", JSON.stringify([...canceledDistricts]));
    } catch (e) {}
  }, [canceledDistricts]);

  useEffect(() => {
    try {
      localStorage.setItem("deshghuri.countries", JSON.stringify([...selectedCountries]));
    } catch (e) {}
  }, [selectedCountries]);

  useEffect(() => {
    try {
      localStorage.setItem("deshghuri.name", userName);
    } catch (e) {}
  }, [userName]);

  // Bangladesh Handlers
  const handleToggleDistrict = (name: string) => {
    setSelectedDistricts((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
        if (next.size === 10 || next.size === 25 || next.size === 50 || next.size === 64) {
          confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.6 },
          });
        }
      }
      return next;
    });
  };

  const handleSelectAllDistricts = () => {
    setSelectedDistricts(new Set(DISTRICTS.map((d) => d.n)));
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.6 },
    });
  };

  const handleClearAllDistricts = () => {
    setSelectedDistricts(new Set());
  };

  const handleSelectDivision = (divisionKey: string, selectAll: boolean) => {
    setSelectedDistricts((prev) => {
      const next = new Set(prev);
      const divDistricts = DISTRICTS.filter((d) => d.dv === divisionKey);
      divDistricts.forEach((d) => {
        if (selectAll) next.add(d.n);
        else next.delete(d.n);
      });
      return next;
    });
  };

  // Canceled Tour Meme Handlers
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

  // World Handlers
  const handleToggleCountry = (code: string) => {
    setSelectedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleClearAllCountries = () => {
    setSelectedCountries(new Set());
  };

  const travelerTitle = getTravelerTitle(selectedDistricts.size);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] dark:bg-zinc-950 text-foreground">
      {/* Top Navigation & Customization */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        userName={userName}
        setUserName={setUserName}
        userPhoto={userPhoto}
        setUserPhoto={setUserPhoto}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
      />

      {/* Hero Banner */}
      <section className="relative overflow-hidden py-10 px-4 sm:px-6 border-b border-border/60 bg-gradient-to-b from-white/90 to-[#faf7f2] dark:from-zinc-900/40 dark:to-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          {activeTab === "bangladesh" && (
            <>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 mb-4 border border-emerald-200 dark:border-emerald-800">
                <Compass className="w-3.5 h-3.5" />
                ৬৪ জেলা · ৮ বিভাগ
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.25]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-500">
                  বাংলাদেশের
                </span>{" "}
                কতটুকু ঘুরে দেখেছেন?
              </h1>

              <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                যেসব জেলায় ভ্রমণ করেছেন সেগুলো বেছে নিন, পছন্দের কালার থিম দিন এবং সোশ্যাল মিডিয়ায় শেয়ার করার জন্য এইচডি কোয়ালিটি ছবি ডাউনলোড করুন।
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs sm:text-sm">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-border shadow-xs">
                  <Map className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-muted-foreground">ঘুরেছেন:</span>
                  <span className="font-extrabold text-foreground">{toBanglaNum(selectedDistricts.size)} / ৬৪ জেলা</span>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-border shadow-xs">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-muted-foreground">উপাধি:</span>
                  <span className="font-extrabold text-foreground">{travelerTitle.badge}</span>
                </div>
              </div>
            </>
          )}

          {activeTab === "canceled" && (
            <>
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
            </>
          )}

          {activeTab === "world" && (
            <>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 mb-4 border border-blue-200 dark:border-blue-800">
                <Globe className="w-3.5 h-3.5" />
                ১৯৪ দেশ · ৬ মহাদেশ · গ্লোবাল ট্রাভেল
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.25]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-500">
                  পৃথিবীর
                </span>{" "}
                কতটুকু ঘুরে দেখেছেন?
              </h1>

              <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                বিশ্বের যেসব দেশে গিয়েছেন সেগুলো সিলেক্ট করুন এবং নিজের বিশ্ব ভ্রমণ মানচিত্র তৈরি করে ডাউনলোড করুন।
              </p>
            </>
          )}
        </div>
      </section>

      {/* Main Interactive Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Picker Panel */}
          <div className="lg:col-span-5 w-full">
            {activeTab === "bangladesh" && (
              <DistrictPicker
                selectedDistricts={selectedDistricts}
                onToggleDistrict={handleToggleDistrict}
                onSelectAll={handleSelectAllDistricts}
                onClearAll={handleClearAllDistricts}
                onSelectDivision={handleSelectDivision}
                theme={theme}
              />
            )}

            {activeTab === "canceled" && (
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
            )}

            {activeTab === "world" && (
              <CountryPicker
                selectedCountries={selectedCountries}
                onToggleCountry={handleToggleCountry}
                onClearAll={handleClearAllCountries}
                theme={theme}
              />
            )}
          </div>

          {/* Right Canvas Map Preview & Export */}
          <div className="lg:col-span-7 w-full flex justify-center">
            {activeTab === "bangladesh" && (
              <BangladeshCanvasMap
                selectedDistricts={selectedDistricts}
                onToggleDistrict={handleToggleDistrict}
                theme={theme}
                userName={userName}
                userPhoto={userPhoto}
                showLabels={showLabels}
              />
            )}

            {activeTab === "canceled" && (
              <CanceledTourMap
                canceledDistricts={canceledDistricts}
                onToggleDistrict={handleToggleCanceledDistrict}
                victimName={victimName}
                culpritFriends={culpritFriends}
                selectedExcuses={selectedExcuses}
                dialogueText={dialogueText}
                punishmentText={punishmentText}
              />
            )}

            {activeTab === "world" && (
              <WorldCanvasMap
                selectedCountries={selectedCountries}
                onToggleCountry={handleToggleCountry}
                theme={theme}
                userName={userName}
                userPhoto={userPhoto}
                showLabels={showLabels}
              />
            )}
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


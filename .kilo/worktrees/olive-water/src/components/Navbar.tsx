"use client";

import React from "react";
import { MapTheme } from "@/types";
import { THEMES } from "@/data/themes";
import { MapPin, Globe, Compass, Upload, Trash2, Tag, Skull } from "lucide-react";

interface Props {
  activeTab: "bangladesh" | "canceled" | "world";
  setActiveTab: (tab: "bangladesh" | "canceled" | "world") => void;
  theme: MapTheme;
  setTheme: (t: MapTheme) => void;
  userName: string;
  setUserName: (n: string) => void;
  userPhoto: string | null;
  setUserPhoto: (p: string | null) => void;
  showLabels: boolean;
  setShowLabels: (s: boolean) => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  userName,
  setUserName,
  userPhoto,
  setUserPhoto,
  showLabels,
  setShowLabels,
}: Props) {
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUserPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top Line: Brand & Main Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-foreground block leading-none">
                দেশ ঘুরি
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                আপনার ভ্রমণ মানচিত্র
              </span>
            </div>
          </div>

          {/* Map Tabs (Bangladesh vs Canceled Meme vs World) */}
          <div className="flex items-center p-1 rounded-full bg-muted border border-border shadow-inner gap-1">
            <button
              onClick={() => setActiveTab("bangladesh")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === "bangladesh"
                  ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>আমার বাংলাদেশ</span>
            </button>

            <button
              onClick={() => setActiveTab("canceled")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === "canceled"
                  ? "bg-red-600 text-white shadow-sm scale-[1.02]"
                  : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
              }`}
            >
              <span>💔</span>
              <span>ক্যান্সেল ট্যুর</span>
              <span className="text-[10px] bg-red-800 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                Meme
              </span>
            </button>

            <button
              onClick={() => setActiveTab("world")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === "world"
                  ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span>বিশ্ব মানচিত্র</span>
            </button>
          </div>
        </div>

        {/* Second Line: Customization Controls (Shown on Bangladesh & World tabs) */}
        {activeTab !== "canceled" ? (
          <div className="mt-3 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Themes Switcher */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground mr-1">থিম:</span>
              <div className="flex items-center gap-1.5">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t)}
                    title={t.nameBn}
                    className={`w-7 h-7 rounded-full border-2 transition-all p-0.5 relative ${
                      theme.id === t.id
                        ? "ring-2 ring-emerald-500 ring-offset-2 scale-110"
                        : "border-border/60 hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: t.bg }}
                  >
                    <div
                      className="w-full h-full rounded-full"
                      style={{ backgroundColor: t.v1 }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Options: Name, Photo, Labels */}
            <div className="flex flex-wrap items-center gap-2.5">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-border hover:border-foreground/40 bg-muted/30 hover:bg-muted/60 transition">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                {userPhoto ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={userPhoto} alt="User" className="w-4 h-4 rounded-full object-cover" />
                    <span className="font-medium text-foreground">ছবি বদলান</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setUserPhoto(null);
                      }}
                      className="hover:text-rose-600 ml-1 text-muted-foreground"
                      title="ছবি মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground">আপনার ছবি যোগ করুন</span>
                  </>
                )}
              </label>

              <input
                type="text"
                maxLength={24}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="আপনার নাম (ঐচ্ছিক)"
                className="px-3 py-1.5 rounded-xl border border-border bg-muted/30 focus:bg-background focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36 transition"
              />

              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
                  showLabels
                    ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold"
                    : "bg-muted/30 border-border text-muted-foreground font-medium hover:bg-muted/60"
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>নাম দেখান</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-xs text-red-600 dark:text-red-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span>🚨</span>
              <span>দোস্তদের ট্রল করুন: যেসব ট্যুরের কথা দিয়ে বন্ধুদের জন্য যাওয়া হয়নি, সেগুলো বের করুন!</span>
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

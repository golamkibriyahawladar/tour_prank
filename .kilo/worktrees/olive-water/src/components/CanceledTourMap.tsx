"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { DISTRICTS, BANGLADESH_WIDTH, BANGLADESH_HEIGHT, toBanglaNum } from "@/data/districts";
import { CANCEL_EXCUSES } from "@/data/memeQuotes";
import { Download, Sparkles, Share2, Check, RefreshCw } from "lucide-react";

interface Props {
  canceledDistricts: Set<string>;
  onToggleDistrict: (name: string) => void;
  victimName: string;
  culpritFriends: string;
  selectedExcuses: Set<string>;
  dialogueText: string;
  punishmentText: string;
}

export default function CanceledTourMap({
  canceledDistricts,
  onToggleDistrict,
  victimName,
  culpritFriends,
  selectedExcuses,
  dialogueText,
  punishmentText,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const pathsRef = useRef<Map<string, Path2D>>(new Map());

  useEffect(() => {
    if (pathsRef.current.size === 0) {
      DISTRICTS.forEach((d) => {
        pathsRef.current.set(d.n, new Path2D(d.d));
      });
    }
  }, []);

  const BASE_WIDTH = 1000;
  const BASE_HEIGHT = 1460;

  const renderStampPaper = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scaleMultiplier: number
  ) => {
    ctx.save();
    ctx.scale(scaleMultiplier, scaleMultiplier);

    // 1. Authentic Non-Judicial Stamp Paper Texture & Color
    ctx.fillStyle = "#faf6eb"; // Warm legal parchment bond paper
    ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

    // Intricate Double Security Border
    ctx.strokeStyle = "#5a2d2d"; // Official deep burgundy legal ink
    ctx.lineWidth = 3.5;
    ctx.strokeRect(30, 30, BASE_WIDTH - 60, BASE_HEIGHT - 60);

    ctx.strokeStyle = "#8a5252";
    ctx.lineWidth = 1;
    ctx.strokeRect(38, 38, BASE_WIDTH - 76, BASE_HEIGHT - 76);

    // Corner Corner Ornaments
    const drawCorner = (x: number, y: number) => {
      ctx.fillStyle = "#5a2d2d";
      ctx.fillRect(x - 5, y - 5, 10, 10);
      ctx.strokeStyle = "#5a2d2d";
      ctx.strokeRect(x - 9, y - 9, 18, 18);
    };
    drawCorner(38, 38);
    drawCorner(BASE_WIDTH - 38, 38);
    drawCorner(38, BASE_HEIGHT - 38);
    drawCorner(BASE_WIDTH - 38, BASE_HEIGHT - 38);

    // 2. Official Stamp Header
    // Serial Number & Stamp Value
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 13px 'Anek Bangla', 'Hind Siliguri', monospace, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("দলিল নং: ক খ - ৭৮৬৯২০", 56, 68);

    ctx.textAlign = "right";
    ctx.fillText("মূল্য: ১০০ টাকার মিথ্যে আশা 💸", BASE_WIDTH - 56, 68);

    // Official Emblem / Scales of Justice Icon
    ctx.fillStyle = "#5a2d2d";
    ctx.font = "24px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("⚖️", BASE_WIDTH / 2, 78);

    // GRAND OFFICIAL HEADER: "ট্যুর ক্যান্সেল সমিতি কর্তৃক অনুমোদিত" (Big, Bold & Prominent!)
    ctx.fillStyle = "#7f1d1d"; // Deep royal legal crimson
    ctx.font = "900 36px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ট্যুর ক্যান্সেল সমিতি কর্তৃক অনুমোদিত", BASE_WIDTH / 2, 122);

    // Subtitle
    ctx.fillStyle = "#4b5563";
    ctx.font = "600 16px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.fillText("বন্ধু প্রতারণা ও মিথ্যা প্রতিশ্রুতির অফিশিয়াল আইনি দলিল — ২০২৬", BASE_WIDTH / 2, 148);

    // Ornamental Divider Line
    ctx.strokeStyle = "#b91c1c";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(80, 164);
    ctx.lineTo(BASE_WIDTH - 80, 164);
    ctx.stroke();

    ctx.fillStyle = "#b91c1c";
    ctx.beginPath();
    ctx.arc(BASE_WIDTH / 2, 164, 4, 0, Math.PI * 2);
    ctx.fill();

    // 3. Deed Particulars (বাদি ও বিবাদী পরিচিতি)
    const count = canceledDistricts.size;

    // Background panel for legal info
    ctx.fillStyle = "rgba(127, 29, 29, 0.05)";
    ctx.beginPath();
    ctx.roundRect(50, 178, BASE_WIDTH - 100, 58, 12);
    ctx.fill();

    ctx.strokeStyle = "rgba(127, 29, 29, 0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Left: বাদি (ভুক্তভোগী)
    ctx.fillStyle = "#334155";
    ctx.font = "bold 15px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("বাদি (ভুক্তভোগী):", 68, 204);

    ctx.fillStyle = "#0f172a";
    ctx.font = "800 17px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.fillText(victimName.trim() || "আমি নিজে", 175, 204);

    // Center/Right: ১ নম্বর বিবাদী (কালপ্রিট বন্ধুরা)
    ctx.fillStyle = "#991b1b";
    ctx.font = "bold 15px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.fillText("বিবাদী (কালপ্রিটরা):", 340, 204);

    ctx.fillStyle = "#7f1d1d";
    ctx.font = "800 17px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.fillText(culpritFriends.trim() || "সকল ধোঁকাবাজ বন্ধু", 475, 204);

    // Status: বাতিল জেলার সংখ্যা
    ctx.textAlign = "right";
    ctx.fillStyle = "#b91c1c";
    ctx.font = "800 20px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.fillText(`মোট বাতিল: ${toBanglaNum(count)} জেলা`, BASE_WIDTH - 68, 204);

    // 4. Render Districts Map
    const mapScale = 1.13;
    const mapOffsetX = (BASE_WIDTH - BANGLADESH_WIDTH * mapScale) / 2 + 10;
    const mapOffsetY = 245;

    ctx.save();
    ctx.translate(mapOffsetX, mapOffsetY);
    ctx.scale(mapScale, mapScale);

    // Draw Unvisited / Untouched districts
    DISTRICTS.forEach((d) => {
      const path = pathsRef.current.get(d.n);
      if (!path) return;
      if (!canceledDistricts.has(d.n)) {
        ctx.fillStyle = "#ede6d4"; // Parchment unvisited land
        ctx.fill(path);
        ctx.strokeStyle = "#dcd2be";
        ctx.lineWidth = 1.2;
        ctx.stroke(path);
      }
    });

    // Draw CANCELED districts with bold crimson red ink!
    DISTRICTS.forEach((d) => {
      const path = pathsRef.current.get(d.n);
      if (!path) return;
      if (canceledDistricts.has(d.n)) {
        ctx.fillStyle = "#c82333";
        ctx.fill(path);

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.6;
        ctx.stroke(path);
      }
    });

    // Clean, legible labels for canceled districts
    canceledDistricts.forEach((distName) => {
      const dist = DISTRICTS.find((d) => d.n === distName);
      if (!dist) return;

      const [cx, cy] = dist.c;

      // Small X mark
      ctx.font = "bold 10px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("✕", cx, cy - 8);

      // District name with clear halo
      ctx.font = "bold 13px 'Anek Bangla', 'Hind Siliguri', sans-serif";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3.5;
      ctx.lineJoin = "round";
      ctx.strokeText(dist.nameBn, cx, cy + 6);

      ctx.fillStyle = "#7f1d1d";
      ctx.fillText(dist.nameBn, cx, cy + 6);
    });

    ctx.restore();

    // 5. OFFICIAL CIRCULAR RUBBER STAMP: "ভুয়া বন্ধু সার্টিফাইড" (NO 🤡 emoji, 100% CLEAR!)
    // Placed on open clear area below the map so all 64 districts are 100% visible
    ctx.save();
    const stampX = BASE_WIDTH - 200;
    const stampY = 925;
    ctx.translate(stampX, stampY);
    ctx.rotate((-12 * Math.PI) / 180);

    // Crisp high-contrast backdrop so map NEVER obscures the stamp
    ctx.fillStyle = "#fffdf7";
    ctx.beginPath();
    ctx.arc(0, 0, 105, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
    ctx.shadowBlur = 10;

    // Stamp Outer Ring
    ctx.strokeStyle = "#b91c1c";
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(0, 0, 106, 0, Math.PI * 2);
    ctx.stroke();

    // Stamp Inner Dotted/Dashed Ring
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, 96, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Stamp Innermost Ring
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 74, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Stamp Upper Text: "ভুয়া বন্ধু সার্টিফাইড" (Clean & Sharp, NO 🤡)
    ctx.fillStyle = "#b91c1c";
    ctx.font = "900 17px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("★ ভুয়া বন্ধু সার্টিফাইড ★", 0, -48);

    // Stamp Center Box: "১০০% ধোঁকাবাজ"
    ctx.fillStyle = "rgba(185, 28, 28, 0.12)";
    ctx.beginPath();
    ctx.roundRect(-80, -22, 160, 44, 8);
    ctx.fill();

    ctx.strokeStyle = "#b91c1c";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#991b1b";
    ctx.font = "900 24px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.fillText("১০০% ধোঁকাবাজ", 0, 0);

    // Stamp Lower Text: "ট্যুর বাতিল • REJECTED ❌"
    ctx.font = "800 14px 'Anek Bangla', system-ui, sans-serif";
    ctx.fillStyle = "#b91c1c";
    ctx.fillText("ট্যুর বাতিল • REJECTED ❌", 0, 48);

    ctx.restore();

    // 6. ALL Selected Excuses Badges (ধারা সমূহ - Multi-row, NO cutoff!)
    const excusesList = CANCEL_EXCUSES.filter((e) => selectedExcuses.has(e.id));
    let badgeY = BASE_HEIGHT - 265;

    // Title for excuses
    ctx.fillStyle = "#5a2d2d";
    ctx.font = "bold 15px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("📜 প্রতারণার ধারাসমূহ (অজুহাতের তালিকা):", 52, badgeY - 14);

    if (excusesList.length > 0) {
      let badgeX = 52;
      ctx.font = "bold 13px 'Anek Bangla', 'Hind Siliguri', sans-serif";

      excusesList.forEach((excuse) => {
        const text = `${excuse.icon} ${excuse.label}`;
        const w = ctx.measureText(text).width + 24;

        // Wrap to next line if it exceeds width
        if (badgeX + w > BASE_WIDTH - 52) {
          badgeX = 52;
          badgeY += 34;
        }

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, w, 28, 14);
        ctx.fill();

        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = "#334155";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(text, badgeX + 12, badgeY + 14);

        badgeX += w + 8;
      });
    }

    // 7. Punchline Meme Dialogue Card (Official Decree)
    ctx.fillStyle = "#fef2f2"; // Light red legal alert
    ctx.beginPath();
    ctx.roundRect(50, BASE_HEIGHT - 170, BASE_WIDTH - 100, 56, 14);
    ctx.fill();

    ctx.strokeStyle = "#fecaca";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#b91c1c";
    ctx.font = "bold 16px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`"${dialogueText}"`, BASE_WIDTH / 2, BASE_HEIGHT - 142);

    // Punishment Order
    if (punishmentText) {
      ctx.fillStyle = "#7f1d1d";
      ctx.font = "800 14px 'Anek Bangla', 'Hind Siliguri', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(punishmentText, BASE_WIDTH / 2, BASE_HEIGHT - 94);
    }

    // 8. Signatures Section & Disclaimer (স্ট্যাম্প পেপারের মতো স্বাক্ষর)
    ctx.fillStyle = "#64748b";
    ctx.font = "600 12px 'Anek Bangla', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("✍️ বাদির স্বাক্ষর (কান্নারত)", 60, BASE_HEIGHT - 54);

    ctx.textAlign = "right";
    ctx.fillText("⚖️ সভাপতি, ট্যুর ক্যান্সেল সমিতি", BASE_WIDTH - 60, BASE_HEIGHT - 54);

    // Bottom Watermark
    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("দেশ ঘুরি • deshghuri.app • এই দলিলের বিরুদ্ধে কোনো আপিল গ্রহণযোগ্য নয়", BASE_WIDTH / 2, BASE_HEIGHT - 40);

    ctx.restore();
  };

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? Math.max(window.devicePixelRatio || 1, 2) : 2;
    canvas.width = BASE_WIDTH * dpr;
    canvas.height = BASE_HEIGHT * dpr;

    renderStampPaper(ctx, canvas.width, canvas.height, dpr);
  }, [canceledDistricts, victimName, culpritFriends, selectedExcuses, dialogueText, punishmentText]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = BASE_WIDTH / rect.width;
    const scaleY = BASE_HEIGHT / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const mapScale = 1.13;
    const mapOffsetX = (BASE_WIDTH - BANGLADESH_WIDTH * mapScale) / 2 + 10;
    const mapOffsetY = 245;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.translate(mapOffsetX, mapOffsetY);
    ctx.scale(mapScale, mapScale);

    let clickedDistrict: string | null = null;
    DISTRICTS.forEach((d) => {
      const path = pathsRef.current.get(d.n);
      if (path && ctx.isPointInPath(path, (mouseX - mapOffsetX) / mapScale, (mouseY - mapOffsetY) / mapScale)) {
        clickedDistrict = d.n;
      }
    });

    ctx.restore();

    if (clickedDistrict) {
      onToggleDistrict(clickedDistrict);
    }
  };

  const handleDownloadUltraHD = (format: "png" | "jpg" | "story") => {
    setDownloading(format);

    setTimeout(() => {
      const exportScale = 4; // 4000 x 5840 Ultra HD
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = BASE_WIDTH * exportScale;
      exportCanvas.height = BASE_HEIGHT * exportScale;

      const ectx = exportCanvas.getContext("2d");
      if (!ectx) return;

      renderStampPaper(ectx, exportCanvas.width, exportCanvas.height, exportScale);

      if (format === "story") {
        const storyCanvas = document.createElement("canvas");
        storyCanvas.width = 2160;
        storyCanvas.height = 3840;
        const sctx = storyCanvas.getContext("2d");
        if (sctx) {
          sctx.fillStyle = "#faf6eb";
          sctx.fillRect(0, 0, 2160, 3840);

          const targetW = 2000;
          const targetH = (2000 / BASE_WIDTH) * BASE_HEIGHT;
          const offsetY = (3840 - targetH) / 2;

          sctx.drawImage(exportCanvas, 80, offsetY, targetW, targetH);

          sctx.fillStyle = "#7f1d1d";
          sctx.font = "bold 52px 'Anek Bangla', sans-serif";
          sctx.textAlign = "center";
          sctx.fillText("যে দোস্তদের জন্য ট্যুর ক্যান্সেল হইছে, তাদের মেনশন দে! 😂", 1080, 3740);

          const link = document.createElement("a");
          link.download = `tour-cancel-stamp-story-4K-${Date.now()}.png`;
          link.href = storyCanvas.toDataURL("image/png");
          link.click();
        }
      } else {
        const link = document.createElement("a");
        const mime = format === "jpg" ? "image/jpeg" : "image/png";
        link.download = `tour-cancel-stamp-paper-4K-${Date.now()}.${format}`;
        link.href = exportCanvas.toDataURL(mime, 0.98);
        link.click();
      }
      setDownloading(null);
    }, 150);
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-[540px] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#5a2d2d]/30 bg-[#faf6eb] transition-all hover:shadow-[#5a2d2d]/20">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-auto cursor-pointer block select-none"
          title="ম্যাপে ক্লিক করে ক্যান্সেল হওয়া জেলা চিহ্নিত করুন"
        />
        {/* Floating toast div removed as requested */}
      </div>

      <div className="w-full max-w-[540px] mt-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-[#7f1d1d] flex items-center gap-1.5">
            <Download className="w-4 h-4 text-[#7f1d1d]" /> অফিশিয়াল স্ট্যাম্প পেপার ডাউনলোড করুন
          </span>
          <button
            onClick={copyShareLink}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 px-2.5 py-1 rounded-full border border-border hover:bg-muted transition"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            {copiedLink ? "লিংক কপি হয়েছে" : "শেয়ার করুন"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => handleDownloadUltraHD("png")}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs bg-[#7f1d1d] hover:bg-[#991b1b] text-white shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
            title="৪০০০ পিক্সেল আল্ট্রা-এইচডি পিএনজি"
          >
            {downloading === "png" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>4K PNG</span>
          </button>

          <button
            onClick={() => handleDownloadUltraHD("jpg")}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs bg-zinc-800 hover:bg-zinc-900 text-white shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            {downloading === "jpg" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>4K JPG</span>
          </button>

          <button
            onClick={() => handleDownloadUltraHD("story")}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-red-700 to-rose-800 hover:from-red-800 hover:to-rose-900 text-white shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
            title="ইনস্টাগ্রাম ও ফেসবুক স্টোরিতে বন্ধুদের মেনশন দিন"
          >
            {downloading === "story" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Story 9:16</span>
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { DISTRICTS, BANGLADESH_WIDTH, BANGLADESH_HEIGHT, toBanglaNum, getTravelerTitle } from "@/data/districts";
import { MapTheme } from "@/types";
import { Download, Sparkles, Share2, Check, RefreshCw, ZoomIn, FileCode } from "lucide-react";
import confetti from "canvas-confetti";

interface Props {
  selectedDistricts: Set<string>;
  onToggleDistrict: (name: string) => void;
  theme: MapTheme;
  userName: string;
  userPhoto: string | null;
  showLabels: boolean;
}

export default function BangladeshCanvasMap({
  selectedDistricts,
  onToggleDistrict,
  theme,
  userName,
  userPhoto,
  showLabels,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const pathsRef = useRef<Map<string, Path2D>>(new Map());
  const userImgRef = useRef<HTMLImageElement | null>(null);

  // Initialize Path2D
  useEffect(() => {
    if (pathsRef.current.size === 0) {
      DISTRICTS.forEach((d) => {
        pathsRef.current.set(d.n, new Path2D(d.d));
      });
    }
  }, []);

  // Preload User Image
  useEffect(() => {
    if (userPhoto) {
      const img = new Image();
      img.onload = () => {
        userImgRef.current = img;
        drawPreview();
      };
      img.src = userPhoto;
    } else {
      userImgRef.current = null;
      drawPreview();
    }
  }, [userPhoto]);

  // Card Base Dimensions
  const BASE_WIDTH = 1000;
  const BASE_HEIGHT = 1350;

  // Smart Collision-Free Label Placement Algorithm
  const calculateLabels = (scale: number, mapOffsetX: number, mapOffsetY: number, mapScale: number) => {
    // Only place labels for selected districts (or all if user chooses)
    const visited = DISTRICTS.filter((d) => selectedDistricts.has(d.n));
    // Sort north to south (y coordinate)
    visited.sort((a, b) => a.c[1] - b.c[1]);

    const placedBoxes: { x: number; y: number; w: number; h: number }[] = [];
    const results: {
      name: string;
      dotX: number;
      dotY: number;
      textX: number;
      textY: number;
      align: CanvasTextAlign;
    }[] = [];

    const tries: [number, number][] = [
      [0, -12],
      [0, 20],
      [14, 5],
      [-14, 5],
      [0, -30],
      [0, 36],
      [24, -10],
      [-24, -10],
      [24, 20],
      [-24, 20],
    ];

    visited.forEach((d) => {
      const cx = mapOffsetX + d.c[0] * mapScale;
      const cy = mapOffsetY + d.c[1] * mapScale;

      // Approximate text width (length of Bengali characters * 14px)
      const approxW = d.nameBn.length * 15 + 8;
      const h = 22;

      let chosen: { textX: number; textY: number; align: CanvasTextAlign; box: any } | null = null;

      for (const [dx, dy] of tries) {
        const align: CanvasTextAlign = dx > 0 ? "left" : dx < 0 ? "right" : "center";
        const x0 = align === "left" ? cx + dx : align === "right" ? cx + dx - approxW : cx - approxW / 2;
        const y0 = cy + dy - h + 4;
        const box = { x: x0, y: y0, w: approxW, h };

        // Check bounding box collisions with existing placed boxes
        const hasOverlap = placedBoxes.some(
          (b) => box.x < b.x + b.w && box.x + box.w > b.x && box.y < b.y + b.h && box.y + box.h > b.y
        );

        if (!hasOverlap) {
          chosen = { textX: cx + dx, textY: cy + dy, align, box };
          break;
        }
      }

      if (!chosen) {
        // Fallback directly above center
        const box = { x: cx - approxW / 2, y: cy - 24, w: approxW, h };
        chosen = { textX: cx, textY: cy - 10, align: "center", box };
      }

      placedBoxes.push(chosen.box);
      // Also reserve dot area so text doesn't cover its own or other dots
      placedBoxes.push({ x: cx - 4, y: cy - 4, w: 8, h: 8 });

      results.push({
        name: d.nameBn,
        dotX: cx,
        dotY: cy,
        textX: chosen.textX,
        textY: chosen.textY,
        align: chosen.align,
      });
    });

    return results;
  };

  // Master render function used for both screen preview and Ultra HD export
  const renderCard = (ctx: CanvasRenderingContext2D, width: number, height: number, scaleMultiplier: number) => {
    ctx.save();
    ctx.scale(scaleMultiplier, scaleMultiplier);

    // 1. Background
    ctx.fillStyle = theme.bg;
    ctx.beginPath();
    ctx.roundRect(0, 0, BASE_WIDTH, BASE_HEIGHT, 28);
    ctx.fill();

    ctx.strokeStyle = theme.stroke === theme.bg ? "rgba(0,0,0,0.08)" : theme.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. Header
    // Badge
    ctx.fillStyle = theme.v1 + "18";
    ctx.beginPath();
    ctx.roundRect(50, 48, 160, 36, 18);
    ctx.fill();

    ctx.fillStyle = theme.v1;
    ctx.font = "bold 15px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("বাংলাদেশ ভ্রমণ ম্যাপ", 130, 71);

    // Main Heading
    ctx.fillStyle = theme.ink;
    ctx.font = "800 48px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("আমার বাংলাদেশ", 50, 138);

    // Count (e.g. ৮ / ৬৪)
    const count = selectedDistricts.size;
    const countText = `${toBanglaNum(count)} / ৬৪`;
    ctx.font = "800 44px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = theme.v1;
    ctx.fillText(countText, BASE_WIDTH - 50, 138);

    // User Avatar & Name
    if (userName.trim() || userImgRef.current) {
      let leftX = 50;
      if (userImgRef.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(leftX + 22, 178, 22, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(userImgRef.current, leftX, 156, 44, 44);
        ctx.restore();

        ctx.strokeStyle = theme.v1;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(leftX + 22, 178, 23, 0, Math.PI * 2);
        ctx.stroke();
        leftX += 58;
      }
      if (userName.trim()) {
        ctx.fillStyle = theme.muted;
        ctx.font = "500 15px 'Anek Bangla', 'Hind Siliguri', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("ভ্রমণকারী", leftX, 170);
        ctx.fillStyle = theme.ink;
        ctx.font = "bold 20px 'Anek Bangla', 'Hind Siliguri', sans-serif";
        ctx.fillText(userName.trim(), leftX, 192);
      }
    }

    // 3. Render Districts Map
    const mapScale = 1.14;
    const mapOffsetX = (BASE_WIDTH - BANGLADESH_WIDTH * mapScale) / 2 + 10;
    const mapOffsetY = 210;

    ctx.save();
    ctx.translate(mapOffsetX, mapOffsetY);
    ctx.scale(mapScale, mapScale);

    // Draw unvisited districts
    DISTRICTS.forEach((d) => {
      const path = pathsRef.current.get(d.n);
      if (!path) return;
      if (!selectedDistricts.has(d.n)) {
        ctx.fillStyle = theme.land;
        ctx.fill(path);
        ctx.strokeStyle = theme.stroke;
        ctx.lineWidth = 1.2;
        ctx.stroke(path);
      }
    });

    // Draw visited districts
    DISTRICTS.forEach((d) => {
      const path = pathsRef.current.get(d.n);
      if (!path) return;
      if (selectedDistricts.has(d.n)) {
        if (theme.glow) {
          ctx.shadowColor = theme.glow;
          ctx.shadowBlur = 12 * scaleMultiplier;
        }

        const grad = ctx.createLinearGradient(d.c[0] - 30, d.c[1] - 30, d.c[0] + 30, d.c[1] + 30);
        grad.addColorStop(0, theme.v1);
        grad.addColorStop(1, theme.v2);

        ctx.fillStyle = grad;
        ctx.fill(path);

        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        ctx.strokeStyle = theme.vStroke;
        ctx.lineWidth = 1.6;
        ctx.stroke(path);
      }
    });

    ctx.restore();

    // 4. Smart Collision-Free District Labels & Pin Dots
    if (showLabels && count > 0) {
      const labels = calculateLabels(scaleMultiplier, mapOffsetX, mapOffsetY, mapScale);

      labels.forEach((lbl) => {
        // Center Pin Dot
        ctx.beginPath();
        ctx.arc(lbl.dotX, lbl.dotY, 3, 0, Math.PI * 2);
        ctx.fillStyle = theme.dot;
        ctx.fill();

        ctx.strokeStyle = theme.halo || theme.bg;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label Text
        ctx.font = "bold 13px 'Anek Bangla', 'Hind Siliguri', sans-serif";
        ctx.textAlign = lbl.align;
        ctx.textBaseline = "middle";

        // High contrast Halo
        ctx.strokeStyle = theme.halo || theme.bg;
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";
        ctx.strokeText(lbl.name, lbl.textX, lbl.textY);

        ctx.fillStyle = theme.label;
        ctx.fillText(lbl.name, lbl.textX, lbl.textY);
      });
    }

    // 5. Progress Bar & Rank Footer
    const percentage = Math.round((count / 64) * 100);
    const travelerInfo = getTravelerTitle(count);
    const footerY = BASE_HEIGHT - 120;

    // Track
    ctx.fillStyle = theme.track;
    ctx.beginPath();
    ctx.roundRect(50, footerY, BASE_WIDTH - 100, 10, 5);
    ctx.fill();

    // Fill
    if (percentage > 0) {
      const fillWidth = Math.max(16, ((BASE_WIDTH - 100) * percentage) / 100);
      const barGrad = ctx.createLinearGradient(50, footerY, 50 + fillWidth, footerY);
      barGrad.addColorStop(0, theme.v1);
      barGrad.addColorStop(1, theme.v2);
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(50, footerY, fillWidth, 10, 5);
      ctx.fill();
    }

    // Texts
    ctx.fillStyle = theme.ink;
    ctx.font = "bold 18px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${toBanglaNum(percentage)}% বাংলাদেশ ঘোরা হয়েছে`, 50, footerY + 36);

    ctx.fillStyle = theme.muted;
    ctx.font = "500 15px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.fillText(`${toBanglaNum(count)}টি জেলা • ৮টি বিভাগের মধ্যে`, 50, footerY + 58);

    // Rank Badge
    ctx.fillStyle = theme.v1 + "20";
    ctx.beginPath();
    ctx.roundRect(BASE_WIDTH - 240, footerY + 16, 190, 42, 21);
    ctx.fill();

    ctx.fillStyle = theme.v1;
    ctx.font = "bold 16px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`🏆 ${travelerInfo.badge}`, BASE_WIDTH - 145, footerY + 42);

    // Watermark
    ctx.fillStyle = theme.muted;
    ctx.font = "600 14px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("দেশ ঘুরি • deshghuri.app", BASE_WIDTH / 2, BASE_HEIGHT - 22);

    ctx.restore();
  };

  // Draw Screen Preview
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? Math.max(window.devicePixelRatio || 1, 2) : 2;
    canvas.width = BASE_WIDTH * dpr;
    canvas.height = BASE_HEIGHT * dpr;

    renderCard(ctx, canvas.width, canvas.height, dpr);
  }, [theme, selectedDistricts, userName, showLabels]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // Click Canvas to Toggle District
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = BASE_WIDTH / rect.width;
    const scaleY = BASE_HEIGHT / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const mapScale = 1.14;
    const mapOffsetX = (BASE_WIDTH - BANGLADESH_WIDTH * mapScale) / 2 + 10;
    const mapOffsetY = 210;

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
      if (!selectedDistricts.has(clickedDistrict)) {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight,
          },
        });
      }
    }
  };

  // HIGH RESOLUTION EXPORT
  const handleDownloadUltraHD = (format: "png" | "jpg" | "story") => {
    setDownloading(format);

    setTimeout(() => {
      // 4X Scale = 4000 x 5400 px Ultra HD!
      const exportScale = 4;
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = BASE_WIDTH * exportScale;
      exportCanvas.height = BASE_HEIGHT * exportScale;

      const ectx = exportCanvas.getContext("2d");
      if (!ectx) return;

      renderCard(ectx, exportCanvas.width, exportCanvas.height, exportScale);

      if (format === "story") {
        // Story 9:16 Canvas (2160 x 3840 Vertical)
        const storyCanvas = document.createElement("canvas");
        storyCanvas.width = 2160;
        storyCanvas.height = 3840;
        const sctx = storyCanvas.getContext("2d");
        if (sctx) {
          sctx.fillStyle = theme.bg;
          sctx.fillRect(0, 0, 2160, 3840);

          const targetW = 2000;
          const targetH = (2000 / BASE_WIDTH) * BASE_HEIGHT;
          const offsetY = (3840 - targetH) / 2;

          sctx.drawImage(exportCanvas, 80, offsetY, targetW, targetH);

          sctx.fillStyle = theme.ink;
          sctx.font = "bold 56px 'Anek Bangla', sans-serif";
          sctx.textAlign = "center";
          sctx.fillText("আপনার বাংলাদেশ ভ্রমণ ম্যাপ তৈরি করুন: deshghuri.app", 1080, 3700);

          const link = document.createElement("a");
          link.download = `amar-bangladesh-story-${Date.now()}.png`;
          link.href = storyCanvas.toDataURL("image/png");
          link.click();
        }
      } else {
        const link = document.createElement("a");
        const mime = format === "jpg" ? "image/jpeg" : "image/png";
        link.download = `amar-bangladesh-${Date.now()}.${format}`;
        link.href = exportCanvas.toDataURL(mime, 0.98);
        link.click();
      }
      setDownloading(null);
    }, 150);
  };

  // INFINITE RESOLUTION SVG (VECTOR) EXPORT
  const handleDownloadSVG = () => {
    setDownloading("svg");

    setTimeout(() => {
      const count = selectedDistricts.size;
      const countText = `${toBanglaNum(count)} / ৬৪`;
      const percentage = Math.round((count / 64) * 100);
      const travelerInfo = getTravelerTitle(count);
      const mapScale = 1.14;
      const mapOffsetX = (BASE_WIDTH - BANGLADESH_WIDTH * mapScale) / 2 + 10;
      const mapOffsetY = 210;

      // Construct pure vector SVG string
      let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BASE_WIDTH} ${BASE_HEIGHT}" width="${BASE_WIDTH}" height="${BASE_HEIGHT}">
  <defs>
    <linearGradient id="visitedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.v1}"/>
      <stop offset="100%" stop-color="${theme.v2}"/>
    </linearGradient>
    <style>
      text { font-family: 'Anek Bangla', 'Hind Siliguri', system-ui, sans-serif; }
    </style>
  </defs>

  <!-- Background Card -->
  <rect width="${BASE_WIDTH}" height="${BASE_HEIGHT}" rx="28" fill="${theme.bg}" stroke="${theme.stroke}" stroke-width="2"/>

  <!-- Header Badge -->
  <rect x="50" y="48" width="160" height="36" rx="18" fill="${theme.v1}20"/>
  <text x="130" y="71" text-anchor="middle" fill="${theme.v1}" font-size="15" font-weight="bold">বাংলাদেশ ভ্রমণ ম্যাপ</text>

  <!-- Title & Counter -->
  <text x="50" y="138" fill="${theme.ink}" font-size="48" font-weight="800">আমার বাংলাদেশ</text>
  <text x="${BASE_WIDTH - 50}" y="138" text-anchor="end" fill="${theme.v1}" font-size="44" font-weight="800">${countText}</text>
`;

      if (userName.trim()) {
        svgContent += `
  <text x="50" y="170" fill="${theme.muted}" font-size="15">ভ্রমণকারী</text>
  <text x="50" y="192" fill="${theme.ink}" font-size="20" font-weight="bold">${userName.trim()}</text>
`;
      }

      // Districts group
      svgContent += `\n  <!-- Districts Map Vector -->\n  <g transform="translate(${mapOffsetX}, ${mapOffsetY}) scale(${mapScale})">\n`;

      // Unvisited districts
      DISTRICTS.forEach((d) => {
        if (!selectedDistricts.has(d.n)) {
          svgContent += `    <path d="${d.d}" fill="${theme.land}" stroke="${theme.stroke}" stroke-width="1.2"/>\n`;
        }
      });

      // Visited districts
      DISTRICTS.forEach((d) => {
        if (selectedDistricts.has(d.n)) {
          svgContent += `    <path d="${d.d}" fill="url(#visitedGrad)" stroke="${theme.vStroke}" stroke-width="1.6"/>\n`;
        }
      });

      svgContent += `  </g>\n`;

      // Labels
      if (showLabels && count > 0) {
        const labels = calculateLabels(1, mapOffsetX, mapOffsetY, mapScale);
        svgContent += `\n  <!-- District Labels -->\n`;
        labels.forEach((lbl) => {
          svgContent += `  <circle cx="${lbl.dotX}" cy="${lbl.dotY}" r="3" fill="${theme.dot}" stroke="${theme.halo || theme.bg}" stroke-width="1.5"/>\n`;
          svgContent += `  <text x="${lbl.textX}" y="${lbl.textY + 4}" text-anchor="${lbl.align}" fill="${theme.label}" font-size="13" font-weight="bold" stroke="${theme.halo || theme.bg}" stroke-width="3" paint-order="stroke">${lbl.name}</text>\n`;
        });
      }

      // Progress bar & Footer
      const footerY = BASE_HEIGHT - 120;
      const fillW = Math.max(16, ((BASE_WIDTH - 100) * percentage) / 100);

      svgContent += `
  <!-- Footer & Stats -->
  <rect x="50" y="${footerY}" width="${BASE_WIDTH - 100}" height="10" rx="5" fill="${theme.track}"/>
  <rect x="50" y="${footerY}" width="${fillW}" height="10" rx="5" fill="url(#visitedGrad)"/>

  <text x="50" y="${footerY + 36}" fill="${theme.ink}" font-size="18" font-weight="bold">${toBanglaNum(percentage)}% বাংলাদেশ ঘোরা হয়েছে</text>
  <text x="50" y="${footerY + 58}" fill="${theme.muted}" font-size="15">${toBanglaNum(count)}টি জেলা • ৮টি বিভাগের মধ্যে</text>

  <rect x="${BASE_WIDTH - 240}" y="${footerY + 16}" width="190" height="42" rx="21" fill="${theme.v1}20"/>
  <text x="${BASE_WIDTH - 145}" y="${footerY + 42}" text-anchor="middle" fill="${theme.v1}" font-size="16" font-weight="bold">🏆 ${travelerInfo.badge}</text>

  <text x="${BASE_WIDTH / 2}" y="${BASE_HEIGHT - 22}" text-anchor="middle" fill="${theme.muted}" font-size="14">দেশ ঘুরি • deshghuri.app</text>
</svg>`;

      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `amar-bangladesh-vector-${Date.now()}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
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
      {/* Canvas Wrap */}
      <div className="relative w-full max-w-[540px] rounded-2xl overflow-hidden shadow-xl border border-border bg-white transition-all hover:shadow-2xl">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-auto cursor-pointer block select-none"
        />
      </div>

      {/* Download Action Section */}
      <div className="w-full max-w-[540px] mt-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-foreground/80 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-emerald-600" /> ডাউনলোড করুন
          </span>
          <button
            onClick={copyShareLink}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 px-2.5 py-1 rounded-full border border-border hover:bg-muted transition"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            {copiedLink ? "লিংক কপি হয়েছে" : "শেয়ার করুন"}
          </button>
        </div>

        {/* Buttons: PNG, JPG, SVG, Story 9:16 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => handleDownloadUltraHD("png")}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            {downloading === "png" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>PNG</span>
          </button>

          <button
            onClick={() => handleDownloadUltraHD("jpg")}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold text-xs bg-zinc-800 hover:bg-zinc-900 text-white shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            {downloading === "jpg" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>JPG</span>
          </button>

          <button
            onClick={handleDownloadSVG}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            {downloading === "svg" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>SVG</span>
          </button>

          <button
            onClick={() => handleDownloadUltraHD("story")}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
            title="ইনস্টাগ্রাম ও ফেসবুক স্টোরি সাইজ"
          >
            {downloading === "story" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Story (9:16)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

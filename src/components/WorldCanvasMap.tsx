"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { COUNTRIES, WORLD_WIDTH, WORLD_HEIGHT } from "@/data/countries";
import { toBanglaNum } from "@/data/districts";
import { MapTheme } from "@/types";
import { Download, Sparkles, Share2, Check, RefreshCw, ZoomIn, FileCode } from "lucide-react";
import confetti from "canvas-confetti";

interface Props {
  selectedCountries: Set<string>;
  onToggleCountry: (code: string) => void;
  theme: MapTheme;
  userName: string;
  userPhoto: string | null;
  showLabels: boolean;
}

export default function WorldCanvasMap({
  selectedCountries,
  onToggleCountry,
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

  useEffect(() => {
    if (pathsRef.current.size === 0) {
      COUNTRIES.forEach((c) => {
        pathsRef.current.set(c.i, new Path2D(c.d));
      });
    }
  }, []);

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

  const BASE_WIDTH = 1200;
  const BASE_HEIGHT = 860;

  // Collision-free placement for world labels
  const calculateWorldLabels = (mapOffsetX: number, mapOffsetY: number, mapScale: number) => {
    const visited = COUNTRIES.filter((c) => selectedCountries.has(c.i));
    // Bangladesh always first so its label and pin get top priority!
    visited.sort((a, b) => (b.i === "BGD" ? 1 : 0) - (a.i === "BGD" ? 1 : 0));

    const placedBoxes: { x: number; y: number; w: number; h: number }[] = [];
    const results: {
      code: string;
      name: string;
      dotX: number;
      dotY: number;
      textX: number;
      textY: number;
      align: CanvasTextAlign;
      isBangladesh: boolean;
    }[] = [];

    const tries: [number, number][] = [
      [0, -12],
      [0, 18],
      [14, 5],
      [-14, 5],
      [0, -26],
      [0, 32],
      [22, -10],
      [-22, -10],
      [22, 18],
      [-22, 18],
    ];

    visited.forEach((c) => {
      const rawC = (c as any).c;
      if (!rawC) return;
      const cx = mapOffsetX + rawC[0] * mapScale;
      const cy = mapOffsetY + rawC[1] * mapScale;

      const approxW = c.b.length * 13 + 6;
      const h = 20;

      let chosen: { textX: number; textY: number; align: CanvasTextAlign; box: any } | null = null;

      for (const [dx, dy] of tries) {
        const align: CanvasTextAlign = dx > 0 ? "left" : dx < 0 ? "right" : "center";
        const x0 = align === "left" ? cx + dx : align === "right" ? cx + dx - approxW : cx - approxW / 2;
        const y0 = cy + dy - h + 4;
        const box = { x: x0, y: y0, w: approxW, h };

        const hasOverlap = placedBoxes.some(
          (b) => box.x < b.x + b.w && box.x + box.w > b.x && box.y < b.y + b.h && box.y + box.h > b.y
        );

        if (!hasOverlap) {
          chosen = { textX: cx + dx, textY: cy + dy, align, box };
          break;
        }
      }

      if (!chosen) {
        const box = { x: cx - approxW / 2, y: cy - 20, w: approxW, h };
        chosen = { textX: cx, textY: cy - 8, align: "center", box };
      }

      placedBoxes.push(chosen.box);
      placedBoxes.push({ x: cx - 5, y: cy - 5, w: 10, h: 10 });

      results.push({
        code: c.i,
        name: c.b,
        dotX: cx,
        dotY: cy,
        textX: chosen.textX,
        textY: chosen.textY,
        align: chosen.align,
        isBangladesh: c.i === "BGD",
      });
    });

    return results;
  };

  const renderWorldCard = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scaleMultiplier: number
  ) => {
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
    ctx.fillStyle = theme.v1 + "18";
    ctx.beginPath();
    ctx.roundRect(50, 42, 140, 34, 17);
    ctx.fill();

    ctx.fillStyle = theme.v1;
    ctx.font = "bold 15px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("বিশ্ব ভ্রমণ ম্যাপ", 120, 64);

    ctx.fillStyle = theme.ink;
    ctx.font = "800 44px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("আমার পৃথিবী", 50, 130);

    const count = selectedCountries.size;
    const countText = `${toBanglaNum(count)} / ১৯৪`;
    ctx.font = "800 42px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = theme.v1;
    ctx.fillText(countText, BASE_WIDTH - 50, 130);

    // User Avatar & Name
    if (userName.trim() || userImgRef.current) {
      let leftX = 50;
      if (userImgRef.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(leftX + 20, 168, 20, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(userImgRef.current, leftX, 148, 40, 40);
        ctx.restore();

        ctx.strokeStyle = theme.v1;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(leftX + 20, 168, 21, 0, Math.PI * 2);
        ctx.stroke();
        leftX += 52;
      }
      if (userName.trim()) {
        ctx.fillStyle = theme.muted;
        ctx.font = "500 14px 'Anek Bangla', 'Hind Siliguri', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("গ্লোবট্রটার", leftX, 160);
        ctx.fillStyle = theme.ink;
        ctx.font = "bold 18px 'Anek Bangla', 'Hind Siliguri', sans-serif";
        ctx.fillText(userName.trim(), leftX, 180);
      }
    }

    // 3. Render World Map
    const mapScale = 1.08;
    const mapOffsetX = (BASE_WIDTH - WORLD_WIDTH * mapScale) / 2;
    const mapOffsetY = 205;

    ctx.save();
    ctx.translate(mapOffsetX, mapOffsetY);
    ctx.scale(mapScale, mapScale);

    // Draw unvisited
    COUNTRIES.forEach((c) => {
      const path = pathsRef.current.get(c.i);
      if (!path) return;
      if (!selectedCountries.has(c.i)) {
        ctx.fillStyle = theme.land;
        ctx.fill(path);
        ctx.strokeStyle = theme.stroke;
        ctx.lineWidth = 0.8;
        ctx.stroke(path);
      }
    });

    // Draw visited
    COUNTRIES.forEach((c) => {
      const path = pathsRef.current.get(c.i);
      if (!path) return;
      if (selectedCountries.has(c.i)) {
        if (theme.glow) {
          ctx.shadowColor = theme.glow;
          ctx.shadowBlur = 10 * scaleMultiplier;
        }

        ctx.fillStyle = theme.v1;
        ctx.fill(path);

        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        ctx.strokeStyle = theme.vStroke;
        ctx.lineWidth = 1.2;
        ctx.stroke(path);
      }
    });

    ctx.restore();

    // 4. Highlight Small Countries & Spotlight Bangladesh!
    const labels = calculateWorldLabels(mapOffsetX, mapOffsetY, mapScale);

    labels.forEach((lbl) => {
      if (lbl.isBangladesh) {
        // SPECIAL BANGLADESH SPOTLIGHT PIN!
        // Outer pulsing target ring
        ctx.beginPath();
        ctx.arc(lbl.dotX, lbl.dotY, 9, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(244, 42, 65, 0.25)";
        ctx.fill();

        ctx.strokeStyle = "#f42a41";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Inner solid red pin
        ctx.beginPath();
        ctx.arc(lbl.dotX, lbl.dotY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#f42a41";
        ctx.fill();

        // Leader line to text
        ctx.beginPath();
        ctx.moveTo(lbl.dotX, lbl.dotY);
        ctx.lineTo(lbl.textX, lbl.textY);
        ctx.strokeStyle = "rgba(244, 42, 65, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Bold red label badge for Bangladesh
        ctx.font = "800 13px 'Anek Bangla', 'Hind Siliguri', sans-serif";
        ctx.textAlign = lbl.align;
        ctx.textBaseline = "middle";

        ctx.strokeStyle = theme.halo || theme.bg;
        ctx.lineWidth = 4;
        ctx.strokeText("🇧🇩 " + lbl.name, lbl.textX, lbl.textY);

        ctx.fillStyle = "#b91c1c";
        ctx.fillText("🇧🇩 " + lbl.name, lbl.textX, lbl.textY);
      } else {
        // Standard pin for other small/visited countries
        ctx.beginPath();
        ctx.arc(lbl.dotX, lbl.dotY, 3, 0, Math.PI * 2);
        ctx.fillStyle = theme.v1;
        ctx.fill();

        ctx.strokeStyle = theme.halo || theme.bg;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (showLabels) {
          ctx.font = "bold 11px 'Anek Bangla', 'Hind Siliguri', sans-serif";
          ctx.textAlign = lbl.align;
          ctx.textBaseline = "middle";

          ctx.strokeStyle = theme.halo || theme.bg;
          ctx.lineWidth = 3.5;
          ctx.strokeText(lbl.name, lbl.textX, lbl.textY);

          ctx.fillStyle = theme.label;
          ctx.fillText(lbl.name, lbl.textX, lbl.textY);
        }
      }
    });

    // 5. Footer stats
    const percentage = Math.round((count / 194) * 100);
    const footerY = BASE_HEIGHT - 110;

    ctx.fillStyle = theme.track;
    ctx.beginPath();
    ctx.roundRect(50, footerY, BASE_WIDTH - 100, 10, 5);
    ctx.fill();

    if (percentage > 0) {
      const fillW = Math.max(16, ((BASE_WIDTH - 100) * percentage) / 100);
      const grad = ctx.createLinearGradient(50, footerY, 50 + fillW, footerY);
      grad.addColorStop(0, theme.v1);
      grad.addColorStop(1, theme.v2);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(50, footerY, fillW, 10, 5);
      ctx.fill();
    }

    ctx.fillStyle = theme.ink;
    ctx.font = "bold 18px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`বিশ্বের ${toBanglaNum(percentage)}% দেশ ঘোরা হয়েছে`, 50, footerY + 36);

    ctx.fillStyle = theme.muted;
    ctx.font = "500 15px 'Anek Bangla', 'Hind Siliguri', sans-serif";
    ctx.fillText(`${toBanglaNum(count)}টি দেশ • ৬টি মহাদেশের মধ্যে`, 50, footerY + 58);

    ctx.fillStyle = theme.muted;
    ctx.font = "600 14px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("দেশ ঘুরি • deshghuri.app", BASE_WIDTH / 2, BASE_HEIGHT - 22);

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

    renderWorldCard(ctx, canvas.width, canvas.height, dpr);
  }, [theme, selectedCountries, userName, showLabels]);

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

    const mapScale = 1.08;
    const mapOffsetX = (BASE_WIDTH - WORLD_WIDTH * mapScale) / 2;
    const mapOffsetY = 205;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.translate(mapOffsetX, mapOffsetY);
    ctx.scale(mapScale, mapScale);

    let clickedCountry: string | null = null;
    COUNTRIES.forEach((c) => {
      const path = pathsRef.current.get(c.i);
      if (path && ctx.isPointInPath(path, (mouseX - mapOffsetX) / mapScale, (mouseY - mapOffsetY) / mapScale)) {
        clickedCountry = c.i;
      }
    });

    ctx.restore();

    if (clickedCountry) {
      onToggleCountry(clickedCountry);
      if (!selectedCountries.has(clickedCountry)) {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight,
          },
        });
      }
    }
  };

  // High Resolution Export
  const handleDownloadUltraHD = (format: "png" | "jpg") => {
    setDownloading(format);

    setTimeout(() => {
      const exportScale = 4; // 4800 x 3440 px HD Export
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = BASE_WIDTH * exportScale;
      exportCanvas.height = BASE_HEIGHT * exportScale;

      const ectx = exportCanvas.getContext("2d");
      if (!ectx) return;

      renderWorldCard(ectx, exportCanvas.width, exportCanvas.height, exportScale);

      const link = document.createElement("a");
      const mime = format === "jpg" ? "image/jpeg" : "image/png";
      link.download = `amar-prithibi-${Date.now()}.${format}`;
      link.href = exportCanvas.toDataURL(mime, 0.98);
      link.click();
      setDownloading(null);
    }, 150);
  };

  // SVG Vector Export
  const handleDownloadSVG = () => {
    setDownloading("svg");

    setTimeout(() => {
      const count = selectedCountries.size;
      const countText = `${toBanglaNum(count)} / ১৯৪`;
      const percentage = Math.round((count / 194) * 100);
      const mapScale = 1.08;
      const mapOffsetX = (BASE_WIDTH - WORLD_WIDTH * mapScale) / 2;
      const mapOffsetY = 205;

      let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BASE_WIDTH} ${BASE_HEIGHT}" width="${BASE_WIDTH}" height="${BASE_HEIGHT}">
  <style>
    text { font-family: 'Anek Bangla', 'Hind Siliguri', system-ui, sans-serif; }
  </style>

  <rect width="${BASE_WIDTH}" height="${BASE_HEIGHT}" rx="28" fill="${theme.bg}" stroke="${theme.stroke}" stroke-width="2"/>

  <rect x="50" y="42" width="140" height="34" rx="17" fill="${theme.v1}18"/>
  <text x="120" y="64" text-anchor="middle" fill="${theme.v1}" font-size="15" font-weight="bold">বিশ্ব ভ্রমণ ম্যাপ</text>

  <text x="50" y="130" fill="${theme.ink}" font-size="44" font-weight="800">আমার পৃথিবী</text>
  <text x="${BASE_WIDTH - 50}" y="130" text-anchor="end" fill="${theme.v1}" font-size="42" font-weight="800">${countText}</text>
`;

      if (userName.trim()) {
        svgContent += `
  <text x="50" y="160" fill="${theme.muted}" font-size="14">গ্লোবট্রটার</text>
  <text x="50" y="180" fill="${theme.ink}" font-size="18" font-weight="bold">${userName.trim()}</text>
`;
      }

      svgContent += `\n  <g transform="translate(${mapOffsetX}, ${mapOffsetY}) scale(${mapScale})">\n`;

      COUNTRIES.forEach((c) => {
        if (!selectedCountries.has(c.i)) {
          svgContent += `    <path d="${c.d}" fill="${theme.land}" stroke="${theme.stroke}" stroke-width="0.8"/>\n`;
        }
      });

      COUNTRIES.forEach((c) => {
        if (selectedCountries.has(c.i)) {
          svgContent += `    <path d="${c.d}" fill="${theme.v1}" stroke="${theme.vStroke}" stroke-width="1.2"/>\n`;
        }
      });

      svgContent += `  </g>\n`;

      const labels = calculateWorldLabels(mapOffsetX, mapOffsetY, mapScale);
      svgContent += `\n  <!-- Country Labels & Bangladesh Spotlight -->\n`;
      labels.forEach((lbl) => {
        if (lbl.isBangladesh) {
          svgContent += `  <circle cx="${lbl.dotX}" cy="${lbl.dotY}" r="7" fill="rgba(244,42,65,0.25)" stroke="#f42a41" stroke-width="1.8"/>\n`;
          svgContent += `  <circle cx="${lbl.dotX}" cy="${lbl.dotY}" r="4" fill="#f42a41"/>\n`;
          svgContent += `  <line x1="${lbl.dotX}" y1="${lbl.dotY}" x2="${lbl.textX}" y2="${lbl.textY}" stroke="rgba(244,42,65,0.6)" stroke-width="1.5"/>\n`;
          svgContent += `  <text x="${lbl.textX}" y="${lbl.textY + 4}" text-anchor="${lbl.align}" fill="#b91c1c" font-size="13" font-weight="800" stroke="${theme.halo || theme.bg}" stroke-width="3.5" paint-order="stroke">🇧🇩 ${lbl.name}</text>\n`;
        } else {
          svgContent += `  <circle cx="${lbl.dotX}" cy="${lbl.dotY}" r="3" fill="${theme.v1}" stroke="${theme.halo || theme.bg}" stroke-width="1.5"/>\n`;
          if (showLabels) {
            svgContent += `  <text x="${lbl.textX}" y="${lbl.textY + 3}" text-anchor="${lbl.align}" fill="${theme.label}" font-size="11" font-weight="bold" stroke="${theme.halo || theme.bg}" stroke-width="3" paint-order="stroke">${lbl.name}</text>\n`;
          }
        }
      });

      const footerY = BASE_HEIGHT - 110;
      const fillW = Math.max(16, ((BASE_WIDTH - 100) * percentage) / 100);

      svgContent += `
  <rect x="50" y="${footerY}" width="${BASE_WIDTH - 100}" height="10" rx="5" fill="${theme.track}"/>
  <rect x="50" y="${footerY}" width="${fillW}" height="10" rx="5" fill="${theme.v1}"/>

  <text x="50" y="${footerY + 36}" fill="${theme.ink}" font-size="18" font-weight="bold">বিশ্বের ${toBanglaNum(percentage)}% দেশ ঘোরা হয়েছে</text>
  <text x="50" y="${footerY + 58}" fill="${theme.muted}" font-size="15">${toBanglaNum(count)}টি দেশ • ৬টি মহাদেশের মধ্যে</text>

  <text x="${BASE_WIDTH / 2}" y="${BASE_HEIGHT - 22}" text-anchor="middle" fill="${theme.muted}" font-size="14">দেশ ঘুরি • deshghuri.app</text>
</svg>`;

      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `amar-prithibi-vector-${Date.now()}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setDownloading(null);
    }, 150);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-[620px] rounded-2xl overflow-hidden shadow-xl border border-border bg-white transition-all hover:shadow-2xl">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-auto cursor-pointer block select-none"
        />
      </div>

      <div className="w-full max-w-[620px] mt-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-foreground/80 flex items-center gap-1.5">
            <Download className="w-4 h-4 text-blue-600" /> ডাউনলোড করুন
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => handleDownloadUltraHD("png")}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            {downloading === "png" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>PNG</span>
          </button>

          <button
            onClick={() => handleDownloadUltraHD("jpg")}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs bg-zinc-800 hover:bg-zinc-900 text-white shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            {downloading === "jpg" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>JPG</span>
          </button>

          <button
            onClick={handleDownloadSVG}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            {downloading === "svg" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>SVG</span>
          </button>
        </div>
      </div>
    </div>
  );
}

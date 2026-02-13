"use client";

import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { SlideElement } from "../lib/types";

const FONT_SIZES = [16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72];
const COLOR_SWATCHES = [
  "#0f172a", "#1e293b", "#475569", "#ffffff",
  "#dc2626", "#ea580c", "#d97706", "#16a34a",
  "#2563eb", "#7c3aed", "#db2777", "#0891b2",
];

interface Props {
  element: SlideElement;
  canvasScale: number;
  onChange: (updates: Partial<SlideElement>) => void;
}

export default function FloatingToolbar({ element, canvasScale, onChange }: Props) {
  const top = (element.y) * canvasScale - 48;
  const left = (element.x) * canvasScale;

  return (
    <div
      className="absolute z-50 flex items-center gap-1 bg-white rounded-lg shadow-xl border border-gray-200 px-2 py-1"
      style={{ top: Math.max(0, top), left: Math.max(0, left) }}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Bold */}
      <button
        onClick={() => onChange({ fontWeight: element.fontWeight === "bold" ? "normal" : "bold" })}
        className={`p-1.5 rounded hover:bg-gray-100 ${element.fontWeight === "bold" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
      >
        <Bold size={14} />
      </button>

      {/* Italic */}
      <button
        onClick={() => onChange({ fontStyle: element.fontStyle === "italic" ? "normal" : "italic" })}
        className={`p-1.5 rounded hover:bg-gray-100 ${element.fontStyle === "italic" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
      >
        <Italic size={14} />
      </button>

      {/* Underline */}
      <button
        onClick={() => onChange({ textDecoration: element.textDecoration === "underline" ? "none" : "underline" })}
        className={`p-1.5 rounded hover:bg-gray-100 ${element.textDecoration === "underline" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
      >
        <Underline size={14} />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Font size */}
      <select
        value={element.fontSize || 24}
        onChange={e => onChange({ fontSize: Number(e.target.value) })}
        className="text-xs border border-gray-200 rounded px-1 py-1 bg-white text-gray-700 outline-none"
      >
        {FONT_SIZES.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Align */}
      {(["left", "center", "right"] as const).map(a => (
        <button
          key={a}
          onClick={() => onChange({ align: a })}
          className={`p-1.5 rounded hover:bg-gray-100 ${element.align === a ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}
        >
          {a === "left" ? <AlignLeft size={14} /> : a === "center" ? <AlignCenter size={14} /> : <AlignRight size={14} />}
        </button>
      ))}

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Color swatches */}
      <div className="flex gap-0.5">
        {COLOR_SWATCHES.map(c => (
          <button
            key={c}
            onClick={() => onChange({ fill: c })}
            className={`w-4 h-4 rounded-full border ${element.fill === c ? "border-blue-500 ring-1 ring-blue-300" : "border-gray-300"}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { Slide } from "../../lib/types";
import { Plus, Play, Atom, Orbit, Zap, Waves } from "lucide-react";

const STORE_ITEMS = [
  { icon: Atom, label: "Rơi tự do", desc: "Vật rơi từ độ cao h" },
  { icon: Orbit, label: "Con lắc đơn", desc: "Dao động điều hoà" },
  { icon: Zap, label: "Mạch điện RLC", desc: "Dòng điện xoay chiều" },
  { icon: Waves, label: "Sóng cơ học", desc: "Giao thoa hai nguồn" },
];

interface Props {
  slide: Slide;
  onCreateNew?: () => void;
  onPickStore?: (label: string) => void;
}

export default function SimulationPlaceholder({ slide, onCreateNew, onPickStore }: Props) {
  // If simulation HTML exists, render it
  if (slide.simulationHtml) {
    return (
      <div className="w-full h-full relative">
        <iframe
          srcDoc={slide.simulationHtml}
          sandbox="allow-scripts"
          className="w-full h-full border-0"
          title={slide.title}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-8 bg-gradient-to-br from-indigo-50 to-blue-50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{slide.title}</h2>

      {/* Store grid */}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 mb-3">Chọn mô phỏng có sẵn</p>
        <div className="grid grid-cols-2 gap-3">
          {STORE_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => onPickStore?.(item.label)}
              className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                <item.icon size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Create new button */}
      <button
        onClick={onCreateNew}
        className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 font-medium hover:bg-blue-50 hover:border-blue-400 transition-colors"
      >
        <Plus size={18} />
        Tạo mô phỏng mới bằng AI
      </button>
    </div>
  );
}

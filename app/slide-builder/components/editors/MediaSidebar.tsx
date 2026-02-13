"use client";

import { ImageIcon, Upload } from "lucide-react";

const SAMPLE_IMAGES = [
  "https://placehold.co/200x120/e0e7ff/4f46e5?text=Hình+1",
  "https://placehold.co/200x120/dcfce7/16a34a?text=Hình+2",
  "https://placehold.co/200x120/fef3c7/d97706?text=Hình+3",
  "https://placehold.co/200x120/fce7f3/db2777?text=Hình+4",
  "https://placehold.co/200x120/e0f2fe/0284c7?text=Biểu+đồ",
  "https://placehold.co/200x120/f3e8ff/7c3aed?text=Sơ+đồ",
];

export default function MediaSidebar() {
  return (
    <div className="w-56 shrink-0 bg-white border-l border-gray-200 overflow-y-auto p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <ImageIcon size={14} /> Thư viện ảnh
      </h3>
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 transition-colors">
        <Upload size={20} className="text-gray-400 mb-1" />
        <span className="text-xs text-gray-500">Tải ảnh lên</span>
        <input type="file" accept="image/*" className="hidden" />
      </label>
      <div className="space-y-2">
        {SAMPLE_IMAGES.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`media-${i}`}
            draggable
            className="w-full rounded-lg border border-gray-200 cursor-grab hover:border-blue-400 transition-colors"
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { ImageIcon, Upload, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { useSlideStore } from "../../hooks/useSlideStore";
import { v4 as uuid } from "uuid";

export default function MediaSidebar() {
  const [images, setImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const { state, dispatch } = useSlideStore();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const insertImage = (src: string) => {
    const slide = state.presentation?.slides[state.activeSlideIndex];
    if (!slide) return;
    // Get image dimensions for aspect ratio
    const img = new window.Image();
    img.onload = () => {
      const maxW = 400;
      const ratio = img.height / img.width;
      const w = Math.min(img.width, maxW);
      const h = w * ratio;
      dispatch({
        type: "UPDATE_SLIDE",
        index: state.activeSlideIndex,
        slide: {
          ...slide,
          elements: [...slide.elements, {
            id: uuid(),
            type: "image" as const,
            x: 280,
            y: 150,
            width: Math.round(w),
            height: Math.round(h),
            content: "",
            src,
          }],
        },
      });
    };
    img.src = src;
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-56 shrink-0 bg-white border-l border-gray-200 overflow-y-auto p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <ImageIcon size={14} /> Thư viện ảnh
      </h3>
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 transition-colors">
        <Upload size={20} className="text-gray-400 mb-1" />
        <span className="text-xs text-gray-500">Tải ảnh lên</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </label>
      {images.length === 0 && (
        <p className="text-xs text-gray-400 text-center">Chưa có ảnh nào. Tải lên để bắt đầu.</p>
      )}
      <div className="space-y-2">
        {images.map((src, i) => (
          <div key={i} className="relative group">
            <img
              src={src}
              alt={`upload-${i}`}
              className="w-full rounded-lg border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => insertImage(src)}
            />
            <button
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

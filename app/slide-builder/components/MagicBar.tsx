"use client";

import { Sparkles, Play, Copy, RefreshCw, Type, Calculator } from "lucide-react";
import { useState } from "react";
import { useSlideStore } from "../hooks/useSlideStore";
import { createDefaultSlide } from "../lib/slideDefaults";
import { v4 as uuid } from "uuid";

export default function MagicBar() {
  const [visible, setVisible] = useState(false);
  const { state, dispatch } = useSlideStore();

  const close = () => setVisible(false);

  const insertSimulation = () => {
    dispatch({
      type: "ADD_SLIDE",
      slide: createDefaultSlide("simulation", "Mô phỏng tương tác"),
      afterIndex: state.activeSlideIndex,
    });
    close();
  };

  const insertTextElement = () => {
    const slide = state.presentation?.slides[state.activeSlideIndex];
    if (!slide) return;
    dispatch({
      type: "UPDATE_SLIDE",
      index: state.activeSlideIndex,
      slide: {
        ...slide,
        elements: [...slide.elements, {
          id: uuid(), type: "text", x: 80, y: 200 + slide.elements.length * 50,
          width: 800, height: 40, content: "Nhập nội dung mới...",
          fontSize: 24, fill: "#1e293b", align: "left",
        }],
      },
    });
    close();
  };

  const insertFormula = () => {
    const slide = state.presentation?.slides[state.activeSlideIndex];
    if (!slide) return;
    dispatch({
      type: "UPDATE_SLIDE",
      index: state.activeSlideIndex,
      slide: {
        ...slide,
        elements: [...slide.elements, {
          id: uuid(), type: "formula", x: 200, y: 250 + slide.elements.length * 50,
          width: 560, height: 60, content: "E = mc^2",
          fontSize: 28, fill: "#2563eb", align: "center",
        }],
      },
    });
    close();
  };

  const duplicateSlide = () => {
    const slide = state.presentation?.slides[state.activeSlideIndex];
    if (!slide) return;
    dispatch({
      type: "ADD_SLIDE",
      slide: { ...slide, id: uuid(), title: slide.title + " (bản sao)" },
      afterIndex: state.activeSlideIndex,
    });
    close();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setVisible(!visible)}
        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <Sparkles size={14} />
        Magic
      </button>
      {visible && (
        <>
          <div className="fixed inset-0 z-30" onClick={close} />
          <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-1.5 min-w-[220px] z-40">
            <button onClick={insertTextElement} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
              <Type size={14} /> Thêm văn bản
            </button>
            <button onClick={insertFormula} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
              <Calculator size={14} /> Thêm công thức
            </button>
            <button onClick={insertSimulation} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
              <Play size={14} /> Chèn mô phỏng
            </button>
            <button onClick={duplicateSlide} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
              <Copy size={14} /> Nhân bản slide
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button onClick={close} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors">
              <RefreshCw size={14} /> AI viết lại (sắp ra mắt)
            </button>
          </div>
        </>
      )}
    </div>
  );
}

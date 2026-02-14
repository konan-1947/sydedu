"use client";

import { useSlideStore } from "../hooks/useSlideStore";
import { usePresentMode } from "../hooks/usePresentMode";
import SlideRenderer from "./SlideRenderer";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function PresentMode() {
  const { state, dispatch } = useSlideStore();
  const slides = state.presentation?.slides || [];
  const activeIndex = state.activeSlideIndex;
  const { containerRef } = usePresentMode({
    totalSlides: slides.length,
    activeIndex,
    onNavigate: (index) => dispatch({ type: "SET_ACTIVE", index }),
    onExit: () => dispatch({ type: "SET_PHASE", phase: "editor" }),
  });

  const slide = slides[activeIndex];
  if (!slide) return null;

  const canPrev = activeIndex > 0;
  const canNext = activeIndex < slides.length - 1;

  return (
    <div ref={containerRef} className="group fixed inset-0 bg-black z-50 flex items-center justify-center">
      <SlideRenderer slide={slide} className="w-full h-full" style={{ maxWidth: "100vw", maxHeight: "100vh" }} />
      <button
        onClick={() => dispatch({ type: "SET_PHASE", phase: "editor" })}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
      >
        <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors">
          <X size={20} />
        </div>
      </button>
      {canPrev && (
        <button
          onClick={() => dispatch({ type: "SET_ACTIVE", index: activeIndex - 1 })}
          className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        >
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors">
            <ChevronLeft size={22} />
          </div>
        </button>
      )}
      {canNext && (
        <button
          onClick={() => dispatch({ type: "SET_ACTIVE", index: activeIndex + 1 })}
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        >
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors">
            <ChevronRight size={22} />
          </div>
        </button>
      )}
      <div className="absolute bottom-4 right-4 text-white/50 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {activeIndex + 1} / {slides.length} — ESC để thoát
      </div>
    </div>
  );
}

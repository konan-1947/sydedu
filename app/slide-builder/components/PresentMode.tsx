"use client";

import { useSlideStore } from "../hooks/useSlideStore";
import { usePresentMode } from "../hooks/usePresentMode";
import SlideRenderer from "./SlideRenderer";

export default function PresentMode() {
  const { state, dispatch } = useSlideStore();
  const slides = state.presentation?.slides || [];
  const { containerRef } = usePresentMode({
    totalSlides: slides.length,
    activeIndex: state.activeSlideIndex,
    onNavigate: (index) => dispatch({ type: "SET_ACTIVE", index }),
    onExit: () => dispatch({ type: "SET_PHASE", phase: "editor" }),
  });

  const slide = slides[state.activeSlideIndex];
  if (!slide) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black z-50 flex items-center justify-center cursor-none">
      <SlideRenderer slide={slide} className="w-full h-full" style={{ maxWidth: "100vw", maxHeight: "100vh" }} />
      <div className="absolute bottom-4 right-4 text-white/50 text-sm">
        {state.activeSlideIndex + 1} / {slides.length} — ESC để thoát
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useCallback } from "react";

interface Options {
  totalSlides: number;
  activeIndex: number;
  onNavigate: (index: number) => void;
  onExit: () => void;
}

export function usePresentMode({ totalSlides, activeIndex, onNavigate, onExit }: Options) {
  const containerRef = useRef<HTMLDivElement>(null);
  const didEnterFullscreen = useRef(false);

  const handleKey = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
      case " ":
        e.preventDefault();
        if (activeIndex < totalSlides - 1) onNavigate(activeIndex + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        if (activeIndex > 0) onNavigate(activeIndex - 1);
        break;
      case "Escape":
        e.preventDefault();
        if (document.fullscreenElement) document.exitFullscreen();
        onExit();
        break;
    }
  }, [activeIndex, totalSlides, onNavigate, onExit]);

  // Keyboard listener - re-registers when activeIndex changes
  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Fullscreen - enter once on mount, exit on unmount
  useEffect(() => {
    if (!didEnterFullscreen.current && containerRef.current) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      didEnterFullscreen.current = true;
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  return { containerRef };
}

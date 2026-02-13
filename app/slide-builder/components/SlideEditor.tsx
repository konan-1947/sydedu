"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSlideStore } from "../hooks/useSlideStore";
import { SLIDE_WIDTH, SLIDE_HEIGHT } from "../lib/slideDefaults";
import SlideRenderer from "./SlideRenderer";
import FormulaEditor from "./editors/FormulaEditor";
import KonvaCanvas from "./KonvaCanvas";
import { useRouter } from "next/navigation";

export default function SlideEditor() {
  const { state, dispatch, undo, redo } = useSlideStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [editingFormula, setEditingFormula] = useState<{ elementId: string; content: string } | null>(null);
  const router = useRouter();

  const slide = state.presentation?.slides[state.activeSlideIndex];

  const updateSize = useCallback(() => {
    if (!containerRef.current) return;
    const { width } = containerRef.current.getBoundingClientRect();
    setScale(Math.min((width - 48) / SLIDE_WIDTH, 1));
  }, []);

  useEffect(() => {
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateSize]);

  // Clear editing state when changing slides
  useEffect(() => {
    setEditingFormula(null);
  }, [state.activeSlideIndex]);

  // Listen for simulation HTML returned from /simu-gen
  useEffect(() => {
    const html = sessionStorage.getItem("simugen_result_html");
    const targetSlideId = sessionStorage.getItem("simugen_target_slide");
    if (html && targetSlideId && state.presentation) {
      const slideIndex = state.presentation.slides.findIndex(s => s.id === targetSlideId);
      if (slideIndex !== -1) {
        const targetSlide = state.presentation.slides[slideIndex];
        dispatch({
          type: "UPDATE_SLIDE",
          index: slideIndex,
          slide: { ...targetSlide, simulationHtml: html },
        });
      }
      sessionStorage.removeItem("simugen_result_html");
      sessionStorage.removeItem("simugen_target_slide");
    }
  }, [state.presentation, dispatch]);

  // Keyboard shortcuts: Ctrl+Z, Ctrl+Shift+Z
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  if (!slide) return null;

  const handleSlideUpdate = (updatedSlide: typeof slide) => {
    dispatch({ type: "UPDATE_SLIDE", index: state.activeSlideIndex, slide: updatedSlide });
  };

  const handleEditFormula = (elementId: string, latex: string) => {
    setEditingFormula({ elementId, content: latex });
  };

  const handleFormulaSave = (latex: string) => {
    if (!editingFormula || !slide) return;
    const updatedElements = slide.elements.map(el =>
      el.id === editingFormula.elementId ? { ...el, content: latex } : el
    );
    dispatch({ type: "UPDATE_SLIDE", index: state.activeSlideIndex, slide: { ...slide, elements: updatedElements } });
    setEditingFormula(null);
  };

  const handleSimulationCreate = () => {
    sessionStorage.setItem("simugen_target_slide", slide.id);
    sessionStorage.setItem("simugen_return", "true");
    sessionStorage.setItem("simugen_prefill", slide.title);
    router.push("/simu-gen");
  };

  const handleSimulationPick = (label: string) => {
    sessionStorage.setItem("simugen_target_slide", slide.id);
    sessionStorage.setItem("simugen_return", "true");
    sessionStorage.setItem("simugen_prefill", `Mô phỏng ${label}`);
    router.push("/simu-gen");
  };

  const scaledW = SLIDE_WIDTH * scale;
  const scaledH = SLIDE_HEIGHT * scale;

  return (
    <div ref={containerRef} className="flex-1 flex items-start justify-center bg-gray-100 pt-4 px-6 relative group/editor">
      {slide.type === "simulation" ? (
        <div
          className="shadow-2xl rounded-lg overflow-hidden bg-white relative"
          style={{ width: scaledW, height: scaledH }}
        >
          {slide.simulationHtml ? (
            <iframe
              srcDoc={slide.simulationHtml}
              sandbox="allow-scripts"
              className="border-0 absolute top-0 left-0"
              title={slide.title}
              style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT, transform: `scale(${scale})`, transformOrigin: "top left" }}
            />
          ) : (
            <div style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
              <SlideRenderer
                slide={slide}
                className="w-full h-full"
                interactive
                onSimulationCreate={handleSimulationCreate}
                onSimulationPick={handleSimulationPick}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="shadow-2xl rounded-lg overflow-hidden bg-white">
          <KonvaCanvas
            slide={slide}
            scale={scale}
            onUpdate={handleSlideUpdate}
            onEditFormula={handleEditFormula}
          />
        </div>
      )}
      {editingFormula && (
        <FormulaEditor
          initialLatex={editingFormula.content}
          onSave={handleFormulaSave}
          onClose={() => setEditingFormula(null)}
        />
      )}
    </div>
  );
}

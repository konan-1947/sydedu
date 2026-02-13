"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSlideStore } from "../hooks/useSlideStore";
import { SLIDE_WIDTH, SLIDE_HEIGHT } from "../lib/slideDefaults";
import SlideRenderer from "./SlideRenderer";
import FormulaEditor from "./editors/FormulaEditor";
import { useRouter } from "next/navigation";

export default function SlideEditor() {
  const { state, dispatch } = useSlideStore();
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

  if (!slide) return null;

  const handleUpdateTitle = (title: string) => {
    dispatch({ type: "UPDATE_SLIDE", index: state.activeSlideIndex, slide: { ...slide, title } });
  };

  const handleUpdateSubtitle = (subtitle: string) => {
    dispatch({ type: "UPDATE_SLIDE", index: state.activeSlideIndex, slide: { ...slide, subtitle } });
  };

  const handleUpdateElement = (elementId: string, content: string) => {
    const updatedElements = slide.elements.map(el =>
      el.id === elementId ? { ...el, content } : el
    );
    dispatch({ type: "UPDATE_SLIDE", index: state.activeSlideIndex, slide: { ...slide, elements: updatedElements } });
  };

  const handleEditFormula = (elementId: string, latex: string) => {
    setEditingFormula({ elementId, content: latex });
  };

  const handleFormulaSave = (latex: string) => {
    if (!editingFormula) return;
    handleUpdateElement(editingFormula.elementId, latex);
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

  return (
    <div ref={containerRef} className="flex-1 flex items-start justify-center bg-gray-100 pt-4 px-6 relative">
      <div
        className="shadow-2xl rounded-lg overflow-hidden bg-white"
        style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT, zoom: scale }}
      >
        <SlideRenderer
          slide={slide}
          className="w-full h-full"
          editable
          interactive={slide.type === "simulation"}
          onUpdateTitle={handleUpdateTitle}
          onUpdateSubtitle={handleUpdateSubtitle}
          onUpdateElement={handleUpdateElement}
          onEditFormula={handleEditFormula}
          onSimulationCreate={handleSimulationCreate}
          onSimulationPick={handleSimulationPick}
        />
      </div>
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

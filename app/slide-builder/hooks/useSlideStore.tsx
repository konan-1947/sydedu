"use client";

import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode } from "react";
import { ComposerState, ComposerAction } from "../lib/types";
import { useUndoReducer } from "./useUndoReducer";

const STORAGE_KEY = "sydedu_slide_composer_state";
const DEFAULT_STATE: ComposerState = { phase: "input", presentation: null, activeSlideIndex: 0 };

function reducer(state: ComposerState, action: ComposerAction): ComposerState {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, phase: action.phase };
    case "SET_PRESENTATION":
      return { ...state, presentation: action.presentation, activeSlideIndex: 0, phase: "editor" };
    case "SET_ACTIVE":
      return { ...state, activeSlideIndex: action.index };
    case "UPDATE_SLIDE": {
      if (!state.presentation) return state;
      const slides = [...state.presentation.slides];
      slides[action.index] = action.slide;
      return { ...state, presentation: { ...state.presentation, slides } };
    }
    case "DELETE_SLIDE": {
      if (!state.presentation) return state;
      const slides = state.presentation.slides.filter((_, i) => i !== action.index);
      const newActive = Math.min(state.activeSlideIndex, slides.length - 1);
      return { ...state, presentation: { ...state.presentation, slides }, activeSlideIndex: Math.max(0, newActive) };
    }
    case "ADD_SLIDE": {
      if (!state.presentation) return state;
      const slides = [...state.presentation.slides];
      const insertAt = action.afterIndex !== undefined ? action.afterIndex + 1 : slides.length;
      slides.splice(insertAt, 0, action.slide);
      return { ...state, presentation: { ...state.presentation, slides }, activeSlideIndex: insertAt };
    }
    case "REORDER_SLIDES": {
      if (!state.presentation) return state;
      const slides = [...state.presentation.slides];
      const [moved] = slides.splice(action.fromIndex, 1);
      slides.splice(action.toIndex, 0, moved);
      return { ...state, presentation: { ...state.presentation, slides }, activeSlideIndex: action.toIndex };
    }
    case "RESET": {
      try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
      return DEFAULT_STATE;
    }
    default:
      return state;
  }
}

interface SlideContextType {
  state: ComposerState;
  dispatch: Dispatch<ComposerAction>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const SlideContext = createContext<SlideContextType>({
  state: DEFAULT_STATE,
  dispatch: () => {},
  undo: () => {},
  redo: () => {},
  canUndo: false,
  canRedo: false,
});

export function SlideProvider({ children }: { children: ReactNode }) {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useUndoReducer(reducer, DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Load from sessionStorage AFTER hydration to avoid mismatch
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ComposerState;
        if (parsed.presentation) {
          const hasSimResult = sessionStorage.getItem("simugen_result_html");
          dispatch({ type: "SET_PRESENTATION", presentation: parsed.presentation });
          if (!hasSimResult && parsed.phase === "input") {
            dispatch({ type: "SET_PHASE", phase: "input" });
          }
          if (parsed.activeSlideIndex > 0) {
            dispatch({ type: "SET_ACTIVE", index: parsed.activeSlideIndex });
          }
        }
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, [dispatch]);

  // Persist state to sessionStorage on every change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    if (state.phase !== "presenting") {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch { /* quota exceeded */ }
    }
  }, [state, hydrated]);

  return (
    <SlideContext.Provider value={{ state, dispatch, undo, redo, canUndo, canRedo }}>
      {children}
    </SlideContext.Provider>
  );
}

export function useSlideStore() {
  return useContext(SlideContext);
}

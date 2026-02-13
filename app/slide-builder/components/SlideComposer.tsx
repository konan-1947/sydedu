"use client";

import { useState, useEffect, useCallback } from "react";
import { useSlideStore } from "../hooks/useSlideStore";
import InputPanel from "./InputPanel";
import SlideList from "./SlideList";
import SlideEditor from "./SlideEditor";
import PresentMode from "./PresentMode";
import MagicBar from "./MagicBar";
import MediaSidebar from "./editors/MediaSidebar";
import { Download, Play, ArrowLeft, Loader2, PanelRight } from "lucide-react";
import { exportPptx } from "../lib/exportPptx";

export default function SlideComposer() {
  const { state, dispatch } = useSlideStore();
  const [showMedia, setShowMedia] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Keyboard shortcuts for editor phase
  const handleKeyboard = useCallback((e: KeyboardEvent) => {
    if (state.phase !== "editor" || !state.presentation) return;
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

    const total = state.presentation.slides.length;

    if (e.key === "ArrowUp" && !e.ctrlKey) {
      e.preventDefault();
      if (state.activeSlideIndex > 0) dispatch({ type: "SET_ACTIVE", index: state.activeSlideIndex - 1 });
    } else if (e.key === "ArrowDown" && !e.ctrlKey) {
      e.preventDefault();
      if (state.activeSlideIndex < total - 1) dispatch({ type: "SET_ACTIVE", index: state.activeSlideIndex + 1 });
    } else if (e.key === "F5" || (e.key === "p" && e.ctrlKey)) {
      e.preventDefault();
      dispatch({ type: "SET_PHASE", phase: "presenting" });
    } else if (e.key === "Delete" && e.shiftKey && total > 1) {
      e.preventDefault();
      dispatch({ type: "DELETE_SLIDE", index: state.activeSlideIndex });
    }
  }, [state.phase, state.presentation, state.activeSlideIndex, dispatch]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, [handleKeyboard]);

  if (state.phase === "presenting") {
    return <PresentMode />;
  }

  if (state.phase === "input" || state.phase === "generating") {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Smart Slide Composer</h1>
          <p className="text-gray-500 mb-8">Nhập chủ đề và AI sẽ tạo bài giảng slide cho bạn</p>

          {/* Resume editing existing presentation */}
          {state.phase === "input" && state.presentation && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Đang có bài giảng: {state.presentation.title}</p>
                <p className="text-xs text-blue-500">{state.presentation.slides.length} slides</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => dispatch({ type: "SET_PHASE", phase: "editor" })}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tiếp tục chỉnh sửa
                </button>
                <button
                  onClick={() => dispatch({ type: "RESET" })}
                  className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Tạo mới
                </button>
              </div>
            </div>
          )}

          {state.phase === "generating" ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Đang triệu hồi kiến thức...</p>
              <p className="text-gray-400 text-sm mt-1">AI đang soạn slide bài giảng</p>
            </div>
          ) : (
            <InputPanel />
          )}
        </div>
      </div>
    );
  }

  // Editor phase
  const activeSlide = state.presentation?.slides[state.activeSlideIndex];

  const handleExport = async () => {
    if (!state.presentation || exporting) return;
    setExporting(true);
    try {
      await exportPptx(state.presentation);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch({ type: "SET_PHASE", phase: "input" })}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <span className="text-sm font-medium text-gray-800">{state.presentation?.title}</span>
          <span className="text-xs text-gray-400">
            — Slide {state.activeSlideIndex + 1}/{state.presentation?.slides.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MagicBar />
          <button
            onClick={() => setShowMedia(!showMedia)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border transition-colors ${showMedia ? "bg-blue-50 text-blue-700 border-blue-200" : "text-gray-600 border-gray-200 hover:bg-gray-50"}`}
          >
            <PanelRight size={14} /> Ảnh
          </button>
          <button
            onClick={() => dispatch({ type: "SET_PHASE", phase: "presenting" })}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
            title="F5"
          >
            <Play size={14} /> Trình chiếu
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download size={14} /> {exporting ? "Đang xuất..." : "Xuất PPTX"}
          </button>
        </div>
      </div>
      {/* Slide info bar */}
      {activeSlide && (
        <div className="h-8 bg-gray-50 border-b border-gray-100 flex items-center justify-between px-4 text-xs text-gray-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{activeSlide.type}</span>
            {activeSlide.notes && <span className="truncate max-w-xs">Ghi chú: {activeSlide.notes}</span>}
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <span>↑↓ chuyển slide</span>
            <span>F5 trình chiếu</span>
            <span>Shift+Del xoá</span>
          </div>
        </div>
      )}
      {/* Editor area */}
      <div className="flex-1 flex overflow-hidden">
        <SlideList />
        <SlideEditor />
        {showMedia && <MediaSidebar />}
      </div>
    </div>
  );
}

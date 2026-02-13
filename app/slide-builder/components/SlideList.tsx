"use client";

import { DndContext, closestCenter, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2, Copy, BookOpen, FlaskConical, HelpCircle, Presentation, Atom } from "lucide-react";
import { v4 as uuid } from "uuid";
import { useSlideStore } from "../hooks/useSlideStore";
import SlideRenderer from "./SlideRenderer";
import { createDefaultSlide } from "../lib/slideDefaults";
import { SlideType } from "../lib/types";

const SLIDE_TYPES: { value: SlideType; label: string; icon: React.ReactNode }[] = [
  { value: "concept", label: "Kiến thức", icon: <BookOpen size={12} /> },
  { value: "formula", label: "Công thức", icon: <FlaskConical size={12} /> },
  { value: "quiz", label: "Trắc nghiệm", icon: <HelpCircle size={12} /> },
  { value: "intro", label: "Giới thiệu", icon: <Presentation size={12} /> },
  { value: "simulation", label: "Mô phỏng", icon: <Atom size={12} /> },
];

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  intro: { label: "Giới thiệu", color: "bg-blue-100 text-blue-700" },
  concept: { label: "Kiến thức", color: "bg-emerald-100 text-emerald-700" },
  formula: { label: "Công thức", color: "bg-purple-100 text-purple-700" },
  quiz: { label: "Trắc nghiệm", color: "bg-amber-100 text-amber-700" },
  simulation: { label: "Mô phỏng", color: "bg-rose-100 text-rose-700" },
};

function SortableThumb({ slideId, index }: { slideId: string; index: number }) {
  const { state, dispatch } = useSlideStore();
  const slide = state.presentation!.slides[index];
  const isActive = state.activeSlideIndex === index;
  const total = state.presentation!.slides.length;
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: slideId });
  const typeInfo = TYPE_LABELS[slide.type] || TYPE_LABELS.concept;

  const duplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "ADD_SLIDE", slide: { ...slide, id: uuid() }, afterIndex: index });
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={() => dispatch({ type: "SET_ACTIVE", index })}
      className={`group relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${isActive ? "border-blue-500 shadow-lg ring-1 ring-blue-200" : "border-transparent hover:border-gray-300"}`}
    >
      {/* Thumbnail */}
      <div className="pointer-events-none overflow-hidden bg-gray-50" style={{ height: 108 }}>
        <div style={{ width: 960, height: 540, zoom: 0.19 }}>
          <SlideRenderer slide={slide} className="w-full h-full" />
        </div>
      </div>
      {/* Info bar */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white border-t border-gray-100">
        <span className="text-[11px] font-semibold text-gray-400 w-4 shrink-0">{index + 1}</span>
        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${typeInfo.color}`}>{typeInfo.label}</span>
        <span className="text-[10px] text-gray-600 truncate flex-1">{slide.title}</span>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={duplicate} className="p-0.5 text-gray-400 hover:text-blue-600" title="Nhân bản">
            <Copy size={11} />
          </button>
          {total > 1 && (
            <button
              onClick={e => { e.stopPropagation(); dispatch({ type: "DELETE_SLIDE", index }); }}
              className="p-0.5 text-gray-400 hover:text-red-600" title="Xoá"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SlideList() {
  const { state, dispatch } = useSlideStore();
  const slides = state.presentation?.slides || [];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = slides.findIndex(s => s.id === active.id);
    const toIndex = slides.findIndex(s => s.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      dispatch({ type: "REORDER_SLIDES", fromIndex, toIndex });
    }
  };

  const addSlide = (type: SlideType) => {
    const labels: Record<SlideType, string> = {
      concept: "Kiến thức mới",
      formula: "Công thức",
      quiz: "Câu hỏi trắc nghiệm",
      intro: "Giới thiệu",
      simulation: "Mô phỏng",
    };
    dispatch({
      type: "ADD_SLIDE",
      slide: createDefaultSlide(type, labels[type]),
      afterIndex: state.activeSlideIndex,
    });
  };

  return (
    <div className="w-56 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="px-3 py-2 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-700">{slides.length} slides</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {slides.map((slide, i) => (
              <SortableThumb key={slide.id} slideId={slide.id} index={i} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      {/* Add slide section */}
      <div className="p-3 border-t border-gray-200 space-y-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1">Thêm slide</p>
        <div className="grid grid-cols-2 gap-1">
          {SLIDE_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => addSlide(t.value)}
              className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-blue-600 px-2 py-1.5 rounded-lg border border-gray-200 hover:border-blue-300 bg-white transition-colors"
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

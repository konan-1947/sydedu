"use client";

import { Slide } from "../../lib/types";
import { EditableCallbacks } from "../SlideRenderer";

const OPTION_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
const OPTION_LABELS = ["A", "B", "C", "D"];

const editableClass = "outline-none hover:ring-2 hover:ring-white/40 rounded px-1 cursor-text focus:ring-2 focus:ring-white/60";
const editableDarkClass = "outline-none hover:ring-2 hover:ring-blue-300 rounded px-1 cursor-text focus:ring-2 focus:ring-blue-500";

interface Props extends EditableCallbacks {
  slide: Slide;
  editable?: boolean;
}

export default function QuizSlide({ slide, editable, onUpdateTitle, onUpdateElement }: Props) {
  const textElements = slide.elements.filter(e => e.type === "text");
  const question = textElements[0];
  const options = textElements.slice(1, 5);

  return (
    <div className="w-full h-full flex flex-col p-10" style={{ backgroundColor: slide.bgColor || "#fffbeb" }}>
      <h2
        contentEditable={editable}
        suppressContentEditableWarning
        onBlur={editable ? (e) => onUpdateTitle?.(e.currentTarget.textContent || "") : undefined}
        className={`text-2xl font-bold text-gray-900 mb-2 ${editable ? editableDarkClass : ""}`}
      >
        {slide.title}
      </h2>
      {question && (
        <p
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={editable ? (e) => onUpdateElement?.(question.id, e.currentTarget.textContent || "") : undefined}
          className={`text-xl text-gray-800 mb-8 font-medium ${editable ? editableDarkClass : ""}`}
        >
          {question.content}
        </p>
      )}
      <div className="grid grid-cols-2 gap-4 flex-1 content-center">
        {options.map((el, i) => (
          <div key={el.id} className="flex items-center gap-3 rounded-xl p-4 text-white font-semibold text-lg" style={{ backgroundColor: OPTION_COLORS[i] || "#6b7280" }}>
            <span className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center font-bold shrink-0">{OPTION_LABELS[i]}</span>
            <span
              contentEditable={editable}
              suppressContentEditableWarning
              onBlur={editable ? (e) => onUpdateElement?.(el.id, e.currentTarget.textContent || "") : undefined}
              className={`flex-1 ${editable ? editableClass : ""}`}
            >
              {el.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

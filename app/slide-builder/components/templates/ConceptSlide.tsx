"use client";

import { Slide } from "../../lib/types";
import { EditableCallbacks } from "../SlideRenderer";

const editableClass = "outline-none hover:ring-2 hover:ring-blue-300 rounded px-1 cursor-text focus:ring-2 focus:ring-blue-500";

interface Props extends EditableCallbacks {
  slide: Slide;
  editable?: boolean;
}

export default function ConceptSlide({ slide, editable, onUpdateTitle, onUpdateSubtitle, onUpdateElement }: Props) {
  return (
    <div className="w-full h-full flex flex-col p-10" style={{ backgroundColor: slide.bgColor || "#ffffff" }}>
      <h2
        contentEditable={editable}
        suppressContentEditableWarning
        onBlur={editable ? (e) => onUpdateTitle?.(e.currentTarget.textContent || "") : undefined}
        className={`text-3xl font-bold text-gray-900 mb-6 border-b-2 border-blue-500 pb-3 ${editable ? editableClass : ""}`}
      >
        {slide.title}
      </h2>
      {slide.subtitle && (
        <p
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={editable ? (e) => onUpdateSubtitle?.(e.currentTarget.textContent || "") : undefined}
          className={`text-lg text-gray-500 mb-4 ${editable ? editableClass : ""}`}
        >
          {slide.subtitle}
        </p>
      )}
      <div className="flex-1 space-y-3">
        {slide.elements.filter(e => e.type === "text").map(el => (
          <p
            key={el.id}
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={editable ? (e) => onUpdateElement?.(el.id, e.currentTarget.textContent || "") : undefined}
            className={editable ? editableClass : ""}
            style={{ fontSize: el.fontSize || 22, color: el.fill || "#1e293b" }}
          >
            {el.content}
          </p>
        ))}
      </div>
    </div>
  );
}

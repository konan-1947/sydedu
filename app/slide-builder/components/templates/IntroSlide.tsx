"use client";

import { Slide } from "../../lib/types";
import { EditableCallbacks } from "../SlideRenderer";

const editableClass = "outline-none hover:ring-2 hover:ring-white/40 rounded px-1 cursor-text focus:ring-2 focus:ring-white/60";

interface Props extends EditableCallbacks {
  slide: Slide;
  editable?: boolean;
}

export default function IntroSlide({ slide, editable, onUpdateTitle, onUpdateSubtitle, onUpdateElement }: Props) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white p-12" style={{ background: slide.bgColor || "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)" }}>
      <h1
        contentEditable={editable}
        suppressContentEditableWarning
        onBlur={editable ? (e) => onUpdateTitle?.(e.currentTarget.textContent || "") : undefined}
        className={`text-4xl font-bold text-center mb-4 drop-shadow-lg ${editable ? editableClass : ""}`}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={editable ? (e) => onUpdateSubtitle?.(e.currentTarget.textContent || "") : undefined}
          className={`text-xl opacity-90 text-center ${editable ? editableClass : ""}`}
        >
          {slide.subtitle}
        </p>
      )}
      {slide.elements.filter(e => e.type === "text").map(el => (
        <p
          key={el.id}
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={editable ? (e) => onUpdateElement?.(el.id, e.currentTarget.textContent || "") : undefined}
          className={`text-lg opacity-80 mt-4 text-center ${editable ? editableClass : ""}`}
          style={{ color: el.fill || "#ffffff" }}
        >
          {el.content}
        </p>
      ))}
    </div>
  );
}

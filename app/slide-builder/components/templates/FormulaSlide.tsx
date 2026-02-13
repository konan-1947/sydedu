"use client";

import { Slide } from "../../lib/types";
import { EditableCallbacks } from "../SlideRenderer";
import katex from "katex";

const editableClass = "outline-none hover:ring-2 hover:ring-blue-300 rounded px-1 cursor-text focus:ring-2 focus:ring-blue-500";

function renderLatex(latex: string): string {
  try {
    return katex.renderToString(latex, { throwOnError: false, displayMode: true });
  } catch {
    return latex;
  }
}

interface Props extends EditableCallbacks {
  slide: Slide;
  editable?: boolean;
}

export default function FormulaSlide({ slide, editable, onUpdateTitle, onUpdateElement, onEditFormula }: Props) {
  return (
    <div className="w-full h-full flex flex-col p-10" style={{ backgroundColor: slide.bgColor || "#f8fafc" }}>
      <h2
        contentEditable={editable}
        suppressContentEditableWarning
        onBlur={editable ? (e) => onUpdateTitle?.(e.currentTarget.textContent || "") : undefined}
        className={`text-3xl font-bold text-gray-900 mb-6 ${editable ? editableClass : ""}`}
      >
        {slide.title}
      </h2>
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {slide.elements.map(el => (
          el.type === "formula" ? (
            <div
              key={el.id}
              className={`text-2xl ${editable ? "cursor-pointer hover:ring-2 hover:ring-purple-400 rounded p-1" : ""}`}
              onClick={editable ? () => onEditFormula?.(el.id, el.content) : undefined}
              dangerouslySetInnerHTML={{ __html: renderLatex(el.content) }}
            />
          ) : (
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
          )
        ))}
      </div>
    </div>
  );
}

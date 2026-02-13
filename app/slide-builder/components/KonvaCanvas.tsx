"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer } from "react-konva";
import Konva from "konva";
import { Slide, SlideElement } from "../lib/types";
import { SLIDE_WIDTH, SLIDE_HEIGHT } from "../lib/slideDefaults";
import { migrateSlideToElements } from "../lib/migrateSlide";
import FloatingToolbar from "./FloatingToolbar";
import katex from "katex";

interface Props {
  slide: Slide;
  scale: number;
  onUpdate: (slide: Slide) => void;
  onEditFormula?: (elementId: string, latex: string) => void;
}

// Render KaTeX to an HTMLImageElement
function renderFormulaImage(latex: string, fontSize: number = 28): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const html = katex.renderToString(latex, { throwOnError: false, displayMode: true });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="120">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:${fontSize}px;padding:8px;color:#1e293b;">${html}</div>
      </foreignObject>
    </svg>`;
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

export default function KonvaCanvas({ slide: rawSlide, scale, onUpdate, onEditFormula }: Props) {
  const slide = migrateSlideToElements(rawSlide);
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formulaImages, setFormulaImages] = useState<Record<string, HTMLImageElement>>({});
  const [userImages, setUserImages] = useState<Record<string, HTMLImageElement>>({});

  // If migration created new elements, push them up
  useEffect(() => {
    if (rawSlide.elements.length === 0 && slide.elements.length > 0) {
      onUpdate(slide);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawSlide.id]);

  // Render formula images
  useEffect(() => {
    slide.elements.filter(el => el.type === "formula").forEach(el => {
      if (!formulaImages[el.id + el.content]) {
        renderFormulaImage(el.content, el.fontSize).then(img => {
          setFormulaImages(prev => ({ ...prev, [el.id + el.content]: img }));
        }).catch(() => {});
      }
    });
  }, [slide.elements, formulaImages]);

  // Load user images
  useEffect(() => {
    slide.elements.filter(el => el.type === "image" && el.src).forEach(el => {
      if (!userImages[el.src!]) {
        const img = new window.Image();
        img.onload = () => setUserImages(prev => ({ ...prev, [el.src!]: img }));
        img.src = el.src!;
      }
    });
  }, [slide.elements, userImages]);

  // Attach transformer
  useEffect(() => {
    if (!trRef.current || !stageRef.current) return;
    if (selectedId) {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer()?.batchDraw();
        return;
      }
    }
    trRef.current.nodes([]);
    trRef.current.getLayer()?.batchDraw();
  }, [selectedId]);

  const updateElement = useCallback(
    (elementId: string, updates: Partial<SlideElement>) => {
      const elements = slide.elements.map(el =>
        el.id === elementId ? { ...el, ...updates } : el
      );
      onUpdate({ ...slide, elements });
    },
    [slide, onUpdate]
  );

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage() || e.target.name() === "bg") {
      setSelectedId(null);
      setEditingId(null);
    }
  };

  const handleDragEnd = (el: SlideElement, e: Konva.KonvaEventObject<DragEvent>) => {
    updateElement(el.id, { x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
  };

  const handleTransformEnd = (el: SlideElement, e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    updateElement(el.id, {
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      width: Math.round(Math.max(20, node.width() * scaleX)),
      height: Math.round(Math.max(20, node.height() * scaleY)),
      rotation: Math.round(node.rotation()),
    });
  };

  const handleDblClick = (el: SlideElement) => {
    if (el.type === "formula") {
      onEditFormula?.(el.id, el.content);
      return;
    }
    if (el.type === "text") {
      setEditingId(el.id);
      setSelectedId(el.id);
    }
  };

  const selectedElement = slide.elements.find(el => el.id === selectedId);

  return (
    <div className="relative">
      <Stage
        ref={stageRef}
        width={SLIDE_WIDTH * scale}
        height={SLIDE_HEIGHT * scale}
        scaleX={scale}
        scaleY={scale}
        onClick={handleStageClick}
        onTap={handleStageClick as unknown as (e: Konva.KonvaEventObject<TouchEvent>) => void}
      >
        <Layer>
          {/* Background */}
          <Rect
            name="bg"
            x={0}
            y={0}
            width={SLIDE_WIDTH}
            height={SLIDE_HEIGHT}
            fill={slide.bgColor || "#ffffff"}
          />

          {/* Elements */}
          {slide.elements.map(el => {
            if (el.type === "text") {
              return (
                <Text
                  key={el.id}
                  id={el.id}
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  text={el.content}
                  fontSize={el.fontSize || 24}
                  fontFamily="sans-serif"
                  fontStyle={
                    (el.fontWeight === "bold" ? "bold " : "") +
                    (el.fontStyle === "italic" ? "italic" : "")
                  }
                  textDecoration={el.textDecoration || ""}
                  fill={el.fill || "#1e293b"}
                  align={el.align || "left"}
                  rotation={el.rotation || 0}
                  draggable
                  onClick={() => setSelectedId(el.id)}
                  onTap={() => setSelectedId(el.id)}
                  onDblClick={() => handleDblClick(el)}
                  onDblTap={() => handleDblClick(el)}
                  onDragEnd={e => handleDragEnd(el, e)}
                  onTransformEnd={e => handleTransformEnd(el, e)}
                />
              );
            }

            if (el.type === "formula") {
              const fImg = formulaImages[el.id + el.content];
              if (!fImg) {
                return (
                  <Text
                    key={el.id}
                    id={el.id}
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    height={el.height}
                    text={el.content}
                    fontSize={18}
                    fontStyle="italic"
                    fill={el.fill || "#2563eb"}
                    draggable
                    onClick={() => setSelectedId(el.id)}
                    onDblClick={() => handleDblClick(el)}
                    onDragEnd={e => handleDragEnd(el, e)}
                    onTransformEnd={e => handleTransformEnd(el, e)}
                  />
                );
              }
              return (
                <KonvaImage
                  key={el.id}
                  id={el.id}
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  image={fImg}
                  rotation={el.rotation || 0}
                  draggable
                  onClick={() => setSelectedId(el.id)}
                  onTap={() => setSelectedId(el.id)}
                  onDblClick={() => handleDblClick(el)}
                  onDblTap={() => handleDblClick(el)}
                  onDragEnd={e => handleDragEnd(el, e)}
                  onTransformEnd={e => handleTransformEnd(el, e)}
                />
              );
            }

            if (el.type === "image" && el.src) {
              const uImg = userImages[el.src];
              if (!uImg) return null;
              return (
                <KonvaImage
                  key={el.id}
                  id={el.id}
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  image={uImg}
                  rotation={el.rotation || 0}
                  draggable
                  onClick={() => setSelectedId(el.id)}
                  onTap={() => setSelectedId(el.id)}
                  onDragEnd={e => handleDragEnd(el, e)}
                  onTransformEnd={e => handleTransformEnd(el, e)}
                />
              );
            }

            return null;
          })}

          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 20 || newBox.height < 20) return oldBox;
              return newBox;
            }}
          />
        </Layer>
      </Stage>

      {/* Inline text editing overlay */}
      {editingId && (() => {
        const el = slide.elements.find(e => e.id === editingId);
        if (!el || el.type !== "text") return null;
        return (
          <textarea
            autoFocus
            className="absolute border-2 border-blue-500 bg-transparent outline-none resize-none overflow-hidden"
            style={{
              top: el.y * scale,
              left: el.x * scale,
              width: el.width * scale,
              minHeight: el.height * scale,
              fontSize: (el.fontSize || 24) * scale,
              fontWeight: el.fontWeight || "normal",
              fontStyle: el.fontStyle || "normal",
              textDecoration: el.textDecoration || "none",
              color: el.fill || "#1e293b",
              textAlign: el.align || "left",
              fontFamily: "sans-serif",
              lineHeight: 1.2,
              padding: 0,
            }}
            defaultValue={el.content}
            onBlur={e => {
              updateElement(el.id, { content: e.target.value });
              setEditingId(null);
            }}
            onKeyDown={e => {
              if (e.key === "Escape") {
                (e.target as HTMLTextAreaElement).blur();
              }
            }}
          />
        );
      })()}

      {/* Floating toolbar for selected text elements */}
      {selectedElement && selectedElement.type === "text" && !editingId && (
        <FloatingToolbar
          element={selectedElement}
          canvasScale={scale}
          onChange={updates => updateElement(selectedElement.id, updates)}
        />
      )}
    </div>
  );
}

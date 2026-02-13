import { Slide, SlideElement } from "./types";
import { v4 as uuid } from "uuid";

/**
 * Convert old template-based slides (title/subtitle only) into element-based slides
 * so KonvaCanvas can render them.
 */
export function migrateSlideToElements(slide: Slide): Slide {
  if (slide.elements.length > 0) return slide;

  const elements: SlideElement[] = [];

  if (slide.title) {
    elements.push({
      id: uuid(),
      type: "text",
      x: 60,
      y: slide.type === "intro" ? 180 : 30,
      width: 840,
      height: 60,
      content: slide.title,
      fontSize: slide.type === "intro" ? 40 : 32,
      fontWeight: "bold",
      fill: slide.type === "intro" ? "#ffffff" : "#0f172a",
      align: slide.type === "intro" ? "center" : "left",
    });
  }

  if (slide.subtitle) {
    elements.push({
      id: uuid(),
      type: "text",
      x: 60,
      y: slide.type === "intro" ? 260 : 100,
      width: 840,
      height: 40,
      content: slide.subtitle,
      fontSize: slide.type === "intro" ? 22 : 18,
      fill: slide.type === "intro" ? "#cccccc" : "#64748b",
      align: slide.type === "intro" ? "center" : "left",
    });
  }

  return { ...slide, elements };
}

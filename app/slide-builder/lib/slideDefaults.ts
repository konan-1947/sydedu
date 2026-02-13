import { Slide, SlideType } from "./types";
import { v4 as uuid } from "uuid";

export function createDefaultSlide(type: SlideType, title: string, overrides?: Partial<Slide>): Slide {
  const base: Slide = {
    id: uuid(),
    type,
    title,
    elements: [],
    bgColor: "#ffffff",
    ...overrides,
  };
  return base;
}

export const SLIDE_WIDTH = 960;
export const SLIDE_HEIGHT = 540;
export const SLIDE_ASPECT = SLIDE_WIDTH / SLIDE_HEIGHT;

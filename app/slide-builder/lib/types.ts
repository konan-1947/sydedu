export type SlideType = "intro" | "concept" | "formula" | "quiz" | "simulation";

export interface SlideElement {
  id: string;
  type: "text" | "image" | "formula" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize?: number;
  fontStyle?: string;
  fontWeight?: "normal" | "bold";
  textDecoration?: "none" | "underline";
  fill?: string;
  align?: "left" | "center" | "right";
  rotation?: number;
  src?: string;
}

export interface Slide {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  elements: SlideElement[];
  bgColor?: string;
  notes?: string;
  simulationHtml?: string;
}

export interface SlidePresentation {
  title: string;
  subject?: string;
  slides: Slide[];
}

export type ComposerPhase = "input" | "generating" | "editor" | "presenting";

export interface ComposerState {
  phase: ComposerPhase;
  presentation: SlidePresentation | null;
  activeSlideIndex: number;
}

export type ComposerAction =
  | { type: "SET_PHASE"; phase: ComposerPhase }
  | { type: "SET_PRESENTATION"; presentation: SlidePresentation }
  | { type: "SET_ACTIVE"; index: number }
  | { type: "UPDATE_SLIDE"; index: number; slide: Slide }
  | { type: "DELETE_SLIDE"; index: number }
  | { type: "ADD_SLIDE"; slide: Slide; afterIndex?: number }
  | { type: "REORDER_SLIDES"; fromIndex: number; toIndex: number }
  | { type: "RESET" };

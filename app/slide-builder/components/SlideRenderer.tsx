"use client";

import { Slide } from "../lib/types";
import IntroSlide from "./templates/IntroSlide";
import ConceptSlide from "./templates/ConceptSlide";
import FormulaSlide from "./templates/FormulaSlide";
import QuizSlide from "./templates/QuizSlide";
import SimulationPlaceholder from "./templates/SimulationPlaceholder";

export interface EditableCallbacks {
  onUpdateTitle?: (title: string) => void;
  onUpdateSubtitle?: (subtitle: string) => void;
  onUpdateElement?: (elementId: string, content: string) => void;
  onEditFormula?: (elementId: string, latex: string) => void;
}

interface Props extends EditableCallbacks {
  slide: Slide;
  className?: string;
  style?: React.CSSProperties;
  editable?: boolean;
  interactive?: boolean;
  onSimulationCreate?: () => void;
  onSimulationPick?: (label: string) => void;
}

export default function SlideRenderer({
  slide, className = "", style,
  editable, interactive,
  onUpdateTitle, onUpdateSubtitle, onUpdateElement, onEditFormula,
  onSimulationCreate, onSimulationPick,
}: Props) {
  if (slide.type === "simulation") {
    return (
      <div className={`overflow-hidden ${className}`} style={{ aspectRatio: "16/9", ...style }}>
        <SimulationPlaceholder
          slide={slide}
          onCreateNew={interactive ? onSimulationCreate : undefined}
          onPickStore={interactive ? onSimulationPick : undefined}
        />
      </div>
    );
  }

  const editableProps = editable ? { editable, onUpdateTitle, onUpdateSubtitle, onUpdateElement, onEditFormula } : {};

  const TEMPLATES: Record<string, React.FC<{ slide: Slide } & EditableCallbacks & { editable?: boolean }>> = {
    intro: IntroSlide,
    concept: ConceptSlide,
    formula: FormulaSlide,
    quiz: QuizSlide,
  };

  const Template = TEMPLATES[slide.type] || ConceptSlide;
  return (
    <div className={`overflow-hidden ${className}`} style={{ aspectRatio: "16/9", ...style }}>
      <Template slide={slide} {...editableProps} />
    </div>
  );
}

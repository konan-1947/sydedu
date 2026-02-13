"use client";

import PageShell from "../components/PageShell";
import { SlideProvider } from "./hooks/useSlideStore";
import SlideComposer from "./components/SlideComposer";

export default function SlideBuilderPage() {
  return (
    <PageShell>
      <SlideProvider>
        <SlideComposer />
      </SlideProvider>
    </PageShell>
  );
}

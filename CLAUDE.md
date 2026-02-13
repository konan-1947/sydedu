# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `npm start` — Start production server

## Architecture

Sydedu is a Vietnamese education platform MVP built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

### Layout Pattern

Every page uses a fixed sidebar + top bar layout. The shared layout components are in `app/components/` (Sidebar, TopBar). Each page manually includes `<Sidebar />` and `<TopBar />` rather than using a nested layout — the sidebar width is hardcoded at `ml-[260px]`.

### Routes

- `/` — Dashboard (server component) with hardcoded stats and tool cards
- `/slide-builder` — Full slide composition system with Canvas rendering, AI generation, and PPTX export
- `/ai-generator` — AI-powered lesson plan and exam generation with tab switching ("Soạn Giáo án" / "Tạo Đề thi"). UI-only, no backend yet.
- `/physics-mapper` — Upload video or YouTube link to extract physics motion graphs. UI-only, no backend yet.
- `/simu-gen` — AI-powered physics simulation generator with multi-step workflow (analyze → generate → review)

### API Routes

- `/api/slide-gen` — Generates slide presentations from topics using OpenAI GPT-4o with structured JSON schema. Returns typed slides (intro, concept, formula, quiz, simulation).
- `/api/simu-gen` — Multi-step physics simulation pipeline using OpenAI GPT-4o. Produces standalone HTML5/Canvas simulations with interactive controls.

### Slide Builder Architecture (`app/slide-builder/`)

The most complex feature. Key structure:

- **SlideComposer** — Orchestrator managing three phases: `input` → `generating` → `editor`/`presenting`
- **useSlideStore** — Context-based state management (reducer pattern) with sessionStorage persistence
- **SlideEditor** — Main editor with formula editing, simulation integration, Magic Bar for quick inserts
- **PresentMode** — Full-screen slideshow with keyboard/mouse controls
- **Templates** — Per-slide-type renderers: IntroSlide, ConceptSlide, FormulaSlide, QuizSlide, SimulationPlaceholder
- **lib/types.ts** — Core types: `SlideType`, `SlideElement`, `Slide`, `SlidePresentation`, `ComposerPhase`
- **lib/exportPptx.ts** — PPTX export via pptxgenjs

### Simu-Gen ↔ Slide Builder Integration

Uses sessionStorage for cross-route communication:
1. Slide builder sets `simugen_return=true` and `simugen_prefill` before navigating to `/simu-gen`
2. After generation, simu-gen stores result in `simugen_result_html` and `simugen_target_slide`
3. Slide builder detects and embeds the HTML simulation on return

### Key Libraries

- `pptxgenjs` — PPTX file export
- `katex` — LaTeX formula rendering
- `konva` / `react-konva` — Canvas-based slide rendering
- `@dnd-kit` — Drag-and-drop for slide reordering
- `lucide-react` — Icons

### Conventions

- UI text is in Vietnamese
- Tailwind for all styling (no CSS modules), rounded-2xl cards with gray-100 borders as primary UI pattern
- Fonts: Geist Sans + Geist Mono via `next/font/google`
- Keyboard shortcuts: Arrow keys (slide nav), F5/Ctrl+P (present), Shift+Delete (delete slide)

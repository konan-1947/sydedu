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

### Three Main Tools (routes)

- `/slide-builder` — Upload lesson plans (PDF/Word) and auto-generate presentation slides. Client component.
- `/ai-generator` — AI-powered lesson plan and exam generation with tab switching between "Soạn Giáo án" and "Tạo Đề thi". Client component.
- `/physics-mapper` — Upload video or YouTube link to extract physics motion graphs. Client component.

### Current State

This is a UI-only MVP — no backend integration yet. All tool pages render forms and mock previews but don't call any APIs. The home page (`/`) is a server component showing a dashboard with hardcoded stats and tool cards.

### Shared Components

- `FileUpload` — Drag-and-drop file upload component (accepts configurable file types)
- `TabSelector` — Generic tab switcher used in AI Generator
- `Sidebar` / `TopBar` — Navigation shell present on all pages

### Conventions

- UI text is in Vietnamese
- Icons from `lucide-react`
- Tailwind for all styling (no CSS modules), rounded-2xl cards with gray-100 borders as primary UI pattern
- Fonts: Geist Sans + Geist Mono via `next/font/google`

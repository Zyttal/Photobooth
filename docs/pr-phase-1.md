# Phase 1 — Photobooth Foundation

**Branch:** `phase-1/foundation` → `main`
**Title:** `phase 1: photobooth foundation — frame picker, capture/upload, composite, local gallery`

First playable cut of the photobooth. Frontend-only, no backend, mobile-first. Built on the existing Vite 7 + React 19 + TypeScript scaffold with **no new runtime dependencies**.

## What's in this phase

- **Frame picker** — config-driven (`src/config/frames.ts`); each frame declares its own slot count, slot rects, overlay image, output dimensions, and optional reveal animation. Adding a frame is a one-file config edit plus dropping image assets into `src/assets/frames/`.
- **Capture flow** — camera (`getUserMedia` with countdown + flash) and file upload tabs; graceful fallback when camera is denied or unavailable. Slots fill sequentially with a Retake / Use confirmation per shot. Bulk-uploading multiple photos distributes them across remaining empty slots.
- **Adjust step** — optional per-slot drag + pinch-zoom on top of the auto cover-fit, using native Pointer Events (no gesture library).
- **Composite + preview** — final-quality canvas render with the frame overlay drawn on top of slot images. Reveal animation per frame style (`polaroid-develop`, `strip-print`, `fade-in`, or any custom class name from `animations.css`).
- **Output** — Download as PNG; Web Share API where available (mobile native share sheet).
- **Local gallery (IndexedDB)** — composites auto-save to the device on the Preview screen. Gallery screen lists, views, deletes individual photos, or clears all. Storage-usage footer via `navigator.storage.estimate()`.
- **Animations** — countdown digit, capture flash, polaroid develop, strip print, frame card hover/press, button taps. All CSS keyframes in `src/styles/animations.css`. `prefers-reduced-motion` respected globally.
- **Three starter frames bundled** — Classic Strip (4 photos), Single Polaroid (1 photo), Trio Collage (3 photos with rotation).

## Extension points (designed for custom work)

This phase intentionally surfaces hooks the user will need in later phases:

- **Custom animations** — drop new `@keyframes` and class definitions into `src/styles/animations.css`; reference by string from `FrameConfig.revealAnimation` or `FrameConfig.className`. Global timing variables (`--anim-fast/base/slow`) on `:root`.
- **Custom graphics** — `FrameConfig.decorations[]` stacks extra graphics (stickers, dates, logos) above slots but under the overlay. Overlay and decorations accept PNG or SVG.
- **New flows / screens** — `AppStep` union + `appReducer` are the single edit surface to add screens (e.g. a Filters step).
- **Countdown / Flash overrides** — both components accept an optional `className` prop so a custom variant can re-skin them per frame or theme.

## Privacy (a feature of this build)

- No network requests after the initial bundle. No telemetry, analytics, or external scripts.
- All photos and gallery state live in the user's browser (IndexedDB). Clearing site data wipes everything.
- Camera stream is explicitly stopped the moment the user leaves the capture screen — indicator light goes off.
- A privacy banner on the Home screen and an inline note on the Gallery screen make this explicit to the user.

## File map (high level)

- `src/App.tsx` — reducer + screen switch shell (replaces counter demo)
- `src/types/index.ts` — `FrameConfig`, `SlotConfig`, `SlotImage`, `AppState`, `Action`, `SavedPhoto`
- `src/state/appReducer.ts` — flow reducer
- `src/config/frames.ts` — frames array (edit surface for new frames)
- `src/screens/` — `HomeScreen`, `CaptureScreen`, `AdjustScreen`, `PreviewScreen`, `GalleryScreen`
- `src/components/` — `FrameCard`, `CameraView`, `Countdown`, `FlashOverlay`, `SlotPreview`, `CompositeCanvas`, `StepIndicator`
- `src/hooks/` — `useCamera`, `useSlotTransform`, `useObjectUrl`, `useShare`, `useGallery`
- `src/utils/` — `composite`, `coverFit`, `captureFromVideo`, `fileToImage`, `download`, `thumbnail`, `storage`
- `src/styles/animations.css` — keyframes + named animation classes + shared layout
- `src/assets/frames/` — three starter frames (overlay + thumbnail SVGs)

## Out of scope (future phases)

- Filters / color grading
- Drag-and-drop file upload from desktop
- Sharing to specific networks beyond Web Share API
- Cloud sync (would compromise the local-only privacy stance — would need explicit opt-in)
- PWA / offline install
- i18n

## How to test

```bash
git checkout phase-1/foundation
npm install
npm run dev -- --host          # opens on LAN for phone testing
npm run lint
npm run build && npm run preview
```

### Manual checks

- **Frame selection** — open each frame; verify the slot count matches expectation.
- **Camera + countdown + flash** — allow camera permission, take a photo through Camera tab, confirm countdown counts 3-2-1, flash appears, preview shows the captured photo, Retake clears, Use this photo advances.
- **Camera permission denied** — block camera at the browser level, reload; the Camera tab should show a denial message and point to Upload.
- **Upload — single + bulk** — single file goes through preview-confirm; multi-select distributes across all remaining empty slots and auto-advances when full.
- **Adjust** — pan and pinch each slot; output composite should reflect the adjusted position.
- **Preview reveal animation** — single-slot frames play `polaroid-develop`; multi-slot strip plays `strip-print`. Save status flips from `Saving to gallery…` to `✓ Saved to gallery`.
- **Output** — Download produces a PNG at the frame's `output` dimensions; on mobile, Share opens the native share sheet.
- **Gallery persistence** — create a photo, hard-refresh, open Gallery → photo is present. Delete individual / Clear All both require confirmation.
- **Privacy / no-network** — DevTools Network tab during the full flow shows zero requests beyond the initial bundle and assets.
- **Reduced motion** — DevTools rendering panel → emulate `prefers-reduced-motion: reduce` → animations near-instant.
- **Mobile (Safari + Chrome on LAN URL)** — front camera defaults; pinch zoom adjusts; native share sheet works; theme-color picked up.

## Verification status

- `npm run lint` — clean
- `npm run build` — type-check + Vite build pass; output ~226 KB JS, ~10 KB CSS (gzip: 71 KB / 2.7 KB)
- No new runtime dependencies added

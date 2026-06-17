# Phase 1: Photobooth Foundation

**Branch:** `phase-1/foundation` → `main`
**Title:** `phase 1: photobooth foundation (frames, capture, composite, gallery, custom frames)`

## Summary

First shippable cut of the photobooth. Frontend-only, mobile-first, no runtime dependencies beyond React + React DOM. The app lets a visitor pick a frame, capture or upload the right number of photos, optionally reposition each one, then download, share, or revisit them later from a local gallery. Visitors can also upload their own image as a new frame and define photo slots on top.

Built on the Vite 7 + React 19 + TypeScript scaffold. Production builds deploy to GitHub Pages via the workflow added in this PR.

## What's in this phase

### Core flow
- **Five-step state machine** driven by a single `useReducer` in `App.tsx`. Steps: `home → capture → adjust → preview → gallery` (plus `add-frame` and `edit`).
- **Frame picker** is config-driven (`src/config/frames.ts`). Each `FrameConfig` declares its own slot count, slot rectangles in output-pixel space, output dimensions, optional rotation per slot, optional overlay or background image, and an optional reveal animation.
- **Capture** offers a Camera tab (`getUserMedia` with a 3-2-1 countdown and a white flash on shutter) and an Upload tab. Captures are center-cropped to the slot's aspect ratio at encode time so cover-fit is a no-op for camera input. Bulk-uploading multiple photos distributes them across the remaining empty slots.
- **Adjust step** is optional. Each slot is pannable (mouse drag, touch drag) and zoomable (pinch on touch, wheel on desktop) via native Pointer Events. No gesture library.
- **Preview** runs the composite through a single canvas: background → slot images (clipped, optionally rotated, drawn with cover-fit + the per-slot transform) → optional overlay. Reveal animation is per-frame: `polaroid-develop`, `strip-print`, `fade-in`, or any custom keyframe class.
- **Output**: Download as PNG and Web Share API where the browser supports it (mobile native share sheet). Desktop falls back to download.
- **Local gallery**: every composite auto-saves to IndexedDB on the Preview screen. The Gallery screen lists, opens, downloads, shares, and deletes saved photos. Storage usage footer via `navigator.storage.estimate()`. Clear All wipes the entire library after confirmation.

### Custom frames (user-uploadable)
- "Add a frame" tile at the end of the home grid opens an upload + editor flow. The uploaded image becomes the frame's background and its natural dimensions become the output canvas.
- Slot editor: a default slot is created at 80% centered. Slots are draggable, corner and edge handles resize, numeric inputs allow pixel-precise tweaks. Adding a new slot clones the currently-selected slot's dimensions and offsets diagonally so each new rectangle is visible.
- In-editor zoom (50% to 800%, independent of browser zoom) plus stage scroll for fine work on large images.
- Persisted to IndexedDB (`frames` object store, DB v2) as Blob + thumbnail + metadata. Materialized into a runtime `FrameConfig` with object URLs.
- Custom frames mix into the home grid above the built-ins. Each custom tile has a delete affordance with a confirmation dialog. The Preview frame-swap strip also lists custom frames so you can rerun the same photos against a different design.

### Animations and theme
- All animations are CSS keyframes in `src/styles/animations.css`: countdown digit, flash, polaroid develop, strip print, frame card hover and press, button taps, modal fades. `prefers-reduced-motion` zeroes everything globally.
- Light "Snoopy-style" theme: cream background with pastel polka-dot accents, rounded comic-display + body font stacks, chunky outlined buttons that compress on press. All system fonts, no external font requests.

### Privacy as a feature
- No network requests after the initial bundle. No telemetry, analytics, or external scripts.
- All photos, gallery state, and custom frames live in the user's browser via IndexedDB (`photobooth.photos` and `photobooth.frames` object stores). Clearing site data wipes everything.
- Camera stream is explicitly stopped the moment the user leaves the capture screen so the device indicator light turns off immediately.
- A dismissable privacy banner on Home and an inline note on the Gallery screen make the model explicit. Delete confirmations spell out that deletions are permanent.

### Bundled frames
- Classic Strip (4 photos)
- Single Polaroid (1 photo)
- Trio Collage (3 photos with rotation)
- Snoopy Diner, Snoopy Stars, Snoopy Space (3-photo Peanuts-themed strips, 707×2000 source PNGs with slot rectangles tuned to the sky+grass windows)

### Extension points
The architecture surfaces hooks the user needs to extend the app without rewriting screens.

- **Custom animations**: drop new `@keyframes` + class into `src/styles/animations.css`, then reference the class name from `FrameConfig.revealAnimation` or `FrameConfig.className`. Global timing variables (`--anim-fast/base/slow`) live on `:root`.
- **Custom graphics**: `FrameConfig.decorations[]` stacks extra images (stickers, dates, logos) above slots but under the overlay. Background, overlay, and decorations all accept PNG or SVG.
- **New flows or screens**: the `AppStep` union and the `appReducer` are the single edit surface to add screens. Add a step, add a case, render a screen.
- **Calibration tool**: `FrameEditorScreen` provides a visual drag/resize/zoom editor for slot rectangles. Unlinked from the home UI (reachable via `dispatch({ type: 'goto', step: 'edit' })`) but kept around for debugging and curating future built-in frames.

## Deployment

This PR includes the GitHub Pages workflow.

- `vite.config.ts` sets `base: '/Photobooth/'` in production builds so asset URLs resolve under the project-pages subpath. Dev keeps `/`.
- `.github/workflows/deploy.yml` runs on pushes to `main` and via manual dispatch. Installs deps, lints, builds, then publishes `dist/` through `actions/deploy-pages@v4`.
- The first deploy requires the repo owner to flip **Settings → Pages → Source** to **GitHub Actions** once. After that, every merge to main publishes automatically.

Target URL: `https://zyttal.github.io/Photobooth/`.

## File map (high level)
- `src/App.tsx`: reducer + screen switch shell.
- `src/types/index.ts`: `FrameConfig`, `SlotConfig`, `SlotImage`, `AppState`, `Action`, `SavedPhoto`, `CustomFrame`.
- `src/state/appReducer.ts`: flow reducer.
- `src/config/frames.ts`: built-in frames array (the user's edit surface for new built-ins).
- `src/screens/`: HomeScreen, CaptureScreen, AdjustScreen, PreviewScreen, GalleryScreen, AddFrameScreen, FrameEditorScreen.
- `src/components/`: FrameCard, CameraView, Countdown, FlashOverlay, SlotPreview, CompositeCanvas, StepIndicator.
- `src/hooks/`: useCamera, useSlotTransform, useObjectUrl, useShare, useGallery, useCustomFrames.
- `src/utils/`: db (shared IndexedDB open), storage (photos), customFrameStorage (frames), composite, coverFit, captureFromVideo, fileToImage, download, thumbnail.
- `src/styles/animations.css`: keyframes, animation classes, shared layout.
- `src/assets/frames/`: bundled overlay and background assets.

## Out of scope (future phases)
- Filters and color grading
- Drag-and-drop file upload from desktop into the grid
- Sharing to specific networks beyond the Web Share API
- Cloud sync (would compromise the local-only privacy stance, would need explicit opt-in)
- PWA / offline install
- i18n
- URL-based routing inside the app (everything is in-memory state for now)

## How to test

```bash
git checkout phase-1/foundation
npm install
npm run dev -- --host          # exposes on the LAN for phone testing
npm run lint
npm run build && npm run preview
```

### Manual checks
- **Each built-in frame**: pick it, take photos via camera and via upload, watch the countdown and flash, reposition in Adjust, hit Preview. Composite saves automatically, Download produces a PNG at the frame's `output` dimensions.
- **Camera denied**: block the camera site permission and reload. Camera tab should show a denial message and point at Upload.
- **Frame swap**: from Preview, tap a different frame in the swap strip. The captured photos should re-composite against the new frame.
- **Add a frame**: tap the "Add a frame" tile at the end of the home grid. Upload an image, drop slots on it, name it, save. The new frame appears in the home grid, the Preview swap strip, and survives a hard refresh.
- **Custom frame delete**: ✕ on a custom tile confirms, then removes from IndexedDB. Saved photos that used it remain.
- **Gallery persistence**: create a photo, hard-refresh, open Gallery. Photo is present. Open a tile to see the full-size composite. Delete and Clear All both confirm.
- **Privacy**: DevTools Network tab during the entire flow shows zero requests beyond the initial bundle and assets.
- **Reduced motion**: DevTools rendering panel emulate `prefers-reduced-motion: reduce`. Animations are near-instant.
- **Mobile (Safari + Chrome on the LAN URL)**: front camera defaults, pinch zoom adjusts, native share sheet works, theme-color is picked up.

## Verification status
- `npm run lint`: clean
- `npm run build`: type-check + Vite build pass
- Build output: ~248 KB JS, ~18 KB CSS (gzip: ~77 KB / ~4 KB) plus the bundled frame PNGs
- No new runtime dependencies added

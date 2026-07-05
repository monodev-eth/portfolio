# portfolio-next

The PS2-dashboard portfolio as a **Next.js (App Router) + TypeScript** app, Vercel-ready.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
# or
npm run build && npm start
```

## How it's structured / optimized for Next.js

- **`app/layout.tsx`** — `next/font` self-hosts *Play* + *Hanken Grotesk* at build time (no external request, no layout shift).
- **`app/page.tsx`** — a Server Component that passes `PROJECTS` into the client `<Dashboard/>`, so project titles, taglines, and case-study copy render into the **initial HTML (SEO)**.
- **`components/Dashboard.tsx`** (`"use client"`) — the carousel, modal, save-state, keyboard/drag nav, sound, and boot timeline. Content is JSX; the imperative bits (WebGL, audio, centering) run in effects.
- **`lib/ps2bg.ts`** — the Three.js boot + menu shader. Imported **only via dynamic `import()` inside a client effect**, so `three` never touches SSR and lands in its own async chunk (not in First Load JS).
- **`lib/audio.ts`** — synthesized WebAudio (hum + blips).
- **`lib/projects.ts`** — typed `Project[]`. **This is the edit point.**
- **`public/clips/`** — placeholder demo clips. Swap for your recordings, or point `video` at Cloudflare Stream / Mux URLs.

Perf: pixel-ratio capped at 1.5, the menu shader samples 3× (not 6×), the WebGL loop pauses while a demo modal is open or the tab is hidden, and only one tile video decodes at a time.

## Deploy (Vercel)

`vercel` (or push to a GitHub repo and import). No env vars required. For real video, use Cloudflare Stream/Mux URLs in `lib/projects.ts` and add `poster` images for fast LCP.

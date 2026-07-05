/*
 * THE edit point — replace with your real apps.
 * Each object is one "save file" in the memory-card browser.
 *   poster : [colorA, colorB] gradient for the focused tile + its accent glow
 *   video  : demo clip (placeholders live in /public/clips; swap for Cloudflare Stream URLs)
 */
export type ProjectState = "featured" | "new" | "live" | "seen";

export interface Project {
  id: string;
  title: string;
  year: string;
  /** Build window shown in the breadcrumb, formatted "mm/yyyy – mm/yyyy". */
  period: string;
  role: string;
  tagline: string;
  stack: string[];
  state: ProjectState;
  poster: [string, string];
  video: string;
  problem: string;
  process: string;
  outcome: string;
  links: { live?: string; code?: string; study?: string };
}

export const PROJECTS: Project[] = [
  {
    id: "macro-terminal",
    title: "Macro Terminal",
    year: "2025",
    period: "01/2025 – 06/2025",
    role: "Solo — design + full stack",
    tagline: "A markets terminal that scores its own calls — dated, falsifiable theses, Brier-graded.",
    stack: ["Next.js", "TypeScript", "Tailwind", "SVG", "Postgres"],
    state: "featured",
    poster: ["#11204a", "#0a0e1e"],
    video: "/clips/macro-terminal.mp4",
    problem:
      "Market commentary is unfalsifiable — nobody scores their own calls. I wanted a terminal that tracks theses as dated, falsifiable bets with explicit invalidation conditions.",
    process:
      "Built a dense pro-terminal: a thesis board, a regime cockpit, a council that confirms/contradicts each call, and a forecast log scored with Brier as outcomes land.",
    outcome:
      "Turns 'I think' into 'here's my measured track record.' Reads at a glance; the verdict leads, the claim is the subtitle.",
    links: { live: "#", code: "#", study: "#" },
  },
  {
    id: "quant-desk",
    title: "Quant Desk",
    year: "2025",
    period: "03/2025 – 06/2025",
    role: "Solo — full stack + infra",
    tagline: "An autonomous long/short crypto trading bot — vol-targeted, live since launch.",
    stack: ["TypeScript", "Python", "Bybit API", "Postgres"],
    state: "new",
    poster: ["#0e2f2a", "#0a0e1e"],
    video: "/clips/quant-desk.mp4",
    problem:
      "Manual trading doesn't scale and doesn't sleep. The goal was a hands-off book that sizes by volatility and survives regime shifts.",
    process:
      "A Ralph-style autonomous loop: signal intake, portfolio vol-targeting, risk gates, and an observability layer that shows real state — not claims.",
    outcome: "Runs unattended with mandatory vol-targeting and a progress tracker as the source of truth.",
    links: { live: "#", code: "#", study: "#" },
  },
  {
    id: "signal-radar",
    title: "Signal Radar",
    year: "2024",
    period: "05/2024 – 12/2024",
    role: "Solo — data + frontend",
    tagline: "A real-time dashboard that surfaces which callers actually have edge, from on-chain + social flow.",
    stack: ["Next.js", "DuckDB", "WebSockets"],
    state: "live",
    poster: ["#2a164a", "#0a0e1e"],
    video: "/clips/signal-radar.mp4",
    problem: "Alpha is buried in noisy flow. I needed to find which callers actually have edge, not just volume.",
    process:
      "Streamed flow into a fast columnar store, computed caller-edge metrics, and rendered a live radar that updates as the tape moves.",
    outcome: "Caller edge becomes measured, not claimed — ranked, time-decayed, and explorable.",
    links: { live: "#", code: "#", study: "#" },
  },
  {
    id: "browser-pilot",
    title: "Browser Pilot",
    year: "2024",
    period: "02/2024 – 07/2024",
    role: "Solo — systems",
    tagline: "A control plane that lets AI agents drive real websites — headed login, headless automation.",
    stack: ["Python", "CDP", "asyncio"],
    state: "seen",
    poster: ["#3a2410", "#0a0e1e"],
    video: "/clips/browser-pilot.mp4",
    problem: "Agents need to use real sites behind logins and Cloudflare — without a brittle scraper for each one.",
    process:
      "A shared daemon exposing a clean CLI: explore, log in headed, hand control to an agent headless. One session, many consumers.",
    outcome: "Agents fetch and act on pages that block ordinary tooling, with human-in-the-loop login when needed.",
    links: { live: "#", code: "#", study: "#" },
  },
  {
    id: "flow-engine",
    title: "Flow Engine",
    year: "2023",
    period: "08/2023 – 01/2024",
    role: "Solo — backend",
    tagline: "A scheduler that ships on-brand content across many accounts, automatically.",
    stack: ["Node", "Redis", "Cron"],
    state: "seen",
    poster: ["#0e1d3a", "#0a0e1e"],
    video: "/clips/flow-engine.mp4",
    problem: "Posting on-brand, on-time, across accounts is a full-time job done badly by hand.",
    process: "A job orchestrator with a persona layer, draft review, and reliable scheduling — voice in, posts out.",
    outcome: "Content goes out consistently, on a calibrated voice, without a human babysitting the queue.",
    links: { live: "#", code: "#", study: "#" },
  },
  {
    id: "outreach-crm",
    title: "Outreach CRM",
    year: "2024",
    period: "09/2024 – 02/2025",
    role: "Solo — full stack",
    tagline: "An end-to-end lead pipeline — enrich, score, and auto-contact, with a follow-up ledger.",
    stack: ["tsx", "Postgres", "Node"],
    state: "seen",
    poster: ["#3a1024", "#0a0e1e"],
    video: "/clips/outreach-crm.mp4",
    problem: "Lead lists rot. The follow-up ledger lived in someone's head and the sends never happened.",
    process: "A grounded pipeline reading straight from Postgres: enrich, score, draft, and auto-send with a follow-up ledger.",
    outcome: "First real sends in days after a long no-op streak — the pool finally has clean, contactable leads.",
    links: { live: "#", code: "#", study: "#" },
  },
  {
    id: "ledger-lens",
    title: "Ledger Lens",
    year: "2022",
    period: "04/2022 – 11/2022",
    role: "Solo — frontend + WASM",
    tagline: "A fast dashboard showing real-time P&L across every venue in one view.",
    stack: ["React", "Rust", "WASM"],
    state: "seen",
    poster: ["#102a3a", "#0a0e1e"],
    video: "/clips/ledger-lens.mp4",
    problem: "Positions scattered across venues meant no single, trustworthy P&L.",
    process: "A Rust core compiled to WASM does the number-crunching; a React shell renders it without jank.",
    outcome: "One view, live P&L, fast enough to actually watch during a move.",
    links: { live: "#", code: "#", study: "#" },
  },
  {
    id: "stream-deck",
    title: "Stream Deck",
    year: "2023",
    period: "01/2023 – 05/2023",
    role: "Solo — full stack",
    tagline: "Observability dashboards that prove system health from live data — not green-by-default.",
    stack: ["Svelte", "ClickHouse"],
    state: "seen",
    poster: ["#241a3a", "#0a0e1e"],
    video: "/clips/stream-deck.mp4",
    problem: "Most dashboards assert health. I wanted ones that prove it from live data.",
    process: "Wide events into ClickHouse, a Svelte frontend that surfaces real state with honest empty/error states.",
    outcome: "When something's down, the board says so — and where. No green-by-default lies.",
    links: { live: "#", code: "#", study: "#" },
  },
];

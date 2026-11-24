/*
 * The single source of truth for identity.
 *
 * Every identity surface reads from here — the OSD wordmark, the boot splash,
 * contact links, page metadata, JSON-LD, and the generated agent-readable
 * files (/profile.json, /llms.json, /llms.txt, /humans.txt). Nothing is
 * hand-copied: change a handle here and it changes everywhere.
 */
export const PROFILE = {
  /** Canonical handle. Matches GitHub, which is the primary public identity. */
  name: "monodev-eth",
  /** What people actually call him. Leads every human-facing surface. */
  displayName: "Dima",
  /** Formal name, kept for entity resolution (LinkedIn, JSON-LD alternateName). */
  fullName: "Dmitry S",
  handle: "@monodev-eth",
  role: "Co-founder · SigIntZero",
  roleLong: "Co-founder at SigIntZero and TrueOrigin Labs",
  summary: "Product engineer and founder, working from consumer front ends through to the AI agents that build them. Has shipped DeFi lending, staking and venture platforms, copytrading and trade-simulation tools, a tokenized-stock card app, open-source browser infrastructure for agents, and a security blog that researches and publishes itself.",
  /** The hard numbers behind the summary, shown under it on the landing page. Source: lib/projects.ts. */
  proof: "Shipped the front ends for IMF, a credit desk that peaked near $260M TVL, and StockRip, whose on-chain stock-card protocol has handled 77.9K draws and 1,764 ETH of volume.",
  location: "Sydney, Australia",
  focus: [
    "Web3 security",
    "AI agents",
    "browser automation",
    "autonomous systems",
  ],
  avatar: "https://github.com/monodev-eth.png?size=96",
  github: "https://github.com/monodev-eth",
  twitter: "https://x.com/monodev_eth",
  linkedin: "https://www.linkedin.com/in/dmitry-serdyuk-55149b123",
  telegram: "https://t.me/dmitry_xyz",
  email: "serdyuk.dmitry@gmail.com",
  ens: "monodev.eth",
  ensProfile: "https://app.ens.domains/monodev.eth",
  /* One identity, four separators — the platforms disagree, the person doesn't. */
  handles: {
    github: "monodev-eth",
    x: "monodev_eth",
    telegram: "dmitry_xyz",
    ens: "monodev.eth",
  },
  /** Every name this resolves to, so an agent can collapse them into one entity. */
  aliases: ["Dima", "Dmitry S", "monodev-eth", "monodev_eth", "monodev.eth"],
  /** Bump when the identity surfaces are reviewed; stamped onto the generated files. */
  lastReviewed: "2026-10-12",
} as const;

/** Ordered newest first. Feeds the profile page, profile.json, llms.json and llms.txt. */
export interface Role {
  role: string;
  organization: string;
  /** Date range, formatted "yyyy – yyyy" or "yyyy – now". Shown on the resume. */
  period: string;
  /** Short line shown under the org on the profile page and in the JSON surfaces. */
  summary: string;
}

export const EXPERIENCE: Role[] = [
  {
    role: "Co-Founder",
    organization: "SigIntZero",
    period: "2025 – now",
    summary: "Smart-contract audit and security firm. Search, AI, and digital infrastructure across the brand and products.",
  },
  {
    role: "Co-Founder / Software Engineer",
    organization: "TrueOrigin Labs",
    period: "2020 – now",
    summary: "Venture studio behind IMF, Flow, Aetos, and more. Product and systems work across crypto, fintech, and applied AI.",
  },
  {
    role: "Front-End, Design, Integration & QA",
    organization: "Book Club",
    period: "2022 – now",
    summary: "Founding-team member. APAC crypto venture community, runs on Aetos.",
  },
  {
    role: "Tech Co-Founder / Lead Frontend Engineer",
    organization: "Yieldly",
    period: "2020 – 2022",
    summary: "The first DeFi suite on Algorand. Led front-end and product engineering through launch.",
  },
  {
    role: "Full Stack Engineer",
    organization: "MantraDAO",
    period: "2020 – 2021",
    summary: "Web3 product engineering in the TrueOrigin external team.",
  },
  {
    role: "Co-Founder",
    organization: "TrueOrigin",
    period: "2019 – 2021",
    summary: "Onchain product authenticity and supply-chain provenance. The studio's namesake.",
  },
];

/** Long-form focus lines for the agent-readable text surface. */
export const FOCUS_LONG: string[] = [
  "Web3 security and smart-contract auditing",
  "AI agents and tooling",
  "Search infrastructure",
  "DeFi and on-chain credit",
  "Low-latency trading systems",
  "Multi-chain development (Ethereum, Solana, TON, Base)",
  "TypeScript, Rust",
];

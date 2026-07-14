/*
 * Real projects shown in the memory-card browser, one object per save file.
 *   poster : [colorA, colorB] gradient for the focused tile + its accent glow
 *   video  : demo clip in /public/clips (abstract loops stand in until a real capture exists)
 */
export type ProjectState = "featured" | "new" | "live" | "seen";

/** XMB horizontal axis: the company/org a project was built under. */
export interface Org {
  id: string;
  name: string;
  logo: string;
  blurb: string;
}

export const ORGS: Org[] = [
  {
    id: "tolabs",
    name: "TrueOrigin Labs",
    logo: "/logos/tolabs.png",
    blurb: "The venture studio. Client engagements and studio products.",
  },
  {
    id: "sigintzero",
    name: "SigIntZero",
    logo: "/logos/sigintzero.png",
    blurb: "Smart-contract audit and security firm.",
  },
  {
    id: "bookclub",
    name: "Book Club",
    logo: "/logos/bookclub.png",
    blurb: "APAC crypto venture community.",
  },
  {
    id: "trueorigin",
    name: "TrueOrigin",
    logo: "/logos/trueorigin.png",
    blurb: "Onchain provenance. The studio's namesake.",
  },
];

export interface Project {
  id: string;
  title: string;
  year: string;
  /** Build window shown in the breadcrumb, formatted "mm/yyyy – mm/yyyy". */
  period: string;
  role: string;
  /** id of the ORGS entry this project sits under on the XMB. */
  org: string;
  /** Small mark shown in the XMB item row. */
  logo: string;
  tagline: string;
  stack: string[];
  state: ProjectState;
  poster: [string, string];
  video: string;
  /** Set when the clip is a portrait (mobile) capture, so the preview + player render 9:16 instead of 16:9. */
  portrait?: boolean;
  problem: string;
  process: string;
  outcome: string;
  links: { live?: string; code?: string; study?: string };
}

export const PROJECTS: Project[] = [
  {
    id: "aetos",
    org: "tolabs",
    logo: "/logos/aetos.png",
    title: "Aetos",
    year: "2023",
    period: "2022 – 2023",
    role: "TrueOrigin Labs · front-end + design + integration + QA",
    tagline:
      "A trustless platform for venture DAOs: capital calls, proposals, vaults, and returns, all on-chain.",
    stack: ["React", "TypeScript", "Solidity", "The Graph", "EVM"],
    state: "featured",
    poster: ["#3a2c10", "#0a0e1e"],
    video: "/clips/aetos.mp4",
    problem:
      "Venture funds run on trust. Commitments, capital calls, allocations, and distributions all depend on a fund manager behaving. Web3 funds wanted the whole lifecycle automated and trustless.",
    process:
      "Built the dApp front end at TrueOrigin: wallet-native flows over the Aetos contracts. Members vote each other in (1 member = 1 vote), commitment schedules call capital in rounds, vaults are siloed by purpose (capital, operations, returns, sub-vaults), and whitelisted tokens swap through an AMM. Indexed with The Graph.",
    outcome:
      "An open-source, EVM-compatible platform that underpins Book Club, an APAC crypto venture community. The demo is the full 12-minute walkthrough: membership vote to claimed returns, every step an on-chain transaction.",
    links: { live: "https://aetos.vc", study: "https://aetos.gitbook.io/aetos.vc" },
  },
  {
    id: "flow",
    org: "tolabs",
    logo: "/logos/flow.jpg",
    title: "Flow",
    year: "2024",
    period: "2024 – 2025",
    role: "TrueOrigin Labs · trading front-end",
    tagline:
      "A high-frequency copytrading system on Solana and Ethereum. 0-block latency from signal to execution.",
    stack: ["Next.js", "TypeScript", "Solana", "Ethereum"],
    state: "live",
    poster: ["#0e1d3a", "#0a0e1e"],
    video: "/clips/flow.mp4",
    problem:
      "Copytrading is a latency race. By the time a tracked wallet's trade confirms and you mirror it, the edge is gone.",
    process:
      "Built the trading front-end over the copy engine: tracked-wallet feeds, live positions, and execution controls, on top of a pipeline tuned for same-block follows.",
    outcome:
      "Copytrades land at 0-block latency. The mirror executes in the same block as the source trade, on Solana and Ethereum.",
    links: {},
  },
  {
    id: "imf",
    org: "tolabs",
    logo: "/logos/imf.png",
    title: "IMF",
    year: "2026",
    period: "2025 – now",
    role: "TrueOrigin Labs · front-end build",
    tagline:
      "The International Meme Fund — a memecoin-native bank on Ethereum. Borrow real stablecoins against your bags, and launch a coin that ships with its own ENS name and gas on the house.",
    stack: ["Next.js", "TypeScript", "Ethereum", "ENS", "Morpho"],
    state: "live",
    poster: ["#0c3a1e", "#0a0e1e"],
    video: "/clips/imf.mp4",
    problem:
      "Memecoins get treated as toys: you can't borrow against them, and launching one means fighting snipers, rug fears, and a nameless 0x address. The upside is real; the plumbing to actually bank it isn't.",
    process:
      "Built the front-end for IMF on Ethereum across both sides of the protocol: the credit desk — deposit a memecoin (or BTC/ETH), borrow USDS from isolated Morpho vaults, earn $IMF rewards — and V4, a launchpad where every coin bonds on a fair fixed-supply curve and graduates into permanently locked liquidity, shipping with a free ENS subname and gas covered by the protocol. All over a wallet-native front end.",
    outcome:
      "IMF became the fastest-growing Morpho vault — a nine-figure book that peaked near $260M TVL and the largest single holder of USDS — then shipped V4 to make launching a coin as easy as claiming a name. Now moving onto Robinhood Chain.",
    links: { live: "https://imf.bz", study: "https://docs.imf.bz" },
  },
  {
    id: "sigintzero",
    org: "sigintzero",
    logo: "/logos/sigintzero.png",
    title: "SigIntZero",
    year: "2026",
    period: "2025 – now",
    role: "Chief Digital Officer",
    tagline:
      "A smart-contract audit and security firm: Sentinel AI scans, senior audits, and Tripwire runtime monitoring.",
    stack: ["AI", "Security", "Next.js", "Search"],
    state: "live",
    poster: ["#0f2430", "#0a0e1e"],
    video: "/clips/sigintzero.mp4",
    problem:
      "An audit is a snapshot. Funds move at runtime, and exploits go through people and infrastructure as often as code.",
    process:
      "Run the digital side as CDO: brand, site, search presence, and the daily security-intel engine behind the research blog, next to Sentinel (AI auditing) and Tripwire (0-block threat detection and response).",
    outcome:
      "A three-product security ladder in production: self-serve Sentinel scans, senior audits, and Tripwire monitoring backed by a Superteam Australia grant.",
    links: { live: "https://sigintzero.com" },
  },
  {
    id: "yieldly",
    org: "tolabs",
    logo: "/logos/yieldly.png",
    title: "Yieldly",
    year: "2021",
    period: "2020 – 2022",
    role: "Tech co-founder · lead frontend",
    tagline: "The first DeFi suite on Algorand: staking pools and no-loss prize games.",
    stack: ["React", "TypeScript", "Algorand", "TEAL"],
    state: "seen",
    poster: ["#0e2f2a", "#0a0e1e"],
    video: "/clips/yieldly.mp4",
    portrait: true,
    problem:
      "Algorand had speed and finality but nothing to do with your ALGO: no staking products, no yield, no DeFi.",
    process:
      "Led front-end and product as tech co-founder: wallet flows, staking pools, and prize games, from zero to mainnet launch.",
    outcome: "Shipped the chain's first DeFi suite and ran it through the 2021 cycle.",
    links: {},
  },
  {
    id: "tonsoffriends",
    org: "tolabs",
    logo: "/logos/tonsoffriends.png",
    title: "TonsOfFriends",
    year: "2024",
    period: "2024 – 2025",
    role: "TrueOrigin Labs · product & front-end",
    tagline:
      "A social DeFi ecosystem on Telegram: discover communities, play to earn $FREN, and trade — all in one TON mini-app.",
    stack: ["Next.js", "TypeScript", "TON", "Telegram", "EVM"],
    state: "live",
    poster: ["#0a3050", "#0a0e1e"],
    video: "/clips/tonsoffriends.mp4",
    portrait: true,
    problem:
      "Crypto's newcomers are overwhelmed and alone. Communities are scattered across Telegram, X, and Discord, low-quality projects erode trust, and TON lacks the integrations EVM chains take for granted — so there's no friendly, unified way in.",
    process:
      "Built a Telegram-native ecosystem around the $FREN token: a mini-app (@toftechbot) to search, join, and grow communities, a squad-based tapper game, and a DeFi suite — non-custodial Vaults, tradable group shares, a democratic meme-token launchpad, a swap aggregator, and Flow-powered chain analytics — bridged across TON, Ethereum, and Base.",
    outcome:
      "One mini-app where friends discover communities, play to earn, and trade without leaving Telegram — lowering the barrier to Web3 for newcomers while giving builders funding, tools, and a built-in audience.",
    links: { live: "https://tonfriends.tech", study: "https://docs.tonfriends.tech" },
  },
  {
    id: "bookclub",
    org: "bookclub",
    logo: "/logos/bookclub.png",
    title: "Book Club",
    year: "2022",
    period: "2022 – now",
    role: "Founding team · front-end + design + integration + QA",
    tagline: "An APAC crypto venture community: 500+ members, 9 teams backed, runs on Aetos.",
    stack: ["Aetos", "EVM", "Design"],
    state: "live",
    poster: ["#3a1024", "#0a0e1e"],
    video: "/clips/bookclub.mp4",
    problem:
      "APAC crypto had talent and capital but no shared room where founders, funds, and builders actually ship together.",
    process:
      "On the founding team. Built the club's web presence and the Aetos rails it runs on: front-end, design, integration, QA.",
    outcome:
      "Since January 2022: 9 teams supported, $10M+ collective revenue, 500+ members, and monthly demo nights across the region.",
    links: { live: "https://www.bookclub.wtf" },
  },
  {
    id: "mantra",
    org: "tolabs",
    logo: "/logos/mantra.png",
    title: "MantraDAO",
    year: "2020",
    period: "2020 – 2021",
    role: "TrueOrigin Labs · full stack, external team",
    tagline: "DeFi staking and governance. Product engineering from an embedded external team.",
    stack: ["React", "TypeScript", "Solidity"],
    state: "seen",
    poster: ["#2a164a", "#0a0e1e"],
    video: "/clips/mantra.mp4",
    problem:
      "MANTRA needed product shipped across staking and governance without slowing the core roadmap.",
    process:
      "Full stack in the TrueOrigin external team inside the org, shipping product surfaces over the staking and governance contracts.",
    outcome: "Features landed release after release next to the core team's roadmap.",
    links: {},
  },
  {
    id: "shuriken",
    org: "tolabs",
    logo: "/logos/shuriken.png",
    title: "Shuriken",
    year: "2025",
    period: "2024 – 2025",
    role: "TrueOrigin Labs · core development",
    tagline:
      "The Rust EVM simulation engine behind Shuriken: simulate a token's buy and sell against live chain state to catch honeypots and price impact before you snipe.",
    stack: ["Rust", "EVM", "Ethereum", "ERC-20", "Simulation"],
    state: "live",
    poster: ["#11204a", "#0a0e1e"],
    video: "/clips/shuriken.mp4",
    problem:
      "Sniping a token launch is a blind bet: from the outside you can't tell if trading is even enabled, whether it's a honeypot you can never sell, or what the tax and price impact will be — and getting it wrong on-chain costs real money, instantly.",
    process:
      "On the core dev team, built the Rust EVM simulation-and-analysis engine: it replays contract state at a target block — with preceding transactions and state overrides — to simulate a token's buy and sell from the sniper's perspective, flagging honeypots and trade-enablement and computing the real buy/sell delta before any transaction is sent. Runs across L1 and L2.",
    outcome:
      "A simulation API that turns a blind snipe into a checked one — honeypots and untradeable tokens filtered, trades sized on real numbers, all before capital ever touches the chain.",
    links: { live: "https://shuriken.trade" },
  },
  {
    id: "bespoke",
    org: "tolabs",
    logo: "/logos/bespoke.png",
    title: "Bespoke",
    year: "2022",
    period: "2022",
    role: "TrueOrigin Labs · front-end build",
    tagline:
      "The mint site for Bespoke: a 10,000-piece NFT collection styled as a tailor tucked away on Wall Street — 3D storefront, lore, and wallet mint in one experience.",
    stack: ["Next.js", "TypeScript", "MUI", "Ethereum", "Web3"],
    state: "seen",
    poster: ["#332a0c", "#0a0e1e"],
    video: "/clips/bespoke.mp4",
    problem:
      "An NFT drop lives or dies on its mint experience. Bespoke needed a site that sold the story — a tailor tucked away on Wall Street — not just a wallet-connect over a grid of thumbnails.",
    process:
      "Built the front-end: a rendered 3D storefront you step into, the About / Specs / Team / Community sections, whitelist and fixed-price minting with wallet connect, Lottie feature loops, and an interactive “Enter the Tower” page.",
    outcome:
      "A branded, atmospheric mint site for a 10,000-piece collection — the storefront, the lore, and the mint flow in one place.",
    links: { live: "https://bespoke.bond", study: "https://docs.bespoke.bond" },
  },
  {
    id: "trueorigin",
    org: "trueorigin",
    logo: "/logos/trueorigin.png",
    title: "TrueOrigin",
    year: "2020",
    period: "2019 – 2021",
    role: "Co-founder",
    tagline: "Product authenticity and supply-chain provenance, proven on-chain.",
    stack: ["Solidity", "Node", "Supply chain"],
    state: "seen",
    poster: ["#3a2410", "#0a0e1e"],
    video: "/clips/trueorigin.mp4",
    problem: "Counterfeits thrive because provenance lives in paperwork nobody can verify.",
    process:
      "Co-founded the startup and built the systems that verify authenticity and track supply chains on-chain.",
    outcome:
      "The venture studio kept the name: TrueOrigin Labs went on to build Aetos, Flow, and the client work that followed.",
    links: {},
  },
];

/*
 * Real projects shown in the memory-card browser, one object per save file.
 *   poster : [colorA, colorB] gradient for the focused tile + its accent glow
 *   video  : demo clip in /public/clips; omit it and the preview still stands in
 */
import { SITE_URL } from "@/lib/site";

export interface Project {
  id: string;
  title: string;
  year: string;
  /** Build window shown in the breadcrumb, formatted "mm/yyyy – mm/yyyy". */
  period: string;
  role: string;
  /** Small mark shown in the XMB item row. */
  logo: string;
  tagline: string;
  /** Fuller prose for the agent-readable surfaces (/profile.json, /llms.json, /llms.txt). */
  summary: string;
  stack: string[];
  poster: [string, string];
  video?: string;
  /** Set when the clip is a portrait (mobile) capture, so the preview + player render 9:16 instead of 16:9. */
  portrait?: boolean;
  problem: string;
  process: string;
  outcome: string;
  /** Concise result shown before the detailed case study and on the résumé. */
  result: string;
  /** A lightweight frame from the demo, shown before playback and on mobile. */
  preview: string;
  links: { live?: string; app?: string; code?: string; study?: string };
}

const PROJECT_ORDER = [
  "imf",
  "stockrip",
  "sigintzero",
  "vibatchium",
  "shuriken",
  "flow",
  "tonsoffriends",
  "aetos",
  "yieldly",
  "bespoke",
  "mantra",
] as const;

const PROJECTS_BY_HISTORY: Project[] = [
  {
    id: "aetos",
    result: "Built the venture-DAO interface behind Book Club, an APAC community with more than 500 members.",
    preview: "/previews/aetos.webp",
    logo: "/logos/aetos.png",
    title: "Aetos",
    year: "2023",
    period: "2022 – 2023",
    role: "TrueOrigin Labs · front-end + design + integration + QA",
    tagline:
      "A trustless platform for venture DAOs: capital calls, proposals, vaults, and returns, all on-chain.",
    summary:
      "Trustless venture-DAO platform built at TrueOrigin Labs. On-chain capital calls, proposals, siloed vaults, and returns. Underpins Book Club: 500+ members, 9 teams, $10M+ collective revenue.",
    stack: ["React", "TypeScript", "Solidity", "The Graph", "EVM"],
    poster: ["#3a2c10", "#0a0e1e"],
    video: "/clips/aetos.mp4",
    problem:
      "Venture funds run on trust. Commitments, capital calls, allocations, and distributions all depend on a fund manager behaving. Web3 funds wanted the whole lifecycle automated and trustless.",
    process:
      "Built the dApp front end at TrueOrigin: wallet-native flows over the Aetos contracts. Members vote each other in (1 member = 1 vote), commitment schedules call capital in rounds, vaults are siloed by purpose (capital, operations, returns, sub-vaults), and whitelisted tokens swap through an AMM. Indexed with The Graph.",
    outcome:
      "An open-source, EVM-compatible platform that underpins Book Club, an APAC crypto venture community with 500+ members. Since 2022 the community has supported 9 teams with $10M+ in collective revenue. The demo follows the full on-chain lifecycle from membership vote to claimed returns.",
    links: { live: "https://aetos.vc", study: "https://aetos.gitbook.io/aetos.vc" },
  },
  {
    id: "flow",
    result: "Built the trading front end for same-block copytrading on Solana and Ethereum.",
    preview: "/previews/flow.webp",
    logo: "/logos/flow.jpg",
    title: "Flow",
    year: "2024",
    period: "2024 – 2025",
    role: "TrueOrigin Labs · trading front-end",
    tagline:
      "A high-frequency copytrading system on Solana and Ethereum. 0-block latency from signal to execution.",
    summary:
      "High-frequency copytrading system on Solana and Ethereum (TrueOrigin Labs). Trading front-end, 0-block latency execution.",
    stack: ["Next.js", "TypeScript", "Solana", "Ethereum"],
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
    result: "Front end for a credit desk that peaked near $260M TVL, followed by its V4 launchpad.",
    preview: "/previews/imf.webp",
    logo: "/logos/imf.png",
    title: "IMF",
    year: "2026",
    period: "2025 – now",
    role: "TrueOrigin Labs · front-end build",
    tagline:
      "The International Meme Fund: a memecoin-native bank on Ethereum. Borrow real stablecoins against your bags, and launch a coin that ships with its own ENS name and gas on the house.",
    summary:
      "The International Meme Fund, a memecoin launchpad and credit desk on Ethereum and Robinhood Chain (TrueOrigin Labs). Borrow USDS against memecoins via isolated Morpho vaults; the V4 launchpad bonds coins on a fair fixed-supply curve, shipping with a free ENS subname and gas covered. Peaked near $260M TVL and the largest single holder of USDS.",
    stack: ["Next.js", "TypeScript", "Ethereum", "ENS", "Morpho"],
    poster: ["#0c3a1e", "#0a0e1e"],
    video: "/clips/imf.mp4",
    problem:
      "Memecoins get treated as toys: you can't borrow against them, and launching one means fighting snipers, rug fears, and a nameless 0x address. The upside is real; the plumbing to actually bank it isn't.",
    process:
      "Built the front-end for IMF on Ethereum across both sides of the protocol. The credit desk lets you deposit a memecoin (or BTC/ETH), borrow USDS from isolated Morpho vaults, and earn $IMF rewards. V4 is a launchpad where every coin bonds on a fair fixed-supply curve and graduates into permanently locked liquidity, shipping with a free ENS subname and gas covered by the protocol. All over a wallet-native front end.",
    outcome:
      "IMF became the fastest-growing Morpho vault: a nine-figure book that peaked near $260M TVL and the largest single holder of USDS. Then it shipped V4 to make launching a coin as easy as claiming a name. Now moving onto Robinhood Chain.",
    links: { live: "https://imf.bz", app: "https://app.imf.bz", study: "https://docs.imf.bz" },
  },
  {
    id: "stockrip",
    result: "Built the front end for StockRip's on-chain stock-card protocol (77.9K draws), then led an AI-agent build of its consumer app, live on real money in six days.",
    preview: "/previews/stockrip.webp",
    logo: "/logos/stockrip.png",
    title: "StockRip",
    year: "2026",
    period: "2025 – now",
    role: "TrueOrigin Labs · product & front-end",
    tagline:
      "Trading cards that hold real shares. Rip a pack on your phone, pull tokenized stocks out of a live on-chain draw, then keep the card or sell it.",
    summary:
      "A trading-card app for tokenized stocks on Robinhood Chain (TrueOrigin Labs). The consumer app at stockrip.com is a PWA where each card holds real Robinhood stock tokens: rip a pack, keep or sell a card, buy a stock as a new card, or gift a pack by link, with prices in dollars and an embedded wallet. AI agents wrote it from a task graph, with tests written before the code and a reviewer agent that never sees the builder\'s reasoning. Underneath is the StockRip draw protocol, whose original front end now runs at pro.stockrip.com: depositors pair stock tokens with ETH backing, and buyers pay a harmonic-mean price to draw a random position settled by on-chain VRF.",
    stack: ["Next.js", "TypeScript", "viem", "Robinhood Chain", "Privy", "Three.js", "Playwright"],
    poster: ["#16300c", "#0a0e1e"],
    video: "/clips/stockrip.mp4",
    portrait: true,
    problem:
      "Tokenized stocks trade, and that is all they do. A position is a number in a wallet: nothing to open, nothing to chase, no reason to come back. Meanwhile the fair-launch mechanics that make people show up live entirely in memecoins, where there is no asset underneath.",
    process:
      "Built the protocol's own front end first, now at pro.stockrip.com: a vending-machine homepage that reads the whole pool live, one-click deposits, a reveal that holds the audience while the on-chain randomness settles, and collectible vault cards. Then led the build of the consumer app that replaced it on stockrip.com. AI agents wrote the code from a task plan: tests came first, screens were checked against the design by a second AI reviewer, and the product, design and money calls stayed with the team.",
    outcome:
      "The app went live on real money six days after its first commit and took over stockrip.com within the month. The protocol underneath has handled 77.9K draws and 1,764 ETH of volume, with over 1,000 positions in the pool. The clip is the live app on a phone: the pack carousel, the shelf of stock cards, and a card's own page with its chart and news.",
    links: { live: "https://stockrip.com", study: "https://stockrip.com/docs" },
  },
  {
    id: "sigintzero",
    result: "Co-founded a security firm spanning AI scans, senior audits and runtime monitoring, backed by a Superteam Australia grant.",
    preview: "/previews/sigintzero.webp",
    logo: "/logos/sigintzero.png",
    title: "SigIntZero",
    year: "2026",
    period: "2025 – now",
    role: "SigIntZero · Co-founder",
    tagline:
      "A smart-contract audit and security firm: Sentinel AI scans, senior audits, and Tripwire runtime monitoring.",
    summary:
      "Smart-contract audit and security firm (co-founder). Sentinel AI scans, senior audits, and Tripwire runtime monitoring, backed by a Superteam Australia grant.",
    stack: ["AI", "Security", "Next.js", "Search"],
    poster: ["#0f2430", "#0a0e1e"],
    video: "/clips/sigintzero.mp4",
    problem:
      "An audit is a snapshot. Funds move at runtime, and exploits go through people and infrastructure as often as code.",
    process:
      "Co-founded the firm and run the digital side: brand, site, search presence, and the daily security-intel engine behind the research blog, next to Sentinel (AI auditing) and Tripwire (0-block threat detection and response).",
    outcome:
      "A three-product security ladder in production: self-serve Sentinel scans, senior audits, and Tripwire monitoring backed by a Superteam Australia grant.",
    links: { live: "https://sigintzero.com" },
  },
  {
    id: "vibatchium",
    result: "Built and maintain an open-source browser daemon that runs many logged-in Chrome sessions for AI agents, unattended.",
    preview: "/previews/vibatchium.webp",
    logo: "/logos/vibatchium.png",
    title: "vibatchium",
    year: "2026",
    period: "2026 – now",
    role: "TrueOrigin Labs · creator & maintainer",
    tagline:
      "The browser layer for an always-on box: one daemon, many logged-in Chrome sessions, stealth on by default, driven by AI agents through a CLI and an MCP server.",
    summary:
      "Open-source (Apache-2.0) browser daemon for AI agents (TrueOrigin Labs, creator and maintainer). One daemon runs many persistent, logged-in Chrome sessions unattended, with a stealth layer, a browserless fetch lane on the same cookies, origin-bound secrets the agent can use but not read, and prompt-injection scanning. Ships as the vb CLI and an MCP server on PyPI.",
    stack: ["Python", "Patchright", "Chrome", "MCP", "curl_cffi"],
    poster: ["#0f3324", "#0a0e1e"],
    problem:
      "Agents that work on the real web hit login walls, bot challenges and pages that only exist after JavaScript runs. The supervised tools hand control back to a human at every wall, and the libraries leave sessions, crash recovery and credentials for you to build.",
    process:
      "Wrote it as a daemon rather than a library: N persistent Chrome profiles behind one process, with leases so agents sharing a box don't collide, crash self-heal, budgets and idle freeze. A fetch lane replays the session's cookies with a Chrome TLS fingerprint and no renderer, so a page only pays for a browser when it needs one. Secrets are filled by origin and refused on read-back, and page text is scanned for prompt injection before an agent sees it.",
    outcome:
      "Twenty minor releases on PyPI and listed in the MCP registry. It runs under the multi-account posting engine in the Lab, and it filmed the StockRip wallet demo on a machine with no screen.",
    links: { code: "https://github.com/trueoriginlabs/vibatchium", live: "https://pypi.org/project/vibatchium/", study: `${SITE_URL}/blog/browser-for-agents` },
  },
  {
    id: "yieldly",
    result: "Led front end and product from zero to mainnet for Algorand's first DeFi suite.",
    preview: "/previews/yieldly.webp",
    logo: "/logos/yieldly.png",
    title: "Yieldly",
    year: "2021",
    period: "2020 – 2022",
    role: "Tech co-founder · lead frontend",
    tagline: "The first DeFi suite on Algorand: staking pools and no-loss prize games.",
    summary:
      "The first DeFi suite on Algorand (tech co-founder, lead frontend). Staking pools and no-loss prize games.",
    stack: ["React", "TypeScript", "Algorand", "TEAL"],
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
    result: "Built a Telegram mini-app bringing communities, games and DeFi together across TON and EVM chains.",
    preview: "/previews/tonsoffriends.webp",
    logo: "/logos/tonsoffriends.png",
    title: "TonsOfFriends",
    year: "2024",
    period: "2024 – 2025",
    role: "TrueOrigin Labs · product & front-end",
    tagline:
      "A social DeFi ecosystem on Telegram: discover communities, play to earn $FREN, and trade, all in one TON mini-app.",
    summary:
      "A social DeFi ecosystem on Telegram (TrueOrigin Labs): discover communities, play to earn $FREN, and trade in one TON mini-app, bridged across TON, Ethereum, and Base.",
    stack: ["Next.js", "TypeScript", "TON", "Telegram", "EVM"],
    poster: ["#0a3050", "#0a0e1e"],
    video: "/clips/tonsoffriends.mp4",
    portrait: true,
    problem:
      "Crypto's newcomers are overwhelmed and alone. Communities are scattered across Telegram, X, and Discord, low-quality projects erode trust, and TON lacks the integrations EVM chains take for granted, so there's no friendly, unified way in.",
    process:
      "Built a Telegram-native ecosystem around the $FREN token: a mini-app (@toftechbot) to search, join, and grow communities, a squad-based tapper game, and a DeFi suite (non-custodial Vaults, tradable group shares, a democratic meme-token launchpad, a swap aggregator, and Flow-powered chain analytics), all bridged across TON, Ethereum, and Base.",
    outcome:
      "One mini-app where friends discover communities, play to earn, and trade without leaving Telegram. It lowers the barrier to Web3 for newcomers while giving builders funding, tools, and a built-in audience.",
    links: { live: "https://tonfriends.tech", study: "https://docs.tonfriends.tech" },
  },
  {
    id: "mantra",
    result: "Shipped full-stack staking and governance features as part of TrueOrigin's embedded team.",
    preview: "/previews/mantra.webp",
    logo: "/logos/mantra.png",
    title: "MantraDAO",
    year: "2020",
    period: "2020 – 2021",
    role: "TrueOrigin Labs · full stack, external team",
    tagline: "DeFi staking and governance. Product engineering from an embedded external team.",
    summary:
      "DeFi staking and governance. Full-stack product engineering in the TrueOrigin external team.",
    stack: ["React", "TypeScript", "Solidity"],
    poster: ["#2a164a", "#0a0e1e"],
    video: "/clips/mantra.mp4",
    problem:
      "MantraDAO needed product shipped across staking and governance without slowing the core roadmap.",
    process:
      "Full stack in the TrueOrigin external team inside the org, shipping product surfaces over the staking and governance contracts.",
    outcome: "Features landed release after release next to the core team's roadmap.",
    links: {},
  },
  {
    id: "shuriken",
    result: "Built the Rust simulation engine that checks honeypots and price impact before capital reaches the chain.",
    preview: "/previews/shuriken.webp",
    logo: "/logos/shuriken.png",
    title: "Shuriken",
    year: "2025",
    period: "2024 – 2025",
    role: "TrueOrigin Labs · core development",
    tagline:
      "The Rust EVM simulation engine behind Shuriken: simulate a token's buy and sell against live chain state to catch honeypots and price impact before you snipe.",
    summary:
      "Rust EVM simulation engine (core dev). Replays chain state to simulate a token's buy and sell before you snipe, flagging honeypots and price impact. Runs across L1 and L2.",
    stack: ["Rust", "EVM", "Ethereum", "ERC-20", "Simulation"],
    poster: ["#11204a", "#0a0e1e"],
    video: "/clips/shuriken.mp4",
    problem:
      "Sniping a token launch is a blind bet: from the outside you can't tell if trading is even enabled, whether it's a honeypot you can never sell, or what the tax and price impact will be. Getting it wrong on-chain costs real money, instantly.",
    process:
      "On the core dev team, built the Rust EVM simulation-and-analysis engine: it replays contract state at a target block (with preceding transactions and state overrides) to simulate a token's buy and sell from the sniper's perspective, flagging honeypots and trade-enablement and computing the real buy/sell delta before any transaction is sent. Runs across L1 and L2.",
    outcome:
      "A simulation API that turns a blind snipe into a checked one: honeypots and untradeable tokens filtered, trades sized on real numbers, all before capital ever touches the chain.",
    links: { live: "https://shuriken.trade" },
  },
  {
    id: "bespoke",
    result: "Built an immersive 3D storefront and wallet mint for a 10,000-piece NFT collection.",
    preview: "/previews/bespoke.webp",
    logo: "/logos/bespoke.png",
    title: "Bespoke",
    year: "2022",
    period: "2022",
    role: "TrueOrigin Labs · front-end build",
    tagline:
      "The mint site for Bespoke: a 10,000-piece NFT collection styled as a tailor tucked away on Wall Street, with a 3D storefront, lore, and wallet mint in one experience.",
    summary:
      "The mint site for a 10,000-piece NFT collection (TrueOrigin Labs): a 3D storefront, lore, and wallet mint in one experience.",
    stack: ["Next.js", "TypeScript", "MUI", "Ethereum", "Web3"],
    poster: ["#332a0c", "#0a0e1e"],
    video: "/clips/bespoke.mp4",
    problem:
      "An NFT drop lives or dies on its mint experience. Bespoke needed a site that sold the story, a tailor tucked away on Wall Street, not just a wallet-connect over a grid of thumbnails.",
    process:
      "Built the front-end: a rendered 3D storefront you step into, the About / Specs / Team / Community sections, whitelist and fixed-price minting with wallet connect, Lottie feature loops, and an interactive “Enter the Tower” page.",
    outcome:
      "A branded, atmospheric mint site for a 10,000-piece collection: the storefront, the lore, and the mint flow in one place.",
    links: { study: "https://docs.bespoke.bond" },
  },
];

export const PROJECTS = [...PROJECTS_BY_HISTORY].sort(
  (a, b) => PROJECT_ORDER.indexOf(a.id as (typeof PROJECT_ORDER)[number]) - PROJECT_ORDER.indexOf(b.id as (typeof PROJECT_ORDER)[number]),
);

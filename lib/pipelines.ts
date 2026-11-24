/*
 * Systems that run themselves. These are not products: no UI to film, no public
 * URL, no launch. They are machinery, so /lab renders them as stage rails rather
 * than as memory-card tiles like lib/projects.ts.
 *
 * House rule carried over from the project copy: no em-dashes.
 */

export interface Stage {
  /** Short label on the rail. Lowercase, one word where possible. */
  name: string;
  /** What the stage actually does, in six or so words. */
  detail: string;
}

export interface Artifact {
  /** Site-absolute path under /public. */
  src: string;
  alt: string;
}

export interface Pipeline {
  id: string;
  title: string;
  shortTitle: string;
  tagline: string;
  /** What fires it, and how often. */
  cadence: string;
  /** What it is built on. Rendered as chips. */
  runtime: string[];
  stages: Stage[];
  /** Why it exists at all. */
  why: string;
  /** The decision worth showing another engineer. */
  mechanic: string;
  /** Concrete, checkable output. */
  shipped: string[];
  /** Real output of the pipeline itself, never decoration. */
  artifacts?: Artifact[];
  /** How the artifacts are laid out: wide 16:9 stills, or portrait card cuts. */
  artifactShape?: "wide" | "card";
  /** Why there is nothing to show, when that is itself the interesting part. */
  note?: string;
  /** Publicly checkable output. */
  evidence?: { label: string; href: string }[];
  /** Deep-dive post slug in content/posts, when one exists. */
  post?: string;
}

export const PIPELINES: Pipeline[] = [
  {
    id: "blog-writer",
    shortTitle: "Blog writer",
    title: "SigIntZero blog writer",
    tagline:
      "A security research blog that picks its own subject, writes it, checks itself, illustrates itself and ships, then skips the day when nothing is worth writing about.",
    cadence: "cron, 10:33 every morning",
    runtime: ["Python", "claude -p", "codex", "git worktree", "Pillow"],
    stages: [
      { name: "brief", detail: "the 10:07 security brief hands off scored picks" },
      { name: "pick", detail: "re-scores for bloggability, dedupes against what shipped" },
      { name: "write", detail: "a slash command with a persona and a corpus" },
      { name: "gate", detail: "AI tells, fact check, editorial review, schema validator" },
      { name: "cover", detail: "codex renders a text-free 1280x720 illustration" },
      { name: "ship", detail: "isolated worktree, branch, commit, deploy" },
      { name: "post", detail: "LinkedIn, X, and the canonical article repo" },
    ],
    why:
      "Security incidents have a short half-life. Writing one up properly takes a couple of hours, so most of them never get written up at all and the ones that do land a week late. The morning brief was already finding them. The gap was everything after finding them.",
    mechanic:
      "The interesting part is the skip. Most of this pipeline is gates that can stop it: the selector disqualifies weekly digests, proof-of-concept tracker commits, generic index URLs, anything outside a 14 day window, and any topic a published post already covers. A quiet cycle produces nothing, and that is the correct outcome rather than a failure. The first autonomous run got it wrong in an instructive way. It read the X posting queue instead of the brief's curated incidents, picked a stale off-brand story and skipped a $20M governance takeover. The fix was a structured hand-off file between the two stages, not a smarter prompt. One smaller thing worth stealing: the stat cards are drawn programmatically with Pillow and a truetype font rather than generated, because image models garble text and always will.",
    shipped: [
      "64 posts live between 5 July and 24 November 2026",
      "A generated cover on every post, every one of them text-free",
      "Publishes from an isolated worktree, so it has never touched a working tree",
    ],
    artifacts: [
      { src: "/lab/covers/bonkdao.webp", alt: "Generated cover: a hand dropping a ballot onto scales that tip and spill coins" },
      { src: "/lab/covers/coldcard.webp", alt: "Generated cover: an opened hardware wallet showing a chip and a brass gear" },
      { src: "/lab/covers/injective.webp", alt: "Generated cover: a package fanning out into a dependency tree with one red path" },
      { src: "/lab/covers/harmony.webp", alt: "Generated cover: a gloved hand pulling one red block out of a dark grid" },
    ],
    artifactShape: "wide",
    evidence: [{ label: "sigintzero.com/blog", href: "https://sigintzero.com/blog" }],
  },
  {
    id: "app-builder",
    shortTitle: "App builder",
    title: "StockRip build harness",
    tagline:
      "A consumer app that moves real money, written by AI agents against a harness that decides when their work is done.",
    cadence: "continuous, a few agent sessions in parallel",
    runtime: ["Claude Code", "Playwright", "Vitest", "GitHub Actions", "GPU runner"],
    stages: [
      { name: "decide", detail: "people make the product and money calls" },
      { name: "task", detail: "forty four tasks over seven phases" },
      { name: "tests", detail: "written first, must fail before any code" },
      { name: "build", detail: "agents write the code and the PRs" },
      { name: "diff", detail: "each screen against the prototype, loosely" },
      { name: "judge", detail: "a reviewer blind to the builder's reasoning" },
      { name: "browser", detail: "the affected specs, WebGL on a GPU" },
      { name: "guard", detail: "changes to the checks get their own review" },
    ],
    why:
      "An agent will tell you it is finished when it isn't, and on an app where a tap can spend someone's money that is the failure that matters. So most of the effort went into the machinery that decides when work is done, and into making any change to that machinery visible.",
    mechanic:
      "The judge was tested before it graded anything real: screens broken on purpose (a shifted layout, the wrong metal on the pay button, a missing row) next to screens nudged by a point, five runs each, with at most a 2% false-fail and a 5% false-pass rate. Changes to the checks themselves never ride along with a feature: any pull request that touches the tests, thresholds or rubric gets its own review, and the job fails until that review approves. The product, design and money calls stay with people, each one written down as a decision.",
    shipped: [
      "Live on real money six days after the first commit, and serving stockrip.com within the month",
      "526 merged pull requests in seven weeks",
      "About 2,150 unit tests on every pull request, plus browser specs on a GPU",
    ],
    evidence: [{ label: "stockrip.com", href: "https://stockrip.com" }],
  },
  {
    id: "card-art",
    shortTitle: "Card art",
    title: "StockRip card art",
    tagline:
      "Forty eight trading cards rendered by an agent, from a CSV of names to the shipped cut, one command per stage.",
    cadence: "on demand, one collection at a time",
    runtime: ["Python", "codex", "Pillow", "HTML + SVG renderer"],
    stages: [
      { name: "ladder", detail: "a CSV of twelve items per ticker, cheap to absurd" },
      { name: "refs", detail: "browse for a real reference, stop if there is none" },
      { name: "brief", detail: "an agent task file, not a prompt" },
      { name: "render", detail: "codex exec with craft and geometry pinned as inputs" },
      { name: "revise", detail: "one named change, current art as the authority" },
      { name: "promote", detail: "adopt a variant as that card's master" },
      { name: "post", detail: "deterministic pixel ops, then the webp cut" },
      { name: "verify", detail: "integrity check across every path" },
    ],
    why:
      "The cards had to look like one set made by one hand, across four collections and forty eight subjects with nothing in common beyond a ticker. Twelve separate prompts give you twelve unrelated pictures, which is exactly what the first attempt produced.",
    mechanic:
      "Two decisions carry the whole thing. The art is generated as a bare panel with no text, no logo and no border, because the app draws the label block over it and baking text into the image collides with live UI chrome. And the briefs are agent task files with explicit inputs, outputs and prohibitions rather than prompts. The first version emitted bare prompts, and codex had no idea where to save, what to read as a style reference, or what it was not allowed to touch. The reference step has an explicit stop instruction so it cannot invent the geometry of a real object it failed to find. One flag selects the ladder and every path underneath it, so a new collection is a CSV plus two dict entries and never a new script.",
    shipped: [
      "48 shipped cuts across four collections, 342 renders behind them",
      "Lives in its own repo, versioned separately from the app it feeds",
    ],
    artifacts: [
      { src: "/lab/cards/uranium-ore.webp", alt: "Card art: a tin of uranium ore" },
      { src: "/lab/cards/quantum-chandelier.webp", alt: "Card art: a gold quantum computer chandelier" },
      { src: "/lab/cards/lego-server-rack.webp", alt: "Card art: a server rack built out of plastic bricks" },
      { src: "/lab/cards/llama.webp", alt: "Card art: a llama" },
      { src: "/lab/cards/raptor-engine.webp", alt: "Card art: a rocket engine" },
      { src: "/lab/cards/chopsticks-catch.webp", alt: "Card art: launch tower arms closing on a booster" },
    ],
    artifactShape: "card",
  },
  {
    id: "persona-engine",
    shortTitle: "Posting engine",
    title: "Multi-account posting engine",
    tagline:
      "A registry of accounts, a voice contract for each, and a scheduler built so that two of them never speak in the same moment or out of the same burst of traffic.",
    cadence: "systemd timers, randomized smear",
    runtime: ["Python", "claude -p", "SQLite", "systemd", "vibatchium"],
    stages: [
      { name: "registry", detail: "one row per account: session, database, persona" },
      { name: "read", detail: "scrape that account's own timeline for this tick" },
      { name: "decide", detail: "the model returns original, reply, or skip" },
      { name: "cap", detail: "edge-vocabulary quota, cadence and halt thresholds" },
      { name: "lock", detail: "a session lock so parallel ticks cannot collide" },
      { name: "post", detail: "dry run to JSONL first, live only after the gate" },
      { name: "watch", detail: "an operator delete trips a halt, engagement is recorded" },
    ],
    why:
      "One account is a script you write in an afternoon. Several accounts, each with a voice you would recognise blind, is a scheduling and isolation problem, and every failure worth learning from lives in the isolation.",
    mechanic:
      "There is no API key anywhere in it. The composing model is Claude Code itself, reading the persona file and the fetched timeline each tick and returning one decision, which means the voice lives in a markdown contract rather than in a prompt buried in Python. The scheduler is the part I would actually show another engineer. Ticks fire from randomized timers rather than a fixed cron minute, and the per-account refresh jobs were split onto disjoint windows after I noticed a single address fetching two accounts inside one ninety second burst. It is worth being precise about what that buys, because I oversold it the first time I described it. Splitting in time does not remove the fact that one address reaches both. What it removes is the tight co-occurrence, which is the strongest and most machine-obvious form of the signal. It is a reduction, not a fix, and it is written into the script header that way so the next person does not inherit my nicer version.",
    shipped: [
      "38 test files, and a dry-run gate every account has to clear before it posts live",
      "The same timeline scrapes feed a read-only opportunity radar",
    ],
    note:
      "Nothing from this one is on the page. The accounts are not mine to put next to my own name, and a screenshot would be the whole point of the isolation undone for a thumbnail.",
  },
  {
    id: "fleet",
    shortTitle: "Fleet Terminal",
    title: "Fleet Terminal",
    tagline:
      "One screen for every autonomous job on the box: schedule, health, and notional cost, across forty units and three species.",
    cadence: "systemd user timer, every three minutes",
    runtime: ["Next.js", "Python collector", "systemd"],
    stages: [
      { name: "collect", detail: "crontab -l, systemctl show, ps, log tails" },
      { name: "classify", detail: "cron ticks, systemd timers, always-on daemons" },
      { name: "cost", detail: "notional pay-as-you-go equivalent, never billed" },
      { name: "serve", detail: "a JSON overwrite, so no restart between refreshes" },
    ],
    why:
      "Forty scheduled jobs on one machine is well past the point where you can hold the schedule in your head. And the question that actually matters is never what is running. It is what quietly stopped four days ago.",
    mechanic:
      "The collector is strictly read-only. It shells out to crontab -l, systemctl --user show, ps and file reads, and there is no code path in it that edits a crontab or touches a running job, which is the only reason I am willing to point it at a fleet that includes live bots. It runs on a user-bus timer rather than cron, because the collector itself calls systemctl --user, and a cron job would have to do the XDG_RUNTIME_DIR dance just to reach the user bus.",
    shipped: [
      "40 units tracked across cron ticks, systemd timers and always-on daemons",
      "Read-only by construction, never deployed anywhere",
    ],
    note:
      "There is no screenshot of this one either, for a duller reason. The file it builds embeds absolute paths, working-directory slugs, session UUIDs, full command lines and log tails, so it is local-only by construction. A public view needs a separate scrub pass, and a redacted screenshot is just a picture of black rectangles.",
  },
];

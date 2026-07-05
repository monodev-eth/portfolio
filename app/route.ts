import { PROJECTS } from "@/lib/projects";
import { PROFILE } from "@/lib/profile";

export const dynamic = "force-static";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const projects = PROJECTS.slice(0, 6);
  const visibleProjects = projects.slice(0, 4);
  const intro =
    "Full-stack operator building across security, AI, search, and digital infrastructure.";
  const experience = [
    {
      role: "Chief Digital Officer",
      org: "SigIntZero",
      meta: "Web3 security, search, AI, scalable systems",
    },
    {
      role: "Co-Founder / Software Engineer",
      org: "TrueOrigin Venture Studio",
      meta: "AI products, software delivery, digital infrastructure",
    },
    {
      role: "Tech Co-Founder / Lead Frontend",
      org: "Yieldly",
      meta: "Crypto products, frontend systems, launch execution",
    },
    {
      role: "Full Stack Engineer",
      org: "MANTRA",
      meta: "Remote web3 product engineering",
    },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${PROFILE.name} agent index`,
    about: {
      "@type": "Person",
      name: PROFILE.displayName,
      alternateName: PROFILE.name,
      image: PROFILE.avatar,
      jobTitle: PROFILE.role,
      description: PROFILE.summary,
      url: PROFILE.github,
      sameAs: [PROFILE.github, PROFILE.twitter, PROFILE.telegram, PROFILE.ensProfile],
      identifier: PROFILE.ens,
      knowsAbout: PROFILE.focus,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          name: project.title,
          description: project.tagline,
          dateCreated: project.year,
          keywords: project.stack.join(", "),
        },
      })),
    },
  };

  const focus = PROFILE.focus.map((item) => esc(item)).join(" / ");
  const experienceItems = experience
    .map((item) => (
      `<li>` +
      `<h3>${esc(item.role)}</h3>` +
      `<p><strong>${esc(item.org)}</strong><span>${esc(item.meta)}</span></p>` +
      `</li>`
    ))
    .join("");
  const projectItems = visibleProjects
    .map((project) => (
      `<li>` +
      `<h3>${esc(project.title)}</h3>` +
      `<p>${esc(project.tagline)}</p>` +
      `</li>`
    ))
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${esc(PROFILE.displayName)} / ${esc(PROFILE.name)}</title>
<meta name="description" content="${esc(PROFILE.summary)}">
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(PROFILE.displayName)} / ${esc(PROFILE.name)}">
<meta property="og:description" content="${esc(PROFILE.summary)}">
<meta property="og:image" content="${esc(PROFILE.avatar)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(PROFILE.displayName)} / ${esc(PROFILE.name)}">
<meta name="twitter:description" content="${esc(PROFILE.summary)}">
<meta name="twitter:image" content="${esc(PROFILE.avatar)}">
<link rel="me" href="${esc(PROFILE.github)}">
<link rel="me" href="${esc(PROFILE.twitter)}">
<link rel="me" href="${esc(PROFILE.telegram)}">
<link rel="me" href="${esc(PROFILE.ensProfile)}">
<link rel="alternate" type="application/json" href="/llms.json" title="LLM profile">
<link rel="alternate" type="application/json" href="/profile.json" title="Structured profile">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>
:root{--bg:#060711;--fg:#f3f6ff;--muted:#b2bce2;--dim:#707c9e;--line:rgba(164,184,245,.2);--line-strong:rgba(188,207,255,.38);--cyan:#76e4f4;--blue:#94aaff}
*{box-sizing:border-box}
html,body{min-height:100%;margin:0}
body{position:relative;overflow-x:hidden;background:radial-gradient(900px 420px at 50% -160px,rgba(42,79,180,.42),transparent 70%),linear-gradient(180deg,#080b18 0%,var(--bg) 38%,#04050b 100%);color:var(--fg);font:15px/1.72 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
body:before,body:after{content:"";position:absolute;inset:0;min-height:100%;z-index:0;pointer-events:none}
body:before{background:linear-gradient(rgba(255,255,255,.018) 50%,transparent 50%);background-size:100% 4px;opacity:.35}
body:after{background:linear-gradient(135deg,rgba(255,255,255,.035),transparent 16%,transparent 84%,rgba(118,228,244,.028)),linear-gradient(rgba(160,180,255,.115) 1px,transparent 1px),linear-gradient(90deg,rgba(160,180,255,.1) 1px,transparent 1px),linear-gradient(rgba(118,228,244,.035) 2px,transparent 2px),linear-gradient(90deg,rgba(118,228,244,.03) 2px,transparent 2px);background-size:56px 56px,56px 56px,56px 56px,224px 224px,224px 224px;mask-image:linear-gradient(180deg,rgba(0,0,0,.68),rgba(0,0,0,.56) 52%,rgba(0,0,0,.28) 86%,rgba(0,0,0,.12));opacity:.55}
a{color:var(--fg);text-underline-offset:4px;text-decoration-thickness:1px;transition:color .18s,border-color .18s}
a:hover,a:focus-visible{color:var(--cyan)}
a:focus-visible{outline:1px solid var(--cyan);outline-offset:4px}
.wrap{position:relative;z-index:1;width:min(100% - 36px,780px);min-height:100svh;margin:0 auto;padding:88px 0 28px;display:flex;flex-direction:column}
header{display:flex;align-items:center;justify-content:space-between;gap:28px;padding-bottom:18px;overflow:visible}
.id{display:inline-flex;align-items:center;gap:12px;color:var(--fg);text-decoration:none}
.avatar{width:48px;height:48px;border:1px solid var(--line-strong);border-radius:3px;box-shadow:0 0 22px rgba(117,215,232,.14)}
.name,.handle{display:block}.name{font-size:15px;font-weight:500;color:var(--fg)}.handle{margin-top:1px;color:var(--dim);font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
main{padding:48px 0 0}
.hero{max-width:none}
h1{margin:0;color:#fbfcff;font-size:clamp(44px,7.4vw,72px);font-weight:400;line-height:1;letter-spacing:0}
h1 span{display:block;color:var(--muted);font-size:.72em;white-space:nowrap}
.showcase-cta{position:relative;isolation:isolate;display:inline-flex;align-items:center;justify-content:space-between;gap:18px;min-width:224px;height:66px;padding:0 12px 0 22px;border:1px solid rgba(174,196,255,.14);border-radius:12px;color:var(--fg);text-decoration:none;background:radial-gradient(95% 140% at 82% 50%,rgba(54,214,230,.08),transparent 58%),linear-gradient(90deg,rgba(7,10,28,.02),rgba(18,28,72,.16));box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 0 34px rgba(54,214,230,.035);overflow:visible}
.showcase-cta:before{content:"";position:absolute;inset:-74px -112px;border-radius:80px;background:radial-gradient(closest-side at 62% 50%,rgba(42,88,245,.16),transparent 72%),radial-gradient(closest-side at 72% 44%,rgba(54,214,230,.1),transparent 74%);z-index:-3;opacity:.88;filter:blur(2px)}
.showcase-cta:after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(135deg,rgba(255,255,255,.05),transparent 26%,rgba(54,214,230,.03));z-index:0;pointer-events:none;opacity:.56}
.showcase-cta:hover,.showcase-cta:focus-visible{color:#fff;border-color:rgba(118,228,244,.48);background:radial-gradient(95% 140% at 82% 50%,rgba(54,214,230,.16),transparent 58%),linear-gradient(90deg,rgba(7,10,28,.08),rgba(22,34,88,.34));box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 44px rgba(54,214,230,.13)}
.showcase-label{position:relative;z-index:2;color:#e8efff;font:500 12px/.95 "Trebuchet MS","Segoe UI",Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;text-shadow:0 0 10px rgba(54,214,230,.24)}
.showcase-label:before{content:attr(data-label);position:absolute;left:0;top:0;color:rgba(54,214,230,.24);transform:translate(.7px,.7px);pointer-events:none;z-index:-1}
.play-mark{position:relative;z-index:2;display:grid;place-items:center;width:44px;height:44px;border:1px solid rgba(174,196,255,.26);border-radius:8px;background:rgba(6,9,24,.36);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 0 20px rgba(54,214,230,.1);transition:border-color .18s,background .18s,box-shadow .18s}
.showcase-cta:hover .play-mark,.showcase-cta:focus-visible .play-mark{border-color:rgba(118,228,244,.72);background:rgba(10,17,44,.5);box-shadow:inset 0 1px 0 rgba(255,255,255,.13),0 0 28px rgba(54,214,230,.24)}
.play-triangle{width:0;height:0;margin-left:3px;border-top:8px solid transparent;border-bottom:8px solid transparent;border-left:13px solid currentColor;filter:drop-shadow(0 0 12px rgba(54,214,230,.86))}
.showcase-orbs{position:absolute;inset:-96px -128px;z-index:-2;width:calc(100% + 256px);height:calc(100% + 192px);pointer-events:none;mix-blend-mode:screen;opacity:.9}
.summary{max-width:52ch;margin:16px 0 0;color:var(--muted);font-size:16px;line-height:1.65}
.focusline{max-width:64ch;margin:13px 0 0;color:var(--dim);font:12px/1.75 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
.icon-link{display:inline-grid;place-items:center;width:32px;height:32px;border:1px solid var(--line);border-radius:3px;color:var(--muted);text-decoration:none;background:rgba(8,11,24,.18)}
.icon-link:hover,.icon-link:focus-visible{border-color:var(--line-strong);color:var(--fg);background:rgba(16,22,46,.28)}
.icon-link svg{width:16px;height:16px;display:block}
.ens-link{display:inline-flex;align-items:center;height:32px;padding:0 11px;border:1px solid var(--line);border-radius:3px;color:var(--muted);text-decoration:none;background:rgba(8,11,24,.18);font:12px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.ens-link:hover,.ens-link:focus-visible{border-color:var(--line-strong);color:var(--fg);background:rgba(16,22,46,.28)}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
h2,h3{margin:0;font-weight:500;letter-spacing:0}
h2{color:var(--fg);font-size:13px;text-transform:uppercase;letter-spacing:.13em}
.projects{margin-top:34px}.projects.compact{margin-top:30px}
.section-head{margin-bottom:10px}.section-head h2{font-size:13px}
.projects ol{display:grid;gap:16px;margin:0;padding:0;list-style:none}
.projects li{display:grid;grid-template-columns:170px minmax(0,1fr);gap:22px;padding:0}
.projects h3{color:#fbfcff;font-size:15px}.projects p{margin:0;color:var(--muted);line-height:1.6}.projects strong{display:block;color:var(--muted);font-weight:400}.projects span{display:block;color:var(--dim);margin-top:2px}
footer{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-top:auto;padding-top:20px;color:var(--dim);font:10px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
footer a{color:var(--dim);text-decoration:none;opacity:.58}
footer a:hover,footer a:focus-visible{color:var(--cyan);opacity:1;text-decoration:underline}
footer a+a:before{content:"/";margin-right:10px;color:var(--dim);opacity:.45;text-decoration:none}
@media (max-width:760px){.wrap{width:min(100% - 32px,780px);padding-top:64px}header{gap:12px}.id{gap:9px}.avatar{width:44px;height:44px}.name{font-size:14px}.handle{font-size:11px}footer{justify-content:flex-end}main{padding-top:34px}.showcase-cta{min-width:166px;height:52px;padding:0 8px 0 14px;gap:10px}.showcase-label{font-size:10px;letter-spacing:.14em}.play-mark{width:34px;height:34px;border-radius:7px}.play-triangle{border-top-width:6px;border-bottom-width:6px;border-left-width:10px}.showcase-orbs{inset:-64px -70px -96px -82px;width:calc(100% + 152px);height:calc(100% + 160px)}.projects{margin-top:30px}.projects li{grid-template-columns:1fr;gap:5px}footer{margin-top:30px}}
@media (prefers-reduced-motion:reduce){a{transition:none}}
</style>
</head>
<body>
<div class="wrap h-card">
  <header>
    <a class="id u-url" href="${esc(PROFILE.github)}" rel="me">
      <img class="avatar u-photo" src="${esc(PROFILE.avatar)}" alt="" width="64" height="64">
      <span><span class="name p-name">${esc(PROFILE.displayName)}</span><span class="handle p-nickname">${esc(PROFILE.handle)}</span></span>
    </a>
    <a class="showcase-cta" href="/showcase" aria-label="Open showcase">
      <canvas class="showcase-orbs" aria-hidden="true"></canvas>
      <span class="showcase-label" data-label="SHOWCASE">SHOWCASE</span>
      <span class="play-mark" aria-hidden="true"><span class="play-triangle"></span></span>
    </a>
  </header>

  <main>
    <section class="hero" aria-label="Profile summary">
      <p class="summary p-note">${esc(intro)}</p>
      <p class="focusline">${focus}</p>
      <div class="actions" aria-label="Contact and proof links">
        <a class="icon-link" href="${esc(PROFILE.github)}" rel="me" aria-label="GitHub">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.16c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .98-.31 3.18 1.18A11.1 11.1 0 0 1 12 5.99c.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.77.12 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.16c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>
          <span class="sr-only">GitHub</span>
        </a>
        <a class="icon-link" href="${esc(PROFILE.twitter)}" rel="me" aria-label="X / Twitter">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.7 3h3.05l-6.66 7.61L21.93 21h-6.14l-4.81-6.29L5.48 21H2.43l7.12-8.14L2.03 3h6.29l4.35 5.75L17.7 3Zm-1.07 16.17h1.69L7.4 4.74H5.58l11.05 14.43Z"/></svg>
          <span class="sr-only">X / Twitter</span>
        </a>
        <a class="icon-link" href="${esc(PROFILE.telegram)}" rel="me" aria-label="Telegram">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          <span class="sr-only">Telegram</span>
        </a>
        <a class="ens-link" href="${esc(PROFILE.ensProfile)}" rel="me" aria-label="ENS: ${esc(PROFILE.ens)}">${esc(PROFILE.ens)}</a>
      </div>
    </section>
  </main>

  <section class="projects compact" aria-label="Experience">
    <ol>${experienceItems}</ol>
  </section>

  <section class="projects" aria-labelledby="projects">
    <div class="section-head">
      <h2 id="projects">Projects</h2>
    </div>
    <ol>${projectItems}</ol>
  </section>

  <footer>
    <a href="/llms.json">llms.json</a>
    <a href="/profile.json">profile.json</a>
  </footer>
</div>
<script>
(() => {
  const canvas = document.querySelector(".showcase-orbs");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const host = canvas.closest(".showcase-cta");
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0;
  let dpr = 1;
  let cw = 0;
  let ch = 0;

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    cw = Math.max(1, Math.round(r.width));
    ch = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rotX(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
  }

  function rotY(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
  }

  function rotZ(p, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
  }

  function projectedDots(t) {
    const dots = [];
    for (let k = 0; k < 8; k += 1) {
      const fk = k;
      const ang = t * 0.22 + fk / 8 * Math.PI * 2;
      let p = [Math.cos(ang) * 0.62, Math.sin(ang) * 0.62, Math.sin(ang * 1.7) * 0.30];
      p = rotX(p, t * 0.40);
      p = rotY(p, t * 0.50);
      p = rotZ(p, t * 0.30);
      const z = 1.7 - p[2] * 0.6;
      const pulse = 0.72 + 0.28 * Math.cos(t * 1.1 - fk * 0.6);
      dots.push({ x: p[0] / z, y: p[1] / z, z: p[2], pulse });
    }
    return dots;
  }

  function glow(x, y, radius, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0.00, "rgba(238,246,255," + (0.76 * alpha) + ")");
    g.addColorStop(0.18, "rgba(155,190,255," + (0.52 * alpha) + ")");
    g.addColorStop(0.48, "rgba(54,214,230," + (0.24 * alpha) + ")");
    g.addColorStop(0.74, "rgba(38,82,245," + (0.16 * alpha) + ")");
    g.addColorStop(1.00, "rgba(38,82,245,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function roundRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  function clearButtonCenter() {
    if (!(host instanceof HTMLElement)) return;
    const hr = host.getBoundingClientRect();
    const cr = canvas.getBoundingClientRect();
    const x = hr.left - cr.left + 8;
    const y = hr.top - cr.top + 7;
    const w = Math.max(1, hr.width - 16);
    const h = Math.max(1, hr.height - 14);
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.66)";
    roundRect(x, y, w, h, 14);
    ctx.fill();
    ctx.restore();
  }

  function draw(time) {
    if (!cw || !ch) resize();
    const t = reduced ? 4 : time * 0.001;
    ctx.clearRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = "lighter";

    const cx = cw * 0.57;
    const cy = ch * 0.50;
    const scale = Math.min(ch * 0.84, cw * 0.50);

    const halo = ctx.createRadialGradient(cx, cy, 4, cx, cy, Math.min(cw, ch) * 0.56);
    halo.addColorStop(0, "rgba(42,88,245,0.055)");
    halo.addColorStop(0.46, "rgba(54,214,230,0.035)");
    halo.addColorStop(1, "rgba(54,214,230,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, cw, ch);

    const passes = [
      { t: t - 0.24, a: 0.12, r: 22 },
      { t: t - 0.10, a: 0.26, r: 23 },
      { t: t, a: 0.72, r: 25 },
    ];

    for (const pass of passes) {
      for (const dot of projectedDots(pass.t)) {
        const depth = 0.84 + dot.z * 0.34;
        const x = cx + dot.x * scale;
        const y = cy - dot.y * scale * 0.92;
        glow(x, y, pass.r * depth, pass.a * dot.pulse);
      }
    }

    clearButtonCenter();
    ctx.globalCompositeOperation = "source-over";
    if (!reduced) raf = requestAnimationFrame(draw);
  }

  resize();
  draw(0);
  if (!reduced) raf = requestAnimationFrame(draw);
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    resize();
    draw(performance.now());
    if (!reduced) raf = requestAnimationFrame(draw);
  }, { passive: true });
})();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}

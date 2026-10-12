import { PROJECTS } from "@/lib/projects";
import { EXPERIENCE, FOCUS_LONG, PROFILE } from "@/lib/profile";
import { SITE_URL } from "@/lib/site";

/*
 * The printable resume. Built from the same identity + project sources as every
 * other surface, so it cannot drift: edit lib/profile.ts or lib/projects.ts.
 *
 * On screen it renders as a white sheet on the site's dark ground. In print the
 * ground drops away and only the sheet prints, so browser "Save as PDF" gives a
 * clean A4 document with live links.
 */
export const dynamic = "force-static";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Every stack entry across the portfolio, most-used first, deduped. */
function techIndex(): string[] {
  const counts = new Map<string, number>();
  for (const project of PROJECTS) {
    for (const item of project.stack) counts.set(item, (counts.get(item) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([item]) => item);
}

/** The one link worth printing per project: the app, then the source, then the marketing site. */
function primaryLink(links: (typeof PROJECTS)[number]["links"]): string | undefined {
  return links.app ?? links.code ?? links.live ?? links.study;
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

export function GET() {
  /* Printed labels are derived from the hrefs, so what a reader types matches where it goes. */
  const contacts = [
    SITE_URL,
    PROFILE.github,
    PROFILE.linkedin,
    PROFILE.twitter,
    PROFILE.telegram,
  ].map((href) => ({ href, label: stripProtocol(href) }));
  contacts.push({ href: `mailto:${PROFILE.email}`, label: PROFILE.email });
  contacts.push({ href: PROFILE.ensProfile, label: PROFILE.ens });

  const contactLine = contacts
    .map((item) => `<a href="${esc(item.href)}">${esc(item.label)}</a>`)
    .join("");

  const experienceItems = EXPERIENCE.map((item) => (
    `<li>` +
    `<div class="when">${esc(item.period)}</div>` +
    `<div class="what">` +
    `<h3>${esc(item.role)}<span class="org">${esc(item.organization)}</span></h3>` +
    `<p>${esc(item.summary)}</p>` +
    `</div>` +
    `</li>`
  )).join("");

  /* A curated subset for the one-pager; the full list stays on /showcase, linked under
   * the list. Resolved by lookup rather than filter so a renamed id fails the
   * build instead of silently shortening the resume. */
  const RESUME_PROJECT_IDS = ["imf", "stockrip", "sigintzero", "vibatchium", "shuriken", "flow", "aetos", "yieldly"];
  const selected = RESUME_PROJECT_IDS.map((id) => {
    const project = PROJECTS.find((p) => p.id === id);
    if (!project) throw new Error(`resume: RESUME_PROJECT_IDS names unknown project "${id}"`);
    return project;
  });
  const projectItems = selected.map((project) => {
    const href = primaryLink(project.links);
    const link = href
      ? `<a class="proj-link" href="${esc(href)}">${esc(stripProtocol(href))}</a>`
      : "";
    return (
      `<li>` +
      `<div class="when">${esc(project.period)}</div>` +
      `<div class="what">` +
      `<h3>${esc(project.title)}<span class="org">${esc(project.role)}</span></h3>` +
      `<p>${esc(project.result)}</p>` +
      `<p class="meta">${esc(project.stack.join(" · "))}${link ? `<span class="sep" aria-hidden="true">·</span>${link}` : ""}</p>` +
      `</div>` +
      `</li>`
    );
  }).join("");

  const focusItems = FOCUS_LONG.map((item) => `<li>${esc(item)}</li>`).join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(PROFILE.fullName)} / Resume</title>
<meta name="description" content="Resume for ${esc(PROFILE.displayName)} (${esc(PROFILE.fullName)}). ${esc(PROFILE.summary)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${esc(SITE_URL)}/resume">
<style>
:root{--ink:#14161d;--body:#3a4050;--dim:#6b7386;--rule:#dfe3ec;--accent:#1d4ed8;--sheet:#fff}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:#0a0d18;color:var(--body);font:13.2px/1.58 "Inter",ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
.sheet{width:min(100% - 24px,820px);margin:28px auto;padding:52px 58px 46px;background:var(--sheet);border-radius:2px;box-shadow:0 24px 70px rgba(0,0,0,.5)}
a{color:inherit;text-decoration:none;border-bottom:1px solid var(--rule)}
a:hover{color:var(--accent);border-color:currentColor}

.head{display:flex;align-items:flex-start;justify-content:space-between;gap:28px;padding-bottom:16px;border-bottom:1.5px solid var(--ink)}
h1{margin:0;color:var(--ink);font-size:30px;font-weight:600;letter-spacing:-.015em;line-height:1.06}
.goesby{margin:5px 0 0;color:var(--dim);font-size:12px}
.role{margin:9px 0 0;color:var(--ink);font-size:13.6px;font-weight:500}
.loc{margin:3px 0 0;color:var(--dim);font-size:12.4px}
.contacts{flex:0 0 auto;text-align:right;color:var(--body);font-size:11.4px;line-height:1.72}
.contacts a{display:block;white-space:nowrap;border-bottom-color:transparent}
.contacts a:hover{border-bottom-color:currentColor}
.sep{margin:0 6px;color:var(--rule)}

.summary{margin:16px 0 0;color:var(--body);font-size:13.4px;line-height:1.62}

section{margin-top:22px;break-inside:auto}
h2{margin:0 0 10px;color:var(--ink);font-size:10.6px;font-weight:600;letter-spacing:.15em;text-transform:uppercase}
h2:after{content:"";display:block;margin-top:6px;border-top:1px solid var(--rule)}

.rows{margin:0;padding:0;list-style:none}
.rows li{display:grid;grid-template-columns:92px minmax(0,1fr);gap:20px;padding:9px 0;break-inside:avoid;page-break-inside:avoid}
.rows li+li{border-top:1px solid #f0f2f7}
.when{color:var(--dim);font-size:11.4px;line-height:1.5;padding-top:2px;white-space:nowrap;font-variant-numeric:tabular-nums}
h3{margin:0;color:var(--ink);font-size:13.4px;font-weight:600;line-height:1.45}
h3 .org{display:block;color:var(--body);font-size:12.4px;font-weight:400}
.what p{margin:3px 0 0;font-size:12.6px;line-height:1.55}
.meta{color:var(--dim);font-size:11.3px}
.proj-link{color:var(--accent);border-bottom-color:transparent}
.proj-link:hover{border-bottom-color:currentColor}

.cols{margin:0;padding:0;list-style:none;columns:2;column-gap:34px}
.cols li{padding:2.5px 0;font-size:12.5px;break-inside:avoid}
.cols li:before{content:"—";margin-right:8px;color:var(--dim)}
.tech{margin:9px 0 0;color:var(--body);font-size:12.3px;line-height:1.75}
.tech strong{color:var(--ink);font-weight:600}

footer{flex-wrap:wrap;margin-top:24px;padding-top:12px;border-top:1px solid var(--rule);display:flex;justify-content:space-between;gap:16px;color:var(--dim);font-size:10.8px}
footer a{border-bottom-color:transparent}
.resume-actions{display:flex;gap:10px}.download{display:inline-block;margin:14px 0 0;padding:7px 13px;border:1px solid var(--rule);border-radius:3px;color:var(--ink);font-size:11.6px}
.download:hover{border-color:var(--accent);color:var(--accent)}

@media (max-width:720px){
  .sheet{padding:32px 24px 30px}
  .head{flex-direction:column;gap:14px}
  .contacts{text-align:left;line-height:1.9;max-width:100%}
  .contacts a{white-space:normal;overflow-wrap:anywhere}
  footer{flex-direction:column;gap:8px}
  .rows li{grid-template-columns:1fr;gap:2px}
  .when{padding-top:0}
  .cols{columns:1}
}

@media print{
  @page{size:A4;margin:13mm 14mm}
  html,body{background:#fff}
  body{font-size:9.6pt;line-height:1.46}
  .sheet{width:auto;margin:0;padding:0;box-shadow:none;border-radius:0}
  a{border-bottom:0}
  h1{font-size:21pt}
  .goesby{font-size:8.2pt}
  .role{font-size:10pt}
  .loc{font-size:8.4pt}
  .contacts{font-size:8.2pt;line-height:1.6}
  .summary{font-size:9.6pt}
  section{margin-top:13pt}
  h2{font-size:7.6pt}
  .rows li{padding:5.5pt 0;grid-template-columns:74pt minmax(0,1fr);gap:14pt}
  .when{font-size:8.2pt}
  h3{font-size:9.8pt}
  h3 .org{font-size:9pt}
  .what p{font-size:9.2pt;line-height:1.42}
  .meta,.cols li,.tech{font-size:8.4pt}
  footer{font-size:7.6pt}
  .proj-link{color:var(--body)}
  .resume-actions{display:none}
}
</style>
</head>
<body>
<main class="sheet">
  <header class="head">
    <div>
      <h1>${esc(PROFILE.fullName)}</h1>
      <p class="goesby">Goes by ${esc(PROFILE.displayName)} · ${esc(PROFILE.handle)}</p>
      <p class="role">${esc(PROFILE.roleLong)}</p>
      <p class="loc">${esc(PROFILE.location)}</p>
    </div>
    <div class="contacts">${contactLine}</div>
  </header>

  <nav class="resume-actions" aria-label="Résumé actions"><a class="download" href="/dima-resume.pdf" download>Download PDF</a><a class="download" href="/">← Home</a></nav>

  <p class="summary">${esc(PROFILE.summary)} ${PROJECTS.length} shipped products across DeFi, security, trading infrastructure, and agent tooling, from the first DeFi suite on Algorand to a nine-figure on-chain credit desk.</p>

  <section aria-labelledby="experience">
    <h2 id="experience">Experience</h2>
    <ol class="rows">${experienceItems}</ol>
  </section>

  <section aria-labelledby="work">
    <h2 id="work">Selected work</h2>
    <ol class="rows">${projectItems}</ol>
    <p><a href="${esc(SITE_URL)}/showcase">Explore all ${PROJECTS.length} projects</a></p>
  </section>

  <section aria-labelledby="focus">
    <h2 id="focus">Focus</h2>
    <ul class="cols">${focusItems}</ul>
    <p class="tech"><strong>Tech:</strong> ${esc(techIndex().join(" · "))}</p>
  </section>

  <footer>
    <span>Last reviewed ${esc(PROFILE.lastReviewed)}</span>
    <span><a href="${esc(SITE_URL)}/showcase">Interactive portfolio: ${esc(stripProtocol(SITE_URL))}/showcase</a></span>
    <span><a href="${esc(SITE_URL)}/lab">Running systems: ${esc(stripProtocol(SITE_URL))}/lab</a></span>
    <span><a href="${esc(SITE_URL)}/blog">Writing: ${esc(stripProtocol(SITE_URL))}/blog</a></span>
  </footer>
</main>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}

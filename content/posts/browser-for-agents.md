---
title: Most of the work in an agent browser is knowing when not to open one
date: 2026-09-01
excerpt: Building an agent browser taught me when to skip Chrome, when to escalate, and how to make failures useful.
summary: Notes from twenty versions of vibatchium, a stealth browser daemon that AI agents drive. The stealth turned out to be the easy part. The escalation policy, a second lane that runs no JavaScript, and a README section listing what the thing cannot do turned out to be the rest of it.
cover: /blog/cover-vb.png
coverAlt: Diagram of the escalation ladder from plain HTTP through the fetch lane to a real browser
tags: vibatchium, agents, browsers, python
---

I build a thing called [vibatchium](https://pypi.org/project/vibatchium/). It is a browser daemon that AI agents drive: a hardened Chrome behind a CLI and an MCP server, so an agent can say "go look at this page" and get text back instead of a 403.

It started because of a failure that kept happening.

## The failure

An agent fetches a URL. The site is behind Cloudflare, or it is a JavaScript shell that renders nothing without a browser, or it is a login wall. The agent gets back a page that says "Just a moment..." or an empty div, and it tells the user "I was unable to access that page."

Which is false. The page is fine. The agent brought a plain HTTP client to a fight that needed a browser, then reported the result of that mismatch as a property of the page.

I have watched this cost entire research sessions. Not because the tooling was missing, but because nothing in the loop treated a block as a reason to change method. A 403 looks like an answer. It is not an answer, it is a routing decision nobody has made yet.

So the first real design decision in vibatchium happens before any browser starts. It lives in the instructions the MCP server hands the model on connect, which say, roughly: when you see a 403, a challenge page, a blank SPA or a paywall, the page is not unreachable, that is the signal to switch, do not report failure and stop.

Building the browser was the easy half. Getting something to reach for it at the right moment is the half that saves the session.

## Two lanes, and the cheap one wins most of the time

A real Chrome costs 200 to 400MB of RAM and a couple of seconds per page. For the great majority of pages that is waste. So there are two lanes, and picking between them is most of the value.

<figure class="diagram">
<svg viewBox="0 0 880 330" role="img" aria-labelledby="lanes-t lanes-d" width="100%">
<title id="lanes-t">The escalation ladder from plain fetch to a real browser</title>
<desc id="lanes-d">A ladder the agent climbs by hand, not an automatic router. Start with plain HTTP; if it succeeds, stop. If it is blocked by a TLS or header gate, step up to the fetch lane, which uses curl_cffi with Chrome's JA3 fingerprint and the session's own cookies and runs no JavaScript. If it is blocked by a JavaScript challenge, a single page app, or a login wall, step up again to the browser lane, a real hardened Chrome with a persistent profile.</desc>
<defs>
<marker id="a2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
<path d="M0,0 L10,5 L0,10 z" fill="#707c9e"/>
</marker>
</defs>
<g font-family="ui-monospace, Menlo, Consolas, monospace" font-size="13">
<rect x="10" y="20" width="200" height="66" rx="8" fill="rgba(16,22,46,0.5)" stroke="rgba(164,184,245,0.28)"/>
<text x="110" y="46" fill="#f3f6ff" text-anchor="middle">plain HTTP</text>
<text x="110" y="66" fill="#707c9e" text-anchor="middle" font-size="11">cheap, no process</text>
<line x1="210" y1="53" x2="268" y2="53" stroke="#707c9e" marker-end="url(#a2)"/>
<text x="239" y="42" fill="#5ddc9a" text-anchor="middle" font-size="11">ok</text>
<rect x="272" y="26" width="120" height="52" rx="8" fill="rgba(14,44,30,0.5)" stroke="rgba(93,220,154,0.4)"/>
<text x="332" y="57" fill="#5ddc9a" text-anchor="middle">done</text>
<line x1="110" y1="86" x2="110" y2="136" stroke="#707c9e" marker-end="url(#a2)"/>
<text x="122" y="114" fill="#e0b060" font-size="11">403 / TLS gate</text>
<rect x="10" y="140" width="330" height="76" rx="8" fill="rgba(16,22,46,0.5)" stroke="rgba(164,184,245,0.28)"/>
<text x="175" y="166" fill="#f3f6ff" text-anchor="middle">fetch lane (curl_cffi)</text>
<text x="175" y="185" fill="#76e4f4" text-anchor="middle" font-size="11">Chrome JA3 + HTTP2, session cookies, proxy</text>
<text x="175" y="203" fill="#707c9e" text-anchor="middle" font-size="11">no renderer, no JavaScript, no RAM</text>
<line x1="110" y1="216" x2="110" y2="258" stroke="#707c9e" marker-end="url(#a2)"/>
<text x="122" y="240" fill="#e0607a" font-size="11">JS challenge / SPA / login</text>
<rect x="10" y="262" width="330" height="58" rx="8" fill="rgba(16,22,46,0.5)" stroke="rgba(164,184,245,0.28)"/>
<text x="175" y="286" fill="#f3f6ff" text-anchor="middle">browser lane (patchright Chrome)</text>
<text x="175" y="305" fill="#707c9e" text-anchor="middle" font-size="11">persistent profile, 200-400MB, real renderer</text>
<line x1="340" y1="178" x2="404" y2="178" stroke="rgba(164,184,245,0.25)" stroke-dasharray="4 4"/>
<line x1="340" y1="291" x2="404" y2="291" stroke="rgba(164,184,245,0.25)" stroke-dasharray="4 4"/>
<text x="412" y="150" fill="#b2bce2" font-size="11.5">the two lanes share one session:</text>
<text x="412" y="170" fill="#b2bce2" font-size="11.5">cookies and proxy flow browser to fetch,</text>
<text x="412" y="190" fill="#b2bce2" font-size="11.5">so you log in once with the renderer and</text>
<text x="412" y="210" fill="#b2bce2" font-size="11.5">then pull a hundred authenticated pages</text>
<text x="412" y="230" fill="#b2bce2" font-size="11.5">without paying for one.</text>
<text x="412" y="268" fill="#707c9e" font-size="11">the escalation is one-way on purpose.</text>
<text x="412" y="287" fill="#707c9e" font-size="11">nothing silently downgrades and</text>
<text x="412" y="306" fill="#707c9e" font-size="11">quietly re-bills you for a second attempt.</text>
</g>
</svg>
<figcaption>Cheap first, expensive only on evidence. The agent picks the rung; nothing here routes by itself.</figcaption>
</figure>

The middle lane barely existed as an idea when I started. It uses [curl_cffi](https://github.com/lexiforest/curl_cffi) to match Chrome's TLS and HTTP/2 fingerprint, and it borrows the running session's cookies, proxy and user agent from the live browser. So the pattern becomes: open the real browser once, log in by hand, then pull a hundred authenticated pages through a lane that runs no JavaScript and allocates no renderer.

That combination clears a surprising amount. Blockscout's API sits behind Cloudflare and returns "Just a moment..." to plain curl. The same URL through the fetch lane comes back as a clean `200` with JSON in about 1.3 seconds, with no browser involved.

It is also genuinely limited, and I keep having to say so in the docs, because the shape of it invites over-claiming. It matches a TLS fingerprint. It does not execute a JavaScript challenge. If the wall is Turnstile or a DataDome probe, no amount of fingerprint matching helps and you have to spend the RAM. It is also not on by default: curl_cffi is an optional extra and the verb is deliberately kept out of the lean capability set, so a stock install does not silently gain a second network path.

## Writing down what it cannot do

The README has a section called Honest limits, and it exists because of one audit that went badly for me.

Every `click`, `type` and `hover` in the tool rides Playwright over CDP's `Input.dispatchMouseEvent` and `dispatchKeyEvent`. That leaves a signature. `getCoalescedEvents` comes back empty or with a single entry, `pointerrawupdate` never fires, and the whole shape is wrong for a human hand. [Patchright](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright) patches the JavaScript-context leaks, not the Input domain. There is a project called CDP-Patches that fixes it properly at the OS level, and I went and read it, and it is headful, active-tab only, archived, and GPL. None of which fits a headless daemon running sessions in parallel.

So the choice was to ship a "humanize" mode with nice Bézier cursor paths and let people assume it had solved the problem, or write a paragraph saying this is a real leak, here is its exact shape, here is why I am not fixing it, and here is the mode you actually need, which is attaching to a real headful Chrome you drive yourself. I wrote the paragraph, and softened the humanizer's docstring at the same time, because it had been implying more than it delivered.

One of the tells in that list used to have a third item. I had written down, and repeated in the docs, that synthetic input also gives itself away with `pageX == screenX`. Then I built a measurement harness, pointed it at my own stack, and it does not fire: the events carry a real screen offset, 375 against 365. I had been confidently citing a leak that was not there. It is still in the README as I write this, which is its own small lesson about a claim you never go back and check.

## The clever test I deleted

Stealth decays on its own, because the browser underneath you keeps shipping. So there is a CI job that runs before anything is built or published, and getting it right took one deletion.

The version I wanted was a self-contained offline page that probes for the classic `Runtime.enable` leak: trap the `Error.stack` getter, watch what the devtools protocol does to it, mirror the findings into a hidden DOM node so an isolated-world script can read them back. I built it. It went green.

Then I could not answer the only question that mattered, which is whether it would ever go red. I had no positive control. I could not make the leak appear on demand and watch the probe catch it, so a green result told me nothing about whether the probe worked. That is not a gate, it is a decoration that costs CI minutes and buys false confidence. I deleted it and left a note in CONTRIBUTING telling future me not to re-add a behavioural probe without building the positive control first.

What guards the build now is duller and provable. A property posture check: `navigator.webdriver` falsy, `chrome.runtime` undefined, no `--no-sandbox` in the launch argv, no `Headless` token in the user agent on the main thread or inside a SharedWorker, profile files at 0600. A tripwire pinning the exact patchright versions that have been checked by hand, so an unvetted upgrade fails loudly instead of quietly changing the stealth surface. And an offline classifier that has to correctly identify saved copies of real wall pages. When a Chromium update breaks something, I find out from a red build rather than from a scraper returning garbage three weeks later.

## Measure which flags matter, do not copy the soup

Every headless-browser project accumulates a pile of Chrome flags nobody can justify. Adding the next one is free, removing one feels dangerous, so the pile only grows.

When I added real GPU WebGL, because headless Chrome reports SwiftShader by default and that is a fingerprint tell, I probed the actual machine instead of pasting the standard incantation. Baseline: SwiftShader. Target: the real Intel UHD 620 in this box.

`--use-angle=gl-egl` was the one flag that did the work. `--use-gl=angle` is its canonical pairing and stayed for that reason. `--ignore-gpu-blocklist` stayed as insurance for hosts whose GPU is blocklisted, which this one is not. And `--disable-software-rasterizer` and `--disable-gpu-compositing`, both of which I had been about to include because everyone includes them, changed the reported renderer not at all. Cargo cult. Dropped, with a test that asserts they stay dropped.

The same work produced a bug worth remembering. A `gpu_info` call takes a per-session lock, and I had registered it as an ordinary verb rather than a registry verb, so it took a lock the caller already held. Python's `asyncio.Lock` is not re-entrant, so it deadlocked, silently, forever. It surfaced as a test that never returned, which is about the least informative symptom a bug can have.

## Things I got wrong

I let a tool's default override the house style. A long research job I was running ended with its output published as a hosted page on somebody else's server, because the agent doing the writing defaults to publishing finished work as a shareable link. Everything in this stack is deliberately local and greppable: a memory server on a socket, a browser daemon on another one, bots as systemd units, notes as markdown in a vault. A hosted page is the one output you cannot grep, diff, version, or feed to the next bot. The rule is now written where the agents read it: a deliverable here is a path, not a link.

I ran the heavy test suite next to production. The daemon is shared, live bots hold sessions in it, and the multi-session tests spawn several concurrent Chromes. On a memory-tight box that means the OOM killer picks a victim, which is how a green test run takes down five bots. `--isolated` now exists to prevent that, though the reason actually written in the commit was a different one: a profile-leak incident that left over a thousand stray profile directories on disk. It also carries a RAM floor check, because a private daemon that goes on to launch Chrome can tip a tight box over on its own.

I published a tool surface that promised verbs it could not call. The MCP server had a static instructions string that named the browse verbs unconditionally. If an operator narrowed the capability set past those, the instructions kept advertising them. The instructions are now built from the live capability set, and if no browse verb is exposed at all, the server ships no instructions rather than a false promise.

## Where it is now

Twenty minor versions in, fifty-eight releases, 74 test files carrying about 1,170 tests, and a changelog long enough that I read it to remember what I did in July. It is on PyPI, it has a CLI and an MCP server, and it is doing actual work: pulling a repair guide out of [a login-walled Facebook group](/blog/three-weeks-wrong-about-a-drone), verifying [AliExpress listings](/blog/fpv-research-rabbit-hole) without tripping their search wall, and last week driving [a wallet demo on a machine with no screen attached](/blog/filming-a-wallet-demo-headless).

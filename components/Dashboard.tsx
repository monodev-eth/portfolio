"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Project } from "@/lib/projects";
import { SURFACES } from "@/lib/surfaces";
import { PROFILE } from "@/lib/profile";
import { createAudio, type AudioApi } from "@/lib/audio";
import type { PS2Api } from "@/lib/ps2bg";
import Wordmark from "@/components/Wordmark";
import VideoWall from "@/components/VideoWall";

type SaveMap = Record<string, { t: number; done: boolean }>;

const SAVE_KEY = "ps2.portfolio.v1";

export default function Dashboard({ projects }: { projects: Project[] }) {
  const [focused, setFocused] = useState(0);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [booted, setBooted] = useState(false);
  const [bootPhase, setBootPhase] = useState<"sony" | "mark" | null>(null);
  const [clock, setClock] = useState("");
  const [widePreview, setWidePreview] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [titleInBar, setTitleInBar] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const projectTrackRef = useRef<HTMLDivElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const caseTitleRef = useRef<HTMLHeadingElement>(null);
  /* Where focus was before the modal opened, so closing puts it back. */
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const ps2 = useRef<PS2Api | null>(null);
  const audio = useRef<AudioApi | null>(null);
  const savesRef = useRef<SaveMap>({});
  const focusedRef = useRef(0);
  const modalRef = useRef<number | null>(null);
  const bootedRef = useRef(false);
  const skipRef = useRef<(() => void) | null>(null);
  const initOnce = useRef(false);
  const draggedRef = useRef(false);
  const browserRef = useRef<HTMLElement>(null);
  const flashTimer = useRef<number | null>(null);
  const clicks = useRef(0);
  const clickT = useRef(0);

  useEffect(() => { focusedRef.current = focused; }, [focused]);
  useEffect(() => { modalRef.current = modalIndex; }, [modalIndex]);
  useEffect(() => { bootedRef.current = booted; }, [booted]);
  useEffect(() => { document.body.classList.toggle("ready", booted); }, [booted]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 721px) and (prefers-reduced-motion: no-preference)");
    const update = () => setWidePreview(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const centerAxes = useCallback(() => {
    const projectTrack = projectTrackRef.current;
    const projectEl = projectTrack?.children[focusedRef.current] as HTMLElement | undefined;
    if (projectTrack && projectEl && projectTrack.parentElement) {
      // rounded to the pixel grid; fractional translates blur the text layer
      const x = Math.round(projectTrack.parentElement.clientWidth / 2 - (projectEl.offsetLeft + projectEl.offsetWidth / 2));
      projectTrack.style.transform = `translateX(${x}px)`;
    }
  }, []);

  const playFocused = useCallback(
    (i: number) => {
      const v = previewVideoRef.current;
      // the preview pane is hidden on small screens; don't stream video into it
      if (!v || window.matchMedia("(max-width: 720px)").matches) return;
      const src = projects[i]?.video;
      if (src && v.getAttribute("src") !== src) v.setAttribute("src", src);
      v.play()?.catch(() => {});
    },
    [projects],
  );

  const goFocus = useCallback(
    (next: number, opts?: { silent?: boolean }) => {
      const i = Math.max(0, Math.min(projects.length - 1, next));
      if (i !== focusedRef.current) {
        if (!opts?.silent) audio.current?.navBlip();
        browserRef.current?.scrollTo({ top: 0 });
        /* Roving tabindex: the tab we are leaving is about to become
         * tabindex=-1, so it must not keep the focus ring. */
        if (document.activeElement?.classList.contains("projecttab")) {
          requestAnimationFrame(() => {
            projectTrackRef.current?.querySelectorAll<HTMLElement>(".projecttab")[i]?.focus({ preventScroll: true });
          });
        }
      }
      setFocused(i);
    },
    [projects.length],
  );

  const persist = useCallback(() => {
    const mi = modalRef.current;
    if (mi == null) return;
    const v = modalVideoRef.current;
    const p = projects[mi];
    const t = v?.currentTime || 0;
    const done = !!(v && v.duration && t >= v.duration - 1.5);
    const next: SaveMap = { ...savesRef.current, [p.id]: { t: done ? 0 : t, done: done || !!savesRef.current[p.id]?.done } };
    savesRef.current = next;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(next)); } catch {}
  }, [projects]);

  const openModal = useCallback((i: number) => {
    if (modalRef.current === null) returnFocusRef.current = document.activeElement as HTMLElement | null;
    modalRef.current = i;
    setModalIndex(i);
    window.history.replaceState(null, "", `#${projects[i].id}`);
  }, [projects]);

  const modalStep = useCallback((delta: number) => {
    const current = modalRef.current;
    if (current == null) return;
    persist();
    const next = (current + delta + projects.length) % projects.length;
    modalRef.current = next;
    setFocused(next);
    setModalIndex(next);
    window.history.replaceState(null, "", `#${projects[next].id}`);
    sheetRef.current?.scrollTo({ top: 0 });
    audio.current?.navBlip();
  }, [persist, projects.length]);

  /* Console-style arrows inside the modal: scroll the sheet, then walk the link chips at the bottom. */
  const modalArrow = useCallback((dir: 1 | -1) => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const links = Array.from(sheet.querySelectorAll<HTMLAnchorElement>(".mlinks a"));
    const idx = links.indexOf(document.activeElement as HTMLAnchorElement);
    const step = sheet.clientHeight * 0.55;
    const atBottom = sheet.scrollTop + sheet.clientHeight >= sheet.scrollHeight - 8;
    if (dir > 0) {
      if (idx >= 0 && idx < links.length - 1) {
        links[idx + 1].focus({ preventScroll: true });
        audio.current?.navBlip();
      } else if (idx < 0 && atBottom && links.length) {
        links[0].focus({ preventScroll: true });
        audio.current?.navBlip();
      } else if (idx < 0) {
        sheet.scrollBy({ top: step, behavior: "smooth" });
      }
    } else {
      if (idx > 0) {
        links[idx - 1].focus({ preventScroll: true });
        audio.current?.navBlip();
      } else {
        if (idx === 0) (links[0] as HTMLElement).blur();
        sheet.scrollBy({ top: -step, behavior: "smooth" });
      }
    }
  }, []);

  const closeModal = useCallback(() => {
    persist();
    audio.current?.backBlip();
    const mi = modalRef.current;
    if (mi != null) setFocused(mi);
    try { modalVideoRef.current?.pause(); } catch {}
    modalRef.current = null;
    setModalIndex(null);
    window.history.replaceState(null, "", window.location.pathname);
    const back = returnFocusRef.current;
    returnFocusRef.current = null;
    requestAnimationFrame(() => {
      const target = back && back !== document.body && back.isConnected ? back : document.querySelector<HTMLElement>(".projectcard");
      target?.focus({ preventScroll: true });
    });
  }, [persist]);

  // Focused project -> center the icon rail, update the scene accent, and play its preview.
  useEffect(() => {
    const accent = projects[focused]?.poster[0];
    if (accent) {
      document.documentElement.style.setProperty("--accent", accent);
      ps2.current?.setAccent(accent);
    }
    requestAnimationFrame(centerAxes);
    if (booted && modalIndex === null) playFocused(focused);
  }, [focused, booted, modalIndex, projects, centerAxes, playFocused, widePreview]);

  // open/close the demo modal — the PS2 scene keeps animating behind the translucent backdrop
  useEffect(() => {
    if (modalIndex == null) return;
    const p = projects[modalIndex];
    setTitleInBar(false);
    audio.current?.confirmBlip();
    try { previewVideoRef.current?.pause(); } catch {}
    // A dialog that opens with focus on <body> strands keyboard and screen-reader users.
    requestAnimationFrame(() => sheetRef.current?.focus({ preventScroll: true }));
    const v = modalVideoRef.current;
    if (v) {
      v.src = p.video;
      const sv = savesRef.current[p.id];
      v.currentTime = sv && sv.t > 3 && !sv.done ? sv.t : 0;
      v.play()?.catch(() => {});
    }
  }, [modalIndex, projects]);

  // one-time bootstrap: audio, clock, three.js, global listeners
  useEffect(() => {
    if (initOnce.current) return;
    initOnce.current = true;

    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) savesRef.current = JSON.parse(raw) as SaveMap;
    } catch {}

    audio.current = createAudio();

    const setNow = () => {
      const d = new Date();
      setClock(`${d.getHours()}:${d.getMinutes() < 10 ? "0" : ""}${d.getMinutes()}`);
    };
    setNow();
    const clockId = window.setInterval(setNow, 20000);

    const readProjectHash = () => {
      const index = projects.findIndex((p) => `#${p.id}` === window.location.hash);
      if (index >= 0) {
        focusedRef.current = index;
        setFocused(index);
        openModal(index);
      } else if (modalRef.current !== null) closeModal();
      return index >= 0;
    };
    const linkedProject = readProjectHash();
    window.addEventListener("hashchange", readProjectHash);

    let bootTimers: number[] = [];
    let disposed = false;

    import("@/lib/ps2bg").then(({ initPS2 }) => {
      if (disposed || !canvasRef.current) return;
      const api = initPS2(canvasRef.current);
      ps2.current = api;
      if (!api.ok()) document.body.classList.add("nogl");

      const finishBoot = () => {
        bootTimers.forEach((t) => clearTimeout(t));
        bootTimers = [];
        api.enterMenu();
        setBootPhase(null);
        setBooted(true);
        if (audio.current?.isOn()) audio.current.boom();
      };
      skipRef.current = finishBoot;

      if (linkedProject || api.reduced() || !api.ok()) {
        api.enterMenu();
        setBooted(true);
      } else {
        api.startBoot();
        bootTimers.push(window.setTimeout(() => setBootPhase("sony"), 250));
        bootTimers.push(window.setTimeout(() => setBootPhase("mark"), 1500));
        bootTimers.push(window.setTimeout(finishBoot, 3400));
      }
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (modalRef.current != null) closeModal();
        else window.location.assign("/");
        return;
      }
      if (!bootedRef.current) { skipRef.current?.(); return; }
      if (modalRef.current != null) {
        if (e.key === "Tab") {
          // Keep Tab inside the dialog; without this the page behind stays reachable.
          const sheet = sheetRef.current;
          if (!sheet) return;
          const focusable = Array.from(
            sheet.querySelectorAll<HTMLElement>('a[href],button,video[controls],[tabindex]:not([tabindex="-1"])'),
          ).filter((el) => el.offsetParent !== null);
          if (!focusable.length) { e.preventDefault(); sheet.focus(); return; }
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          const active = document.activeElement as HTMLElement | null;
          if (e.shiftKey && (active === first || active === sheet)) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
          else if (active && !sheet.contains(active)) { e.preventDefault(); first.focus(); }
          return;
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          modalStep(e.key === "ArrowRight" ? 1 : -1);
        } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          modalArrow(e.key === "ArrowDown" ? 1 : -1);
        }
        return;
      }
      if (e.key === "Enter" && (e.target as HTMLElement)?.closest("a,button") && !(e.target as HTMLElement)?.closest(".projecttab")) return;
      if (e.key === "ArrowLeft") goFocus(focusedRef.current - 1);
      else if (e.key === "ArrowRight") goFocus(focusedRef.current + 1);
      else if (e.key === "Enter") { e.preventDefault(); openModal(focusedRef.current); }
      else return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      ps2.current?.setMouse(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight, 1);
    };
    const onResize = () => centerAxes();
    const onVis = () => {
      if (document.hidden) {
        ps2.current?.setPaused(true);
        try { previewVideoRef.current?.pause(); } catch {}
      } else {
        ps2.current?.setPaused(false);
        if (bootedRef.current && modalRef.current == null) playFocused(focusedRef.current);
      }
    };
    let dragX: number | null = null;
    let dragY: number | null = null;
    const onDown = (e: PointerEvent) => {
      draggedRef.current = false;
      if (modalRef.current !== null || !bootedRef.current) return;
      dragX = e.clientX; dragY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      if (dragX == null || dragY == null) return;
      const dx = e.clientX - dragX;
      const dy = e.clientY - dragY;
      dragX = dragY = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        draggedRef.current = true;
        goFocus(focusedRef.current + (dx < 0 ? 1 : -1));
      }
    };
    /* Wheel and trackpad walk the rail from anywhere on the page, not just over
     * the card.
     *   deltaMode 1 and 2 report lines and pages rather than pixels, so
     *   normalise first: Firefox sends 3 lines per notch, which at 40px a line
     *   lands on the same ~120px a pixel-mode notch reports.
     *   Then split by event size rather than by a timer. One chunky event is a
     *   discrete mouse notch and steps on its own; a stream of small ones is a
     *   trackpad and spends its travel proportionally. A time-based lock gets
     *   this wrong in both directions: it stampedes on a flick, and it stalls
     *   completely when the WebGL scene slows event delivery down.
     *   `intent` exists because focusedRef only catches up after a render, so
     *   two steps inside one frame would otherwise both read the same index. */
    const WHEEL_TO_PX = [1, 40, 800];
    const WHEEL_STEP = 100;
    const WHEEL_NOTCH = 50;
    const WHEEL_SPILL = 48;
    let accum = 0;
    let lastAt = 0;
    let intent = -1;
    const onWheel = (e: WheelEvent) => {
      // The case-study sheet scrolls itself; never take the wheel off it.
      if (modalRef.current != null || !bootedRef.current) return;
      const scale = WHEEL_TO_PX[e.deltaMode] ?? 1;
      const dx = e.deltaX * scale;
      const dy = e.deltaY * scale;
      /* The rail is what the wheel drives. Only hand a notch back to the card
       * when it genuinely has content out of view, so a few stray pixels of
       * overflow cannot swallow a navigation step on a short screen. */
      const browser = browserRef.current;
      const spill = browser ? browser.scrollHeight - browser.clientHeight : 0;
      if (browser && spill > WHEEL_SPILL && browser.contains(e.target as Node) && Math.abs(dy) >= Math.abs(dx)) {
        const canScroll = dy > 0
          ? browser.scrollTop + browser.clientHeight < browser.scrollHeight - 2
          : browser.scrollTop > 2;
        if (canScroll) return;
      }
      const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      if (!delta) return;
      e.preventDefault();

      const now = e.timeStamp || performance.now();
      const fresh = now - lastAt > 500;
      lastAt = now;
      if (fresh || delta * accum < 0) accum = 0;
      if (fresh || intent < 0) intent = focusedRef.current;

      if (Math.abs(delta) >= WHEEL_NOTCH) {
        accum = 0;
      } else {
        accum += delta;
        if (Math.abs(accum) < WHEEL_STEP) return;
        accum = 0;
      }
      intent = Math.max(0, Math.min(projects.length - 1, intent + (delta > 0 ? 1 : -1)));
      goFocus(intent);
    };

    const onClick = (e: MouseEvent) => {
      if (draggedRef.current) { e.preventDefault(); e.stopPropagation(); draggedRef.current = false; }
    };
    window.addEventListener("click", onClick, true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("wheel", onWheel, { passive: false });

    requestAnimationFrame(centerAxes);

    return () => {
      disposed = true;
      bootTimers.forEach((t) => clearTimeout(t));
      window.clearInterval(clockId);
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", readProjectHash);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("wheel", onWheel);
      ps2.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSound = () => {
    const on = !soundOn;
    setSoundOn(on);
    audio.current?.setSound(on);
  };

  /* Triple-click the watermark. It was on the brand until the brand became a
   * link home, and the joke belongs on the memory-card mark anyway. */
  const onMemoryCard = () => {
    const now = Date.now();
    if (now - clickT.current > 600) clicks.current = 0;
    clickT.current = now;
    clicks.current += 1;
    if (clicks.current < 3) return;
    clicks.current = 0;
    setFlash("\u25CD MEMORY CARD (8MB) \u00B7 formatted with care");
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 2200);
    if (!soundOn) { setSoundOn(true); audio.current?.setSound(true); }
    audio.current?.confirmBlip();
    document.body.animate?.(
      [{ filter: "brightness(1)" }, { filter: "brightness(1.6)" }, { filter: "brightness(1)" }],
      { duration: 700 },
    );
  };

  const onTimeUpdate = () => {
    const v = modalVideoRef.current;
    if (v && Math.floor(v.currentTime) % 2 === 0) persist();
  };

  const cur = projects[focused];
  const m = modalIndex !== null ? projects[modalIndex] : null;

  return (
    <>
      <canvas id="gl" ref={canvasRef} />
      <div className="grain" aria-hidden />

      <div className={`boot${booted ? " gone" : ""}`} aria-hidden={booted}>
        <div className="bootvig" onClick={() => skipRef.current?.()} />
        <div className={`bootbeat beat-sony${bootPhase === "sony" ? " show" : ""}`}>
          {PROFILE.name}
        </div>
        <div className={`bootbeat mark${bootPhase === "mark" ? " show" : ""}`}>
          <Wordmark className="wm" />
        </div>
        <button className="bootskip" tabIndex={booted ? -1 : 0} onClick={() => skipRef.current?.()}>press any key to skip ▸</button>
      </div>

      <header className="osd" inert={modalIndex !== null}>
        <div className="osd-l">
          <a className="brand" href="/" aria-label={`${PROFILE.displayName}, home`}>
            <img className="brandavatar" src={PROFILE.avatar} alt="" width={36} height={36} />
            <span className="brandcopy">
              <span className="brandname">{PROFILE.displayName}</span>
              <span className="role">{PROFILE.handle}</span>
            </span>
          </a>
          <nav className="surfacechips" aria-label="Site">
            <a className="chip showcase-current" href="/showcase" aria-current="page">Showcase</a>
            {SURFACES.map((surface) => (
              <a key={surface.id} className="chip" href={surface.href} title={surface.hint} aria-label={surface.hint}>
                <img src={surface.logo} alt="" width={22} height={22} />
                <span>{surface.label}</span>
              </a>
            ))}
          </nav>
        </div>
        <div className="osd-r">
          <nav className="links" aria-label="Contact">
            <a href={PROFILE.github} target="_blank" rel="noreferrer">GitHub</a>
            <a href={PROFILE.twitter} target="_blank" rel="noreferrer">X</a>
            <a href={PROFILE.linkedin} target="_blank" rel="noreferrer">In</a>
            <a href={PROFILE.telegram} target="_blank" rel="noreferrer">TG</a>
            <a href={PROFILE.ensProfile} target="_blank" rel="noreferrer" title={PROFILE.ens}>ENS</a>
          </nav>
          <span className="clock">{clock}</span>
          <button className="sndbtn" aria-pressed={soundOn} aria-label="Toggle sound" onClick={toggleSound}>
            <span className="spk">♪</span>
          </button>
        </div>
      </header>

      <main className="browser project-browser" ref={browserRef} inert={modalIndex !== null}>
        <h1 className="sr-only">{PROFILE.name} portfolio: selected projects</h1>
        <section className="project-rail" aria-label="Projects">
          <div className="projecttrack" ref={projectTrackRef}>
            {projects.map((project, index) => {
              const on = index === focused;
              return (
                <button
                  key={project.id}
                  className={`projecttab${on ? " on" : ""}`}
                  aria-current={on}
                  onClick={() => goFocus(index)}
                  tabIndex={on ? 0 : -1}
                  aria-label={`${project.title}, ${project.period}`}
                >
                  <span className="projectglyph"><img src={project.logo} alt="" width={56} height={56} /></span>
                  <span className="projectname">{project.title}</span>
                  <span className="projectperiod">{project.period}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="project-stage">
          <nav className="project-controls" aria-label="Browse projects">
            <button disabled={focused === 0} onClick={() => goFocus(focused - 1)} aria-label="Previous project">← <span>Previous</span></button>
            <span className="positioncounter" aria-live="polite">{String(focused + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
            <button disabled={focused === projects.length - 1} onClick={() => goFocus(focused + 1)} aria-label="Next project"><span>Next</span> →</button>
          </nav>
          {cur && (
            <button
              className={`projectcard${booted && modalIndex === null ? " playing" : ""}`}
              style={{ "--a1": cur.poster[0], "--a2": cur.poster[1] } as CSSProperties}
              onClick={() => openModal(focused)}
              aria-label={`Open ${cur.title} case study`}
            >
              <span className="projectcard-icon"><img src={cur.logo} alt="" width={56} height={56} /></span>
              <span className="projectcard-copy">
                <span className="projectcard-top">
                  <span className="projectcard-title">{cur.title}</span>
                  <span className="projectcard-period">{cur.period}</span>
                </span>
                <span className="projectcard-role">{cur.role}</span>
                <span className="projectcard-tagline">{cur.tagline}</span>
                <span className="projectcard-cta">View case study <span aria-hidden="true">↗</span></span>
                <span className="projectcard-stack">{cur.stack.map((item) => <span key={item}>{item}</span>)}</span>
              </span>
              <span className="projectcard-preview" aria-hidden="true">
                <img className="preview-still" src={cur.preview} alt="" width={720} height={406} />
                {widePreview && booted && modalIndex === null && (cur.portrait ? (
                  <VideoWall src={cur.video} panels={3} />
                ) : (
                  <video ref={previewVideoRef} poster={cur.preview} muted loop playsInline preload="none" />
                ))}
              </span>
            </button>
          )}
        </section>
      </main>

      <aside className="navhud">
        <div className="navlegend" aria-hidden="true">
          <kbd>←</kbd><kbd>→</kbd><span className="lbl">project</span>
          <span className="sep">·</span>
          <kbd>Enter</kbd><span className="lbl">open</span>
          <span className="sep">·</span>
          <kbd>Esc</kbd><span className="lbl">exit</span>
        </div>
      </aside>

      <button className="footmark" aria-hidden tabIndex={-1} onClick={onMemoryCard}>
        <Wordmark decorative />
      </button>

      <div className={`saveflash${flash ? " show" : ""}`}>{flash}</div>

      {m && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="casestudy-title" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div
            className="sheet"
            ref={sheetRef}
            tabIndex={-1}
            onScroll={(e) => {
              /* Reveal the bar's label only once the heading it duplicates has
               * gone behind it. On a short case study that never happens, and
               * the bar correctly stays quiet. */
              const h = caseTitleRef.current;
              const past = !!h && h.getBoundingClientRect().bottom < e.currentTarget.getBoundingClientRect().top + 60;
              setTitleInBar((was) => (was === past ? was : past));
            }}
          >
            <div className={`dialogbar${titleInBar ? " scrolled" : ""}`}>
              <button className="dialog-step" aria-label="Previous project" onClick={() => modalStep(-1)}>←</button>
              <button className="dialog-step" aria-label="Next project" onClick={() => modalStep(1)}>→</button>
              <span aria-hidden="true">{m.title}</span>
              <button className="close" aria-label="Close case study" onClick={closeModal}>✕</button>
            </div>
            <div className="player">
              {m.portrait ? (
                <VideoWall src={m.video} panels={3} />
              ) : (
                <video
                  ref={modalVideoRef}
                  poster={m.preview}
                  controls
                  loop
                  controlsList="nodownload noplaybackrate noremoteplayback"
                  disablePictureInPicture
                  playsInline
                  preload="metadata"
                  onTimeUpdate={onTimeUpdate}
                />
              )}
            </div>
            <div className="mbody">
              <div className="mtop">
                <h2 id="casestudy-title" ref={caseTitleRef}>{m.title}</h2>
                <span className="myr">{m.year}</span>
              </div>
              <p className="mrole">{m.role}</p>
              <p className="mresult">{m.result}</p>
              <div className="stacklist">{m.stack.map((s) => <span key={s}>{s}</span>)}</div>
              <div className="casegrid">
                <section><h4>Problem</h4><p>{m.problem}</p></section>
                <section><h4>Process</h4><p>{m.process}</p></section>
                <section><h4>Outcome</h4><p>{m.outcome}</p></section>
              </div>
              <div className="mlinks">
                {m.links.live && <a className={m.links.live !== "#" ? "live" : undefined} href={m.links.live} target="_blank" rel="noreferrer" onClick={(e) => { if (m.links.live === "#") e.preventDefault(); }}>Live</a>}
                {m.links.app && <a className="live" href={m.links.app} target="_blank" rel="noreferrer">App</a>}
                {m.links.code && <a href={m.links.code} target="_blank" rel="noreferrer" onClick={(e) => { if (m.links.code === "#") e.preventDefault(); }}>Code</a>}
                {m.links.study && <a href={m.links.study} target="_blank" rel="noreferrer" onClick={(e) => { if (m.links.study === "#") e.preventDefault(); }}>Case study</a>}
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

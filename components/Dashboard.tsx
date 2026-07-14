"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ORGS, type Project } from "@/lib/projects";
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
  const [flash, setFlash] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colRef = useRef<HTMLElement>(null);
  const orgTrackRef = useRef<HTMLDivElement>(null);
  const colTrackRef = useRef<HTMLDivElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const ps2 = useRef<PS2Api | null>(null);
  const audio = useRef<AudioApi | null>(null);
  const orgMemo = useRef<Record<string, number>>({});
  const savesRef = useRef<SaveMap>({});
  const focusedRef = useRef(0);
  const modalRef = useRef<number | null>(null);
  const bootedRef = useRef(false);
  const flashTimer = useRef<number | null>(null);
  const skipRef = useRef<(() => void) | null>(null);
  const initOnce = useRef(false);
  const clicks = useRef(0);
  const clickT = useRef(0);

  useEffect(() => { focusedRef.current = focused; }, [focused]);
  useEffect(() => { modalRef.current = modalIndex; }, [modalIndex]);
  useEffect(() => { bootedRef.current = booted; }, [booted]);
  useEffect(() => { document.body.classList.toggle("ready", booted); }, [booted]);

  const showFlash = useCallback((msg: string) => {
    setFlash(msg);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 2200);
  }, []);

  /* XMB axes: ORGS with at least one project, each holding flat indices into `projects`. */
  const groups = useMemo(
    () =>
      ORGS.map((org) => ({
        org,
        items: projects
          .map((p, i) => (p.org === org.id ? i : -1))
          .filter((i) => i >= 0),
      })).filter((g) => g.items.length > 0),
    [projects],
  );
  const orgIdxOf = useCallback(
    (pIdx: number) => Math.max(0, groups.findIndex((g) => g.items.includes(pIdx))),
    [groups],
  );

  const centerAxes = useCallback((pIdx: number) => {
    const gi = orgIdxOf(pIdx);
    const orgTrack = orgTrackRef.current;
    const orgEl = orgTrack?.children[gi] as HTMLElement | undefined;
    if (orgTrack && orgEl && orgTrack.parentElement) {
      // rounded to the pixel grid; fractional translates blur the text layer
      const x = Math.round(orgTrack.parentElement.clientWidth / 2 - (orgEl.offsetLeft + orgEl.offsetWidth / 2));
      orgTrack.style.transform = `translateX(${x}px)`;
    }
    const ii = groups[gi]?.items.indexOf(pIdx) ?? 0;
    const colTrack = colTrackRef.current;
    const itemEl = colTrack?.children[ii] as HTMLElement | undefined;
    if (colTrack && itemEl) {
      const y = Math.round(8 - itemEl.offsetTop);
      colTrack.style.transform = `translateY(${y}px)`;
    }
  }, [groups, orgIdxOf]);

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
      if (i !== focusedRef.current && !opts?.silent) audio.current?.navBlip();
      setFocused(i);
    },
    [projects.length],
  );

  /* Vertical axis: step within the focused org's column. */
  const goItem = useCallback(
    (delta: number) => {
      const gi = orgIdxOf(focusedRef.current);
      const items = groups[gi].items;
      const pos = items.indexOf(focusedRef.current);
      const next = Math.max(0, Math.min(items.length - 1, pos + delta));
      goFocus(items[next]);
    },
    [groups, orgIdxOf, goFocus],
  );

  /* Horizontal axis: step across orgs, restoring that org's remembered row. */
  const goOrg = useCallback(
    (delta: number) => {
      const gi = orgIdxOf(focusedRef.current);
      const next = Math.max(0, Math.min(groups.length - 1, gi + delta));
      if (next === gi) return;
      const g = groups[next];
      const pos = Math.min(orgMemo.current[g.org.id] ?? 0, g.items.length - 1);
      goFocus(g.items[pos]);
    },
    [groups, orgIdxOf, goFocus],
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

  const openModal = useCallback((i: number) => setModalIndex(i), []);

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
    setModalIndex(null);
  }, [persist]);

  // focus / boot / modal -> center both axes, accent, remember the row, play the preview
  useEffect(() => {
    const p = projects[focused];
    if (!p) return;
    document.documentElement.style.setProperty("--accent", p.poster[0]);
    ps2.current?.setAccent(p.poster[0]);
    const gi = orgIdxOf(focused);
    orgMemo.current[groups[gi].org.id] = groups[gi].items.indexOf(focused);
    centerAxes(focused);
    if (booted && modalIndex === null) playFocused(focused);
  }, [focused, booted, modalIndex, projects, groups, orgIdxOf, centerAxes, playFocused]);

  // open/close the demo modal — the PS2 scene keeps animating behind the translucent backdrop
  useEffect(() => {
    if (modalIndex == null) return;
    const p = projects[modalIndex];
    audio.current?.confirmBlip();
    try { (document.activeElement as HTMLElement | null)?.blur?.(); } catch {}
    try { previewVideoRef.current?.pause(); } catch {}
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

      if (api.reduced() || !api.ok()) {
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
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          modalArrow(e.key === "ArrowDown" ? 1 : -1);
        }
        return;
      }
      if (e.key === "ArrowLeft") goOrg(-1);
      else if (e.key === "ArrowRight") goOrg(1);
      else if (e.key === "ArrowUp") goItem(-1);
      else if (e.key === "ArrowDown") goItem(1);
      else if (e.key === "Enter") openModal(focusedRef.current);
      else return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      ps2.current?.setMouse(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight, 1);
    };
    const onResize = () => centerAxes(focusedRef.current);
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
    const onDown = (e: PointerEvent) => { dragX = e.clientX; dragY = e.clientY; };
    const onUp = (e: PointerEvent) => {
      if (dragX == null || dragY == null) return;
      const dx = e.clientX - dragX;
      const dy = e.clientY - dragY;
      dragX = dragY = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) goOrg(dx < 0 ? 1 : -1);
      else if (Math.abs(dy) > 40) goItem(dy < 0 ? 1 : -1);
    };
    let wheelLock = false;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < 4 && Math.abs(e.deltaY) < 8) return;
      e.preventDefault();
      if (wheelLock) return;
      wheelLock = true;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) goOrg(e.deltaX > 0 ? 1 : -1);
      else goItem(e.deltaY > 0 ? 1 : -1);
      window.setTimeout(() => { wheelLock = false; }, 260);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    const shelf = colRef.current;
    shelf?.addEventListener("wheel", onWheel, { passive: false });

    requestAnimationFrame(() => centerAxes(focusedRef.current));

    return () => {
      disposed = true;
      bootTimers.forEach((t) => clearTimeout(t));
      window.clearInterval(clockId);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      shelf?.removeEventListener("wheel", onWheel);
      ps2.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSound = () => {
    const on = !soundOn;
    setSoundOn(on);
    audio.current?.setSound(on);
  };

  const onBrand = () => {
    const now = Date.now();
    if (now - clickT.current > 600) clicks.current = 0;
    clickT.current = now;
    clicks.current += 1;
    if (clicks.current >= 3) {
      clicks.current = 0;
      showFlash("◍ MEMORY CARD (8MB) · formatted with care");
      if (!soundOn) { setSoundOn(true); audio.current?.setSound(true); }
      audio.current?.confirmBlip();
      document.body.animate?.(
        [{ filter: "brightness(1)" }, { filter: "brightness(1.6)" }, { filter: "brightness(1)" }],
        { duration: 700 },
      );
    }
  };

  const onTimeUpdate = () => {
    const v = modalVideoRef.current;
    if (v && Math.floor(v.currentTime) % 2 === 0) persist();
  };

  const m = modalIndex !== null ? projects[modalIndex] : null;

  return (
    <>
      <canvas id="gl" ref={canvasRef} />
      <div className="grain" aria-hidden />

      <div className={`boot${booted ? " gone" : ""}`} aria-hidden>
        <div className="bootvig" onClick={() => skipRef.current?.()} />
        <div className={`bootbeat beat-sony${bootPhase === "sony" ? " show" : ""}`}>
          {PROFILE.name}
        </div>
        <div className={`bootbeat mark${bootPhase === "mark" ? " show" : ""}`}>
          <Wordmark className="wm" />
        </div>
        <button className="bootskip" onClick={() => skipRef.current?.()}>press any key to skip ▸</button>
      </div>

      <header className="osd">
        <div className="osd-l">
          <button className="brand" onClick={onBrand} title={PROFILE.github} aria-label={`${PROFILE.name} on GitHub`}>
            <img className="brandavatar" src={PROFILE.avatar} alt="" width={36} height={36} />
            <span className="brandcopy">
              <span className="brandname">{PROFILE.name}</span>
              <span className="role">{PROFILE.handle}</span>
            </span>
          </button>
        </div>
        <div className="osd-r">
          <nav className="links" aria-label="Contact">
            <a href={PROFILE.github} target="_blank" rel="noreferrer">GitHub</a>
            <a href={PROFILE.twitter} target="_blank" rel="noreferrer">X</a>
            <a href={PROFILE.telegram} target="_blank" rel="noreferrer">TG</a>
            <a href={PROFILE.ensProfile} target="_blank" rel="noreferrer" title={PROFILE.ens}>ENS</a>
          </nav>
          <span className="clock">{clock}</span>
          <button className="sndbtn" aria-pressed={soundOn} aria-label="Toggle sound" onClick={toggleSound}>
            <span className="spk">♪</span>
          </button>
        </div>
      </header>

      <main className="browser xmb">
        <section className="xmb-bar" aria-label="Companies">
          <div className="orgtrack" ref={orgTrackRef}>
            {groups.map((g, gi) => {
              const on = gi === orgIdxOf(focused);
              return (
                <button
                  key={g.org.id}
                  className={`org${on ? " on" : ""}`}
                  aria-current={on}
                  onClick={() => {
                    const pos = Math.min(orgMemo.current[g.org.id] ?? 0, g.items.length - 1);
                    goFocus(g.items[pos]);
                  }}
                >
                  <img src={g.org.logo} alt="" width={64} height={64} />
                  <span className="orgname">{g.org.name}</span>
                  <span className="orgblurb">{g.org.blurb}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="xmb-col" ref={colRef} aria-label="Projects">
          <div className="coltrack" ref={colTrackRef}>
            {groups[orgIdxOf(focused)].items.map((pIdx) => {
              const p = projects[pIdx];
              const on = pIdx === focused;
              return (
                <button
                  key={p.id}
                  className={`xitem${on ? " on" : ""}${on && booted && modalIndex === null ? " playing" : ""}`}
                  style={{ "--a1": p.poster[0], "--a2": p.poster[1] } as CSSProperties}
                  onClick={() => (on ? openModal(pIdx) : goFocus(pIdx))}
                  aria-label={`${p.title}, ${p.year}`}
                >
                  <span className="xicon"><img src={p.logo} alt="" width={28} height={28} /></span>
                  <span className="xmeta">
                    <span className="xtop">
                      <span className="xtitle">{p.title}</span>
                      <span className="xyear">{p.period}</span>
                    </span>
                    <span className="xrole">{p.role}</span>
                    {on && <span className="xtag">{p.tagline}</span>}
                  </span>
                  {on && modalIndex === null && (
                    <span className="xpreview" aria-hidden="true">
                      {p.portrait ? (
                        <VideoWall src={p.video} panels={3} />
                      ) : (
                        <video ref={previewVideoRef} muted loop playsInline preload="none" />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </main>

      <aside className="navhud">
        <div className="dots" role="tablist" aria-label="Projects in this company">
          {groups[orgIdxOf(focused)].items.map((pIdx) => (
            <button
              key={projects[pIdx].id}
              className={`dot${pIdx === focused ? " on" : ""}`}
              role="tab"
              aria-selected={pIdx === focused}
              aria-label={projects[pIdx].title}
              onClick={() => goFocus(pIdx)}
            />
          ))}
        </div>
        <div className="navlegend" aria-hidden="true">
          <kbd>←</kbd><kbd>→</kbd><span className="lbl">company</span>
          <span className="sep">·</span>
          <kbd>↑</kbd><kbd>↓</kbd><span className="lbl">project</span>
          <span className="sep">·</span>
          <kbd>Enter</kbd><span className="lbl">watch</span>
          <span className="sep">·</span>
          <kbd>Esc</kbd><span className="lbl">exit</span>
        </div>
      </aside>

      <Wordmark className="footmark" decorative />

      {m && (
        <div className="modal" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="sheet" ref={sheetRef}>
            <div className="player">
              <button className="close" aria-label="Close" onClick={closeModal}>✕</button>
              {m.portrait ? (
                <VideoWall src={m.video} panels={3} />
              ) : (
                <video
                  ref={modalVideoRef}
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
                <h2>{m.title}</h2>
                <span className="myr">{m.year}</span>
              </div>
              <p className="mrole">{m.role}</p>
              <div className="stacklist">{m.stack.map((s) => <span key={s}>{s}</span>)}</div>
              <div className="casegrid">
                <section><h4>Problem</h4><p>{m.problem}</p></section>
                <section><h4>Process</h4><p>{m.process}</p></section>
                <section><h4>Outcome</h4><p>{m.outcome}</p></section>
              </div>
              <div className="mlinks">
                {m.links.live && <a className={m.links.live !== "#" ? "live" : undefined} href={m.links.live} target="_blank" rel="noreferrer" onClick={(e) => { if (m.links.live === "#") e.preventDefault(); }}>Live</a>}
                {m.links.code && <a href={m.links.code} target="_blank" rel="noreferrer" onClick={(e) => { if (m.links.code === "#") e.preventDefault(); }}>Code</a>}
                {m.links.study && <a href={m.links.study} target="_blank" rel="noreferrer" onClick={(e) => { if (m.links.study === "#") e.preventDefault(); }}>Case study</a>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`saveflash${flash ? " show" : ""}`}>{flash}</div>
    </>
  );
}

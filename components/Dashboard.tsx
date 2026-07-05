"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { Project } from "@/lib/projects";
import { PROFILE } from "@/lib/profile";
import { createAudio, type AudioApi } from "@/lib/audio";
import type { PS2Api } from "@/lib/ps2bg";
import Wordmark from "@/components/Wordmark";

type SaveMap = Record<string, { t: number; done: boolean }>;
const SAVE_KEY = "ps2.portfolio.v1";

function fmt(t: number): string {
  t = Math.max(0, Math.floor(t || 0));
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function Dashboard({ projects }: { projects: Project[] }) {
  const [focused, setFocused] = useState(0);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [booted, setBooted] = useState(false);
  const [bootPhase, setBootPhase] = useState<"sony" | "mark" | null>(null);
  const [saves, setSaves] = useState<SaveMap>({});
  const [clock, setClock] = useState("");
  const [flash, setFlash] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shelfRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  const ps2 = useRef<PS2Api | null>(null);
  const audio = useRef<AudioApi | null>(null);
  const trackX = useRef(0);
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
  useEffect(() => { savesRef.current = saves; }, [saves]);
  useEffect(() => { document.body.classList.toggle("ready", booted); }, [booted]);

  const showFlash = useCallback((msg: string) => {
    setFlash(msg);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 2200);
  }, []);

  const centerTrack = useCallback((i: number) => {
    const tile = tileRefs.current[i];
    const shelf = shelfRef.current;
    const track = trackRef.current;
    if (!tile || !shelf || !track) return;
    const s = shelf.getBoundingClientRect();
    const t = tile.getBoundingClientRect();
    trackX.current += s.left + s.width / 2 - (t.left + t.width / 2);
    track.style.transform = `translateX(${trackX.current}px)`;
  }, []);

  const playFocused = useCallback(
    (i: number) => {
      tileRefs.current.forEach((tile, j) => {
        const v = tile?.querySelector("video");
        if (!v) return;
        if (j === i) {
          if (!v.getAttribute("src")) v.setAttribute("src", projects[i].video);
          v.play()?.catch(() => {});
        } else {
          try { v.pause(); } catch {}
        }
      });
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

  const modalStep = useCallback(
    (d: number) => {
      persist();
      setModalIndex((mi) => (mi == null ? mi : Math.max(0, Math.min(projects.length - 1, mi + d))));
    },
    [persist, projects.length],
  );

  const closeModal = useCallback(() => {
    persist();
    audio.current?.backBlip();
    showFlash("Save data written");
    const mi = modalRef.current;
    setSaves({ ...savesRef.current });
    if (mi != null) setFocused(mi);
    try { modalVideoRef.current?.pause(); } catch {}
    setModalIndex(null);
  }, [persist, showFlash]);

  // focus / boot / modal -> center, accent, play the focused tile
  useEffect(() => {
    const p = projects[focused];
    if (!p) return;
    document.documentElement.style.setProperty("--accent", p.poster[0]);
    ps2.current?.setAccent(p.poster[0]);
    centerTrack(focused);
    if (booted && modalIndex === null) playFocused(focused);
  }, [focused, booted, modalIndex, projects, centerTrack, playFocused]);

  // open/close the demo modal
  useEffect(() => {
    if (modalIndex == null) {
      ps2.current?.setPaused(false);
      return;
    }
    const p = projects[modalIndex];
    ps2.current?.setPaused(true);
    audio.current?.confirmBlip();
    tileRefs.current.forEach((tile) => {
      const v = tile?.querySelector("video");
      try { v?.pause(); } catch {}
    });
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
      if (raw) {
        const s = JSON.parse(raw) as SaveMap;
        savesRef.current = s;
        setSaves(s);
      }
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
        if (e.key === "ArrowLeft") modalStep(-1);
        else if (e.key === "ArrowRight") modalStep(1);
        return;
      }
      if (e.key === "ArrowLeft") goFocus(focusedRef.current - 1);
      else if (e.key === "ArrowRight") goFocus(focusedRef.current + 1);
      else if (e.key === "Enter") openModal(focusedRef.current);
    };
    const onMove = (e: PointerEvent) => {
      ps2.current?.setMouse(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight, 1);
    };
    const onResize = () => centerTrack(focusedRef.current);
    const onVis = () => {
      if (document.hidden) {
        ps2.current?.setPaused(true);
        tileRefs.current.forEach((t) => { const v = t?.querySelector("video"); try { v?.pause(); } catch {} });
      } else {
        ps2.current?.setPaused(modalRef.current != null);
        if (bootedRef.current && modalRef.current == null) playFocused(focusedRef.current);
      }
    };
    let dragX: number | null = null;
    const onDown = (e: PointerEvent) => { dragX = e.clientX; };
    const onUp = (e: PointerEvent) => {
      if (dragX == null) return;
      const dx = e.clientX - dragX;
      dragX = null;
      if (Math.abs(dx) > 40) goFocus(focusedRef.current + (dx < 0 ? 1 : -1));
    };
    let wheelLock = false;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY) && Math.abs(e.deltaY) < 8) return;
      e.preventDefault();
      if (wheelLock) return;
      wheelLock = true;
      goFocus(focusedRef.current + (e.deltaX + e.deltaY > 0 ? 1 : -1));
      window.setTimeout(() => { wheelLock = false; }, 260);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    const shelf = shelfRef.current;
    shelf?.addEventListener("wheel", onWheel, { passive: false });

    requestAnimationFrame(() => centerTrack(focusedRef.current));

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
      showFlash("◍ MEMORY CARD (8MB) — formatted with care");
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

  const cur = projects[focused];
  const curSave = cur ? saves[cur.id] : undefined;
  const canResume = !!(curSave && curSave.t > 3 && !curSave.done);
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

      <main className="browser">
        <div className="crumbs">
          <span className="crumb-cur">{cur?.title}</span>
          <span className="crumb-date">{cur?.period}</span>
        </div>
        <section className="shelf" ref={shelfRef}>
          <button className="arrow left" aria-label="Previous project" disabled={focused === 0} onClick={() => goFocus(focused - 1)}>‹</button>
          <div className="track" ref={trackRef}>
            {projects.map((p, i) => (
              <button
                key={p.id}
                ref={(el) => { tileRefs.current[i] = el; }}
                className={`tile${i === focused ? " focus" : ""}${i === focused && booted && modalIndex === null ? " playing" : ""}`}
                style={{ "--a1": p.poster[0], "--a2": p.poster[1] } as CSSProperties}
                onClick={() => (i === focused ? openModal(i) : goFocus(i))}
                aria-label={`${p.title}, ${p.year}`}
              >
                <video muted loop playsInline preload="none" />
                <span className="glyph">{p.title}</span>
                <span className="playcue" aria-hidden="true">▶</span>
                <span className="tile-label">{p.title}</span>
              </button>
            ))}
          </div>
          <button className="arrow right" aria-label="Next project" disabled={focused === projects.length - 1} onClick={() => goFocus(focused + 1)}>›</button>
        </section>

        <section className="info">
          <p className="info-tag">{cur?.tagline}</p>
          {canResume && (
            <div className="info-actions">
              <button className="btn ghost" onClick={() => openModal(focused)}>↺&nbsp;&nbsp;Continue · {fmt(curSave!.t)}</button>
            </div>
          )}
        </section>
      </main>

      <aside className="navhud">
        <div className="dots" role="tablist" aria-label="Projects">
          {projects.map((p, i) => (
            <button
              key={p.id}
              className={`dot${i === focused ? " on" : ""}`}
              role="tab"
              aria-selected={i === focused}
              aria-label={p.title}
              onClick={() => goFocus(i)}
            />
          ))}
        </div>
        <div className="navlegend" aria-hidden="true">
          <kbd>←</kbd><kbd>→</kbd><span className="lbl">browse</span>
          <span className="sep">·</span>
          <kbd>Enter</kbd><span className="lbl">watch</span>
          <span className="sep">·</span>
          <kbd>Esc</kbd><span className="lbl">exit</span>
        </div>
      </aside>

      <Wordmark className="footmark" decorative />

      {m && (
        <div className="modal" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="sheet">
            <div className="player">
              <button className="close" aria-label="Close" onClick={closeModal}>✕</button>
              <button className="nav prev" aria-label="Previous project" onClick={() => modalStep(-1)}>‹</button>
              <button className="nav next" aria-label="Next project" onClick={() => modalStep(1)}>›</button>
              <video
                ref={modalVideoRef}
                controls
                controlsList="nodownload noplaybackrate noremoteplayback"
                disablePictureInPicture
                playsInline
                preload="metadata"
                onTimeUpdate={onTimeUpdate}
              />
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
                {m.links.live && <a href={m.links.live} onClick={(e) => { if (m.links.live === "#") e.preventDefault(); }}>Live</a>}
                {m.links.code && <a href={m.links.code} onClick={(e) => { if (m.links.code === "#") e.preventDefault(); }}>Code</a>}
                {m.links.study && <a href={m.links.study} onClick={(e) => { if (m.links.study === "#") e.preventDefault(); }}>Case study</a>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`saveflash${flash ? " show" : ""}`}>{flash}</div>
    </>
  );
}

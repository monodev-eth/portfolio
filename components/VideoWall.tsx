"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * A portrait (9:16) clip shown as N side-by-side panels, each seeked to an
 * evenly-spaced offset, so a single vertical recording fills a 16:9 slot and
 * you see several moments of the demo at once. Three 9:16 panels tile almost
 * exactly into 16:9. Panels are muted, looping, decorative — no controls.
 *
 * Panels 2..N seek to mid-file offsets, so their frames range-fetch and paint
 * later than panel 1 (which plays from t=0). Rather than hold the whole wall
 * black until the slowest panel is ready, each panel fades in on its own as
 * soon as its frame decodes — so the wall populates progressively (1, then 2,
 * then 3) instead of staying blank.
 */
export default function VideoWall({ src, panels = 3 }: { src: string; panels?: number }) {
  const [readyMask, setReadyMask] = useState<boolean[]>(() => Array(panels).fill(false));

  const mark = useCallback((i: number) => {
    setReadyMask((prev) => {
      if (prev[i]) return prev;
      const next = prev.slice();
      next[i] = true;
      return next;
    });
  }, []);

  // reset on a new clip; safety-reveal any panel whose readiness event never
  // lands (e.g. a backgrounded tab that throttles media events)
  useEffect(() => {
    setReadyMask(Array(panels).fill(false));
    const t = setTimeout(() => setReadyMask(Array(panels).fill(true)), 3000);
    return () => clearTimeout(t);
  }, [src, panels]);

  return (
    <span className="videowall" aria-hidden="true">
      {Array.from({ length: panels }, (_, i) => (
        <video
          key={i}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          // each panel fades in independently as its frame decodes: 1, then 2, then 3
          style={{ opacity: readyMask[i] ? 1 : 0, transition: "opacity 0.4s ease" }}
          onLoadedMetadata={(e) => {
            const el = e.currentTarget;
            if (el.duration && Number.isFinite(el.duration)) {
              // stagger each panel by a fixed fraction; all advance at 1x so
              // the offset between panels stays constant across loops
              el.currentTime = (i * el.duration) / panels;
            }
            el.play?.().catch(() => {});
          }}
          // panel 0 stays at t=0 (no seek fires) → use loadeddata; the rest
          // signal readiness once their seeked frame is decoded
          onLoadedData={() => { if (i === 0) mark(0); }}
          onSeeked={() => mark(i)}
        />
      ))}
    </span>
  );
}

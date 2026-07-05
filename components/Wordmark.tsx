/* "PortFolio®2" wordmark — PlayStation 2-logo homage (mixed-case word with a
   capital F, a CIRCULAR registered mark sitting at the baseline, and a cap-height
   "2"). Zrnic letterforms (Typodermic Fonts) converted to STATIC SVG OUTLINES — no
   font software embedded/shipped, so Zrnic's free *desktop* license is respected.
   The ® is built as a stroked circle + Zrnic "R" (Zrnic's own ® glyph is a rounded
   rectangle, so we draw a real circle instead). fill=currentColor; CSS sets color/
   opacity/glow per placement. Regenerate via scratchpad/gen3.py. */
export default function Wordmark({
  className,
  decorative,
}: {
  className?: string;
  /** When true, hide from assistive tech (use for repeat/watermark instances). */
  decorative?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="-20 -792 4243.0 875.0"
      xmlns="http://www.w3.org/2000/svg"
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": "Portfolio 2" })}
    >
      <g fill="currentColor">
        <path d="M472 -487C472 -664 439 -701 305 -701H50V0H155V-641H293C353 -641 369 -615 369 -489C369 -363 353 -339 293 -339H196V-280H305C439 -280 472 -310 472 -487ZM679 -555C559 -555 528 -509 528 -385V-170C528 -46 559 0 679 0H813C933 0 964 -46 964 -170V-385C964 -509 933 -555 813 -555ZM630 -389C630 -478 644 -495 715 -495H777C848 -495 862 -478 862 -389V-166C862 -77 848 -60 777 -60H715C644 -60 630 -77 630 -166ZM1052 -385V0H1154V-389C1154 -478 1168 -495 1239 -495H1307V-555H1203C1083 -555 1052 -509 1052 -385ZM1616 -555H1477V-701H1375V-134C1375 -58 1406 0 1502 0H1588V-60H1543C1491 -60 1477 -77 1477 -141V-495H1616ZM2019 -701H1678V0H1784V-319H1961V-378H1784V-641H2019ZM2217 -555C2097 -555 2066 -509 2066 -385V-170C2066 -46 2097 0 2217 0H2351C2471 0 2502 -46 2502 -170V-385C2502 -509 2471 -555 2351 -555ZM2168 -389C2168 -478 2182 -495 2253 -495H2315C2386 -495 2400 -478 2400 -389V-166C2400 -77 2386 -60 2315 -60H2253C2182 -60 2168 -77 2168 -166ZM2696 -721H2594V0H2696ZM2900 -555H2798V0H2900ZM2900 -722H2798V-626H2900ZM3145 -555C3025 -555 2994 -509 2994 -385V-170C2994 -46 3025 0 3145 0H3279C3399 0 3430 -46 3430 -170V-385C3430 -509 3399 -555 3279 -555ZM3096 -389C3096 -478 3110 -495 3181 -495H3243C3314 -495 3328 -478 3328 -389V-166C3328 -77 3314 -60 3243 -60H3181C3110 -60 3096 -77 3096 -166Z" />
        <circle cx="3592.0" cy="-116.0" r="116.0" fill="none" stroke="currentColor" strokeWidth="15" />
        <g transform="translate(3550.45 -60.2) scale(0.1592)"><path d="M471 -513C471 -647 426 -701 308 -701H50V0H155V-641H287C338 -641 365 -609 365 -503C365 -397 338 -364 287 -364H198V-305H285C340 -305 367 -272 367 -161V0H472V-161C472 -285 427 -319 381 -335C427 -348 471 -379 471 -513Z" /></g>
        <g transform="translate(3709.0 0)"><path d="M142 -187C142 -299 157 -329 245 -329H308C409 -329 444 -363 444 -523C444 -656 403 -701 290 -701H68V-641H265C320 -641 347 -616 347 -519C347 -427 336 -392 265 -392H214C73 -392 39 -340 39 -192V0H432V-60H142Z" /></g>
      </g>
    </svg>
  );
}

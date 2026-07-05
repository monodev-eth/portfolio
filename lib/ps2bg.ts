/*
 * ps2bg.ts — the WebGL atmosphere (three.js).
 *
 * TWO scenes share one renderer:
 *   BOOT — a fly-through of rising translucent GLASS data-blocks (lit edges) in the
 *          near-black void, with 7 glowing orbs ("Seven Stars") + a floor reflection.
 *   MENU — a full-screen fragment-shader port of the PS2 main-menu drifting dot-field
 *          (orbiting soft dots + fading trails on near-black), with a cursor light.
 *
 * Imported only via dynamic import() inside a client effect, so three never loads
 * during SSR. Returns an imperative API the Dashboard drives.
 */
import * as THREE from "three";

export interface PS2Api {
  startBoot: (cb?: () => void) => void;
  enterMenu: () => void;
  setMouse: (x: number, y: number, on?: number) => void;
  setAccent: (hex: string) => void;
  setPaused: (p: boolean) => void;
  ok: () => boolean;
  reduced: () => boolean;
  dispose: () => void;
}

interface Tower { up: THREE.Mesh; rf: THREE.Mesh; h: number; w: number; delay: number }

const BOOT_CAMERA_START_Z = 64;
const BOOT_CAMERA_END_Z = -76;

const COL = {
  voidc: 0x080a16,
  pillars: [0x274bff, 0x1aa7e0, 0x8fb0ff, 0x12407a],
  cyan: 0x16d6e6,
  white: 0xcfe0ff,
  orb: 0xbcd0ff,
};

export function initPS2(canvas: HTMLCanvasElement): PS2Api {
  let reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch {}

  let renderer: THREE.WebGLRenderer;
  let clock: THREE.Clock;
  let raf = 0;
  let mode: "idle" | "boot" | "menu" = "idle";
  let ok = false;

  // boot
  let bScene: THREE.Scene, bCam: THREE.PerspectiveCamera, bGroup: THREE.Group;
  let bTowerObjs: Tower[] = [];
  const bOrbs: THREE.Sprite[] = [];
  let bootT0 = 0;
  const bootDur = 3.0;

  // menu
  let mScene: THREE.Scene, mCam: THREE.OrthographicCamera, mMat: THREE.ShaderMaterial, mMesh: THREE.Mesh;
  let menuFade = 0;

  const mouse = { x: 0.5, y: 0.5, on: 0 };
  let paused = false;
  const accent = new THREE.Color(0x4f7cff);
  let accentTarget = new THREE.Color(0x4f7cff);

  const ar = () => window.innerWidth / Math.max(1, window.innerHeight);

  function hasWebGL() {
    try {
      const probe = document.createElement("canvas");
      return !!(probe.getContext("webgl2") || probe.getContext("webgl") || probe.getContext("experimental-webgl"));
    } catch {
      return false;
    }
  }

  function glowTexture(): THREE.CanvasTexture {
    const s = 128;
    const c = document.createElement("canvas");
    c.width = c.height = s;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0.0, "rgba(255,255,255,1)");
    grd.addColorStop(0.25, "rgba(190,205,255,0.85)");
    grd.addColorStop(0.6, "rgba(120,140,255,0.25)");
    grd.addColorStop(1.0, "rgba(80,100,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, s, s);
    return new THREE.CanvasTexture(c);
  }

  function buildBoot() {
    bScene = new THREE.Scene();
    bScene.background = new THREE.Color(COL.voidc);
    bScene.fog = new THREE.Fog(COL.voidc, 26, 120);

    bCam = new THREE.PerspectiveCamera(60, ar(), 0.1, 400);
    bCam.position.set(0, 5, BOOT_CAMERA_START_Z);
    bCam.lookAt(0, 7, -60);

    bGroup = new THREE.Group();
    bScene.add(bGroup);

    const cols = 11, rows = 8, spacing = 9.5;
    const geo = new THREE.BoxGeometry(1.0, 1, 1.0);
    geo.translate(0, 0.5, 0);
    const edgeGeo = new THREE.EdgesGeometry(geo);

    bTowerObjs = [];
    for (let r = 0; r < rows; r++) {
      for (let cc = 0; cc < cols; cc++) {
        const seed = Math.sin(cc * 12.9898 + r * 78.233) * 43758.5453;
        const rnd = seed - Math.floor(seed);
        if (rnd < 0.62) continue;
        const seed2 = Math.sin(cc * 31.7 + r * 11.13) * 24634.6345;
        const rnd2 = seed2 - Math.floor(seed2);
        const x = (cc - (cols - 1) / 2) * spacing + ((r % 2) * spacing) / 2;
        const z = -r * spacing + 14;
        const tall = rnd2 > 0.45;
        const h = tall ? 14 + rnd2 * 30 : 3 + rnd2 * 7;
        const w = tall ? 1.8 + rnd2 * 1.4 : 3.2 + rnd2 * 2.4;
        const faceHex = COL.pillars[(cc + r) % 4];
        const edgeHex = rnd2 > 0.6 ? COL.cyan : COL.white;

        const faceMat = new THREE.MeshBasicMaterial({ color: faceHex, transparent: true, opacity: 0.14, fog: true, depthWrite: false });
        const edgeMat = new THREE.LineBasicMaterial({ color: edgeHex, transparent: true, opacity: 0.5, fog: true });

        const up = new THREE.Mesh(geo, faceMat);
        up.position.set(x, 0, z);
        up.add(new THREE.LineSegments(edgeGeo, edgeMat));
        bGroup.add(up);

        const rf = new THREE.Mesh(geo, faceMat.clone());
        (rf.material as THREE.MeshBasicMaterial).opacity = 0.05;
        rf.position.set(x, 0, z);
        const rfEdge = new THREE.LineSegments(edgeGeo, edgeMat.clone());
        (rfEdge.material as THREE.LineBasicMaterial).opacity = 0.15;
        rf.add(rfEdge);
        rf.frustumCulled = false;
        rfEdge.frustumCulled = false;
        bGroup.add(rf);

        bTowerObjs.push({ up, rf, h, w, delay: r * 0.06 + rnd2 * 0.2 });
      }
    }

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(1600, 1600),
      new THREE.MeshBasicMaterial({ color: 0x0a1838, transparent: true, opacity: 0.4, fog: true, depthWrite: false })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.0;
    floor.renderOrder = -1; // draw first so it never depth-occludes the under-floor reflections
    bScene.add(floor);

    const tex = glowTexture();
    for (let k = 0; k < 7; k++) {
      const smat = new THREE.SpriteMaterial({
        map: tex,
        color: COL.orb,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        fog: false,
      });
      const sp = new THREE.Sprite(smat);
      sp.scale.set(9, 9, 1);
      bScene.add(sp);
      bOrbs.push(sp);
    }
  }

  const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function updateBoot(now: number) {
    const p = Math.min(1, (now - bootT0) / bootDur);
    const cz = THREE.MathUtils.lerp(BOOT_CAMERA_START_Z, BOOT_CAMERA_END_Z, Math.pow(p, 1.6)); // quicker start, still accelerates in
    bCam.position.set(Math.sin(now * 0.25) * 2.2, 4.5 + Math.sin(now * 0.5) * 0.6, cz);
    bCam.lookAt(0, 6, cz - 80);

    for (let i = 0; i < bTowerObjs.length; i++) {
      const to = bTowerObjs[i];
      const local = (p * bootDur - to.delay) / 0.9;
      const g = easeInOut(Math.max(0, Math.min(1, local)));
      const sy = Math.max(0.001, g * to.h);
      to.up.scale.set(to.w, sy, to.w);
      to.rf.scale.set(to.w, -sy, to.w);
    }

    for (let k = 0; k < bOrbs.length; k++) {
      const a = now * 0.55 + (k / 7) * Math.PI * 2;
      const rad = 26 + Math.sin(now * 0.4 + k) * 4;
      bOrbs[k].position.set(Math.cos(a) * rad, 20 + Math.sin(a * 1.3) * 8, cz - 70 + Math.sin(a) * 10);
      const sc = 7 + Math.sin(now * 2 + k) * 1.5;
      bOrbs[k].scale.set(sc, sc, 1);
    }
  }

  const VERT = `varying vec2 vUv;\nvoid main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

  const FRAG = [
    "precision highp float;",
    "varying vec2 vUv;",
    "uniform float uTime;",
    "uniform vec2 uRes;",
    "uniform vec2 uMouse;",
    "uniform float uMouseOn;",
    "uniform vec3 uAccent;",
    "uniform float uFade;",
    "mat3 rotX(float a){ float c=cos(a),s=sin(a); return mat3(1.,0.,0., 0.,c,-s, 0.,s,c); }",
    "mat3 rotY(float a){ float c=cos(a),s=sin(a); return mat3(c,0.,s, 0.,1.,0., -s,0.,c); }",
    "mat3 rotZ(float a){ float c=cos(a),s=sin(a); return mat3(c,-s,0., s,c,0., 0.,0.,1.); }",
    "vec2 dotsAt(vec2 uv, float t){",
    "  vec2 acc = vec2(0.0);",
    "  mat3 R = rotZ(t*0.30) * rotY(t*0.50) * rotX(t*0.40);",
    "  for(int k=0;k<8;k++){",
    "    float fk = float(k);",
    "    float ang = t*0.22 + fk/8.0*6.28318;",
    "    vec3 p = vec3(cos(ang)*0.62, sin(ang)*0.62, sin(ang*1.7)*0.30);",
    "    p = R * p;",
    "    vec2 pos = p.xy / (1.7 - p.z*0.6);",
    "    float d = length(uv - pos);",
    "    float pulse = 0.6 + 0.4*cos(t*1.1 - fk*0.6);",
    "    acc.x += exp(-d*34.0) * pulse;",
    "    acc.y += exp(-d*10.0) * pulse;",
    "  }",
    "  return acc;",
    "}",
    "vec2 trails(vec2 uv){",
    "  vec2 a  = dotsAt(uv, uTime);",
    "  a += dotsAt(uv, uTime-0.10)*0.5;",
    "  a += dotsAt(uv, uTime-0.24)*0.22;",
    "  return a;",
    "}",
    "void main(){",
    "  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / uRes.y;",
    "  vec2 a = trails(uv);",
    "  vec3 blue = vec3(0.22, 0.42, 0.95);",
    "  float center = clamp(1.0 - length(uv)*1.05, 0.0, 1.0);",
    "  vec3 col = mix(vec3(0.012,0.024,0.065), vec3(0.03,0.06,0.13), center);",
    "  col += blue * a.y * 0.26;",
    "  col += vec3(0.5,0.66,1.0) * a.x * 0.10;",
    "  col += uAccent * a.y * 0.05;",
    "  vec2 m = (uMouse*uRes - 0.5*uRes)/uRes.y;",
    "  float dl = length(uv - m);",
    "  col += mix(vec3(0.05,0.11,0.38), uAccent, 0.35) * exp(-dl*3.2) * 0.14 * uMouseOn;",
    "  float vig = clamp(1.0 - (length(uv)-0.32)*0.9, 0.0, 1.0);",
    "  col *= mix(0.6, 1.0, vig);",
    "  float gr = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233)))*43758.5453);",
    "  col += (gr-0.5)*0.012;",
    "  col *= uFade;",
    "  gl_FragColor = vec4(col, 1.0);",
    "}",
  ].join("\n");

  function buildMenu() {
    mScene = new THREE.Scene();
    mCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geo = new THREE.PlaneGeometry(2, 2);
    mMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uMouseOn: { value: 0 },
        uAccent: { value: accent },
        uFade: { value: 0 },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      depthTest: false,
      depthWrite: false,
    });
    mMesh = new THREE.Mesh(geo, mMat);
    mScene.add(mMesh);
  }

  function tick() {
    raf = requestAnimationFrame(tick);
    if (!ok || paused) return;
    const now = clock.getElapsedTime();
    if (mode === "boot") {
      updateBoot(now);
      renderer.render(bScene, bCam);
    } else if (mode === "menu") {
      accent.lerp(accentTarget, 0.06);
      const u = mMat.uniforms;
      u.uTime.value = reduce ? 4.0 : now;
      (u.uMouse.value as THREE.Vector2).set(mouse.x, mouse.y);
      u.uMouseOn.value += ((reduce ? 0 : mouse.on) - u.uMouseOn.value) * 0.08;
      menuFade += (1 - menuFade) * 0.04;
      u.uFade.value = menuFade < 0.999 ? menuFade : 1;
      renderer.render(mScene, mCam);
    }
  }

  function setSize() {
    if (!ok) return;
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    if (bCam) { bCam.aspect = ar(); bCam.updateProjectionMatrix(); }
    if (mMat) (mMat.uniforms.uRes.value as THREE.Vector2).set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
  }

  if (hasWebGL()) {
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      ok = true;
    } catch {
      ok = false;
    }
  }

  if (ok) {
    clock = new THREE.Clock();
    buildBoot();
    buildMenu();
    setSize();
    window.addEventListener("resize", setSize);
    tick();
  }

  return {
    startBoot(cb?: () => void) {
      if (!ok) { if (cb) cb(); return; }
      bootT0 = clock.getElapsedTime();
      mode = "boot";
    },
    enterMenu() {
      mode = "menu";
      if (ok) setSize();
    },
    setMouse(x, y, on) {
      mouse.x = x; mouse.y = y;
      if (typeof on === "number") mouse.on = on;
    },
    setAccent(hex) {
      try { accentTarget = new THREE.Color(hex); } catch {}
    },
    setPaused(p) { paused = !!p; },
    ok: () => ok,
    reduced: () => reduce,
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setSize);
      try { renderer.dispose(); } catch {}
    },
  };
}

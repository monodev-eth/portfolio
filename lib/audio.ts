/*
 * audio.ts — synthesized PS2 UI sound (WebAudio). No samples: a low ambient hum
 * bed + crisp navigation blips + a confirm/back tone + a startup boom.
 */
export interface AudioApi {
  setSound: (on: boolean) => void;
  isOn: () => boolean;
  navBlip: () => void;
  confirmBlip: () => void;
  backBlip: () => void;
  boom: () => void;
}

export function createAudio(): AudioApi {
  let actx: AudioContext | null = null;
  let hum: { master: GainNode; oscs: OscillatorNode[]; lfo: OscillatorNode } | null = null;
  let soundOn = false;

  function ensure(): AudioContext | null {
    if (actx) return actx;
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      actx = new Ctor();
    } catch {
      actx = null;
    }
    return actx;
  }

  function startHum() {
    if (!actx || hum) return;
    const master = actx.createGain();
    master.gain.value = 0;
    master.connect(actx.destination);
    const lp = actx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 380;
    lp.connect(master);
    const oscs = [55, 88, 132].map((f, i) => {
      const o = actx!.createOscillator();
      o.type = i === 2 ? "triangle" : "sine";
      o.frequency.value = f;
      const g = actx!.createGain();
      g.gain.value = 0.05 / (i + 1);
      o.connect(g);
      g.connect(lp);
      o.start();
      return o;
    });
    const lfo = actx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoG = actx.createGain();
    lfoG.gain.value = 0.02;
    lfo.connect(lfoG);
    lfoG.connect(master.gain);
    lfo.start();
    master.gain.setTargetAtTime(0.06, actx.currentTime, 1.2);
    hum = { master, oscs, lfo };
  }

  function stopHum() {
    if (!hum || !actx) return;
    const h = hum;
    hum = null;
    try {
      h.master.gain.setTargetAtTime(0, actx.currentTime, 0.3);
      setTimeout(() => {
        h.oscs.forEach((o) => {
          try { o.stop(); } catch {}
        });
        try { h.lfo.stop(); } catch {}
      }, 600);
    } catch {}
  }

  function blip(f1: number, f2: number, dur: number, vol: number, type: OscillatorType) {
    if (!soundOn || !actx) return;
    const t = actx.currentTime;
    const o = actx.createOscillator();
    o.type = type;
    const g = actx.createGain();
    o.frequency.setValueAtTime(f1, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(actx.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  return {
    setSound(on: boolean) {
      soundOn = on;
      if (on) {
        ensure();
        if (actx && actx.state === "suspended") actx.resume();
        startHum();
      } else {
        stopHum();
      }
    },
    isOn: () => soundOn,
    navBlip: () => blip(620, 880, 0.09, 0.05, "square"),
    confirmBlip: () => {
      blip(520, 0, 0.08, 0.06, "sine");
      setTimeout(() => blip(820, 0, 0.12, 0.06, "sine"), 70);
    },
    backBlip: () => blip(440, 240, 0.12, 0.05, "sine"),
    boom: () => {
      if (!soundOn || !actx) return;
      const t = actx.currentTime;
      const o = actx.createOscillator();
      o.type = "sawtooth";
      const g = actx.createGain();
      o.frequency.setValueAtTime(220, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.8);
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      o.connect(g);
      g.connect(actx.destination);
      o.start(t);
      o.stop(t + 1.0);
    },
  };
}

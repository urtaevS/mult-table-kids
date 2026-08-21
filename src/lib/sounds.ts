import { Preferences } from '@capacitor/preferences';

const AUDIO_KEY = 'mult-table-sound-enabled';
let muted = false;
let loaded = false;

let ctx: AudioContext | null = null;
let bgGain: GainNode | null = null;
let bgA: OscillatorNode | null = null;
let bgB: OscillatorNode | null = null;

function getCtx(): AudioContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!ctx) {
    ctx = new AC() as AudioContext;
  }
  if (ctx.state === 'suspended') {
    // must be called inside user gesture — caller is click handler, so sync resume works
    void ctx.resume();
  }
  return ctx;
}

export async function initSounds(): Promise<boolean> {
  try {
    const { value } = await Preferences.get({ key: AUDIO_KEY });
    if (value === '0') muted = true;
    else if (value === '1') muted = false;
    else {
      // fallback localStorage (Preferences web uses it but just in case)
      try {
        const ls = localStorage.getItem(AUDIO_KEY);
        if (ls === '0') muted = true;
      } catch { /* ignore */ }
    }
  } catch { muted = false; }
  loaded = true;
  return !muted;
}

export function isMuted() {
  return muted;
}

export async function setMuted(v: boolean) {
  muted = v;
  try {
    await Preferences.set({ key: AUDIO_KEY, value: v ? '0' : '1' });
  } catch { /* ignore */ }
  try {
    localStorage.setItem(AUDIO_KEY, v ? '0' : '1');
  } catch { /* ignore */ }
  if (muted) stopBg();
  else if (loaded) playBg();
}

function tone(freq: number, ms: number, type: OscillatorType = 'sine', gain = 0.22) {
  if (muted) return;
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(c.destination);
    const now = c.currentTime;
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + ms / 1000);
    o.start(now);
    o.stop(now + ms / 1000);
  } catch { /* ignore */ }
}

export function playCorrect() {
  // bright two-note chime
  tone(880, 160, 'sine', 0.26);
  setTimeout(() => tone(1108, 180, 'sine', 0.22), 110);
}

export function playWrong() {
  // buzzy down — much louder + harsher so it's clearly heard on phone speakers
  tone(220, 240, 'square', 0.22);
  setTimeout(() => tone(165, 360, 'sawtooth', 0.2), 150);
  // extra click
  setTimeout(() => tone(90, 120, 'square', 0.18), 260);
}

export function playTick() {
  tone(1200, 70, 'sine', 0.09);
}

export function playAchievement() {
  [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 260, 'sine', 0.18), i * 95));
}

export function playBg() {
  if (muted) return;
  if (bgA) return;
  try {
    const c = getCtx();
    bgGain = c.createGain();
    bgGain.gain.value = 0.0;
    bgGain.connect(c.destination);
    // gentle interval — G3 + B3, soft pad
    bgA = c.createOscillator();
    bgA.type = 'sine';
    bgA.frequency.value = 196;
    bgB = c.createOscillator();
    bgB.type = 'sine';
    bgB.frequency.value = 246.94;
    bgA.connect(bgGain);
    bgB.connect(bgGain);
    bgA.start();
    bgB.start();
    // fade in so not click
    bgGain.gain.linearRampToValueAtTime(0.032, c.currentTime + 0.9);
  } catch { /* ignore */ }
}

export function stopBg() {
  try {
    if (bgGain) {
      const c = ctx;
      if (c) bgGain.gain.linearRampToValueAtTime(0, c.currentTime + 0.25);
    }
  } catch { /* ignore */ }
  setTimeout(() => {
    try {
      bgA?.stop();
      bgB?.stop();
    } catch { /* ignore */ }
    bgA = null;
    bgB = null;
    bgGain = null;
  }, 300);
}

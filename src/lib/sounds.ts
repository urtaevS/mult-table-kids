import { Preferences } from '@capacitor/preferences';

const AUDIO_KEY = 'mult-table-sound-enabled';
let muted = false;
let loaded = false;

// ненавязчивый фон: тихий луп
let bgGain: GainNode | null = null;
let bgOscA: OscillatorNode | null = null;
let bgOscB: OscillatorNode | null = null;
let ctx: AudioContext | null = null;
function getCtx(): AudioContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!ctx) ctx = new AC() as AudioContext;
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export async function initSounds(): Promise<boolean> {
  try {
    const { value } = await Preferences.get({ key: AUDIO_KEY });
    muted = value === '0';
  } catch { muted = false; }
  loaded = true;
  return !muted;
}

export function isMuted() { return muted; }

export async function setMuted(v: boolean) {
  muted = v;
  try { await Preferences.set({ key: AUDIO_KEY, value: v ? '0' : '1' }); } catch { /* ignore */ }
  try { localStorage.setItem(AUDIO_KEY, v ? '0' : '1'); } catch { /* ignore */ }
  if (muted) stopBg();
  else if (loaded) playBg();
}

function tone(freq: number, ms: number, type: OscillatorType = 'sine', gain = 0.14) {
  if (muted) return;
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g); g.connect(c.destination);
    g.gain.setValueAtTime(gain, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + ms / 1000);
    o.start(); o.stop(c.currentTime + ms / 1000);
  } catch { /* ignore */ }
}

export function playCorrect() {
  tone(880, 140, 'sine', 0.18);
  setTimeout(() => tone(1100, 120, 'sine', 0.12), 90);
}

export function playWrong() {
  tone(180, 260, 'triangle', 0.14);
  setTimeout(() => tone(140, 320, 'triangle', 0.10), 120);
}

export function playAchievement() {
  [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 260, 'sine', 0.13), i * 90));
}

export function playBg() {
  if (muted) return;
  try {
    const c = getCtx();
    if (bgOscA) return; // уже играет
    bgGain = c.createGain();
    bgGain.gain.value = 0.015; // очень тихо
    bgGain.connect(c.destination);
    bgOscA = c.createOscillator(); bgOscA.type = 'sine'; bgOscA.frequency.value = 196; // G3
    bgOscB = c.createOscillator(); bgOscB.type = 'sine'; bgOscB.frequency.value = 246.94; // B3
    bgOscA.connect(bgGain); bgOscB.connect(bgGain);
    bgOscA.start(); bgOscB.start();
  } catch { /* ignore */ }
}

export function stopBg() {
  try { bgOscA?.stop(); bgOscB?.stop(); } catch { /* ignore */ }
  bgOscA = null; bgOscB = null;
  bgGain = null;
}

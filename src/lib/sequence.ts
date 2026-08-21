import { rnd, shuffle } from './utils';
import type { SequenceKind } from '../types';

export interface SequenceQuestion {
  display: string; // "2, 4, 6, 8, ?" or "2, 4, 7, 8 — лишнее?"
  answer: number;
  options: number[];
  hint?: string;
}

function progression(type: number): { seq: number[]; next: number; rule: string } {
  const start = rnd(1, 12);
  if (type === 0) { // +step
    const step = rnd(2, 6);
    const seq = Array.from({ length: 5 }, (_, i) => start + i * step);
    return { seq: seq.slice(0, 4), next: seq[4], rule: `+${step}` };
  }
  if (type === 1) { // *2
    const seq = [start, start * 2, start * 4, start * 8, start * 16].slice(0, 5);
    return { seq: seq.slice(0, 4), next: seq[4], rule: '×2' };
  }
  // чередование +2,+3
  const seq: number[] = [start];
  for (let i = 1; i < 5; i++) seq.push(seq[i - 1] + (i % 2 === 1 ? 2 : 3));
  return { seq: seq.slice(0, 4), next: seq[4], rule: '+2,+3' };
}

function makeOddOne(): { items: number[]; odd: number; rule: string } {
  // 4 числа по правилу + одно лишнее
  const step = rnd(2, 4);
  const base = rnd(2, 10);
  const good = Array.from({ length: 4 }, (_, i) => base + i * step);
  const odd = good[rnd(0, 3)] + rnd(1, 3) * (Math.random() < 0.5 ? 1 : -1) + step;
  // ensure odd not in progression and not duplicate
  let o = odd;
  let tries = 0;
  while ((good.includes(o) || o <= 0) && tries < 20) { o = base + rnd(0, 3) * step + rnd(1, 5); tries++; }
  const items = shuffle([...good.slice(0, 3), o, good[3]]);
  // place odd randomly
  return { items: shuffle([...good.slice(0, 2), o, ...good.slice(2)]).slice(0, 5), odd: o, rule: `шаг ${step}` };
}

export function makeSequenceQuestion(kind: SequenceKind, last?: SequenceQuestion): SequenceQuestion {
  let k: SequenceKind = kind;
  // kind is passed explicitly; for mix not used here (Screen has kind)
  if (k === 'next') {
    const t = rnd(0, 2);
    const { seq, next } = progression(t);
    const wrongs = new Set<number>();
    for (const d of shuffle([1, -1, 2, -2, 5, -5, 10, -10])) {
      if (wrongs.size === 3) break;
      const c = next + d; if (c > 0 && c !== next) wrongs.add(c);
    }
    while (wrongs.size < 3) { const c = next + rnd(-10, 10); if (c > 0 && c !== next) wrongs.add(c); }
    const display = seq.join(', ') + ', ?';
    if (last && last.display === display) return makeSequenceQuestion(kind, undefined);
    return { display, answer: next, options: shuffle([next, ...wrongs]) };
  } else {
    const { items, odd } = makeOddOne();
    const wrongs = items.filter(v => v !== odd).slice(0, 3);
    // ensure 4 options: odd + 3 non-odd
    const opts = shuffle([odd, ...wrongs]);
    const display = items.join(', ');
    if (last && last.display === display) return makeSequenceQuestion(kind, undefined);
    return { display, answer: odd, options: opts, hint: 'Найди лишнее' };
  }
}

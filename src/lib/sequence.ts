import { rnd, shuffle } from './utils';
import type { SequenceKind } from '../types';

export interface SequenceQuestion {
  display: string; // "2, 4, 6, 8, ?" or "2, 4, 7, 8 — лишнее?"
  answer: number;
  options: number[];
  hint?: string;
}

export function explainSequence(kind: SequenceKind, question: SequenceQuestion): string {
  if (kind === 'odd') return `Лишнее ${question.answer} — не подходит под шаг ряда`;
  // next / gap: infer step from question
  return `Правило: продолжи ряд → ${question.answer}`;
}

function progression(type: number): { seq: number[]; next: number; rule: string } {
  if (type === 0) { // +step
    const start = rnd(1, 12), step = rnd(2, 6);
    const seq = Array.from({ length: 5 }, (_, i) => start + i * step);
    return { seq: seq.slice(0, 4), next: seq[4], rule: `+${step}` };
  }
  if (type === 1) { // *2
    const seq = [1 + rnd(0, 4), 0, 0, 0, 0]; // replaced below
    const start = 2 + rnd(0, 4);
    const s = [start, start * 2, start * 4, start * 8, start * 16].slice(0, 5);
    return { seq: s.slice(0, 4), next: s[4], rule: '×2' };
  }
  if (type === 2) { // +2,+3 alternation
    const start = rnd(1, 10);
    const seq: number[] = [start];
    for (let i = 1; i < 5; i++) seq.push(seq[i - 1] + (i % 2 === 1 ? 2 : 3));
    return { seq: seq.slice(0, 4), next: seq[4], rule: '+2,+3' };
  }
  if (type === 3) { // +1,+2  — 5, 6, 8, 9, 11...
    const start = rnd(3, 10);
    const pat: number[] = [1, 2];
    const seq: number[] = [start];
    for (let i = 1; i < 5; i++) seq.push(seq[i - 1] + pat[(i - 1) % 2]);
    return { seq: seq.slice(0, 4), next: seq[4], rule: '+1,+2' };
  }
  if (type === 4) { // +3,-1  — 10,13,12,15,14,17...
    const start = rnd(8, 15);
    const seq: number[] = [start];
    for (let i = 1; i < 5; i++) seq.push(seq[i - 1] + (i % 2 === 1 ? 3 : -1));
    return { seq: seq.slice(0, 4), next: seq[4], rule: '+3,−1' };
  }
  if (type === 5) { // ×2,+3  — 2,4,7,14,17,34...
    const start = rnd(1, 5);
    const seq: number[] = [start];
    for (let i = 1; i < 5; i++) seq.push(i % 2 === 1 ? seq[i - 1] * 2 : seq[i - 1] + 3);
    return { seq: seq.slice(0, 4), next: seq[4], rule: '×2,+3' };
  }
  if (type === 6) { // разница растёт +1  — 2,4,7,11,16...
    const start = rnd(1, 6);
    let d = rnd(2, 3), cur = start;
    const seq: number[] = [cur];
    for (let i = 1; i < 5; i++) { cur += d; d += 1; seq.push(cur); }
    return { seq: seq.slice(0, 4), next: seq[4], rule: '+2,+3,+4…' };
  }
  if (type === 7) { // разница растёт +2  — 1,3,7,13,21,31...
    const start = rnd(1, 4);
    let d = 2, cur = start;
    const seq: number[] = [cur];
    for (let i = 1; i < 5; i++) { cur += d; d += 2; seq.push(cur); }
    return { seq: seq.slice(0, 4), next: seq[4], rule: '+2,+4,+6…' };
  }
  if (type === 8) { // разница уменьшается −5,−4,−3... — 30,25,21,18,16,15...
    const start = rnd(28, 35);
    let d = -5, cur = start;
    const seq: number[] = [cur];
    for (let i = 1; i < 5; i++) { cur += d; d += 1; seq.push(cur); }
    return { seq: seq.slice(0, 4), next: seq[4], rule: '−5,−4,−3…' };
  }
  if (type === 9) { // ×3
    const start = 1 + rnd(0, 2);
    const seq = [start, start * 3, start * 9, start * 27, start * 81].slice(0, 5);
    return { seq: seq.slice(0, 4), next: seq[4], rule: '×3' };
  }
  if (type === 10) { // ×4
    const start = 2 + rnd(0, 1);
    const seq = [start, start * 4, start * 16, start * 64, start * 256].slice(0, 5);
    return { seq: seq.slice(0, 4), next: seq[4], rule: '×4' };
  }
  if (type === 11) { // ÷2 — 64,32,16,8,4...
    const start = 32 * (2 + rnd(0, 2)); // 64,96,128
    const seq: number[] = [start];
    for (let i = 1; i < 5; i++) seq.push(Math.floor(seq[i - 1] / 2));
    return { seq: seq.slice(0, 4), next: seq[4], rule: '÷2' };
  }
  // комбинированная ×2,÷2 — 3,6,3,6,3,6...
  const start = 2 + rnd(0, 4);
  const seq: number[] = [start];
  for (let i = 1; i < 5; i++) seq.push(i % 2 === 1 ? seq[i - 1] * 2 : Math.floor(seq[i - 1] / 2));
  return { seq: seq.slice(0, 4), next: seq[4], rule: '×2,÷2' };
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
  // hidden kinds: gap/mix
  let k: SequenceKind = kind as SequenceKind;
  if ((k as string) === 'mix') {
    const r = rnd(0, 2);
    k = (r === 0 ? 'next' : r === 1 ? 'odd' : 'gap') as SequenceKind;
  }
  if ((k as string) === 'gap') {
    // 2, 4, ?, 8  — missing middle
    const type = rnd(0,1);
    if (type === 0) {
      const step = rnd(2,4), start = rnd(1,10);
      const seq = Array.from({length:4}, (_,i)=> start + i*step);
      const idx = rnd(1,2); // hide 1 or 2
      const ans = seq[idx];
      const display = seq.map((v,i)=> i===idx?'?':String(v)).join(', ');
      const wrongs = new Set<number>();
      for(const d of shuffle([1,-1,2,-2])){ if(wrongs.size===3) break; const c=ans+d; if(c>0&&c!==ans) wrongs.add(c); }
      while(wrongs.size<3){ const c=ans+rnd(-8,8); if(c>0&&c!==ans) wrongs.add(c); }
      if(last && last.display===display) return makeSequenceQuestion('gap' as SequenceKind, undefined);
      return { display, answer: ans, options: shuffle([ans, ...wrongs]), hint: 'Вставь пропущенное' };
    } else {
      return makeSequenceQuestion('next', last);
    }
  }
  if (k === 'next') {
    const t = rnd(0, 12);
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

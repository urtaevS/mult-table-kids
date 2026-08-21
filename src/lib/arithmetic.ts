import { rnd, shuffle } from './utils';
import type { ArithmeticOp } from '../types';

export interface ArithQuestion { text: string; answer: number; options: number[] }

export function makeArithmeticQuestion(op: ArithmeticOp, last?: ArithQuestion): ArithQuestion {
  let kind: 'add' | 'sub' = op === 'mix' ? (Math.random() < 0.5 ? 'add' : 'sub') : op;
  let a: number, b: number, ans: number, text: string;
  if (kind === 'add') {
    a = rnd(11, 89); b = rnd(2, 89); if (a + b > 100) { a = rnd(10, 50); b = rnd(2, 100 - a); }
    ans = a + b; text = `${a} + ${b}`;
  } else {
    a = rnd(20, 100); b = rnd(2, a - 1); ans = a - b; text = `${a} − ${b}`;
  }
  if (last && last.text === text) return makeArithmeticQuestion(op, undefined);

  const wrongs = new Set<number>();
  for (const d of shuffle([1, -1, 2, -2, 10, -10, 5, -5])) {
    if (wrongs.size === 3) break;
    const c = ans + d; if (c >= 0 && c <= 100 && c !== ans) wrongs.add(c);
  }
  while (wrongs.size < 3) { const c = ans + rnd(-12, 12); if (c >= 0 && c <= 100 && c !== ans) wrongs.add(c); }
  return { text: `${text} = ?`, answer: ans, options: shuffle([ans, ...wrongs]) };
}

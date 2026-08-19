import { rnd, shuffle } from './utils';

export interface Question { a: number; b: number; answer: number; options: number[] }

export function makeQuestion(table?: number, last?: Question): Question {
  const a = table ?? rnd(2, 10);
  let b = rnd(2, 10);
  if (last && last.a === a && last.b === b) b = (b % 8) + 2;
  const answer = a * b;

  const wrongs = new Set<number>();
  const candidates = shuffle([
    answer + a, answer - a, answer + b, answer - b,
    answer + 10, answer - 10, answer + 1, answer - 1, answer + 2, answer - 2,
  ]);
  for (const c of candidates) {
    if (wrongs.size === 3) break;
    if (c > 0 && c !== answer) wrongs.add(c);
  }
  while (wrongs.size < 3) {
    const c = answer + rnd(-12, 12);
    if (c > 0 && c !== answer) wrongs.add(c);
  }
  return { a, b, answer, options: shuffle([answer, ...wrongs]) };
}
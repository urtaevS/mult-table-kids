import { rnd, shuffle } from './utils';
import type { MissingOp } from '../types';

export interface MissingQuestion { text: string; answer: number; options: number[] }

export function makeMissingQuestion(op: MissingOp, last?: MissingQuestion): MissingQuestion {
  let kind: 'mul'|'div'|'add'|'sub' = op === 'mix' ? (['mul','div','add','sub'] as const)[rnd(0,3)] : op;
  let text: string, ans: number;
  if (kind === 'mul') {
    const a = rnd(2,10), b = rnd(2,10); ans = a*b;
    const pat = rnd(0,2); // 0: a×?=ans, 1: ?×b=ans, 2: a×b=?
    text = pat===0 ? `${a} × ? = ${ans}` : pat===1 ? `? × ${b} = ${ans}` : `${a} × ${b} = ?`;
    if (pat!==2) ans = pat===0 ? b : a; // answer is missing factor
    else { /* ans stays product */ }
    // normalize: for pat 2, question is product; otherwise factor
  } else if (kind === 'div') {
    const b = rnd(2,10), ans2 = rnd(2,10); const a = b*ans2; // divisible
    const pat = rnd(0,2);
    if (pat===0) { text = `${a} ÷ ? = ${ans2}`; ans = b; }
    else if (pat===1) { text = `? ÷ ${b} = ${ans2}`; ans = a; }
    else { text = `${a} ÷ ${b} = ?`; ans = ans2; }
  } else if (kind === 'add') {
    const a = rnd(10,60), b = rnd(5,40); const s=a+b; const pat=rnd(0,2);
    if (pat===0) { text = `${a} + ? = ${s}`; ans=b; }
    else if (pat===1) { text = `? + ${b} = ${s}`; ans=a; }
    else { text = `${a} + ${b} = ?`; ans=s; }
  } else { // sub
    const a = rnd(30,100), b = rnd(5, a-5); const d=a-b; const pat=rnd(0,2);
    if (pat===0) { text = `${a} − ? = ${d}`; ans=b; }
    else if (pat===1) { text = `? − ${b} = ${d}`; ans=a; }
    else { text = `${a} − ${b} = ?`; ans=d; }
  }
  if (last && last.text === text) return makeMissingQuestion(op, undefined);
  const wrongs = new Set<number>();
  for (const delta of shuffle([1,-1,2,-2,10,-10,5,-5])) {
    if (wrongs.size===3) break;
    const c = ans + delta; if (c>=0 && c!==ans && c<=200) wrongs.add(c);
  }
  while (wrongs.size<3) { const c=ans+rnd(-12,12); if(c>=0&&c!==ans&&c<=200) wrongs.add(c); }
  return { text, answer: ans, options: shuffle([ans, ...wrongs]) };
}

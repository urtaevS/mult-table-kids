import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import BigButton from '../components/BigButton';
import Confetti from '../components/Confetti';
import Mascot from '../components/Mascot';
import ProgressBar from '../components/ProgressBar';
import { makeQuestion, type Question } from '../lib/quiz';
import { OPT_STYLES } from '../lib/styles';
import { playCorrect, playTick, playWrong } from '../lib/sounds';
import type { Screen, TimeDifficulty } from '../types';

const DIFFS: { id: TimeDifficulty; label: string; desc: string; secs: number; color: string }[] = [
  { id: 'easy',   label: 'Легко',   desc: '×2–×5 · 60 сек',  secs: 60, color: 'mint' },
  { id: 'medium', label: 'Средне',  desc: '×2–×10 · 60 сек', secs: 60, color: 'sun' },
  { id: 'hard',   label: 'Сложно',  desc: '×6–×10 · 45 сек', secs: 45, color: 'coral' },
];

function pickTable(d: TimeDifficulty): number {
  if (d === 'easy') return 2 + Math.floor(Math.random() * 4);   // 2-5
  if (d === 'hard') return 6 + Math.floor(Math.random() * 5);   // 6-10
  return 2 + Math.floor(Math.random() * 9); // 2-10
}

interface Props {
  difficulty?: TimeDifficulty;
  recordAnswer: (t: number, correct: boolean, reward?: boolean) => void;
  finishTimeAttack: (d: TimeDifficulty, score: number) => void;
  go: (s: Screen) => void;
}

export default function TimeAttackScreen({ difficulty, recordAnswer, finishTimeAttack, go }: Props) {
  const [diff, setDiff] = useState<TimeDifficulty | null>(difficulty ?? null);
  const [phase, setPhase] = useState<'pick' | 'play' | 'done'>('pick');
  const [q, setQ] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [secs, setSecs] = useState(60);
  const [fb, setFb] = useState<'ask' | 'ok' | 'bad'>('ask');
  const [picked, setPicked] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);
  const timerRef = useRef<number | undefined>(undefined);
  const tickRef = useRef<number | undefined>(undefined);
  const msgRef = useRef(0);

  const cur = DIFFS.find(d => d.id === diff);

  const nextQ = (d: TimeDifficulty) => {
    const qq = makeQuestion(pickTable(d));
    setQ(qq); setFb('ask'); setPicked(null);
  };

  const start = (d: TimeDifficulty) => {
    setDiff(d);
    const secs0 = DIFFS.find(x => x.id === d)!.secs;
    setScore(0); setSecs(secs0); setPhase('play');
    // таймер
    tickRef.current = window.setInterval(() => setSecs(s => { if (s <= 1) { return 0; } return s - 1; }), 1000);
    nextQ(d);
  };

  useEffect(() => {
    if (phase !== 'play') return;
    if (secs > 0 && secs <= 10) playTick();
    if (secs === 0) {
      window.clearInterval(tickRef.current);
      window.clearTimeout(timerRef.current);
      if (diff) finishTimeAttack(diff, score);
      setPhase('done');
    }
  }, [secs, phase, diff, score, finishTimeAttack]);

  useEffect(() => () => { window.clearInterval(tickRef.current); window.clearTimeout(timerRef.current); }, []);

  // автоподбор уровня если пришёл без diff
  if (phase === 'pick' && diff && !cur) setDiff(null);
  if (phase === 'pick' && diff && cur) {
    // пришёл с уровнем — сразу старт
    // defer to avoid render loop
    setTimeout(() => start(diff), 0);
  }

  const answer = (opt: number) => {
    if (fb !== 'ask' || !q) return;
    const ok = opt === q.answer;
    recordAnswer(q.a, ok);
    if (ok) { playCorrect(); setBurst(b => b + 1); setScore(s => s + 1); } else playWrong();
    setPicked(opt); setFb(ok ? 'ok' : 'bad'); msgRef.current += 1;
    timerRef.current = window.setTimeout(() => { if (diff) nextQ(diff); }, ok ? 450 : 900);
  };

  if (phase === 'pick') {
    return (
      <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-8">
        <button type="button" onClick={() => go({ name: 'home' })} className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5">
          <ArrowLeft size={24} strokeWidth={2.8} />
        </button>
        <h1 className="mt-4 font-display text-2xl font-bold">⏱️ На время</h1>
        <p className="mt-1.5 text-[15px] font-extrabold text-[#8d84a3]">Примеры вперемешку — сколько успеешь за время?</p>
        <div className="mt-6 space-y-3">
          {DIFFS.map(d => (
            <button
              key={d.id}
              type="button"
              onClick={() => start(d.id)}
              className={`flex w-full items-center gap-3 rounded-3xl px-4 py-4 text-left font-extrabold shadow-[0_6px_0_#f0e7d6] transition active:translate-y-1 ${
                d.color === 'mint' ? 'bg-mint-soft text-[#0d7a4e] shadow-mint/30' :
                d.color === 'sun' ? 'bg-sun-soft text-[#7a5a00]' : 'bg-coral-soft text-[#8e2b1f]'
              }`}
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/60 text-xl">{d.id === 'easy' ? '🌿' : d.id === 'medium' ? '⚡' : '🔥'}</span>
              <span className="flex-1">
                <span className="block text-lg leading-none">{d.label}</span>
                <span className="block text-xs opacity-70">{d.desc}</span>
              </span>
              <span className="rounded-full bg-white px-3 py-1.5 text-sm">Играть →</span>
            </button>
          ))}
        </div>
      </main>
    );
  }

  if (phase === 'done') {
    return (
      <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-10 text-center">
        {score >= 10 && <div className="pointer-events-none absolute inset-x-0 top-6 h-40"><Confetti burst={1} /></div>}
        <div className="animate-pop-in rounded-blob bg-white p-6 shadow-[0_6px_0_#f0e7d6]">
          <div className="text-6xl">{score >= 15 ? '🏆' : score >= 8 ? '🎉' : '💪'}</div>
          <h1 className="mt-2 font-display text-2xl font-bold">{score >= 10 ? 'Отлично!' : score >= 5 ? 'Неплохо!' : 'Ещё разок?'}</h1>
          <p className="mt-1 text-lg font-extrabold text-[#8d84a3]">{score} правильных за {cur?.secs ?? 60} сек</p>
          <p className="mt-2 rounded-full bg-sun-soft px-4 py-1 text-sm font-extrabold text-[#7a5a00]">+{score} ⭐</p>
        </div>
        <div className="mt-6 space-y-3">
          <BigButton color="mint" className="h-16 w-full text-xl" onClick={() => cur && start(cur.id)}>🔄 Ещё раз</BigButton>
          <BigButton color="white" className="h-14 w-full" onClick={() => go({ name: 'home' })}>🏠 На главную</BigButton>
          <button type="button" onClick={() => { setPhase('pick'); setDiff(null); }} className="w-full rounded-2xl py-3 font-extrabold text-[#8d84a3]">Сменить уровень</button>
        </div>
      </main>
    );
  }

  if (!q) return null;
  const pct = ((cur ? cur.secs - secs : 0) / (cur?.secs ?? 60)) * 100;

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-5">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => { window.clearInterval(tickRef.current); setPhase('pick'); setDiff(null); }} className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5">
          <ArrowLeft size={24} strokeWidth={2.8} />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm font-extrabold">
            <span className={secs <= 10 ? 'text-coral animate-pulse' : 'text-[#8d84a3]'}>⏱️ {secs} сек</span>
            <span>⭐ {score}</span>
          </div>
          <ProgressBar value={pct} />
        </div>
      </div>

      <div className="relative mt-5 rounded-blob bg-white p-7 text-center shadow-[0_6px_0_#f0e7d6]">
        <div className="font-display text-[42px] font-bold leading-none">
          {q.a} × {q.b} = {fb === 'ask' ? '?' : <span className={fb === 'ok' ? 'text-mint-dark' : 'text-[#c07a2a]'}>{q.answer}</span>}
        </div>
        {fb === 'ok' && <div className="pointer-events-none absolute inset-0 grid place-items-center"><span className="animate-star-rise text-6xl">⭐</span></div>}
        <Confetti burst={burst} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {q.options.map((opt, i) => {
          let cls = OPT_STYLES[i];
          if (fb === 'ok') cls = opt === q.answer ? 'bg-mint text-white shadow-[0_6px_0_#22a76b] scale-[1.04]' : `${OPT_STYLES[i]} opacity-40`;
          else if (fb === 'bad') {
            if (opt === q.answer) cls = 'bg-mint text-white shadow-[0_6px_0_#22a76b]';
            else if (opt === picked) cls = 'animate-shake bg-[#ffe8d1] text-[#c07a2a] shadow-[0_6px_0_#f2d5b2]';
            else cls = `${OPT_STYLES[i]} opacity-40`;
          }
          return <button key={opt + '-' + i} type="button" onClick={() => answer(opt)} disabled={fb !== 'ask'} className={`h-[68px] rounded-3xl text-[26px] font-extrabold transition-all duration-150 active:translate-y-1 ${cls}`}>{opt}</button>;
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <Mascot emoji={fb === 'ok' ? '🥳' : fb === 'bad' ? '🤗' : '⏱️'} message={fb === 'ok' ? 'Так держать!' : fb === 'bad' ? `Ответ: ${q.a} × ${q.b} = ${q.answer}` : 'Успей больше!'} />
      </div>
    </main>
  );
}

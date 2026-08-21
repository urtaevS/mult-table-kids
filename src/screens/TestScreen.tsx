import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, RotateCcw, Star } from 'lucide-react';
import { playCorrect, playWrong } from '../lib/sounds';
import BigButton from '../components/BigButton';
import Confetti from '../components/Confetti';
import ProgressBar from '../components/ProgressBar';
import { makeQuestion, type Question } from '../lib/quiz';
import { OPT_STYLES } from '../lib/styles';
import { rnd, shuffle } from '../lib/utils';
import type { Screen } from '../types';

function buildTest(): Question[] {
  const tables = shuffle([...Array.from({ length: 9 }, (_, i) => i + 2), rnd(2, 10)]);
  return tables.map(t => makeQuestion(t));
}

interface Props {
  recordAnswer: (t: number, correct: boolean, reward?: boolean) => void;
  finishTest: (score: number) => void;
  go: (s: Screen) => void;
}

export default function TestScreen({ recordAnswer, finishTest, go }: Props) {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'done'>('intro');
  const [qs, setQs] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState<'ask' | 'correct' | 'wrong'>('ask');
  const [picked, setPicked] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const start = () => {
    setQs(buildTest()); setIdx(0); setScore(0);
    setFb('ask'); setPicked(null); setBurst(0); setPhase('quiz');
  };

  const answer = (opt: number) => {
    if (fb !== 'ask' || !qs[idx]) return;
    const q = qs[idx];
    const ok = opt === q.answer;
    recordAnswer(q.a, ok, false);
    if (ok) playCorrect(); else playWrong();
    setPicked(opt);
    setFb(ok ? 'correct' : 'wrong');
    const newScore = score + (ok ? 1 : 0);
    if (ok) { setScore(newScore); setBurst(b => b + 1); }
    timer.current = window.setTimeout(() => {
      if (idx === qs.length - 1) { finishTest(newScore); setPhase('done'); }
      else { setIdx(i => i + 1); setFb('ask'); setPicked(null); }
    }, ok ? 850 : 1600);
  };

  if (phase === 'intro') {
    return (
      <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-12 text-center">
        <div className="animate-float text-7xl">🧑‍🚀</div>
        <h1 className="mt-4 font-display text-2xl font-bold">Быстрый тест</h1>
        <p className="mt-2 text-lg font-extrabold text-[#8d84a3]">
          10 вопросов из всех таблиц.<br />За каждый верный ответ — ⭐!
        </p>
        <BigButton color="sun" className="mt-8 h-16 w-full text-xl" onClick={start}>🚀 Начать!</BigButton>
        <button type="button" onClick={() => go({ name: 'home' })} className="mt-3 h-12 w-full rounded-2xl font-extrabold text-[#8d84a3]">
          Назад
        </button>
      </main>
    );
  }

  if (phase === 'done') {
    const title = score === 10 ? 'Идеально! 🤩' : score >= 8 ? 'Отлично! 🎉' : score >= 5 ? 'Хорошо! 👍' : 'Потренируемся ещё! 💪';
    return (
      <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-8">
        {score >= 8 && (
          <div className="pointer-events-none absolute inset-x-0 top-6 h-44">
            <Confetti burst={1} />
          </div>
        )}
        <div className="animate-pop-in rounded-blob bg-white p-6 text-center shadow-[0_6px_0_#f0e7d6]">
          <div className="text-6xl">{score >= 8 ? '🎉' : score >= 5 ? '🙌' : '🤗'}</div>
          <h1 className="mt-2 font-display text-2xl font-bold">{title}</h1>
          <p className="mt-1.5 text-lg font-extrabold text-[#8d84a3]">{score} / 10 правильных</p>
          <div className="mt-4 flex flex-wrap justify-center gap-1">
            {Array.from({ length: 10 }, (_, i) => (
              <Star
                key={i}
                size={26}
                className={`animate-pop-in ${i < score ? 'fill-sun text-sun' : 'fill-[#efe7d6] text-[#e5dac4]'}`}
                style={{ animationDelay: `${i * 70}ms` }}
              />
            ))}
          </div>
          <p className="mt-4 inline-block rounded-full bg-sun-soft px-4 py-1.5 font-extrabold text-[#a8770a]">+{score} ⭐</p>
        </div>
        <div className="mt-6 space-y-3">
          <BigButton color="mint" className="flex h-16 w-full items-center justify-center gap-2 text-xl" onClick={start}>
            <RotateCcw size={22} strokeWidth={2.8} /> Попробовать ещё раз
          </BigButton>
          <BigButton color="white" className="h-14 w-full text-lg" onClick={() => go({ name: 'home' })}>🏠 На главную</BigButton>
        </div>
      </main>
    );
  }

  const q = qs[idx];
  if (!q) return null;

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-5">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => go({ name: 'home' })}
          aria-label="Выйти"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5"
        >
          <ArrowLeft size={24} strokeWidth={2.8} />
        </button>
        <div className="flex-1">
          <div className="mb-1.5 flex items-center justify-between text-sm font-extrabold text-[#8d84a3]">
            <span>Вопрос {idx + 1} из 10</span>
            <span>⭐ {score}</span>
          </div>
          <ProgressBar value={(idx / 10) * 100} />
        </div>
      </div>

      <div className="relative mt-5 rounded-blob bg-white p-7 text-center shadow-[0_6px_0_#f0e7d6]">
        <div className="font-display text-[42px] font-bold leading-none">
          {q.a} × {q.b} = {fb === 'ask' ? '?' : <span className={fb === 'correct' ? 'text-mint-dark' : 'text-[#c07a2a]'}>{q.answer}</span>}
        </div>
        {fb === 'correct' && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="animate-star-rise text-6xl">⭐</span>
          </div>
        )}
        <Confetti burst={burst} />
      </div>
      {fb === 'wrong' && (
        <p className="mt-3 text-center font-extrabold text-[#c07a2a]">Запомни: {q.a} × {q.b} = {q.answer} 🙂</p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        {q.options.map((opt, i) => {
          let cls = OPT_STYLES[i];
          if (fb === 'correct') {
            cls = opt === q.answer
              ? 'bg-mint text-white shadow-[0_6px_0_#22a76b] scale-[1.04]'
              : `${OPT_STYLES[i]} opacity-40`;
          } else if (fb === 'wrong') {
            if (opt === q.answer) cls = 'bg-mint text-white shadow-[0_6px_0_#22a76b]';
            else if (opt === picked) cls = 'animate-shake bg-[#ffe8d1] text-[#c07a2a] shadow-[0_6px_0_#f2d5b2]';
            else cls = `${OPT_STYLES[i]} opacity-40`;
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => answer(opt)}
              disabled={fb !== 'ask'}
              className={`h-[68px] rounded-3xl text-[26px] font-extrabold transition-all duration-150 active:translate-y-1 ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </main>
  );
}
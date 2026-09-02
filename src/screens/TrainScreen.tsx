import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { playCorrect, playWrong } from '../lib/sounds';
import BigButton from '../components/BigButton';
import Confetti from '../components/Confetti';
import Mascot from '../components/Mascot';
import { makeQuestion, type Question } from '../lib/quiz';
import { OPT_STYLES } from '../lib/styles';
import type { Progress, Screen } from '../types';

const PRAISE = ['Молодец! 🎉', 'Супер! ⭐', 'Точно в цель! 🎯', 'Класс! 🚀', 'Так держать! 🔥', 'Верно! 🤩'];
const SUPPORT = ['Ничего! Запомни и попробуй ещё 💪', 'Почти! Смотри, как правильно 👀', 'Бывает! Повторим ещё раз 🍀'];

interface Props {
  progress: Progress;
  table?: number;
  recordAnswer: (t: number, correct: boolean, reward?: boolean) => void;
  go: (s: Screen) => void;
}

type Diff = 'easy' | 'hard';
const DIFF_TABLES: Record<Diff, number[]> = { easy: [2, 3, 4, 5], hard: [2, 3, 4, 5, 6, 7, 8, 9, 10] };

export default function TrainScreen({ progress, table, recordAnswer, go }: Props) {
  const diffRef = useRef<Diff>('hard');
  const windowRef = useRef<boolean[]>([]);
  const [q, setQ] = useState<Question>(() => makeQuestion(table ?? DIFF_TABLES[diffRef.current][Math.floor(Math.random()*DIFF_TABLES[diffRef.current].length)]));
  const [phase, setPhase] = useState<'ask' | 'correct' | 'wrong'>('ask');
  const [picked, setPicked] = useState<number | null>(null);
  const [burst, setBurst] = useState(0);
  const [msg, setMsg] = useState('Сколько будет? 🤔');
  const [sessionStars, setSessionStars] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const pickTable = (): number | undefined => {
    if (table) return table;
    const pool = DIFF_TABLES[diffRef.current];
    return pool[Math.floor(Math.random()*pool.length)];
  };

  const nextQuestion = () => {
    setQ(makeQuestion(pickTable()));
    setPhase('ask'); setPicked(null); setMsg('Сколько будет? 🤔');
  };

  const answer = (opt: number) => {
    if (phase !== 'ask') return;
    const ok = opt === q.answer;
    recordAnswer(q.a, ok);
    // адаптивная сложность для общего режима (без конкретной таблицы, вперемешку): <40% → easy, иначе hard
    if (!table) {
      windowRef.current.push(ok);
      if (windowRef.current.length > 10) windowRef.current.shift();
      if (windowRef.current.length >= 5) {
        const rate = windowRef.current.filter(Boolean).length / windowRef.current.length;
        if (rate < 0.4) diffRef.current = 'easy';
        else if (rate >= 0.6) diffRef.current = 'hard';
      }
    }
    if (ok) { playCorrect(); } else { playWrong(); }
    if (ok) {
      setPhase('correct'); setBurst(b => b + 1); setSessionStars(s => s + 1);
      setMsg(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      timer.current = window.setTimeout(nextQuestion, 1100);
    } else {
      setPhase('wrong'); setPicked(opt);
      setMsg(SUPPORT[Math.floor(Math.random() * SUPPORT.length)]);
    }
  };

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-5">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => go(table ? { name: 'table', table } : { name: 'home' })}
          aria-label="Назад"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] active:translate-y-0.5"
        >
          <ArrowLeft size={24} strokeWidth={2.8} />
        </button>
        <h1 className="flex-1 text-center font-display text-base font-bold">
          Тренировка{table ? ` × ${table}` : ''}
        </h1>
        <div className="flex shrink-0 gap-1.5">
          <span className={`rounded-full px-3 py-2 text-sm font-extrabold shadow-[0_3px_0_#ece3d2] ${progress.streak >= 3 ? 'bg-coral-soft text-[#de5646]' : 'bg-white'}`}>
            🔥 {progress.streak}
          </span>
          <span className="rounded-full bg-white px-3 py-2 text-sm font-extrabold shadow-[0_3px_0_#ece3d2]">⭐ {progress.stars}</span>
        </div>
      </div>

      {progress.streak >= 2 && (
        <p className="mt-3 text-center text-sm font-extrabold text-coral">🔥 Серия: {progress.streak} правильных подряд!</p>
      )}

      <div className="relative mt-4 rounded-blob bg-white p-7 text-center shadow-[0_6px_0_#f0e7d6]">
        <div className="font-display text-[42px] font-bold leading-none">
          {q.a} × {q.b} = {phase === 'ask' ? '?' : <span className="text-mint-dark">{q.answer}</span>}
        </div>
        {phase === 'correct' && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="animate-star-rise text-6xl">⭐</span>
          </div>
        )}
        <Confetti burst={burst} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {q.options.map((opt, i) => {
          let cls = OPT_STYLES[i];
          if (phase === 'correct') {
            cls = opt === q.answer
              ? 'bg-mint text-white shadow-[0_6px_0_#22a76b] scale-[1.04]'
              : `${OPT_STYLES[i]} opacity-40`;
          } else if (phase === 'wrong') {
            if (opt === q.answer) cls = 'bg-mint text-white shadow-[0_6px_0_#22a76b]';
            else if (opt === picked) cls = 'animate-shake bg-[#ffe8d1] text-[#c07a2a] shadow-[0_6px_0_#f2d5b2]';
            else cls = `${OPT_STYLES[i]} opacity-40`;
          }
          return (
            <button
              key={`${q.a}x${q.b}-${i}`}
              type="button"
              onClick={() => answer(opt)}
              disabled={phase === 'correct'}
              className={`h-[68px] rounded-3xl text-[26px] font-extrabold transition-all duration-150 active:translate-y-1 ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {phase === 'wrong' && (
        <div className="animate-pop-in mt-5 rounded-blob bg-white p-5 text-center shadow-[0_6px_0_#f0e7d6]">
          <p className="font-extrabold text-[#8d84a3]">Правильный ответ:</p>
          <p className="mt-1 font-display text-2xl font-bold text-mint-dark">{q.a} × {q.b} = {q.answer}</p>
          <BigButton
            color="sun"
            className="mt-4 h-14 w-full text-lg"
            onClick={() => { setPhase('ask'); setPicked(null); setMsg('Теперь получится! 💪'); }}
          >
            💪 Попробовать ещё раз
          </BigButton>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Mascot emoji={phase === 'correct' ? '🥳' : phase === 'wrong' ? '🤗' : '🤖'} message={msg} />
      </div>

      {sessionStars > 0 && (
        <p className="mt-4 text-center text-sm font-extrabold text-[#8d84a3]">За эту тренировку: +{sessionStars} ⭐</p>
      )}
    </main>
  );
}
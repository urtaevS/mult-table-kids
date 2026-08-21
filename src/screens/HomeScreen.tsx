import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import BigButton, { type ChunkyColor } from '../components/BigButton';
import Mascot from '../components/Mascot';
import ProgressBar from '../components/ProgressBar';
import type { Progress, Screen } from '../types';

const GREETINGS = [
  'Привет! Потренируемся? 👋',
  'Уверен, сегодня получится! 💪',
  'Время умножать! 🚀',
  'Ты уже близко к цели! ✨',
];

const ACTIONS: { emoji: string; label: string; color: ChunkyColor; to: Screen }[] = [
  { emoji: '📚', label: 'Учить',           color: 'sky',   to: { name: 'learn' } },
  { emoji: '🎯', label: 'Тренироваться',   color: 'mint',  to: { name: 'train' } },
  { emoji: '⏱️', label: 'На время',        color: 'coral', to: { name: 'time-attack' } },
  { emoji: '⚡', label: 'Быстрый тест',    color: 'sun',   to: { name: 'test' } },
  { emoji: '🏆', label: 'Мои результаты',  color: 'grape', to: { name: 'results' } },
];

export default function HomeScreen({ progress, go }: { progress: Progress; go: (s: Screen) => void }) {
  const greeting = useMemo(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)], []);
  const studied = progress.studied.length;
  const percent = Math.round((studied / 9) * 100);
  const acc = progress.answersTotal ? Math.round((progress.answersCorrect / progress.answersTotal) * 100) : null;

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-6">
      <div className="flex justify-center">
        <Mascot emoji="🧑‍🚀" message={greeting} />
      </div>

      <header className="mt-4 text-center">
        <h1 className="font-display text-[26px] font-bold leading-tight">
          Математика — <span className="text-coral">играя</span>
        </h1>
        <p className="mt-1.5 text-base font-extrabold text-[#8d84a3]">Учимся играя 🚀</p>
      </header>

      <div className="mt-6 space-y-3">
        {ACTIONS.map((a, i) => (
          <BigButton
            key={a.label}
            color={a.color}
            onClick={() => go(a.to)}
            className="animate-pop-in flex h-16 w-full items-center gap-3 px-4 text-xl"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/35 text-2xl">{a.emoji}</span>
            {a.label}
            <ChevronRight className="ml-auto opacity-70" size={26} strokeWidth={3} />
          </BigButton>
        ))}
      </div>

      <section className="mt-6 rounded-blob bg-white p-5 shadow-[0_6px_0_#f0e7d6]">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-base font-bold">Мой прогресс</h2>
          <span className="font-display text-xl font-bold text-coral">{percent}%</span>
        </div>
        <ProgressBar value={percent} className="mt-2.5" />
        <ul className="mt-4 space-y-1.5 text-[15px] font-extrabold">
          <li>⭐ Изучено: {studied} из 9 таблиц</li>
          <li>🔥 Правильных ответов: {acc === null ? '—' : `${acc}%`}</li>
          {progress.streak > 0 && <li className="text-coral">🔥 Серия: {progress.streak} подряд!</li>}
        </ul>
      </section>
    </main>
  );
}
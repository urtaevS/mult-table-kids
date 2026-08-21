import { useEffect, useState } from 'react';
import BigButton from '../components/BigButton';
import Mascot from '../components/Mascot';
import { ACHIEVEMENTS } from '../lib/achievements';
import { isMastered, masteryCount } from '../lib/progress';
import { initSounds, playBg, setMuted, stopBg } from '../lib/sounds';
import { TABLES } from '../lib/tables';
import { plural } from '../lib/utils';
import type { Progress, Screen } from '../types';

function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-[0_3px_0_#f0e7d6]">
      <div className="text-xl">{emoji}</div>
      <div className="mt-0.5 font-display text-lg font-bold leading-none">{value}</div>
      <div className="mt-1 text-[11px] font-extrabold text-[#8d84a3]">{label}</div>
    </div>
  );
}

export default function ResultsScreen({ progress, go, resetProgress }: { progress: Progress; go: (s: Screen) => void; resetProgress?: () => void }) {
  const mastered = masteryCount(progress);
  const acc = progress.answersTotal ? Math.round((progress.answersCorrect / progress.answersTotal) * 100) : null;
  const [soundOn, setSoundOn] = useState(true);
  useEffect(() => { void initSounds().then(v => setSoundOn(v)); }, []);
  const toggleSound = async () => {
    const next = !soundOn;
    setSoundOn(next);
    await setMuted(!next);
    if (next) playBg(); else stopBg();
  };

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-5">
      <header className="text-center">
        <h1 className="font-display text-2xl font-bold">Мои результаты</h1>
      </header>
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={toggleSound}
          className="rounded-full bg-white px-4 py-1.5 text-xs font-extrabold shadow-[0_3px_0_#f0e7d6] active:translate-y-0.5"
        >
          {soundOn ? '🔊 Звук вкл' : '🔇 Звук выкл'}
        </button>
      </div>

      <div className="mt-4 flex justify-center">
        <Mascot emoji="🤖" message={mastered === 9 ? 'Ты настоящий чемпион! 👑' : 'Отличный прогресс! Так держать! ✨'} />
      </div>

      <div className="mt-4 rounded-blob bg-gradient-to-br from-sun to-coral p-5 text-center text-white shadow-[0_6px_0_#e0955f]">
        <div className="text-4xl">⭐</div>
        <div className="mt-1 font-display text-4xl font-bold">{progress.stars}</div>
        <div className="font-extrabold opacity-95">{plural(progress.stars, ['звезда', 'звезды', 'звёзд'])}</div>
      </div>

      <div className="mt-3.5 grid grid-cols-3 gap-2.5">
        <StatCard emoji="🎯" label="верных ответов" value={acc === null ? '—' : `${acc}%`} />
        <StatCard emoji="🔥" label="лучшая серия" value={String(progress.bestStreak)} />
        <StatCard emoji="🏅" label="лучший тест" value={progress.bestTest > 0 ? `${progress.bestTest}/10` : '—'} />
      </div>

      <h2 className="mt-6 font-display text-base font-bold">Таблицы</h2>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {TABLES.map(t => {
          const m = isMastered(progress, t);
          const seen = progress.studied.includes(t);
          return (
            <div key={t} className={`rounded-2xl px-2 py-2.5 text-center shadow-[0_3px_0_#f0e7d6] ${m ? 'bg-mint-soft' : seen ? 'bg-sun-soft' : 'bg-white'}`}>
              <div className="font-display text-base font-bold">× {t}</div>
              <div className="mt-0.5 text-[11px] font-extrabold text-[#7d7490]">
                {m ? '⭐ Выучено' : seen ? '📖 Смотрели' : 'Ждёт тебя'}
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mt-6 font-display text-base font-bold">
        Достижения · {progress.achievements.length} из {ACHIEVEMENTS.length}
      </h2>
      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        {ACHIEVEMENTS.map(a => {
          const un = progress.achievements.includes(a.id);
          return (
            <div key={a.id} className={`rounded-2xl p-3.5 shadow-[0_3px_0_#f0e7d6] ${un ? 'bg-white' : 'bg-white/50 opacity-60'}`}>
              <div className="text-2xl">{un ? a.emoji : '🔒'}</div>
              <div className="mt-1 text-sm font-extrabold leading-tight">{a.title}</div>
              <div className="mt-0.5 text-xs font-bold text-[#8d84a3]">{a.desc}</div>
            </div>
          );
        })}
      </div>

      {mastered < 9 && (
        <BigButton color="mint" className="mt-6 h-14 w-full text-lg" onClick={() => go({ name: 'train' })}>
          🚀 Тренироваться дальше
        </BigButton>
      )}

      <button
        type="button"
        onClick={() => {
          if (window.confirm('Сбросить весь прогресс? Это нельзя отменить.')) resetProgress?.();
        }}
        className="mx-auto mt-4 block rounded-full px-3 py-1.5 text-xs font-extrabold text-[#917ea8] underline decoration-dotted underline-offset-4 opacity-70 hover:opacity-100"
      >
        🗑️ Сбросить прогресс
      </button>
    </main>
  );
}
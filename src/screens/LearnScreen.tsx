import { Star } from 'lucide-react';
import { isMastered } from '../lib/progress';
import { TABLES, TABLE_STYLES } from '../lib/tables';
import type { Progress, Screen } from '../types';

export default function LearnScreen({ progress, go }: { progress: Progress; go: (s: Screen) => void }) {
  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-5">
      <header className="mb-5 text-center">
        <h1 className="font-display text-2xl font-bold">Учим таблицы</h1>
        <p className="mt-1 text-[15px] font-extrabold text-[#8d84a3]">Выбери карточку 👇</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {TABLES.map((t, i) => {
          const st = TABLE_STYLES[t];
          const s = progress.tableStats[t];
          const acc = s && s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
          const mastered = isMastered(progress, t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => go({ name: 'table', table: t })}
              className={`animate-pop-in relative rounded-blob p-4 pb-3.5 text-left transition-transform active:scale-95 ${st.card} ${st.shadow}`}
              style={{ animationDelay: `${i * 45}ms` }}
            >
              {mastered && <Star size={22} className="absolute right-2.5 top-2.5 fill-sun text-sun drop-shadow" />}
              <div className={`font-display text-[27px] font-bold ${st.text}`}>× {t}</div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80">
                <div className="h-full rounded-full bg-mint transition-all duration-500" style={{ width: `${acc}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}
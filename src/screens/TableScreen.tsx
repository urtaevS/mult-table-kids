import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import BigButton from '../components/BigButton';
import { TABLE_STYLES } from '../lib/tables';
import type { Screen } from '../types';

interface Props { n: number; go: (s: Screen) => void; markStudied: (t: number) => void }

export default function TableScreen({ n, go, markStudied }: Props) {
  useEffect(() => { markStudied(n); }, [n, markStudied]);
  const st = TABLE_STYLES[n];

  return (
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-5">
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => go({ name: 'learn' })}
          aria-label="Назад"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#ece3d2] transition-all active:translate-y-0.5 active:shadow-[0_2px_0_#ece3d2]"
        >
          <ArrowLeft size={24} strokeWidth={2.8} />
        </button>
        <h1 className="font-display text-xl font-bold leading-snug">Таблица умножения на {n}</h1>
      </div>

      <div className="space-y-2.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(k => (
          <div
            key={k}
            className={`animate-pop-in flex items-center justify-between rounded-2xl px-5 py-3 ${st.card} ${st.shadow}`}
            style={{ animationDelay: `${(k - 1) * 35}ms` }}
          >
            <span className="text-lg font-extrabold">{n} × {k}</span>
            <span className={`font-display text-xl font-bold ${st.text}`}>= {n * k}</span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <BigButton color="mint" className="h-16 w-full text-xl" onClick={() => go({ name: 'train', table: n })}>
          🎯 Потренироваться
        </BigButton>
      </div>
    </main>
  );
}
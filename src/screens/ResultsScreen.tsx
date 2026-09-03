import { useEffect, useState } from 'react';
import BigButton from '../components/BigButton';
import Mascot from '../components/Mascot';
import { ACHIEVEMENTS } from '../lib/achievements';
import { Icon } from '../lib/icons';
import { iconBg } from '../lib/theme';
import { isMastered, masteryCount } from '../lib/progress';
import { initSounds, playBg, setMuted, stopBg } from '../lib/sounds';
import { TABLES } from '../lib/tables';
import { plural } from '../lib/utils';
import type { Progress, Screen } from '../types';

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  const bg = icon==='Target' ? 'bg-mint-soft text-[#22a76b]' : icon==='Flame' ? 'bg-coral-soft text-[#de5646]' : 'bg-sun-soft text-[#a67b00]';
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-[0_3px_0_#f0e7d6]">
      <div className="flex justify-center"><span className={`grid h-8 w-8 place-items-center rounded-xl ${bg}`}><Icon name={icon} size={16} /></span></div>
      <div className="mt-0.5 font-display text-lg font-bold leading-none">{value}</div>
      <div className="mt-1 text-[11px] font-extrabold text-[#8d84a3]">{label}</div>
    </div>
  );
}

export default function ResultsScreen({ progress, go, resetProgress, importProgress }: { progress: Progress; go: (s: Screen) => void; resetProgress?: () => void; importProgress?: (raw: string) => boolean }) {
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
    <main className="relative z-10 mx-auto max-w-md px-4 pb-32 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="text-center">
        <h1 className="font-display text-2xl font-bold">Мои результаты</h1>
      </header>
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={toggleSound}
          aria-label={soundOn ? 'Выключить звук' : 'Включить звук'}
          aria-pressed={soundOn}
          className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-extrabold shadow-[0_4px_0_#ece3d2] transition-all active:translate-y-0.5 active:shadow-none ${
            soundOn
              ? 'border-[#e3d6b8] bg-sun-soft text-[#7a5a00]'
              : 'border-[#ede3cc] bg-white text-[#8d84a3]'
          }`}
        >
          <span className={`grid h-7 w-7 place-items-center rounded-full shadow-sm ${soundOn ? 'bg-sun text-white' : 'bg-[#f3ece0] text-[#b8a88a]'}`}>
            <Icon name={soundOn ? 'Volume2' : 'VolumeX'} size={14} />
          </span>
          <span>{soundOn ? 'Звук вкл' : 'Звук выкл'}</span>
          <span
            className={`ml-1 h-2 w-2 rounded-full ${soundOn ? 'bg-mint' : 'bg-[#d8cbb0]'}`}
            aria-hidden
          />
        </button>
      </div>

      <div className="mt-4 flex justify-center">
        <Mascot emoji="🤖" message={mastered === 9 ? 'Ты настоящий чемпион! 👑' : 'Отличный прогресс! Так держать! ✨'} />
      </div>

      <div className="mt-4 rounded-blob bg-gradient-to-br from-sun to-coral p-5 text-center text-white shadow-[0_6px_0_#e0955f]">
        <div className="flex justify-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20"><Icon name="Star" size={28} className="text-white" /></span></div>
        <div className="mt-1 font-display text-4xl font-bold">{progress.stars}</div>
        <div className="font-extrabold opacity-95">{plural(progress.stars, ['звезда', 'звезды', 'звёзд'])}</div>
      </div>

      <div className="mt-3.5 grid grid-cols-3 gap-2.5">
        <StatCard icon="Target" label="верных ответов" value={acc === null ? '—' : `${acc}%`} />
        <StatCard icon="Flame" label="лучшая серия" value={String(progress.bestStreak)} />
        <StatCard icon="Trophy" label="лучший тест" value={progress.bestTest > 0 ? `${progress.bestTest}/10` : '—'} />
      </div>

      <h2 className="mt-6 font-display text-base font-bold">Таблицы</h2>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {TABLES.map(t => {
          const m = isMastered(progress, t);
          const seen = progress.studied.includes(t);
          const icon = m ? 'Star' : seen ? 'BookOpen' : 'Lock';
          const bg = m ? 'bg-mint-soft text-[#22a76b]' : seen ? 'bg-sun-soft text-[#a67b00]' : 'bg-[#f0e7d6] text-[#b8a88a]';
          return (
            <div key={t} className={`rounded-2xl px-2 py-2.5 text-center shadow-[0_3px_0_#f0e7d6] ${m ? 'bg-mint-soft/60' : seen ? 'bg-sun-soft/60' : 'bg-white'}`}>
              <div className="flex justify-center"><span className={`grid h-7 w-7 place-items-center rounded-lg ${bg}`}><Icon name={icon} size={12} /></span></div>
              <div className="mt-1 font-display text-base font-bold">× {t}</div>
              <div className="mt-0.5 text-[11px] font-extrabold text-[#7d7490]">
                {m ? 'Выучено' : seen ? 'Смотрели' : 'Ждёт тебя'}
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
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${un ? iconBg(a.icon) : 'bg-[#f0e7d6] text-[#b8a88a]'}`}>{un ? <Icon name={a.icon} size={18} /> : <Icon name="Lock" size={16} />}</div>
              <div className="mt-1 text-sm font-extrabold leading-tight">{a.title}</div>
              <div className="mt-0.5 text-xs font-bold text-[#8d84a3]">{a.desc}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-white p-3 text-center shadow-[0_3px_0_#f0e7d6]">
          <div className="flex justify-center"><span className="grid h-8 w-8 place-items-center rounded-xl bg-mint-soft text-[#1a9a5a]"><Icon name="Leaf" size={16} /></span></div>
          <div className="mt-1 text-[11px] font-extrabold text-[#8d84a3]">Легко</div>
          <div className="font-display text-lg font-bold">{progress.bestTimeAttack.easy ?? 0}</div>
          <div className="text-[11px] font-bold text-[#8d84a3]">рекорд</div>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center shadow-[0_3px_0_#f0e7d6]">
          <div className="flex justify-center"><span className="grid h-8 w-8 place-items-center rounded-xl bg-sun-soft text-[#a67b00]"><Icon name="Zap" size={16} /></span></div>
          <div className="mt-1 text-[11px] font-extrabold text-[#8d84a3]">Средне</div>
          <div className="font-display text-lg font-bold">{progress.bestTimeAttack.medium ?? 0}</div>
          <div className="text-[11px] font-bold text-[#8d84a3]">рекорд</div>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center shadow-[0_3px_0_#f0e7d6]">
          <div className="flex justify-center"><span className="grid h-8 w-8 place-items-center rounded-xl bg-coral-soft text-[#de5646]"><Icon name="Flame" size={16} /></span></div>
          <div className="mt-1 text-[11px] font-extrabold text-[#8d84a3]">Сложно</div>
          <div className="font-display text-lg font-bold">{progress.bestTimeAttack.hard ?? 0}</div>
          <div className="text-[11px] font-bold text-[#8d84a3]">рекорд</div>
        </div>
      </div>
      <p className="mt-1.5 text-center text-xs font-extrabold text-[#8d84a3]">⏱️ На время</p>

      <h2 className="mt-4 font-display text-base font-bold">Сложение / вычитание</h2>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {(['add','sub','mix'] as const).map(k => {
          const s = progress.arithmetic?.[k];
          const icon = k==='add'?'Plus':k==='sub'?'Minus':'Shuffle';
          const bg = k==='add'?'bg-sky-soft text-[#2e8fdb]':k==='sub'?'bg-coral-soft text-[#de5646]':'bg-grape-soft text-[#7a55e0]';
          const label = k === 'add' ? 'Сложение' : k === 'sub' ? 'Вычитание' : 'Микс';
          return (
            <div key={k} className="rounded-2xl bg-white p-3 text-center shadow-[0_3px_0_#f0e7d6]">
              <div className="flex justify-center"><span className={`grid h-8 w-8 place-items-center rounded-xl ${bg}`}><Icon name={icon} size={16} /></span></div>
              <div className="mt-1 text-[11px] font-extrabold text-[#8d84a3]">{label}</div>
              <div className="font-display text-lg font-bold">{s ? `${s.correct}/${s.total}` : '0/0'}</div>
              <div className="text-[11px] font-bold text-[#8d84a3]">верно/всего</div>
            </div>
          );
        })}
      </div>

      <h2 className="mt-4 font-display text-base font-bold">Пропущенная цифра</h2>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {(['mul','div','mix'] as const).map(k => {
          const s = progress.missing?.[k];
          const icon = k==='mul'?'X':k==='div'?'Divide':'Shuffle';
          const bg = k==='mul'?'bg-coral-soft text-[#de5646]':k==='div'?'bg-sky-soft text-[#2e8fdb]':'bg-grape-soft text-[#7a55e0]';
          const label = k === 'mul' ? 'Умножение' : k === 'div' ? 'Деление' : 'Микс';
          return (
            <div key={k} className="rounded-2xl bg-white p-3 text-center shadow-[0_3px_0_#f0e7d6]">
              <div className="flex justify-center"><span className={`grid h-8 w-8 place-items-center rounded-xl ${bg}`}><Icon name={icon} size={16} /></span></div>
              <div className="mt-1 text-[11px] font-extrabold text-[#8d84a3]">{label}</div>
              <div className="font-display text-lg font-bold">{s ? `${s.correct}/${s.total}` : '0/0'}</div>
              <div className="text-[11px] font-bold text-[#8d84a3]">верно/всего</div>
            </div>
          );
        })}
      </div>

      <h2 className="mt-4 font-display text-base font-bold">Последовательность</h2>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {(['next','odd'] as const).map(k => {
          const s = progress.sequence?.[k];
          const icon = k==='next'?'ArrowRight':'Ban';
          const bg = k==='next'?'bg-grape-soft text-[#7a55e0]':'bg-coral-soft text-[#de5646]';
          const label = k === 'next' ? 'Следующее' : 'Лишнее';
          return (
            <div key={k} className="rounded-2xl bg-white p-3 text-center shadow-[0_3px_0_#f0e7d6]">
              <div className="flex justify-center"><span className={`grid h-8 w-8 place-items-center rounded-xl ${bg}`}><Icon name={icon} size={16} /></span></div>
              <div className="mt-1 text-[11px] font-extrabold text-[#8d84a3]">{label}</div>
              <div className="font-display text-lg font-bold">{s ? `${s.correct}/${s.total}` : '0/0'}</div>
              <div className="text-[11px] font-bold text-[#8d84a3]">верно/всего</div>
            </div>
          );
        })}
      </div>

      {mastered < 9 && (
        <BigButton color="mint" className="mt-6 h-14 w-full text-lg" onClick={() => go({ name: 'train' })}>
          🚀 Тренироваться дальше
        </BigButton>
      )}

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={async () => {
            const raw = JSON.stringify(progress, null, 2);
            const fileName = `mult-table-progress-${new Date().toISOString().slice(0, 10)}.json`;
            let done = false;
            // 1) Capacitor Filesystem + Share — работает в APK (WebView) всегда
            try {
              const { Filesystem, Directory } = await import('@capacitor/filesystem');
              const { Share } = await import('@capacitor/share');
              const res = await Filesystem.writeFile({ path: fileName, data: raw, directory: Directory.Cache, encoding: 'utf8' as never });
              await Share.share({ title: 'Прогресс — Учимся играя', text: 'Файл прогресса', url: res.uri, dialogTitle: 'Сохранить прогресс' });
              done = true;
            } catch { /* fallback below */ }
            if (done) return;
            // 2) Web Share с файлом (PWA/браузер)
            try {
              const blob = new Blob([raw], { type: 'application/json' });
              const file = new File([blob], fileName, { type: 'application/json' });
              const nav = navigator as unknown as { canShare?: (d: { files: File[] }) => boolean; share?: (d: { files: File[]; title?: string }) => Promise<void> };
              if (nav.canShare?.({ files: [file] }) && nav.share) {
                await nav.share({ files: [file], title: 'Прогресс — Учимся играя' });
                return;
              }
            } catch { /* fallback */ }
            // 3) Скачивание через <a download> (десктоп/PWA)
            try {
              const blob2 = new Blob([raw], { type: 'application/json' });
              const url = URL.createObjectURL(blob2);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              document.body.appendChild(a);
              a.click();
              setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
              return;
            } catch { /* fallback */ }
            // 4) Копирование в буфер как последний шанс
            try {
              await navigator.clipboard.writeText(raw);
              alert('Прогресс скопирован в буфер обмена ✅\nВставь в файл вручную.');
            } catch (e) { alert('Не удалось сохранить: ' + String(e)); }
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[#6a4fa0] shadow-[0_3px_0_#e6dfd0] active:translate-y-0.5"
        >
          <Icon name="Download" size={14} /> Сохранить
        </button>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[#6a4fa0] shadow-[0_3px_0_#e6dfd0] active:translate-y-0.5">
          <Icon name="Upload" size={14} /> Восстановить
          <input
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (!f) return;
              const r = new FileReader();
              r.onload = () => {
                const ok = importProgress?.(String(r.result ?? ''));
                alert(ok ? 'Прогресс импортирован ✅' : 'Неверный файл ❌');
              };
              r.readAsText(f);
              e.target.value = '';
            }}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => {
          if (window.confirm('Сбросить весь прогресс? Это нельзя отменить.')) resetProgress?.();
        }}
        className="mx-auto mt-4 block rounded-full px-3 py-1.5 text-xs font-extrabold text-[#917ea8] underline decoration-dotted underline-offset-4 opacity-70 hover:opacity-100"
      >
        🗑️ Сбросить прогресс
      </button>
      <p className="mt-1.5 text-center text-[11px] font-extrabold tracking-widest text-[#b8a9c8] opacity-80">v{__APP_VERSION__}</p>
    </main>
  );
}
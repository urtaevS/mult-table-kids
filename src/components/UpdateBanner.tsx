import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';

const LATEST_URL = 'https://api.github.com/repos/urtaevS/mult-table-kids/releases/latest';
const STORAGE_KEY = 'dismissed-update-tag';

function cmp(a: string, b: string): number {
  const pa = a.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const pb = b.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
}

export default function UpdateBanner({ current }: { current: string }) {
  const [latest, setLatest] = useState<{ tag: string; url: string } | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let cancelled = false;
    (async () => {
      try {
        const dismissed = localStorage.getItem(STORAGE_KEY);
        const r = await fetch(LATEST_URL, { headers: { Accept: 'application/vnd.github+json' } });
        if (!r.ok) return;
        const j = await r.json() as { tag_name: string; html_url: string };
        if (cancelled) return;
        if (!j.tag_name || cmp(j.tag_name, current) <= 0) return;
        if (dismissed === j.tag_name) return;
        setLatest({ tag: j.tag_name, url: j.html_url });
      } catch { /* offline — ignore */ }
    })();
    return () => { cancelled = true; };
  }, [current]);

  if (!latest) return null;

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, latest.tag); } catch { /* ignore */ }
    setLatest(null);
  };

  return (
    <div className="fixed inset-x-0 bottom-[84px] z-40 flex justify-center px-4">
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border-2 border-[#e3d6b8] bg-sun-soft px-3.5 py-3 shadow-[0_6px_0_#e6c98f]">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sun text-white shadow-sm">⬆️</span>
        <span className="flex-1 text-sm font-extrabold leading-tight text-[#7a5a00]">
          Новая версия <span className="font-display">{latest.tag}</span> — обновить?
        </span>
        <a
          href={latest.url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full bg-ink px-3.5 py-2 text-xs font-extrabold text-white shadow-[0_3px_0_#2a2550] active:translate-y-0.5"
        >
          Скачать
        </a>
        <button type="button" onClick={dismiss} aria-label="Закрыть" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/60 text-[#8d84a3]">✕</button>
      </div>
    </div>
  );
}

import { Capacitor } from '@capacitor/core';
import { useEffect, useRef, useState } from 'react';

const LATEST_URL = 'https://api.github.com/repos/urtaevS/mult-table-kids/releases/latest';
const STORAGE_KEY = 'dismissed-update-tag';

function cmp(a: string, b: string): number {
  const pa = a.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const pb = b.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
}

type Latest = { tag: string; htmlUrl: string; apkUrl: string | null };

export default function UpdateBanner({ current }: { current: string }) {
  const [latest, setLatest] = useState<Latest | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let cancelled = false;
    (async () => {
      try {
        const dismissed = localStorage.getItem(STORAGE_KEY);
        const r = await fetch(LATEST_URL, { headers: { Accept: 'application/vnd.github+json' } });
        if (!r.ok) return;
        const j = await r.json() as { tag_name: string; html_url: string; assets?: { name: string; browser_download_url: string }[] };
        if (cancelled) return;
        if (!j.tag_name || cmp(j.tag_name, current) <= 0) return;
        if (dismissed === j.tag_name) return;
        const apk = j.assets?.find(a => a.name.endsWith('.apk'))?.browser_download_url ?? null;
        setLatest({ tag: j.tag_name, htmlUrl: j.html_url, apkUrl: apk });
      } catch { /* offline — ignore */ }
    })();
    return () => { cancelled = true; };
  }, [current]);

  if (!latest) return null;

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, latest.tag); } catch { /* ignore */ }
    abortRef.current?.abort();
    setLatest(null);
  };

  const downloadAndInstall = async () => {
    if (!latest.apkUrl) {
      window.open(latest.htmlUrl, '_blank');
      return;
    }
    setDownloading(true);
    setProgress(0);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(latest.apkUrl, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const total = Number(res.headers.get('content-length') || 0);
      const reader = res.body?.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) { chunks.push(value); received += value.length; if (total) setProgress(Math.round((received / total) * 100)); }
        }
      }
      const blob = new Blob(chunks as BlobPart[], { type: 'application/vnd.android.package-archive' });
      const b64 = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => {
          const s = String(fr.result ?? '');
          const idx = s.indexOf(',');
          resolve(idx >= 0 ? s.slice(idx + 1) : s);
        };
        fr.onerror = () => reject(fr.error);
        fr.readAsDataURL(blob);
      });
      const fileName = `mult-table-${latest.tag}.apk`;
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const saved = await Filesystem.writeFile({ path: fileName, data: b64, directory: Directory.Cache });
      // try native installer via Browser open (PackageInstaller will handle) — fallback to Share
      try {
        const { Browser } = await import('@capacitor/browser');
        await Browser.open({ url: saved.uri });
      } catch {
        const { Share } = await import('@capacitor/share');
        await Share.share({ title: 'Установка обновления', text: `APK ${latest.tag}`, url: saved.uri, dialogTitle: 'Установить APK' });
      }
    } catch (e) {
      const msg = e instanceof Error && e.name === 'AbortError' ? 'Отменено' : `Ошибка: ${String(e)}`;
      alert(msg + '\nОткрой страницу релиза: ' + latest.htmlUrl);
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-[84px] z-40 flex justify-center px-4">
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border-2 border-[#e3d6b8] bg-sun-soft px-3.5 py-3 shadow-[0_6px_0_#e6c98f]">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sun text-white shadow-sm">⬆️</span>
        <span className="flex-1 text-sm font-extrabold leading-tight text-[#7a5a00]">
          Новая версия <span className="font-display">{latest.tag}</span> — обновить?
        </span>
        {downloading ? (
          <span className="shrink-0 rounded-full bg-white px-3.5 py-2 text-xs font-extrabold text-ink">{progress ? `${progress}%` : '…'} </span>
        ) : (
          <button
            type="button"
            onClick={downloadAndInstall}
            className="shrink-0 rounded-full bg-ink px-3.5 py-2 text-xs font-extrabold text-white shadow-[0_3px_0_#2a2550] active:translate-y-0.5"
          >
            Скачать и установить
          </button>
        )}
        <button type="button" onClick={dismiss} aria-label="Закрыть" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/60 text-[#8d84a3]">✕</button>
      </div>
    </div>
  );
}

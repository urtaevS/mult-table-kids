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
      try {
        const { Browser } = await import('@capacitor/browser');
        await Browser.open({ url: latest.htmlUrl });
      } catch {
        window.open(latest.htmlUrl, '_blank');
      }
      return;
    }
    setDownloading(true);
    setProgress(0);
    const controller = new AbortController();
    abortRef.current = controller;
    const openReleasesFallback = async () => {
      try {
        const { Browser } = await import('@capacitor/browser');
        await Browser.open({ url: latest.htmlUrl });
      } catch {
        window.open(latest.htmlUrl, '_blank');
      }
    };
    try {
      // Сначала пробуем нативный HTTP (CapacitorHttp enabled) — обходит CORS WebView.
      // Затем — системный DownloadManager, затем — in-app fetch (WAF может отдать 403).
      let blob: Blob | null = null;
      let httpStatus: number | null = null;
      const apkUrl = latest.apkUrl;
      // 1) Capacitor Http (если плагин включён) — нативный запрос
      try {
        const mod = await import('@capacitor/core');
        const http = (mod as unknown as { CapacitorHttp?: { request: (o: unknown) => Promise<{ status: number; data: string }> } }).CapacitorHttp;
        if (http?.request) {
          const r = await http.request({
            method: 'GET',
            url: apkUrl,
            responseType: 'arrayBuffer' as unknown as string,
            headers: { Accept: 'application/vnd.android.package-archive' },
          } as unknown as object);
          httpStatus = r.status;
          if (r.status >= 200 && r.status < 300 && r.data) {
            const buf = r.data as unknown as ArrayBuffer | string;
            if (buf instanceof ArrayBuffer) blob = new Blob([buf], { type: 'application/vnd.android.package-archive' });
            else if (typeof buf === 'string') {
              // base64 string fallback
              const bin = atob(buf);
              const u8 = new Uint8Array(bin.length);
              for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
              blob = new Blob([u8], { type: 'application/vnd.android.package-archive' });
            }
          } else if (r.status >= 400) {
            // WAF / 403 — сразу фолбек в DownloadManager, не показываем ошибку с пробелами
            throw new Error(`HTTP ${r.status}`);
          }
        }
      } catch {
        // ignore — пробуем дальше
      }
      // 2) Системный DownloadManager через Capacitor Filesystem downloadFile (если доступен)
      if (!blob) {
        try {
          const fsMod = await import('@capacitor/filesystem');
          const dl = (fsMod.Filesystem as unknown as { downloadFile?: (o: { url: string; path: string; directory: string }) => Promise<{ path: string; blob?: Blob }> }).downloadFile;
          if (dl) {
            const fileName = `mult-table-${latest.tag}.apk`;
            let dlRes: { path: string; blob?: Blob } | null = null;
            try {
              dlRes = await dl({ url: apkUrl, path: fileName, directory: (fsMod.Directory as unknown as Record<string, string>).Cache ?? 'CACHE' });
            } catch {
              dlRes = null;
            }
            if (dlRes?.blob) {
              blob = dlRes.blob;
            } else if (dlRes?.path) {
              // файл уже на диске — сразу открываем установщик
              try {
                const uri = dlRes.path.startsWith('file://') ? dlRes.path : `file://${dlRes.path}`;
                const { Browser } = await import('@capacitor/browser');
                await Browser.open({ url: uri });
                return;
              } catch {
                try {
                  const { Share } = await import('@capacitor/share');
                  await Share.share({ title: 'Установка обновления', text: `APK ${latest.tag}`, url: dlRes.path, dialogTitle: 'Установить APK' });
                  return;
                } catch { /* fallback to fetch */ }
              }
            }
          }
        } catch { /* ignore */ }
      }
      // 3) In-app fetch — последний шанс (в WebView часто CORS/TypeError)
      if (!blob) {
        let res: Response;
        try {
          res = await fetch(apkUrl, { signal: controller.signal });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } catch (fetchErr) {
          // Не ругаем alert с пробелами — молча открываем страницу релиза как было раньше, но без лишних пробелов
          await openReleasesFallback();
          const detail = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
          // лог без пробелов в URL
          console.warn('[update] fetch failed', detail, httpStatus);
          throw new Error('Открыта страница релиза — нажми там Скачать APK.');
        }
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
        } else {
          const buf = await res.arrayBuffer();
          chunks.push(new Uint8Array(buf));
        }
        const totalLen = chunks.reduce((s, c) => s + c.length, 0);
        if (totalLen < 1024 * 100) throw new Error('Файл слишком мал — возможно HTML вместо APK');
        blob = new Blob(chunks as BlobPart[], { type: 'application/vnd.android.package-archive' });
      }
      if (!blob) throw new Error('Не удалось загрузить файл');
      const b64 = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => {
          const s = String(fr.result ?? '');
          const idx = s.indexOf(',');
          resolve(idx >= 0 ? s.slice(idx + 1) : s);
        };
        fr.onerror = () => reject(fr.error);
        fr.readAsDataURL(blob!);
      });
      const fileName = `mult-table-${latest.tag}.apk`;
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const saved = await Filesystem.writeFile({ path: fileName, data: b64, directory: Directory.Cache });
      try {
        const { Browser } = await import('@capacitor/browser');
        await Browser.open({ url: saved.uri });
      } catch {
        const { Share } = await import('@capacitor/share');
        await Share.share({ title: 'Установка обновления', text: `APK ${latest.tag}`, url: saved.uri, dialogTitle: 'Установить APK' });
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        alert('Отменено');
        return;
      }
      const msg = e instanceof Error ? e.message : String(e);
      // Без лишних пробелов в URL — раньше alert резал "https:// github.com/ ... " из-за переноса строки
      if (msg.includes('Открыта страница релиза')) {
        // фолбек уже открыл браузер — не спамим вторым alert
        return;
      }
      alert(msg + '\n' + latest.htmlUrl);
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-[84px] z-40 flex justify-center px-4">
      <div className="flex w-full max-w-md items-center gap-2 rounded-2xl border-2 border-[#e3d6b8] bg-sun-soft px-3 py-3 shadow-[0_6px_0_#e6c98f]">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sun text-white shadow-sm">⬆️</span>
        <span className="flex-1 min-w-0 text-sm font-extrabold leading-tight text-[#7a5a00]">
          <span className="block">Новая версия</span>
          <span className="font-display">{latest.tag}</span>
        </span>
        {downloading ? (
          <span className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-extrabold text-ink">{progress ? `${progress}%` : '…'} </span>
        ) : (
          <button
            type="button"
            onClick={downloadAndInstall}
            className="shrink-0 rounded-full bg-ink px-3 py-2 text-xs font-extrabold leading-none text-white shadow-[0_3px_0_#2a2550] active:translate-y-0.5"
          >
            <span className="block">Скачать</span>
            <span className="block text-[10px] opacity-80">и установить</span>
          </button>
        )}
        <button type="button" onClick={dismiss} aria-label="Закрыть" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/60 text-[#8d84a3]">✕</button>
      </div>
    </div>
  );
}

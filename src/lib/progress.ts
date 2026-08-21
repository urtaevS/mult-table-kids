import { Preferences } from '@capacitor/preferences';
import { useCallback, useEffect, useRef, useState } from 'react';
import { playAchievement } from './sounds';
import type { Progress } from '../types';
import { ACHIEVEMENTS } from './achievements';

const KEY = 'mult-table-progress-v1';
const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

const DEFAULT: Progress = {
  stars: 0, streak: 0, bestStreak: 0,
  answersCorrect: 0, answersTotal: 0,
  studied: [], tableStats: {},
  bestTest: 0, lastTest: null, achievements: [],
  bestTimeAttack: {},
};

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT, ...(JSON.parse(raw) as Partial<Progress>) };
  } catch { /* ignore */ }
  return DEFAULT;
}

async function loadStoredProgress(): Promise<Progress> {
  try {
    const { value } = await Preferences.get({ key: KEY });
    if (value) return { ...DEFAULT, ...(JSON.parse(value) as Partial<Progress>) };
  } catch { /* ignore */ }
  // миграция со старого localStorage → Preferences
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = { ...DEFAULT, ...(JSON.parse(raw) as Partial<Progress>) };
      try { await Preferences.set({ key: KEY, value: JSON.stringify(parsed) }); } catch { /* ignore */ }
      return parsed;
    }
  } catch { /* ignore */ }
  return DEFAULT;
}

async function persistProgress(p: Progress): Promise<void> {
  const raw = JSON.stringify(p);
  try { await Preferences.set({ key: KEY, value: raw }); } catch { /* ignore */ }
  try { localStorage.setItem(KEY, raw); } catch { /* ignore */ }
}

export function isMastered(p: Progress, table: number): boolean {
  const s = p.tableStats[table];
  return !!s && s.total >= 6 && s.correct / s.total >= 0.8;
}

export function masteryCount(p: Progress): number {
  return TABLES.filter(t => isMastered(p, t)).length;
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(DEFAULT);
  const loaded = useRef(false);
  const [toast, setToast] = useState<string | null>(null);
  const seen = useRef<Set<string>>(new Set());

  // загрузка из системного хранилища (Preferences → localStorage миграция)
  useEffect(() => {
    let cancelled = false;
    loadStoredProgress().then(p => {
      if (cancelled) return;
      setProgress(p);
      seen.current = new Set(p.achievements);
      loaded.current = true;
    });
    return () => { cancelled = true; };
  }, []);

  // сохранение на телефон (Preferences + localStorage как fallback)
  useEffect(() => {
    if (!loaded.current) return;
    void persistProgress(progress);
  }, [progress]);

  // Detect newly unlocked achievements whenever progress changes.
  useEffect(() => {
    const mastered = masteryCount(progress);
    const fresh = ACHIEVEMENTS.filter(a => !seen.current.has(a.id) && a.check(progress, mastered));
    if (fresh.length === 0) return;
    fresh.forEach(a => seen.current.add(a.id));
    setToast(`${fresh[0].emoji} ${fresh[0].title}`);
    playAchievement();
    setProgress(prev =>
      prev.achievements.includes(fresh[0].id)
        ? prev
        : { ...prev, achievements: [...prev.achievements, ...fresh.map(a => a.id)] },
    );
  }, [progress]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const recordAnswer = useCallback((table: number, correct: boolean, reward = true) => {
    setProgress(prev => {
      const stat = prev.tableStats[table] ?? { correct: 0, total: 0 };
      const streak = reward ? (correct ? prev.streak + 1 : 0) : prev.streak;
      return {
        ...prev,
        stars: prev.stars + (reward && correct ? 1 : 0),
        streak,
        bestStreak: Math.max(prev.bestStreak, streak),
        answersCorrect: prev.answersCorrect + (correct ? 1 : 0),
        answersTotal: prev.answersTotal + 1,
        tableStats: {
          ...prev.tableStats,
          [table]: { correct: stat.correct + (correct ? 1 : 0), total: stat.total + 1 },
        },
      };
    });
  }, []);

  const markStudied = useCallback((table: number) => {
    setProgress(prev =>
      prev.studied.includes(table) ? prev : { ...prev, studied: [...prev.studied, table] });
  }, []);

  const finishTest = useCallback((score: number) => {
    setProgress(prev => ({
      ...prev,
      stars: prev.stars + score,
      lastTest: score,
      bestTest: Math.max(prev.bestTest, score),
    }));
  }, []);

  const finishTimeAttack = useCallback((difficulty: import('../types').TimeDifficulty, score: number) => {
    setProgress(prev => {
      const best = prev.bestTimeAttack[difficulty] ?? 0;
      return {
        ...prev,
        stars: prev.stars + score,
        bestTimeAttack: { ...prev.bestTimeAttack, [difficulty]: Math.max(best, score) },
      };
    });
  }, []);

  const resetProgress = useCallback(() => {
    seen.current = new Set();
    setProgress({ ...DEFAULT });
  }, []);

  return { progress, recordAnswer, markStudied, finishTest, finishTimeAttack, resetProgress, toast };
}
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Progress } from '../types';
import { ACHIEVEMENTS } from './achievements';

const KEY = 'mult-table-progress-v1';
const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

const DEFAULT: Progress = {
  stars: 0, streak: 0, bestStreak: 0,
  answersCorrect: 0, answersTotal: 0,
  studied: [], tableStats: {},
  bestTest: 0, lastTest: null, achievements: [],
};

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT, ...(JSON.parse(raw) as Partial<Progress>) };
  } catch { /* ignore */ }
  return DEFAULT;
}

export function isMastered(p: Progress, table: number): boolean {
  const s = p.tableStats[table];
  return !!s && s.total >= 6 && s.correct / s.total >= 0.8;
}

export function masteryCount(p: Progress): number {
  return TABLES.filter(t => isMastered(p, t)).length;
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [toast, setToast] = useState<string | null>(null);
  // achievements already earned — used to detect *newly* unlocked ones
  const seen = useRef<Set<string>>(new Set(loadProgress().achievements));

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* ignore */ }
  }, [progress]);

  // Detect newly unlocked achievements whenever progress changes.
  useEffect(() => {
    const mastered = masteryCount(progress);
    const fresh = ACHIEVEMENTS.filter(a => !seen.current.has(a.id) && a.check(progress, mastered));
    if (fresh.length === 0) return;
    fresh.forEach(a => seen.current.add(a.id));
    setToast(`${fresh[0].emoji} ${fresh[0].title}`);
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

  return { progress, recordAnswer, markStudied, finishTest, toast };
}
import type { Progress } from '../types';

export interface Achievement {
  id: string; emoji: string; title: string; desc: string;
  check: (p: Progress, mastered: number) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first',    emoji: '🌱', title: 'Первый шаг',       desc: 'Первый правильный ответ',   check: p => p.answersCorrect >= 1 },
  { id: 'study1',   emoji: '📖', title: 'Читатель',         desc: 'Открыть первую таблицу',    check: p => p.studied.length >= 1 },
  { id: 'streak5',  emoji: '🔥', title: 'Горячая серия',    desc: '5 правильных подряд',       check: p => p.bestStreak >= 5 },
  { id: 'streak10', emoji: '🌋', title: 'Огненная серия',   desc: '10 правильных подряд',      check: p => p.bestStreak >= 10 },
  { id: 'master1',  emoji: '⭐', title: 'Первая победа',    desc: 'Выучить одну таблицу',      check: (_, m) => m >= 1 },
  { id: 'stars50',  emoji: '✨', title: '50 звёзд',         desc: 'Собрать 50 звёзд',          check: p => p.stars >= 50 },
  { id: 'stars150', emoji: '🌟', title: '150 звёзд',        desc: 'Собрать 150 звёзд',         check: p => p.stars >= 150 },
  { id: 'test8',    emoji: '🎯', title: 'Почти идеально',   desc: 'Набрать 8+ в тесте',        check: p => p.bestTest >= 8 },
  { id: 'test10',   emoji: '🏆', title: 'Идеальный тест',   desc: '10 из 10 в тесте',          check: p => p.bestTest >= 10 },
  { id: 'all',      emoji: '👑', title: 'Мастер умножения', desc: 'Выучить все таблицы',       check: (_, m) => m >= 9 },
];
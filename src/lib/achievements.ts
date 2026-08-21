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
  // На время
  { id: 'time5',     emoji: '⏱️', title: 'Быстрый старт',     desc: '5 верных на время',         check: p => (p.bestTimeAttack.easy ?? 0) >= 5 || (p.bestTimeAttack.medium ?? 0) >= 5 || (p.bestTimeAttack.hard ?? 0) >= 5 },
  { id: 'time10',    emoji: '⚡', title: 'Спринтер',         desc: '10 верных на время',        check: p => (p.bestTimeAttack.easy ?? 0) >= 10 || (p.bestTimeAttack.medium ?? 0) >= 10 || (p.bestTimeAttack.hard ?? 0) >= 10 },
  { id: 'time_easy', emoji: '🌿', title: 'Лёгкий темп',      desc: '8+ на лёгком уровне',       check: p => (p.bestTimeAttack.easy ?? 0) >= 8 },
  { id: 'time_hard', emoji: '🔥', title: 'Хардкор',          desc: '8+ на сложном уровне',      check: p => (p.bestTimeAttack.hard ?? 0) >= 8 },
  // Арифметика до 100
  { id: 'arith10',   emoji: '➕', title: 'Сложение — старт',  desc: '10 верных ➕',            check: p => (p.arithmetic?.add.correct ?? 0) >= 10 },
  { id: 'arith_sub', emoji: '➖', title: 'Вычитание — старт', desc: '10 верных ➖',            check: p => (p.arithmetic?.sub.correct ?? 0) >= 10 },
  { id: 'arith_mix', emoji: '🧮', title: 'Микс 20',           desc: '20 верных вперемешку',    check: p => (p.arithmetic?.mix.correct ?? 0) >= 20 },
];
import type { Progress } from '../types';

export interface Achievement {
  id: string; icon: string; title: string; desc: string;
  check: (p: Progress, mastered: number) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first',    icon: 'Sprout', title: 'Первый шаг',       desc: 'Первый правильный ответ',   check: p => p.answersCorrect >= 1 },
  { id: 'study1',   icon: 'BookOpen', title: 'Читатель',         desc: 'Открыть первую таблицу',    check: p => p.studied.length >= 1 },
  { id: 'streak5',  icon: 'Flame', title: 'Горячая серия',    desc: '5 правильных подряд',       check: p => p.bestStreak >= 5 },
  { id: 'streak10', icon: 'Mountain', title: 'Огненная серия',   desc: '10 правильных подряд',      check: p => p.bestStreak >= 10 },
  { id: 'master1',  icon: 'Star', title: 'Первая победа',    desc: 'Выучить одну таблицу',      check: (_, m) => m >= 1 },
  { id: 'stars50',  icon: 'Sparkles', title: '50 звёзд',         desc: 'Собрать 50 звёзд',          check: p => p.stars >= 50 },
  { id: 'stars150', icon: 'Stars', title: '150 звёзд',        desc: 'Собрать 150 звёзд',         check: p => p.stars >= 150 },
  { id: 'test8',    icon: 'Target', title: 'Почти идеально',   desc: 'Набрать 8+ в тесте',        check: p => p.bestTest >= 8 },
  { id: 'test10',   icon: 'Trophy', title: 'Идеальный тест',   desc: '10 из 10 в тесте',          check: p => p.bestTest >= 10 },
  { id: 'all',      icon: 'Crown', title: 'Мастер умножения', desc: 'Выучить все таблицы',       check: (_, m) => m >= 9 },
  { id: 'time5',     icon: 'Timer', title: 'Быстрый старт',     desc: '5 верных на время',         check: p => (p.bestTimeAttack.easy ?? 0) >= 5 || (p.bestTimeAttack.medium ?? 0) >= 5 || (p.bestTimeAttack.hard ?? 0) >= 5 },
  { id: 'time10',    icon: 'Zap', title: 'Спринтер',         desc: '10 верных на время',        check: p => (p.bestTimeAttack.easy ?? 0) >= 10 || (p.bestTimeAttack.medium ?? 0) >= 10 || (p.bestTimeAttack.hard ?? 0) >= 10 },
  { id: 'time_easy', icon: 'Leaf', title: 'Лёгкий темп',      desc: '8+ на лёгком уровне',       check: p => (p.bestTimeAttack.easy ?? 0) >= 8 },
  { id: 'time_hard', icon: 'Flame', title: 'Хардкор',          desc: '8+ на сложном уровне',      check: p => (p.bestTimeAttack.hard ?? 0) >= 8 },
  { id: 'arith10',   icon: 'Plus', title: 'Сложение — старт',  desc: '10 верных ➕',            check: p => (p.arithmetic?.add.correct ?? 0) >= 10 },
  { id: 'arith_sub', icon: 'Minus', title: 'Вычитание — старт', desc: '10 верных ➖',            check: p => (p.arithmetic?.sub.correct ?? 0) >= 10 },
  { id: 'arith_mix', icon: 'Calculator', title: 'Микс 20',           desc: '20 верных вперемешку',    check: p => (p.arithmetic?.mix.correct ?? 0) >= 20 },
  { id: 'miss5',     icon: 'Search', title: 'Наблюдатель',      desc: '5 верных с пропуском',    check: p => Object.values(p.missing ?? {}).some(s => (s.correct ?? 0) >= 5) },
  { id: 'miss_mix',  icon: 'Shuffle', title: 'Микс-пропуск',     desc: '10 верных вперемешку',    check: p => (p.missing?.mix.correct ?? 0) >= 10 },
  { id: 'miss_mul',  icon: 'X', title: 'Пропуск ×',        desc: '10 верных × с пропуском', check: p => (p.missing?.mul.correct ?? 0) >= 10 },
  { id: 'seq_next',  icon: 'ListOrdered', title: 'Продолжи ряд',     desc: '10 верных «следующее»', check: p => (p.sequence?.next.correct ?? 0) >= 10 },
  { id: 'seq_odd',   icon: 'Ban', title: 'Найди лишнее',     desc: '5 верных «лишнее»',      check: p => (p.sequence?.odd.correct ?? 0) >= 5 },
  { id: 'seq_mix',   icon: 'Puzzle', title: 'Закономерность',   desc: '15 верных всего',        check: p => ((p.sequence?.next.correct ?? 0) + (p.sequence?.odd.correct ?? 0)) >= 15 },
];
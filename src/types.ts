export type TimeDifficulty = 'easy' | 'medium' | 'hard';

export type Screen =
  | { name: 'home' }
  | { name: 'learn' }
  | { name: 'table'; table: number }
  | { name: 'train'; table?: number }
  | { name: 'test' }
  | { name: 'time-attack'; difficulty?: TimeDifficulty }
  | { name: 'results' };

export interface TableStat { correct: number; total: number }

export interface Progress {
  stars: number;
  streak: number;
  bestStreak: number;
  answersCorrect: number;
  answersTotal: number;
  studied: number[];
  tableStats: Record<number, TableStat>;
  bestTest: number;
  lastTest: number | null;
  achievements: string[];
  bestTimeAttack: Partial<Record<TimeDifficulty, number>>;
}
export type TimeDifficulty = 'easy' | 'medium' | 'hard';

export type ArithmeticOp = 'add' | 'sub' | 'mix';
export type MissingOp = 'mul' | 'div' | 'add' | 'sub' | 'mix';
export type SequenceKind = 'next' | 'odd';

export type Screen =
  | { name: 'home' }
  | { name: 'learn' }
  | { name: 'table'; table: number }
  | { name: 'train'; table?: number }
  | { name: 'test' }
  | { name: 'time-attack'; difficulty?: TimeDifficulty }
  | { name: 'arithmetic'; op?: ArithmeticOp }
  | { name: 'missing'; op?: MissingOp }
  | { name: 'sequence'; kind?: SequenceKind }
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
  arithmetic: Record<ArithmeticOp, TableStat>;
  missing: Record<MissingOp, TableStat>;
  sequence: Record<SequenceKind, TableStat>;
}
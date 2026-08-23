import {
  Ban, BookOpen, Calculator, Crown, Flame, HelpCircle, ListOrdered, Lock, Minus, Plus, Puzzle,
  Search, Shuffle, Sparkles, Sprout, Star, Target, Timer, Trophy, Mountain, X, Zap, Leaf,
  Bot,
} from 'lucide-react';

const MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Sprout, BookOpen, Flame, Mountain, Star, Sparkles, Target, Trophy, Crown,
  Timer, Zap, Leaf, Plus, Minus, Calculator, Search, Shuffle, X, ListOrdered, Ban, Puzzle,
  Bot, Lock, HelpCircle,
} as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>;

export function Icon({ name, size = 22, className = '' }: { name: string; size?: number; className?: string }) {
  const C = MAP[name] ?? HelpCircle;
  return <C size={size} className={className} />;
}

export const ICON_BG: Record<string, string> = {
  BookOpen: 'bg-sky-soft text-[#2e8fdb]',
  Target: 'bg-mint-soft text-[#22a76b]',
  Timer: 'bg-coral-soft text-[#de5646]',
  Calculator: 'bg-grape-soft text-[#7a55e0]',
  Search: 'bg-candy-soft text-[#e06693]',
  ListOrdered: 'bg-sun-soft text-[#a67b00]',
  Zap: 'bg-sun-soft text-[#e3a312]',
  Trophy: 'bg-grape-soft text-[#7a55e0]',
  Sprout: 'bg-mint-soft text-[#22a76b]',
  Flame: 'bg-coral-soft text-[#de5646]',
  Mountain: 'bg-coral-soft text-[#b42318]',
  Star: 'bg-sun-soft text-[#e3a312]',
  Sparkles: 'bg-sky-soft text-[#2e8fdb]',
  Crown: 'bg-sun text-[#7a5a00]',
  Leaf: 'bg-mint-soft text-[#1a9a5a]',
  Plus: 'bg-sky-soft text-[#2e8fdb]',
  Minus: 'bg-coral-soft text-[#de5646]',
  Shuffle: 'bg-grape-soft text-[#7a55e0]',
  X: 'bg-coral-soft text-[#de5646]',
  Ban: 'bg-coral-soft text-[#de5646]',
  Puzzle: 'bg-grape-soft text-[#7a55e0]',
  Award: 'bg-sun-soft text-[#e3a312]',
};

export function iconBg(name: string): string {
  return ICON_BG[name] ?? 'bg-white/70 text-ink';
}

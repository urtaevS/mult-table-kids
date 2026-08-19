import { BookOpen, Home, Target, Trophy } from 'lucide-react';

const ITEMS = [
  { key: 'home',    label: 'Главная',    icon: Home,     on: 'bg-sun-soft text-[#a8770a]' },
  { key: 'learn',   label: 'Учить',      icon: BookOpen, on: 'bg-sky-soft text-[#2e8fdb]' },
  { key: 'train',   label: 'Тренировка', icon: Target,   on: 'bg-mint-soft text-[#22a76b]' },
  { key: 'results', label: 'Результаты', icon: Trophy,   on: 'bg-grape-soft text-[#7a55e0]' },
] as const;

export type NavKey = (typeof ITEMS)[number]['key'];

export default function BottomNav({ active, onNavigate }: { active: NavKey | null; onNavigate: (k: NavKey) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-[#f0e7d6] bg-white/95 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1 px-4">
        {ITEMS.map(({ key, label, icon: Icon, on }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              className={`flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-extrabold transition-all ${
                isActive ? `${on} scale-105` : 'text-[#a89fbd]'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.8 : 2.2} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
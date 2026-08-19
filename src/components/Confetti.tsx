import { useMemo, type CSSProperties } from 'react';

const COLORS = ['#FFC53D', '#FF7B6B', '#3ECF8E', '#4FB3FF', '#9D7BFF', '#FF8FB8'];

export default function Confetti({ burst }: { burst: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.5;
        const dist = 60 + Math.random() * 70;
        return {
          id: `${burst}-${i}`,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist - 30,
          rot: (Math.random() - 0.5) * 540,
          color: COLORS[i % COLORS.length],
          size: 6 + Math.random() * 7,
          delay: Math.random() * 0.08,
          round: Math.random() > 0.5,
        };
      }),
    [burst],
  );

  if (!burst) return null;
  return (
    <div key={burst} className="pointer-events-none absolute inset-0 overflow-visible">
      {pieces.map(p => (
        <span
          key={p.id}
          className="confetti-piece absolute left-1/2 top-1/2"
          style={{
            width: p.size, height: p.size, background: p.color,
            borderRadius: p.round ? '50%' : '3px',
            animationDelay: `${p.delay}s`,
            '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rot}deg`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
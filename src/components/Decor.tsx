const ITEMS = [
  { ch: '×', left: '6%',  top: '9%',  size: 34, color: '#FFC53D', delay: '0s' },
  { ch: '⭐', left: '86%', top: '7%',  size: 22, color: '#FF8FB8', delay: '.8s' },
  { ch: '7', left: '88%', top: '30%', size: 30, color: '#4FB3FF', delay: '1.4s' },
  { ch: '+', left: '10%', top: '38%', size: 26, color: '#9D7BFF', delay: '.5s' },
  { ch: '3', left: '82%', top: '60%', size: 28, color: '#3ECF8E', delay: '2s' },
  { ch: '=', left: '7%',  top: '66%', size: 30, color: '#FF7B6B', delay: '1s' },
  { ch: '✦', left: '90%', top: '83%', size: 20, color: '#FFC53D', delay: '1.7s' },
  { ch: '9', left: '12%', top: '88%', size: 26, color: '#4FB3FF', delay: '.3s' },
];

export default function Decor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {ITEMS.map((it, i) => (
        <span
          key={i}
          className="animate-float absolute font-display font-bold opacity-30"
          style={{ left: it.left, top: it.top, fontSize: it.size, color: it.color, animationDelay: it.delay }}
        >
          {it.ch}
        </span>
      ))}
    </div>
  );
}
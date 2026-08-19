import type { CSSProperties, ReactNode } from 'react';

export type ChunkyColor = 'sun' | 'coral' | 'mint' | 'sky' | 'grape' | 'candy' | 'white';

const STYLES: Record<ChunkyColor, string> = {
  sun:   'bg-sun text-[#5c4300] shadow-[0_6px_0_#e3a312] active:shadow-[0_2px_0_#e3a312]',
  coral: 'bg-coral text-white shadow-[0_6px_0_#de5646] active:shadow-[0_2px_0_#de5646]',
  mint:  'bg-mint text-white shadow-[0_6px_0_#22a76b] active:shadow-[0_2px_0_#22a76b]',
  sky:   'bg-sky text-white shadow-[0_6px_0_#2e8fdb] active:shadow-[0_2px_0_#2e8fdb]',
  grape: 'bg-grape text-white shadow-[0_6px_0_#7a55e0] active:shadow-[0_2px_0_#7a55e0]',
  candy: 'bg-candy text-white shadow-[0_6px_0_#e06693] active:shadow-[0_2px_0_#e06693]',
  white: 'bg-white text-ink shadow-[0_6px_0_#e6dfd0] active:shadow-[0_2px_0_#e6dfd0]',
};

interface Props {
  color?: ChunkyColor;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
}

export default function BigButton({ color = 'sun', className = '', style, onClick, disabled, children }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`select-none rounded-3xl font-extrabold transition-all duration-100 active:translate-y-1 disabled:pointer-events-none disabled:opacity-50 ${STYLES[color]} ${className}`}
    >
      {children}
    </button>
  );
}
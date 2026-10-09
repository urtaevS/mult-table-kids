import React, { useState } from 'react';

export type MascotMood = 'idle' | 'happy' | 'thinking' | 'celebrate';

interface MascotProps {
  message?: string;
  emoji?: string;
  mood?: MascotMood;
  className?: string;
  size?: number;
}

export default function Mascot({
  message,
  emoji,
  mood,
  className = '',
  size = 72,
}: MascotProps) {
  const [isTapped, setIsTapped] = useState(false);

  // Auto-detect mood from emoji if not explicitly given
  let currentMood: MascotMood = mood || 'idle';
  if (!mood && emoji) {
    if (emoji === '🥳' || emoji === '🎉' || emoji === '⭐' || emoji === '🌟' || emoji === '👑') {
      currentMood = 'happy';
    } else if (emoji === '🤗' || emoji === '🤔' || emoji === '❓') {
      currentMood = 'thinking';
    } else {
      currentMood = 'idle';
    }
  }

  const activeMood = isTapped ? 'happy' : currentMood;

  const handleTap = () => {
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 1400);
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Interactive Vector Fox Mascot */}
      <div
        onClick={handleTap}
        className="cursor-pointer transition-transform duration-200 active:scale-90 hover:scale-105 flex-shrink-0 relative group"
        style={{ width: size, height: size }}
        title="Нажми на меня! 🦊"
      >
        <svg
          viewBox="0 0 100 100"
          className={`w-full h-full drop-shadow-md ${
            activeMood === 'happy' || activeMood === 'celebrate'
              ? 'anim-mascot-jump'
              : activeMood === 'thinking'
              ? 'anim-mascot-tilt'
              : 'animate-float'
          }`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sparkles for Happy/Celebrate */}
          {(activeMood === 'happy' || activeMood === 'celebrate') && (
            <>
              <g className="anim-mascot-sparkle-1" transform="translate(14, 16)">
                <path d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" fill="#FFC72C" />
              </g>
              <g className="anim-mascot-sparkle-2" transform="translate(86, 20)">
                <path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill="#FFB703" />
              </g>
              <g className="anim-mascot-sparkle-1" transform="translate(20, 78)">
                <circle cx="0" cy="0" r="2.5" fill="#FF8CA6" />
              </g>
            </>
          )}

          {/* Question mark for Thinking */}
          {activeMood === 'thinking' && (
            <g className="animate-bounce" transform="translate(80, 18)">
              <rect x="-10" y="-12" width="20" height="22" rx="10" fill="#FFE8A3" />
              <text
                x="0"
                y="3"
                textAnchor="middle"
                fontSize="14"
                fontWeight="900"
                fill="#D97706"
                fontFamily="sans-serif"
              >
                ?
              </text>
            </g>
          )}

          {/* Tail */}
          <g className="anim-mascot-tail">
            <path
              d="M60 62 C75 58 92 68 88 82 C85 92 68 90 58 78 Z"
              fill="#FF7B38"
            />
            {/* Tail tip (white) */}
            <path
              d="M78 72 C88 74 88 82 85 86 C80 89 74 86 72 80 Z"
              fill="#FFF8F0"
            />
          </g>

          {/* Body */}
          <ellipse cx="50" cy="74" rx="24" ry="18" fill="#FF7B38" />
          {/* White Chest */}
          <ellipse cx="50" cy="74" rx="15" ry="13" fill="#FFF8F0" />
          {/* Paws */}
          {activeMood === 'happy' || activeMood === 'celebrate' ? (
            <>
              {/* Joyfully Raised Paws */}
              <circle cx="28" cy="58" r="5" fill="#3B3660" />
              <circle cx="72" cy="58" r="5" fill="#3B3660" />
            </>
          ) : (
            <>
              {/* Resting Paws */}
              <ellipse cx="40" cy="87" rx="5.5" ry="4" fill="#3B3660" />
              <ellipse cx="60" cy="87" rx="5.5" ry="4" fill="#3B3660" />
            </>
          )}

          {/* Left Ear */}
          <g className="anim-mascot-ear-l">
            <path d="M26 42 L18 16 C18 16 34 24 38 36 Z" fill="#FF7B38" />
            <path d="M27 38 L22 22 C22 22 32 28 34 35 Z" fill="#FFF8F0" />
          </g>

          {/* Right Ear */}
          <g className="anim-mascot-ear-r">
            <path d="M74 42 L82 16 C82 16 66 24 62 36 Z" fill="#FF7B38" />
            <path d="M73 38 L78 22 C78 22 68 28 66 35 Z" fill="#FFF8F0" />
          </g>

          {/* Head Base */}
          <ellipse cx="50" cy="46" rx="30" ry="24" fill="#FF7B38" />

          {/* Fluffy White Cheeks */}
          <path
            d="M20 48 C20 58 35 66 50 66 C65 66 80 58 80 48 C76 40 68 34 50 34 C32 34 24 40 20 48 Z"
            fill="#FFF8F0"
          />

          {/* Rosy Pink Cheeks */}
          <ellipse cx="29" cy="52" rx="5.5" ry="3.5" fill="#FF8CA6" opacity="0.85" />
          <ellipse cx="71" cy="52" rx="5.5" ry="3.5" fill="#FF8CA6" opacity="0.85" />

          {/* Eyes */}
          {activeMood === 'happy' || activeMood === 'celebrate' ? (
            /* Joyful Arc Eyes (^ ^) */
            <g stroke="#3B3660" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M33 46 Q38 40 43 46" />
              <path d="M57 46 Q62 40 67 46" />
            </g>
          ) : activeMood === 'thinking' ? (
            /* Thinking Eyes Looking Up/Right */
            <g>
              <ellipse cx="38" cy="45" rx="4" ry="5.5" fill="#3B3660" />
              <ellipse cx="62" cy="45" rx="4" ry="5.5" fill="#3B3660" />
              <circle cx="39.5" cy="43" r="1.8" fill="#FFFFFF" />
              <circle cx="63.5" cy="43" r="1.8" fill="#FFFFFF" />
            </g>
          ) : (
            /* Idle Blinking Eyes with Glimmer */
            <g className="anim-mascot-blink">
              <ellipse cx="38" cy="46" rx="4" ry="5.5" fill="#3B3660" />
              <ellipse cx="62" cy="46" rx="4" ry="5.5" fill="#3B3660" />
              <circle cx="39.5" cy="44.5" r="1.6" fill="#FFFFFF" />
              <circle cx="63.5" cy="44.5" r="1.6" fill="#FFFFFF" />
            </g>
          )}

          {/* Cute Nose */}
          <ellipse cx="50" cy="52" rx="4" ry="3" fill="#3B3660" />

          {/* Mouth */}
          {activeMood === 'happy' || activeMood === 'celebrate' ? (
            /* Wide Open Joyful Smile */
            <g transform="translate(50, 56)">
              <path d="M-6 0 Q0 8 6 0 Z" fill="#3B3660" />
              <path d="M-3 2 Q0 7 3 2 Z" fill="#FF8CA6" />
            </g>
          ) : activeMood === 'thinking' ? (
            /* Small Curious "o" */
            <ellipse cx="50" cy="58" rx="2" ry="2.5" fill="#3B3660" />
          ) : (
            /* Cute Gentle Smile */
            <path
              d="M45 56 Q50 60 55 56"
              stroke="#3B3660"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </svg>
      </div>

      {/* Speech Bubble */}
      {message && (
        <div className="animate-pop-in relative rounded-2xl rounded-bl-md bg-white px-4 py-2.5 font-extrabold text-slate-800 shadow-[0_4px_0_#ece3d2] text-sm sm:text-base border border-amber-100 max-w-[260px] sm:max-w-md">
          {message}
        </div>
      )}
    </div>
  );
}
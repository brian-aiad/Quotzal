interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  dark?: boolean;
  className?: string;
}

const SIZES = {
  xs: { height: 24, textClass: 'text-[15px]' },
  sm: { height: 30, textClass: 'text-lg' },
  md: { height: 36, textClass: 'text-[22px]' },
  lg: { height: 48, textClass: 'text-[30px]' },
  xl: { height: 64, textClass: 'text-[40px]' },
};

function QuetzalBird({ height }: { height: number }) {
  const width = Math.round(height * 40 / 52);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Tail feathers — the Quetzal's iconic long plumes */}
      <path d="M14 30 Q10 38 8 50 Q9 51 10 50 Q13 38 16 31 Z" fill="#047857" />
      <path d="M17 30 Q14 38 13 48 Q14 49 15 48 Q17 38 19 31 Z" fill="#059669" />

      {/* Body — main oval mass */}
      <ellipse cx="22" cy="24" rx="11" ry="9" fill="#059669" transform="rotate(-10 22 24)" />

      {/* Wing detail — darker overlay */}
      <ellipse cx="20" cy="26" rx="7" ry="5" fill="#047857" transform="rotate(-15 20 26)" />

      {/* Chest — crimson breast */}
      <ellipse cx="28" cy="26" rx="4" ry="5" fill="#dc2626" transform="rotate(10 28 26)" />

      {/* Head */}
      <circle cx="28" cy="16" r="7" fill="#059669" />

      {/* Crest — spiky feathers on top of head */}
      <path d="M24 10 Q25 6 26 10 Z" fill="#10b981" />
      <path d="M27 9 Q28 5 29 9 Z" fill="#10b981" />
      <path d="M30 10 Q31 6 32 10 Z" fill="#10b981" />

      {/* Beak */}
      <path d="M34 16 L39 15 L34 18 Z" fill="#047857" />

      {/* Eye */}
      <circle cx="31" cy="14" r="2.5" fill="white" />
      <circle cx="31.5" cy="14" r="1.2" fill="#1f2937" />
      <circle cx="32" cy="13.2" r="0.5" fill="white" />
    </svg>
  );
}

export function QuotzalLogo({ size = 'md', variant = 'full', dark = false, className }: LogoProps) {
  const { height, textClass } = SIZES[size];

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <QuetzalBird height={height} />
      {variant === 'full' && (
        <span className={`font-bold tracking-tight select-none leading-none ${textClass} ${dark ? 'text-white' : 'text-gray-900'}`}>
          Quotzal
        </span>
      )}
    </div>
  );
}

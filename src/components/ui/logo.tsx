interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  dark?: boolean;
  className?: string;
}

const SIZES = {
  xs: { mark: 20, textClass: 'text-[15px]' },
  sm: { mark: 24, textClass: 'text-lg' },
  md: { mark: 30, textClass: 'text-[22px]' },
  lg: { mark: 40, textClass: 'text-[30px]' },
  xl: { mark: 52, textClass: 'text-[40px]' },
};

/**
 * Quotzal "Q" mark — emerald rounded square with a bold white Q.
 * The Q is a thick ring with a short diagonal kick at 5 o'clock,
 * drawn entirely with paths so it renders identically everywhere.
 */
function QMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background */}
      <rect width="64" height="64" rx="14" fill="#059669" />

      {/* Q ring — thick circle with a cutout to form the letter O shape */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M32 12C20.954 12 12 20.954 12 32s8.954 20 20 20 20-8.954 20-20S43.046 12 32 12zm0 8c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12z"
        fill="white"
      />

      {/* Q tail kick — short diagonal bar at bottom-right */}
      <rect x="37" y="38" width="8" height="16" rx="3" transform="rotate(-40 37 38)" fill="white" />
    </svg>
  );
}

export function QuotzalLogo({ size = 'md', variant = 'full', dark = false, className }: LogoProps) {
  const { mark, textClass } = SIZES[size];

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <QMark size={mark} />
      {variant === 'full' && (
        <span
          className={`font-bold select-none leading-none ${textClass} ${dark ? 'text-white' : 'text-gray-900'}`}
          style={{ letterSpacing: '-0.03em' }}
        >
          Quotzal
        </span>
      )}
    </div>
  );
}

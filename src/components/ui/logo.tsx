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
      {/* Rounded square background */}
      <rect width="64" height="64" rx="14" fill="#059669" />
      {/* Q letter — clean geometric, with tail notch suggesting a quetzal feather */}
      <circle cx="30" cy="29" r="14" stroke="white" strokeWidth="5" fill="none" />
      {/* Tail — diagonal line extending from bottom-right of the Q, curving slightly */}
      <path
        d="M38 37 L52 53 Q50 55 48 53 L36 39"
        fill="white"
      />
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

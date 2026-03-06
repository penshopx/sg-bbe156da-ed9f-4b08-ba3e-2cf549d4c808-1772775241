import { useId } from "react";

interface ChaesaLogoProps {
  size?: number;
  className?: string;
}

export function ChaesaLogo({ size = 32, className = "" }: ChaesaLogoProps) {
  const id = useId();
  const bgId = `chaesa-bg-${id}`;
  const glowId = `chaesa-glow-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id={glowId} x1="30" y1="25" x2="95" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill={`url(#${bgId})`} />
      <rect width="120" height="120" rx="28" fill={`url(#${glowId})`} />

      <path
        d="M35 42C35 38.134 38.134 35 42 35H68C71.866 35 75 38.134 75 42V58C75 61.866 71.866 65 68 65H42C38.134 65 35 61.866 35 58V42Z"
        fill="white"
        fillOpacity="0.95"
      />

      <circle cx="46" cy="44" r="3" fill="#7C3AED" />

      <circle cx="82" cy="52" r="14" fill="white" fillOpacity="0.95" />
      <path
        d="M78 46V58L89 52L78 46Z"
        fill="#A855F7"
      />

      <path
        d="M40 78H52"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeOpacity="0.9"
      />
      <path
        d="M40 86H62"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />

      <circle cx="82" cy="78" r="3" fill="#34D399" />
      <circle cx="82" cy="78" r="6" fill="#34D399" fillOpacity="0.3" />
    </svg>
  );
}

export function ChaesaLogoMark({ size = 24, className = "" }: ChaesaLogoProps) {
  const id = useId();
  const markBgId = `chaesa-mark-bg-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={markBgId} x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>

      <path
        d="M30 38C30 34.134 33.134 31 37 31H63C66.866 31 70 34.134 70 38V54C70 57.866 66.866 61 63 61H37C33.134 61 30 57.866 30 54V38Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      <circle cx="41" cy="40" r="3" fill={`url(#${markBgId})`} />

      <circle cx="82" cy="48" r="16" fill="currentColor" fillOpacity="0.9" />
      <path d="M77 42V54L90 48L77 42Z" fill={`url(#${markBgId})`} />

      <path d="M35 74H50" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeOpacity="0.7" />
      <path d="M35 84H60" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeOpacity="0.45" />

      <circle cx="82" cy="76" r="4" fill="#34D399" />
      <circle cx="82" cy="76" r="8" fill="#34D399" fillOpacity="0.25" />
    </svg>
  );
}

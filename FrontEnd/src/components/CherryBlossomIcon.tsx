interface CherryBlossomIconProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export function CherryBlossomIcon({ size = 24, className = '', animated = false }: CherryBlossomIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`${className} ${animated ? 'cherry-blossom-float' : ''}`}
      fill="none"
    >
      {/* Main petals */}
      <g>
        {/* Top petal */}
        <path
          d="M12 2 Q10 6 12 8 Q14 6 12 2Z"
          fill="url(#sakuraPetal1)"
          stroke="rgba(237, 100, 166, 0.3)"
          strokeWidth="0.5"
        />
        
        {/* Right petal */}
        <path
          d="M22 12 Q18 10 16 12 Q18 14 22 12Z"
          fill="url(#sakuraPetal2)"
          stroke="rgba(237, 100, 166, 0.3)"
          strokeWidth="0.5"
        />
        
        {/* Bottom petal */}
        <path
          d="M12 22 Q14 18 12 16 Q10 18 12 22Z"
          fill="url(#sakuraPetal3)"
          stroke="rgba(237, 100, 166, 0.3)"
          strokeWidth="0.5"
        />
        
        {/* Left petal */}
        <path
          d="M2 12 Q6 14 8 12 Q6 10 2 12Z"
          fill="url(#sakuraPetal4)"
          stroke="rgba(237, 100, 166, 0.3)"
          strokeWidth="0.5"
        />
        
        {/* Top-right petal */}
        <path
          d="M18 6 Q15 8 16 10 Q18 9 18 6Z"
          fill="url(#sakuraPetal5)"
          stroke="rgba(237, 100, 166, 0.3)"
          strokeWidth="0.5"
        />
      </g>
      
      {/* Center */}
      <circle
        cx="12"
        cy="12"
        r="2"
        fill="url(#sakuraCenter)"
        stroke="rgba(102, 126, 234, 0.4)"
        strokeWidth="0.5"
      />
      
      {/* Small decorative dots */}
      <circle cx="12" cy="12" r="0.5" fill="rgba(255, 255, 255, 0.8)" />
      <circle cx="11" cy="11.5" r="0.3" fill="rgba(255, 183, 197, 0.6)" />
      <circle cx="13" cy="12.5" r="0.3" fill="rgba(255, 183, 197, 0.6)" />
      
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="sakuraPetal1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffb7c5" />
          <stop offset="100%" stopColor="#ffc2ce" />
        </linearGradient>
        <linearGradient id="sakuraPetal2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffc2ce" />
          <stop offset="100%" stopColor="#ffcdd7" />
        </linearGradient>
        <linearGradient id="sakuraPetal3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffcdd7" />
          <stop offset="100%" stopColor="#ffd8e0" />
        </linearGradient>
        <linearGradient id="sakuraPetal4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd8e0" />
          <stop offset="100%" stopColor="#ffe3e9" />
        </linearGradient>
        <linearGradient id="sakuraPetal5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe3e9" />
          <stop offset="100%" stopColor="#ffb7c5" />
        </linearGradient>
        <radialGradient id="sakuraCenter" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(102, 126, 234, 0.8)" />
          <stop offset="100%" stopColor="rgba(118, 75, 162, 0.6)" />
        </radialGradient>
      </defs>
    </svg>
  );
}
import { useState, useEffect } from 'react';

interface ChibiAvatarProps {
  mood?: 'sad' | 'neutral' | 'happy' | 'thinking' | 'speaking';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ChibiAvatar({ mood = 'neutral', size = 'md', className = '' }: ChibiAvatarProps) {
  const [blinkState, setBlinkState] = useState(false);
  const [floatOffset, setFloatOffset] = useState(0);

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 120);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Floating animation
  useEffect(() => {
    const floatInterval = setInterval(() => {
      setFloatOffset(prev => (prev + 0.1) % (Math.PI * 2));
    }, 100);

    return () => clearInterval(floatInterval);
  }, []);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const getEyeProps = () => {
    if (blinkState) {
      return { ry: '0.2', opacity: 0.8 };
    }
    
    switch (mood) {
      case 'sad':
        return { ry: '1.0', opacity: 1 };
      case 'happy':
        return { ry: '1.8', opacity: 1 };
      case 'thinking':
        return { ry: '1.5', opacity: 1, transform: 'translateX(-0.5px)' };
      default:
        return { ry: '1.5', opacity: 1 };
    }
  };

  const getMouthPath = () => {
    switch (mood) {
      case 'sad':
        return 'M9 16 Q12 14 15 16';
      case 'happy':
        return 'M9 15 Q12 17 15 15';
      case 'thinking':
        return 'M10.5 15.5 Q12 16 13.5 15.5';
      case 'speaking':
        return 'M10 15 Q12 17.5 14 15';
      default:
        return 'M10.5 15.5 L13.5 15.5';
    }
  };

  const floatY = Math.sin(floatOffset) * 3;

  return (
    <div 
      className={`relative ${sizeClasses[size]} ${className}`}
      style={{ transform: `translateY(${floatY}px)` }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-200/20 to-indigo-200/20 blur-md animate-pulse" />
      
      {/* Main character */}
      <div className="relative w-full h-full">
        <svg viewBox="0 0 24 24" className="w-full h-full">
          {/* Head/Body */}
          <ellipse
            cx="12"
            cy="12"
            rx="10"
            ry="11"
            fill="url(#chibiGradient)"
            stroke="rgba(74, 85, 104, 0.3)"
            strokeWidth="0.5"
          />
          
          {/* Blush marks */}
          <ellipse
            cx="6.5"
            cy="12"
            rx="1.2"
            ry="0.8"
            fill="rgba(255, 183, 197, 0.6)"
            opacity={mood === 'sad' ? 0.8 : 0.4}
          />
          <ellipse
            cx="17.5"
            cy="12"
            rx="1.2"
            ry="0.8"
            fill="rgba(255, 183, 197, 0.6)"
            opacity={mood === 'sad' ? 0.8 : 0.4}
          />
          
          {/* Eyes */}
          <ellipse
            cx="9"
            cy="10"
            rx="1.2"
            ry={getEyeProps().ry}
            fill="#2d3748"
            opacity={getEyeProps().opacity}
            style={getEyeProps().transform ? { transform: getEyeProps().transform } : {}}
          />
          <ellipse
            cx="15"
            cy="10"
            rx="1.2"
            ry={getEyeProps().ry}
            fill="#2d3748"
            opacity={getEyeProps().opacity}
            style={getEyeProps().transform ? { transform: getEyeProps().transform } : {}}
          />
          
          {/* Eye highlights */}
          {!blinkState && (
            <>
              <circle cx="9.3" cy="9.5" r="0.4" fill="white" opacity="0.9" />
              <circle cx="15.3" cy="9.5" r="0.4" fill="white" opacity="0.9" />
              <circle cx="8.8" cy="10.2" r="0.2" fill="white" opacity="0.6" />
              <circle cx="14.8" cy="10.2" r="0.2" fill="white" opacity="0.6" />
            </>
          )}
          
          {/* Mouth */}
          <path
            d={getMouthPath()}
            stroke="#4a5568"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Thought bubble for thinking mood */}
          {mood === 'thinking' && (
            <g opacity="0.7">
              <circle cx="18" cy="5" r="2" fill="white" stroke="#a0aec0" strokeWidth="0.5" />
              <circle cx="16" cy="6.5" r="1" fill="white" stroke="#a0aec0" strokeWidth="0.5" />
              <circle cx="15" cy="7.5" r="0.5" fill="white" stroke="#a0aec0" strokeWidth="0.5" />
              <text x="18" y="6" textAnchor="middle" fontSize="1.5" fill="#4a5568">?</text>
            </g>
          )}
          
          {/* Speech indicator for speaking mood */}
          {mood === 'speaking' && (
            <g opacity="0.7">
              <path
                d="M20 8 Q22 6 24 8 Q22 10 20 8"
                fill="rgba(102, 126, 234, 0.3)"
                className="animate-pulse"
              />
            </g>
          )}
          
          {/* Hair/decoration */}
          <path
            d="M4 8 Q8 4 12 6 Q16 4 20 8"
            stroke="rgba(102, 126, 234, 0.5)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Small cherry blossom decoration */}
          <g transform="translate(2, 4)" opacity="0.6">
            <path
              d="M0 2 Q1 1 2 2 Q1 3 0 2 M2 0 Q3 1 2 2 Q1 1 2 0"
              fill="rgba(255, 183, 197, 0.8)"
              className="cherry-blossom-float"
            />
          </g>
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="chibiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(247, 250, 252, 0.9)" />
              <stop offset="50%" stopColor="rgba(255, 183, 197, 0.1)" />
              <stop offset="100%" stopColor="rgba(168, 178, 200, 0.05)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Subtle shadow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-8 h-2 bg-indigo-400/10 rounded-full blur-sm" />
    </div>
  );
}
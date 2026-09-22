import React from 'react';

interface TruckIconProps {
  className?: string;
  variant?: 'white' | 'blue' | 'green' | 'purple';
}

export const TruckIcon: React.FC<TruckIconProps> = ({
  className = 'w-12 h-12',
  variant = 'white',
}) => {
  const getColor = () => {
    switch (variant) {
      case 'blue':
        return '#0284c7';
      case 'green':
        return '#16a34a';
      case 'purple':
        return '#7c3aed';
      case 'white':
      default:
        return 'currentColor';
    }
  };

  const fill = getColor();

  return (
    <svg
      viewBox="0 0 120 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="صهريج مياه"
    >
      {/* Tank body */}
      <rect x="5" y="16" width="70" height="34" rx="17" fill={fill} />
      {/* Tank horizontal highlight stripe */}
      <path d="M7 32H73" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
      {/* Tank top filling dome */}
      <rect x="33" y="11" width="14" height="6" rx="2" fill={fill} />
      <rect x="25" y="13" width="30" height="3" rx="1.5" fill={fill} />
      
      {/* Truck Cab */}
      <path
        d="M74 20H93C97.4183 20 101 23.5817 101 28V36L108 42V50H74V20Z"
        fill={fill}
      />
      {/* Front bumper */}
      <rect x="106" y="47" width="6" height="5" rx="2" fill={fill} />
      {/* Cab Window */}
      <path
        d="M79 24H92C94.5 24 96.5 26 96.5 28.5V36H79V24Z"
        fill="white"
        opacity="0.9"
      />

      {/* Rear chassis mudguard */}
      <rect x="8" y="47" width="58" height="5" fill={fill} opacity="0.6" />

      {/* Wheels */}
      {/* Rear Wheel 1 */}
      <circle cx="20" cy="52" r="10" fill={fill} />
      <circle cx="20" cy="52" r="5" fill="white" />
      {/* Rear Wheel 2 */}
      <circle cx="44" cy="52" r="10" fill={fill} />
      <circle cx="44" cy="52" r="5" fill="white" />
      {/* Front Wheel */}
      <circle cx="92" cy="52" r="10" fill={fill} />
      <circle cx="92" cy="52" r="5" fill="white" />
    </svg>
  );
};

export default TruckIcon;

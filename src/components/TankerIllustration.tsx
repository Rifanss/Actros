import React from 'react';

interface TankerIllustrationProps {
  type: 'potable' | 'non-potable';
  className?: string;
  style?: React.CSSProperties;
}

export const TankerIllustration: React.FC<TankerIllustrationProps> = ({
  type,
  className = 'w-full h-auto',
  style,
}) => {
  const isPotable = type === 'potable';
  const src = isPotable ? '/assets/potable_tanker_exact.png' : '/assets/non_potable_tanker_exact.png';
  const alt = isPotable ? 'صهريج مياه صالحة للشرب' : 'صهريج مياه غير صالحة للشرب';

  return (
    <img
      src={src}
      alt={alt}
      className={`object-contain select-none pointer-events-none ${className}`}
      style={style}
      loading="eager"
      draggable={false}
    />
  );
};

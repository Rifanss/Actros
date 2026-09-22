import React from 'react';

export interface NabaaLogoProps {
  className?: string;
  variant?: 'full' | 'image' | 'vector' | 'icon' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  inverted?: boolean;
  showSubtitle?: boolean;
}

// Logo disabled completely per user instruction
export const NabaaLogo: React.FC<NabaaLogoProps> = () => {
  return null;
};

export default NabaaLogo;

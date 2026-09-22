import React from 'react';
import { useWaterData } from '../context/WaterDataContext';
import { ArrowRight } from 'lucide-react';
import { scrollToTop } from '../utils/scrollUtils';

export interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  variant?: 'light' | 'dark' | 'white' | 'ghost' | 'sky';
  size?: 'xs' | 'sm';
  className?: string;
  showIcon?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({
  label = 'الرجوع',
  onClick,
  variant = 'white',
  size = 'xs',
  className = '',
  showIcon = true,
}) => {
  const { goBack } = useWaterData();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    scrollToTop(true);
    if (onClick) {
      onClick();
    } else {
      goBack();
    }
    scrollToTop(true);
  };

  const variantStyles = {
    white: 'bg-white hover:bg-sky-50 active:bg-sky-100 text-slate-700 hover:text-sky-700 border border-slate-200/90 shadow-2xs',
    light: 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 border border-slate-200/80',
    dark: 'bg-white/15 hover:bg-white/25 active:bg-white/30 text-white border border-white/25 shadow-2xs backdrop-blur-xs',
    ghost: 'hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 border border-transparent',
    sky: 'bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white border border-sky-400 shadow-2xs',
  };

  const sizeStyles = {
    xs: 'px-2 py-1 text-[11px] gap-1',
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center font-bold rounded-lg transition-all active:scale-95 cursor-pointer select-none shrink-0 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {showIcon && <ArrowRight className="w-3.5 h-3.5 shrink-0" />}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
};

export default BackButton;

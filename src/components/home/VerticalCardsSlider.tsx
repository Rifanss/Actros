import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

export interface VerticalSlide {
  id: number;
  src: string;
  alt: string;
  title: string;
}

export const VERTICAL_SLIDES: VerticalSlide[] = [
  {
    id: 1,
    src: '/assets/cards_slider/slide_1.jpg',
    alt: 'كيف نوصلك المياه - نبع لتوريد المياه',
    title: 'كيف نوصلك المياه',
  },
  {
    id: 2,
    src: '/assets/cards_slider/slide_2.jpg',
    alt: 'طلب الخدمة - إشعار فوري بالطلب وتأكيد فوري',
    title: 'طلب الخدمة الفوري',
  },
  {
    id: 3,
    src: '/assets/cards_slider/slide_3.jpg',
    alt: 'تحديد أقرب ناقلة لخدمتك في منطقتك',
    title: 'تحديد أقرب ناقلة',
  },
  {
    id: 4,
    src: '/assets/cards_slider/slide_4.jpg',
    alt: 'محطة التعبئة - تعبئة مياه نقية صالحة للشرب',
    title: 'محطة التعبئة الآمنة',
  },
  {
    id: 5,
    src: '/assets/cards_slider/slide_5.jpg',
    alt: 'توصيل سريع لبابك بأعلى معايير الجودة',
    title: 'توصيل سريع لبابك',
  },
];

// 1mm Titanium Silver Border & Metallic Luster Style (مطابق تماماً لمواصفات السلايدر الأول)
const titaniumCardStyle: React.CSSProperties = {
  borderWidth: '1mm',
  borderStyle: 'solid',
  borderColor: '#9ea7b4', // Titanium Silver Tone
  boxShadow:
    '0 16px 32px -6px rgba(15, 23, 42, 0.25), 0 6px 14px -2px rgba(15, 23, 42, 0.12), inset 0 1px 1.5px rgba(255, 255, 255, 0.8), inset 0 -1px 1px rgba(0, 0, 0, 0.15)',
  outline: '1px solid rgba(255, 255, 255, 0.35)',
  outlineOffset: '-1mm',
};

const titaniumBackCardStyle: React.CSSProperties = {
  borderWidth: '1mm',
  borderStyle: 'solid',
  borderColor: '#98a2af', // Slightly darker titanium tone for depth
  boxShadow:
    '0 10px 20px -4px rgba(15, 23, 42, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
  outline: '1px solid rgba(255, 255, 255, 0.25)',
  outlineOffset: '-1mm',
};

// Slide motion variants supporting forward and reverse sliding (الانزلاق والعكس)
const slideVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? '100%' : '-100%',
    opacity: 0.45,
    scale: 0.96,
  }),
  center: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      y: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
      opacity: { duration: 0.35 },
      scale: { duration: 0.35 },
    },
  },
  exit: (direction: number) => ({
    y: direction > 0 ? '-100%' : '100%',
    opacity: 0.2,
    scale: 0.96,
    transition: {
      y: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
      opacity: { duration: 0.3 },
      scale: { duration: 0.3 },
    },
  }),
};

export const VerticalCardsSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1); // 1 = للأمام, -1 = بالعكس
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play sliding and reversing (الانزلاق والعكس ذهاباً وإياباً تلقائياً)
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setTimeout(() => {
      if (direction > 0) {
        // انزلاق للأمام
        if (currentIndex >= VERTICAL_SLIDES.length - 1) {
          // الوصول لآخر بطاقة -> عكس اتجاه الانزلاق للخلف
          setDirection(-1);
          setCurrentIndex(currentIndex - 1);
        } else {
          setCurrentIndex(currentIndex + 1);
        }
      } else {
        // انزلاق بالعكس (للخلف)
        if (currentIndex <= 0) {
          // الوصول لأول بطاقة -> عكس اتجاه الانزلاق للأمام
          setDirection(1);
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(currentIndex - 1);
        }
      }
    }, 4500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, direction, isPaused]);

  const handleNext = () => {
    if (currentIndex >= VERTICAL_SLIDES.length - 1) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    } else {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex <= 0) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    } else {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSelect = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const toggleDirection = () => {
    setDirection((prev) => (prev > 0 ? -1 : 1));
  };

  const currentSlide = VERTICAL_SLIDES[currentIndex];

  // البطاقة المتراكبة في الخلف بناءً على اتجاه الانزلاق والعكس
  const backIndex =
    direction > 0
      ? (currentIndex + 1) % VERTICAL_SLIDES.length
      : (currentIndex - 1 + VERTICAL_SLIDES.length) % VERTICAL_SLIDES.length;
  const backSlide = VERTICAL_SLIDES[backIndex];

  return (
    <div
      className="relative w-full max-w-[340px] sm:max-w-[370px] mx-auto select-none touch-pan-y"
      style={{ touchAction: 'pan-y' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* 3:4 Aspect Ratio Frame (Exact proportions of the 965x1280 uploaded cards) */}
      <div className="relative w-full aspect-[3/4]">
        {/* Layer 1: Stacked Card behind responding dynamically to slide and reverse direction */}
        <div
          key={`vertical-back-card-${backSlide.id}-${direction}`}
          className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 pointer-events-none transition-transform duration-500"
          style={{
            ...titaniumBackCardStyle,
            transform:
              direction > 0
                ? 'translateY(10px) scale(0.95)'
                : 'translateY(-10px) scale(0.95)',
            transformOrigin: direction > 0 ? 'bottom center' : 'top center',
            opacity: 0.85,
            zIndex: 5,
          }}
        >
          <img
            src={backSlide.src}
            alt={backSlide.alt}
            loading="eager"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover block filter brightness-90"
          />
          {/* Subtle shading overlay for back card depth */}
          <div className="absolute inset-0 bg-slate-950/25 pointer-events-none" />
        </div>

        {/* Layer 0: Active Card with Slide and Reverse Transition (انزلاق وعكس) and 1mm Titanium Silver Border */}
        <div className="relative w-full h-full overflow-hidden rounded-2xl sm:rounded-3xl">
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={`vertical-slide-card-${currentSlide.id}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.25}
              onDragEnd={(_e, { offset, velocity }) => {
                if (offset.y < -35 || velocity.y < -200) {
                  // Swiped up -> slide to next card
                  handleNext();
                } else if (offset.y > 35 || velocity.y > 200) {
                  // Swiped down -> slide in reverse to prev card
                  handlePrev();
                }
              }}
              className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 cursor-grab active:cursor-grabbing group"
              style={{
                ...titaniumCardStyle,
                zIndex: 20,
              }}
            >
              <img
                src={currentSlide.src}
                alt={currentSlide.alt}
                loading="eager"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover block"
              />

              {/* Brushed Titanium reflection shimmer overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.04) 30%, rgba(0,0,0,0) 70%, rgba(255,255,255,0.10) 100%)',
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Quick Vertical Navigation Buttons (Floated on side) */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="w-7 h-7 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-sky-700 shadow-md border border-slate-200/80 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
            aria-label="السابق (عكس)"
            title="السابق (عكس)"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="w-7 h-7 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-sky-700 shadow-md border border-slate-200/80 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
            aria-label="التالي (انزلاق)"
            title="التالي (انزلاق)"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Indicators & Current Title Pill underneath */}
      <div className="flex flex-col items-center gap-1.5 mt-3 px-2">
        {/* Indicators Row */}
        <div className="flex items-center justify-center gap-1.5">
          {VERTICAL_SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={slide.id}
                onClick={() => handleSelect(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer h-1.5 ${
                  isActive
                    ? 'w-7 bg-[#0066d6] shadow-xs'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={slide.title}
                title={slide.title}
              />
            );
          })}
        </div>

        {/* Active Title Banner with Slide & Reverse Direction Indicator */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#042b57] bg-white/85 border border-slate-200/80 px-3 py-1 rounded-full shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span>{currentSlide.title}</span>
          <button
            type="button"
            onClick={toggleDirection}
            className="text-[10px] px-1.5 py-0.5 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/60 font-bold flex items-center gap-0.5 transition cursor-pointer"
            title="انقر لعكس اتجاه الانزلاق"
          >
            <span>{direction > 0 ? 'انزلاق للأمام ↑' : 'انزلاق بالعكس ↓'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerticalCardsSlider;

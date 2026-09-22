import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Mandatory sequence of the 5 slides:
// 1. كيف نوصلك المياه
// 2. طلب الخدمة
// 3. تحديد أقرب ناقلة
// 4. محطة التعبئة
// 5. توصيل سريع لبابك
const SLIDES = [
  {
    id: 1,
    src: '/assets/slider/slide_1_how_we_deliver.jpg',
    alt: 'كيف نوصلك المياه',
    label: 'كيف نوصلك المياه',
  },
  {
    id: 2,
    src: '/assets/slider/slide_2_order_service.jpg',
    alt: 'طلب الخدمة',
    label: 'طلب الخدمة',
  },
  {
    id: 3,
    src: '/assets/slider/slide_3_nearest_tanker.jpg',
    alt: 'تحديد أقرب ناقلة',
    label: 'تحديد أقرب ناقلة',
  },
  {
    id: 4,
    src: '/assets/slider/slide_4_filling_station.jpg',
    alt: 'محطة التعبئة',
    label: 'محطة التعبئة',
  },
  {
    id: 5,
    src: '/assets/slider/slide_5_fast_delivery.jpg',
    alt: 'توصيل سريع لبابك',
    label: 'توصيل سريع لبابك',
  },
];

// 1mm Titanium Silver Border & Metallic Luster Style
const titaniumCardStyle: React.CSSProperties = {
  borderWidth: '1mm',
  borderStyle: 'solid',
  borderColor: '#9ea7b4', // Titanium Silver Tone
  boxShadow:
    '0 14px 30px -6px rgba(15, 23, 42, 0.22), 0 4px 12px -2px rgba(15, 23, 42, 0.1), inset 0 1px 1.5px rgba(255, 255, 255, 0.8), inset 0 -1px 1px rgba(0, 0, 0, 0.15)',
  outline: '1px solid rgba(255, 255, 255, 0.35)',
  outlineOffset: '-1mm',
};

const titaniumBackCardStyle: React.CSSProperties = {
  borderWidth: '1mm',
  borderStyle: 'solid',
  borderColor: '#98a2af', // Slightly darker titanium tone for depth
  boxShadow:
    '0 8px 18px -4px rgba(15, 23, 42, 0.16), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
  outline: '1px solid rgba(255, 255, 255, 0.25)',
  outlineOffset: '-1mm',
};

// Horizontal Slide motion variants (الانزلاق الأفقي)
const horizontalSlideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0.6,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
      opacity: { duration: 0.35 },
      scale: { duration: 0.35 },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0.15,
    scale: 0.98,
    transition: {
      x: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
      opacity: { duration: 0.3 },
      scale: { duration: 0.3 },
    },
  }),
};

export const StackedCardsSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play sliding horizontally every 5 seconds when not paused
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setTimeout(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isPaused]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleSelect = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const currentSlide = SLIDES[currentIndex];
  const nextIndex = (currentIndex + 1) % SLIDES.length;
  const nextSlide = SLIDES[nextIndex];

  return (
    <section
      className="relative w-full pt-1 pb-3 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* 16:9 Aspect Ratio Frame with Stacked Depth & 1mm Titanium Silver Border */}
      <div className="relative w-full aspect-[16/9] group">
        {/* Layer 1: Next Card stacked neatly behind with 1mm Titanium Silver Border */}
        <div
          key={`back-card-${nextSlide.id}`}
          className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 pointer-events-none transition-transform duration-500"
          style={{
            ...titaniumBackCardStyle,
            transform: 'translateY(6px) scale(0.96)',
            transformOrigin: 'bottom center',
            opacity: 0.85,
            zIndex: 5,
          }}
        >
          <img
            src={nextSlide.src}
            alt={nextSlide.alt}
            loading="eager"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover block filter brightness-90"
          />
          {/* Subtle shading overlay for back card depth */}
          <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />
        </div>

        {/* Layer 0: Active Card with Horizontal Sliding Transition (انزلاق أفقي) and 1mm Titanium Silver Border */}
        <div className="relative w-full h-full overflow-hidden rounded-2xl sm:rounded-3xl">
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={`slide-card-${currentSlide.id}`}
              custom={direction}
              variants={horizontalSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_e, { offset, velocity }) => {
                if (offset.x < -35 || velocity.x < -200) {
                  // Swiped left -> advance next
                  handleNext();
                } else if (offset.x > 35 || velocity.x > 200) {
                  // Swiped right -> go prev
                  handlePrev();
                }
              }}
              className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 cursor-grab active:cursor-grabbing"
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
                    'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 30%, rgba(0,0,0,0) 70%, rgba(255,255,255,0.12) 100%)',
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Horizontal Navigation Edge Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 active:scale-90 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer shadow-md opacity-85 sm:opacity-0 group-hover:opacity-100"
          aria-label="السابق"
          title="الشريحة السابقة"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 active:scale-90 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer shadow-md opacity-85 sm:opacity-0 group-hover:opacity-100"
          aria-label="التالي"
          title="الشريحة التالية"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Step Indicators (5 Steps with active titanium highlight and arrow controls) */}
      <div className="flex items-center justify-center gap-2 mt-2.5 px-2">
        <button
          type="button"
          onClick={handlePrev}
          className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer active:scale-95 text-xs"
          aria-label="السابق"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5">
          {SLIDES.map((slide, idx) => {
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
                aria-label={slide.label}
                title={slide.label}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer active:scale-95 text-xs"
          aria-label="التالي"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};

export default StackedCardsSlider;

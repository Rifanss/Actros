import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AnimatedPosterHeadlineProps {
  onOpenOrderModal?: () => void;
}

interface HeadlineItem {
  id: string;
  title: string;
  line1: string;
  line2: string;
  badge: string;
}

export const AnimatedPosterHeadline: React.FC<AnimatedPosterHeadlineProps> = ({
  onOpenOrderModal,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const headlines: HeadlineItem[] = [
    {
      id: '24_hours',
      title: 'خدمة على مدار الساعة',
      line1: 'فريق العمل والأسطول في جاهزية تامة واستجابة فورية',
      line2: '24/7 طوال أيام الأسبوع',
      badge: 'جاهزية 24/7',
    },
    {
      id: 'fast_delivery',
      title: 'سرعة في التوريد',
      line1: 'نظام توجيه ذكي يربط طلبك بأقرب صهريج في منطقتك',
      line2: 'لتوصيل سريع يسبق حاجتك',
      badge: 'استجابة وتوصيل فوري',
    },
    {
      id: 'ready_fleet',
      title: 'أسطول جاهز لخدمتكم',
      line1: 'صهاريج حديثة متعددة السعات ومجهزة بأحدث المضخات',
      line2: 'لتلبية كافة الاحتياجات',
      badge: 'أسطول صهاريج متكامل',
    },
    {
      id: 'all_areas',
      title: 'تغطية شاملة لجميع المناطق',
      line1: 'شبكة توريد وتغطية واسعه ، تصل إلى كافة الأحياء والمخططات',
      line2: 'السكنية والمشاريع',
      badge: 'تغطية جغرافية كاملة',
    },
  ];

  // التبديل التلقائي كل 6 ثوانٍ
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % headlines.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, headlines.length]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % headlines.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + headlines.length) % headlines.length);
  };

  const currentItem = headlines[currentIndex];

  return (
    <div
      className="absolute bottom-0 inset-x-0 z-20 pointer-events-auto select-none"
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => {
        if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), 3500);
      }}
    >
      {/* تدرج لوني داكن ناعم خلف النص لضمان وضوح القراءة فوق الفيديو */}
      <div className="relative w-full pt-16 pb-4 sm:pb-5 px-5 sm:px-7 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <div className="max-w-md mx-auto flex flex-col items-stretch text-right">
          {/* منطقة تبديل العنوان والوصف بحركة انسيابية مع فاصل بصري واضح مقسوم على سطرين */}
          <div className="relative w-full min-h-[104px] sm:min-h-[112px] flex items-center justify-start overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, x: -25, filter: 'blur(2px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 25, filter: 'blur(2px)' }}
                transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
                className="flex flex-col items-start justify-center cursor-pointer w-full text-right"
                onClick={() => onOpenOrderModal && onOpenOrderModal()}
                title={`${currentItem.title} - اضغط لطلب صهريجك الآن`}
              >
                <div className="w-full text-right">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] text-right leading-tight">
                    {currentItem.title}
                  </h3>
                </div>

                {/* فاصل بصري أنيق ومضيء يفصل العنوان عن النص الذي تحته */}
                <div className="flex items-center gap-1.5 my-1.5 w-full">
                  <span className="w-12 sm:w-14 h-1 rounded-full bg-gradient-to-l from-sky-400 via-sky-300 to-blue-500 shadow-[0_0_10px_rgba(56,189,248,0.85)]" />
                  <span className="w-2.5 h-1 rounded-full bg-sky-300/80" />
                  <span className="w-1.5 h-1 rounded-full bg-white/40" />
                </div>

                {/* النص تحت العنوان مقسوم على سطرين بدقة ووضوح */}
                <div className="w-full text-right flex flex-col gap-0.5 drop-shadow-[0_1px_5px_rgba(0,0,0,0.95)]">
                  <span className="text-xs sm:text-[13px] font-semibold text-slate-100/95 leading-snug block text-right">
                    {currentItem.line1}
                  </span>
                  <span className="text-xs sm:text-[13px] font-semibold text-sky-200/95 leading-snug block text-right">
                    {currentItem.line2}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* شريط التحكم: أزرار السابق والتالي ومؤشرات النقاط */}
          <div className="w-full flex items-center justify-between gap-3 pt-2 mt-1 border-t border-white/15">
            <button
              type="button"
              onClick={handlePrev}
              className="w-6 h-6 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-xs active:scale-95 text-sky-200 flex items-center justify-center transition cursor-pointer"
              aria-label="السابق"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5">
              {headlines.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    idx === currentIndex
                      ? 'w-7 sm:w-8 h-1.5 bg-gradient-to-r from-sky-400 to-blue-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]'
                      : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`الانتقال إلى ${item.title}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-6 h-6 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-xs active:scale-95 text-sky-200 flex items-center justify-center transition cursor-pointer"
              aria-label="التالي"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedPosterHeadline;

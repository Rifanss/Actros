import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Droplets } from 'lucide-react';

interface AnimatedPosterTitleProps {
  onClick?: () => void;
}

export const AnimatedPosterTitle: React.FC<AnimatedPosterTitleProps> = ({ onClick }) => {
  return (
    <div
      className="absolute top-0 inset-x-0 z-20 pointer-events-none select-none overflow-hidden"
      onClick={onClick}
    >
      {/* حاوية العنوان والشعار المثبت في أعلى الفيديو بدون تظليل أسود */}
      <div className="relative max-w-md mx-auto px-3.5 sm:px-4 pt-3 sm:pt-4 flex items-center justify-between">
        {/* الجانب الأيمن: العنوان الرسمي وسطر الفزعة */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`flex items-center gap-2 sm:gap-2.5 text-right ${
            onClick ? 'pointer-events-auto cursor-pointer group' : ''
          }`}
        >
          {/* النصوص: العنوان + الشعار اللفظي */}
          <div className="flex flex-col justify-center">
            {/* العنوان الرئيسي */}
            <div className="relative inline-block">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-center gap-1.5">
                <span>نبع لتوريد المياه</span>
                {/* بريق متحرك على العنوان */}
                <motion.span
                  animate={{
                    scale: [0, 1.2, 0],
                    rotate: [0, 90, 180],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    repeatDelay: 2.5,
                    ease: 'easeOut',
                  }}
                  className="inline-block text-sky-200 drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-white stroke-sky-300" />
                </motion.span>
              </h1>

              {/* وميض ضوئي متحرك ناعم عبر العنوان */}
              <motion.div
                animate={{
                  x: ['200%', '-200%'],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  repeatDelay: 2.5,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 bg-gradient-to-l from-transparent via-white/40 to-transparent skew-x-[-20deg] mix-blend-overlay pointer-events-none"
              />
            </div>

            {/* الشعار اللفظي: فزعه قبل الحاجة */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] sm:text-xs font-black text-amber-300 drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)] flex items-center gap-1">
                <span>فزعه قبل الحاجة</span>
                <span className="inline-block w-1 h-1 rounded-full bg-amber-300 animate-pulse"></span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* مساحة فارغة في اليسار مخصصة لزر القائمة الجانبية (Hamburger Menu) في الهيدر لعدم التداخل */}
        <div className="w-10 h-10 shrink-0 pointer-events-none" />
      </div>
    </div>
  );
};

export default AnimatedPosterTitle;

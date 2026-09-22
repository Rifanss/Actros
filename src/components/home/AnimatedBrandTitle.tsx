import React from 'react';
import { motion } from 'motion/react';
import { Droplet, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface AnimatedBrandTitleProps {
  onOrderClick?: () => void;
}

export const AnimatedBrandTitle: React.FC<AnimatedBrandTitleProps> = ({ onOrderClick }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#072448] via-[#004f9e] to-[#0066d6] p-4 sm:p-5 text-white shadow-lg border border-sky-400/25 text-center">
      {/* Background Animated Water Waves / Caustic Light Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <motion.div
          animate={{
            x: ['-20%', '20%', '-20%'],
            y: ['-10%', '10%', '-10%'],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -inset-[50%] bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.35)_0%,transparent_50%)]"
        />
        <motion.div
          animate={{
            x: ['20%', '-20%', '20%'],
            y: ['10%', '-10%', '10%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -inset-[50%] bg-[radial-gradient(circle_at_60%_40%,rgba(251,191,36,0.2)_0%,transparent_50%)]"
        />
      </div>

      {/* Floating Sparkle Stars */}
      <motion.div
        animate={{
          scale: [0.8, 1.3, 0.8],
          opacity: [0.3, 0.9, 0.3],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-2 right-3 text-amber-300 pointer-events-none"
      >
        <Sparkles className="w-4 h-4 fill-amber-300/60" />
      </motion.div>

      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.8, 0.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute bottom-2.5 left-3 text-sky-200 pointer-events-none"
      >
        <Sparkles className="w-3.5 h-3.5 fill-sky-200/50" />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Top Mini Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sky-200 text-[10px] sm:text-xs font-bold mb-2 shadow-xs"
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            💧
          </motion.span>
          <span>المؤسسة الرائدة لتوزيع مياه التحلية والآبار</span>
        </motion.div>

        {/* ========================================================
            MAIN TITLE: "نبع لتوريد المياه" WITH ANIMATED SHIMMER EFFECT
            ======================================================== */}
        <div className="relative my-1">
          {/* Animated Glow Aura Behind Title */}
          <motion.div
            animate={{
              opacity: [0.4, 0.85, 0.4],
              scale: [0.98, 1.03, 0.98],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -inset-2 bg-gradient-to-r from-sky-400/40 via-cyan-300/30 to-blue-500/40 rounded-3xl blur-md pointer-events-none"
          />

          {/* Title Text with Liquid Gradient and Shimmer Light Sweep */}
          <div className="relative overflow-hidden px-3 py-1 rounded-xl">
            <motion.h1
              animate={{
                y: [0, -2, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] flex items-center justify-center gap-2"
            >
              <span>نبع لتوريد المياه</span>
              <motion.span
                animate={{
                  y: [-2, 2, -2],
                  rotate: [-5, 5, -5],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="text-sky-300 inline-block drop-shadow-xs"
              >
                <Droplet className="w-5 h-5 sm:w-6 sm:h-6 fill-sky-400 stroke-sky-200 inline" />
              </motion.span>
            </motion.h1>

            {/* Shimmer Light Beam Effect across the Title */}
            <motion.div
              animate={{
                x: ['-200%', '200%'],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] pointer-events-none"
            />
          </div>
        </div>

        {/* ========================================================
            SUBTITLE UNDERNEATH: "فزعه تسبق الحاجة" WITH EFFECT
            ======================================================== */}
        <div className="relative mt-1.5 flex flex-col items-center">
          {/* Animated Glowing Pill / Aura */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative"
          >
            <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/25 via-sky-400/25 to-amber-500/25 border border-amber-300/40 backdrop-blur-xs shadow-[0_0_15px_rgba(251,191,36,0.25)] flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-amber-300"
              >
                <Zap className="w-4 h-4 fill-amber-300 stroke-amber-400" />
              </motion.span>

              <h2 className="text-base sm:text-lg font-black text-amber-200 tracking-wide drop-shadow-xs">
                فزعه تسبق الحاجة
              </h2>

              <motion.span
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                className="text-sky-300"
              >
                <Sparkles className="w-3.5 h-3.5 fill-sky-300" />
              </motion.span>
            </div>
          </motion.div>

          {/* Underline Animated Wave / Pulse */}
          <motion.div
            animate={{
              width: ['40%', '85%', '40%'],
              opacity: [0.4, 0.9, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent mt-2 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]"
          />

          <p className="text-xs sm:text-[13px] text-sky-100 font-semibold mt-2 max-w-xs leading-relaxed opacity-95">
            مياه نقية وصالحة للشرب مفحوصة مخبرياً • خدمة متواصلة 24 ساعة بأسرع وقت
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnimatedBrandTitle;

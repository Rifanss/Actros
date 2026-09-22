import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Clock, Zap, Truck, MapPin, X, CheckCircle2 } from 'lucide-react';

interface AnimatedPosterIconsProps {
  onOpenOrderModal?: () => void;
}

interface FeatureIcon {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  xPercent: number; // Center X in percentage (RTL order)
  yPercent: number; // Center Y in percentage
  delay: number;
  icon: React.ReactNode;
  badgeColor: string;
}

export const AnimatedPosterIcons: React.FC<AnimatedPosterIconsProps> = ({
  onOpenOrderModal,
}) => {
  const [selectedFeature, setSelectedFeature] = useState<FeatureIcon | null>(null);

  // The 5 official features from right to left (RTL) exactly matching the poster
  const features: FeatureIcon[] = [
    {
      id: 'safe_water',
      title: 'مياه آمنة وصحية',
      shortLabel: 'مياه آمنة وصحية',
      description: 'مياه شرب نقية وعذبة مفحوصة مخبرياً وفق أدق المعايير والمواصفات القياسية الصحية لضمان سلامتكم.',
      xPercent: 85.25,
      yPercent: 80.75,
      delay: 0,
      badgeColor: 'from-sky-500 to-blue-600',
      icon: (
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Animated Water Droplet with Checkmark */}
          <motion.div
            animate={{
              scale: [1, 1.12, 1],
              y: [0, -1.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-white flex items-center justify-center"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-[58%] h-[58%] max-w-[22px] max-h-[22px] drop-shadow-xs"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </motion.div>
        </div>
      ),
    },
    {
      id: '24_hours',
      title: 'خدمة على مدار الساعة',
      shortLabel: 'خدمة 24 ساعة',
      description: 'فريق العمل والأسطول في جاهزية تامة واستجابة فورية 24/7 طوال أيام الأسبوع.',
      xPercent: 68.85,
      yPercent: 80.75,
      delay: 0.25,
      badgeColor: 'from-blue-600 to-indigo-600',
      icon: (
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Animated 24h Clock Icon */}
          <motion.div
            animate={{
              rotate: [0, 8, -8, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.2,
            }}
            className="text-white flex items-center justify-center relative"
          >
            <Clock className="w-[58%] h-[58%] max-w-[22px] max-h-[22px] drop-shadow-xs" />
            {/* Tiny 24 indicator */}
            <span className="absolute -bottom-0.5 text-[6px] sm:text-[7px] font-black leading-none bg-sky-400 text-slate-950 px-0.5 rounded-2xs">
              24
            </span>
          </motion.div>
        </div>
      ),
    },
    {
      id: 'fast_delivery',
      title: 'سرعة في التوريد',
      shortLabel: 'سرعة التوريد',
      description: 'نظام توجيه ذكي يربط طلبك بأقرب صهريج في منطقتك لتوصيل سريع يسبق حاجتك.',
      xPercent: 52.0,
      yPercent: 80.75,
      delay: 0.5,
      badgeColor: 'from-amber-500 to-orange-600',
      icon: (
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Animated Speed Meter & Bolt */}
          <motion.div
            animate={{
              scale: [1, 1.15, 0.95, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.4,
            }}
            className="text-white flex items-center justify-center"
          >
            <Zap className="w-[60%] h-[60%] max-w-[22px] max-h-[22px] fill-amber-300 stroke-white drop-shadow-xs" />
          </motion.div>
        </div>
      ),
    },
    {
      id: 'ready_fleet',
      title: 'أسطول جاهز لخدمتكم',
      shortLabel: 'أسطول جاهز',
      description: 'صهاريج حديثة متعددة السعات ومجهزة بأحدث المضخات لتلبية كافة الاحتياجات.',
      xPercent: 34.25,
      yPercent: 80.75,
      delay: 0.75,
      badgeColor: 'from-emerald-500 to-teal-600',
      icon: (
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Animated Tanker Truck */}
          <motion.div
            animate={{
              x: [-1.5, 1.5, -1.5],
              y: [0, -1, 0],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.6,
            }}
            className="text-white flex items-center justify-center"
          >
            <Truck className="w-[60%] h-[60%] max-w-[22px] max-h-[22px] drop-shadow-xs" />
          </motion.div>
        </div>
      ),
    },
    {
      id: 'all_areas',
      title: 'تغطية شاملة لجميع المناطق',
      shortLabel: 'تغطية شاملة',
      description: 'شبكة توريد وتغطية واسعه ، تصل إلى كافة الأحياء والمخططات السكنية والمشاريع.',
      xPercent: 15.95,
      yPercent: 80.75,
      delay: 1.0,
      badgeColor: 'from-rose-500 to-red-600',
      icon: (
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Animated Location Pin with Radar Ping */}
          <motion.div
            animate={{
              y: [0, -3.5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.8,
            }}
            className="text-white flex items-center justify-center relative"
          >
            <MapPin className="w-[60%] h-[60%] max-w-[22px] max-h-[22px] drop-shadow-xs fill-white/20" />
          </motion.div>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Container for the 5 interactive overlay icons mapped precisely to poster coordinates */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {features.map((feature) => {
          const isSelected = selectedFeature?.id === feature.id;

          return (
            <div
              key={feature.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
              style={{
                left: `${feature.xPercent}%`,
                top: `${feature.yPercent}%`,
                width: '10.5%',
                maxWidth: '46px',
                aspectRatio: '1 / 1',
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFeature(isSelected ? null : feature);
              }}
              title={`${feature.title} - اضغط لمعرفة التفاصيل`}
            >
              {/* Main Animated Circle Badge - smooth natural motion without any flash/shimmer */}
              <motion.div
                animate={{
                  y: [0, -4, 0],
                  scale: isSelected ? 1.18 : [1, 1.04, 1],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: feature.delay,
                }}
                whileHover={{
                  scale: 1.2,
                  y: -6,
                  transition: { duration: 0.2 },
                }}
                whileTap={{
                  scale: 0.92,
                }}
                className={`w-full h-full rounded-full border-2 flex items-center justify-center shadow-lg transition-colors relative overflow-hidden backdrop-blur-xs ${
                  isSelected
                    ? 'border-amber-300 bg-blue-900 ring-2 ring-amber-300/60 shadow-amber-500/30'
                    : 'border-white/95 bg-[#072448]/90 hover:bg-[#0066d6] hover:border-sky-200'
                }`}
              >
                {/* The feature icon graphic */}
                {feature.icon}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Floating Info Tooltip / Card When an Icon is Clicked */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-2 inset-x-3 z-30 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-sky-400/40 shadow-2xl text-right relative">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedFeature(null)}
                className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-start gap-2.5 pl-7">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0 text-sky-300">
                  <CheckCircle2 className="w-5 h-5 text-sky-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-black text-sky-300">
                      {selectedFeature.title}
                    </h4>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 font-bold">
                      ميزة معتمدة
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed mt-1 font-medium">
                    {selectedFeature.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-[10px] text-sky-300/80 font-bold">
                  💧 نبع لتوريد المياه • فزعه تسبق الحاجة
                </span>

                {onOpenOrderModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFeature(null);
                      onOpenOrderModal();
                    }}
                    className="px-3 py-1 bg-[#0066d6] hover:bg-[#0054b3] text-white rounded-lg text-[10px] sm:text-[11px] font-bold shadow-xs cursor-pointer flex items-center gap-1 transition"
                  >
                    <span>اطلب صهريجك الآن</span>
                    <span className="text-xs">←</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AnimatedPosterIcons;

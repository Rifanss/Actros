import React, { useState } from 'react';
import { useWaterData } from '../../context/WaterDataContext';
import { Driver } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { User, ChevronDown, ChevronLeft, Award } from 'lucide-react';

interface DriverPerformanceSectionProps {
  onSelectDriver: (driver: Driver) => void;
}

export const DriverPerformanceSection: React.FC<DriverPerformanceSectionProps> = ({
  onSelectDriver,
}) => {
  const { dashboardMetrics } = useWaterData();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section id="section-driver-performance" className="space-y-2">
      {/* Header Container - Closed by default */}
      <div className="bg-gradient-to-l from-white via-white to-indigo-50/40 rounded-xl border border-indigo-200/90 border-r-[4px] border-r-indigo-600 shadow-2xs overflow-hidden transition hover:border-indigo-300">
        <div
          id="toggle-drivers-performance-header"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-2.5 sm:p-3 flex items-center justify-between gap-2 cursor-pointer select-none text-right"
          role="button"
          aria-expanded={isOpen}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
        >
          {/* Right: Icon badge & Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-6 h-6 rounded-md bg-indigo-100/90 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Award className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-[11px] font-extrabold text-indigo-950 font-['Tajawal',sans-serif] leading-tight">
                أداء السائقين اليوم
              </h2>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                {dashboardMetrics.driversPerformance.length} سائقين
              </span>
            </div>
          </div>

          {/* Left: Accordion chevron */}
          <div className="shrink-0 flex items-center gap-1 text-slate-400">
            <span className="text-[9.5px] hidden sm:inline font-medium text-indigo-700">
              {isOpen ? 'إخفاء' : 'عرض السائقين'}
            </span>
            <div className="w-6 h-6 rounded-md bg-indigo-50/80 flex items-center justify-center border border-indigo-200 text-indigo-700">
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Expandable Clean Drivers List */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="drivers-performance-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-slate-100"
            >
              <div className="p-2 sm:p-2.5 space-y-1 bg-slate-50/40">
                <span className="text-[9px] text-slate-500 font-medium block pr-1 mb-0.5">
                  اضغط على أي سائق لعرض كشف التوريدات الخاص به
                </span>

                {dashboardMetrics.driversPerformance.map((perf) => (
                  <div
                    key={perf.driver.id}
                    onClick={() => onSelectDriver(perf.driver)}
                    className="w-full flex items-center justify-between p-1.5 rounded-lg bg-white hover:bg-indigo-50/30 border border-slate-200/80 hover:border-indigo-200 transition cursor-pointer group text-xs shadow-2xs"
                    role="button"
                    tabIndex={0}
                    title={`اضغط لعرض تفاصيل السائق ${perf.driver.driver_name}`}
                  >
                    {/* Right: Driver Icon + Driver Name */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <User className="w-3 h-3" />
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 block truncate group-hover:text-indigo-900 text-[10.5px]">
                          {perf.driver.driver_name}
                        </span>
                        <span className="text-[8.5px] text-slate-400 font-normal">
                          {perf.driver.vehicle || 'شاحنة أسطول'}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Metrics in compact RTL format: عدد التوريدات · كاش · آجل */}
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[9.5px] text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-900 font-bold">
                        <strong className="font-mono">{perf.totalDeliveries}</strong> توريد
                      </span>
                      <span>·</span>
                      <span className="text-teal-700">
                        كاش <strong className="font-mono">{perf.cashCount}</strong>
                      </span>
                      <span>·</span>
                      <span className="text-amber-700">
                        آجل <strong className="font-mono">{perf.deferredCount}</strong>
                      </span>
                    </div>

                    {/* Left: Total Amount + arrow */}
                    <div className="flex items-center gap-1 shrink-0 text-left">
                      <span className="text-[10px] font-black text-slate-900 font-mono">
                        {perf.totalAmount.toLocaleString('en-US')} ر.س
                      </span>
                      <ChevronLeft className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DriverPerformanceSection;

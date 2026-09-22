import React, { useState } from 'react';
import { useWaterData } from '../../context/WaterDataContext';
import { Driver } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Droplet, ChevronDown, ChevronLeft, Truck } from 'lucide-react';

interface DeliveryDistributionSectionProps {
  onSelectDriver: (driver: Driver) => void;
}

export const DeliveryDistributionSection: React.FC<DeliveryDistributionSectionProps> = ({
  onSelectDriver,
}) => {
  const { dashboardMetrics, filteredDeliveries, drivers } = useWaterData();
  const [isOpen, setIsOpen] = useState(false);

  // Expanded tab: null | 'desalination' | 'well'
  const [expandedType, setExpandedType] = useState<'desalination' | 'well' | null>(null);

  // Distribution of deliveries for the fleet
  const fleetDistribution = React.useMemo(() => {
    // 1. غلام: تريلا ( 30 طن ) مياة تحلية
    const gholamDelivs = filteredDeliveries.filter((d) => {
      if (d.driver_name?.trim() === 'غلام' || d.driver_id === 'drv-1') return true;
      return d.supply_type === 'تحلية' && d.tank_capacity === '30 طن';
    });
    const gholamDriver = drivers.find((drv) => drv.id === 'drv-1' || drv.driver_name === 'غلام');

    // 2. كريم: وايت سكس ( 18 طن ) مياة تحلية
    const karimDelivs = filteredDeliveries.filter((d) => {
      const name = d.driver_name?.trim();
      return name === 'كريم' || name === 'كريم المصري' || d.driver_id === 'drv-3';
    });
    const karimDriver = drivers.find(
      (drv) => drv.id === 'drv-3' || drv.driver_name === 'كريم' || drv.driver_name === 'كريم المصري'
    );

    // 3. أحمد: وايت سكس ( 18 طن ) مياة تحلية
    const ahmedDelivs = filteredDeliveries.filter((d) => {
      const name = d.driver_name?.trim();
      return name === 'أحمد' || name === 'أحمد المصري' || d.driver_id === 'drv-2';
    });
    const ahmedDriver = drivers.find(
      (drv) => drv.id === 'drv-2' || drv.driver_name === 'أحمد' || drv.driver_name === 'أحمد المصري'
    );

    // 4. مختار تريلا: تريلا ( 30 طن ) مياة آبار
    const saadDelivs = filteredDeliveries.filter((d) => {
      const name = d.driver_name?.trim();
      if (name === 'مختار تريلا' || name === 'مختار' || name === 'ص' || d.driver_id === 'drv-4') return true;
      return d.supply_type === 'آبار' && d.tank_capacity === '30 طن';
    });
    const saadDriver = drivers.find(
      (drv) => drv.id === 'drv-4' || drv.driver_name === 'مختار تريلا' || drv.driver_name === 'ص'
    );

    // 5. مختار عايدي: وايت عايدي ( 12 طن ) مياة آبار
    const seenDelivs = filteredDeliveries.filter((d) => {
      const name = d.driver_name?.trim();
      if (name === 'مختار عايدي' || name === 'س' || d.driver_id === 'drv-5') return true;
      return d.supply_type === 'آبار' && (d.tank_capacity === '12 طن' || d.tank_capacity === '11 طن');
    });
    const seenDriver = drivers.find(
      (drv) => drv.id === 'drv-5' || drv.driver_name === 'مختار عايدي' || drv.driver_name === 'س'
    );

    return {
      desalination: [
        {
          id: 'gholam',
          vehicleName: 'تريلا 30 طن',
          driverName: 'غلام',
          plate: 'ب ص ط 1223',
          count: gholamDelivs.length,
          sum: gholamDelivs.reduce((sum, d) => sum + (d.price || 0), 0),
          driver: gholamDriver,
        },
        {
          id: 'karim',
          vehicleName: 'وايت سكس 18 طن',
          driverName: 'كريم',
          plate: 'أ هـ س 7831',
          count: karimDelivs.length,
          sum: karimDelivs.reduce((sum, d) => sum + (d.price || 0), 0),
          driver: karimDriver,
        },
        {
          id: 'ahmed',
          vehicleName: 'وايت سكس 18 طن',
          driverName: 'أحمد',
          plate: 'ب ر أ 8403',
          count: ahmedDelivs.length,
          sum: ahmedDelivs.reduce((sum, d) => sum + (d.price || 0), 0),
          driver: ahmedDriver,
        },
      ],
      well: [
        {
          id: 'saad',
          vehicleName: 'تريلا 30 طن',
          driverName: 'مختار تريلا',
          plate: 'أ ي ق 1385',
          count: saadDelivs.length,
          sum: saadDelivs.reduce((sum, d) => sum + (d.price || 0), 0),
          driver: saadDriver,
        },
        {
          id: 'seen',
          vehicleName: 'وايت عايدي 12 طن',
          driverName: 'مختار عايدي',
          plate: 'أ ح ن 165',
          count: seenDelivs.length,
          sum: seenDelivs.reduce((sum, d) => sum + (d.price || 0), 0),
          driver: seenDriver,
        },
      ],
    };
  }, [filteredDeliveries, drivers]);

  const toggleType = (type: 'desalination' | 'well') => {
    setExpandedType((prev) => (prev === type ? null : type));
  };

  return (
    <section id="section-delivery-distribution" className="space-y-2">
      {/* Header Container - Closed by default */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden transition hover:border-slate-300">
        <div
          id="toggle-delivery-distribution-header"
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
          {/* Right: Title */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-[11px] font-extrabold text-[#03457a] font-['Tajawal',sans-serif] leading-tight">
                توزيع التوريدات اليوم
              </h2>
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[8px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block"></span>
                  تحلية: {dashboardMetrics.desalinationCount}
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                  آبار: {dashboardMetrics.wellCount}
                </span>
              </div>
            </div>
          </div>

          {/* Left: Accordion chevron */}
          <div className="shrink-0 flex items-center gap-1 text-slate-400">
            <span className="text-[9.5px] hidden sm:inline font-medium">
              {isOpen ? 'إخفاء' : 'عرض التوزيع'}
            </span>
            <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center border border-slate-200 text-slate-600">
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Expandable Content Container */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-slate-100 p-2 sm:p-2.5 space-y-2"
            >
              {/* 2 Unified Compact Selector Cards: تحلية / آبار */}
              <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
                {/* 1. التحلية */}
                <div
                  id="btn-distribution-desalination"
                  onClick={() => toggleType('desalination')}
                  className={`rounded-lg p-1.5 border border-sky-200/90 border-r-[4px] border-r-sky-600 bg-gradient-to-l from-white via-white to-sky-50/60 transition-all cursor-pointer select-none flex items-center justify-between shadow-2xs ${
                    expandedType === 'desalination'
                      ? 'ring-2 ring-sky-500/25 shadow-xs border-sky-400'
                      : 'hover:border-sky-300'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleType('desalination');
                    }
                  }}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-sky-100/90 text-sky-700 flex items-center justify-center border border-sky-200 shrink-0 shadow-2xs">
                      <Droplet className="w-2.5 h-2.5 fill-sky-600 text-sky-600" />
                    </div>
                    <div className="truncate">
                      <div className="text-[8.5px] font-bold text-sky-900">توريدات التحلية</div>
                      <div className="text-[10px] sm:text-[10.5px] font-black text-slate-900 font-mono">
                        {dashboardMetrics.desalinationCount} <span className="text-[8px] font-medium text-sky-700 font-['Tajawal',sans-serif]">توريد</span>
                      </div>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-3 h-3 text-sky-600 shrink-0 transition-transform duration-200 ${
                      expandedType === 'desalination' ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </div>

                {/* 2. الآبار */}
                <div
                  id="btn-distribution-well"
                  onClick={() => toggleType('well')}
                  className={`rounded-lg p-1.5 border border-amber-200/90 border-r-[4px] border-r-amber-600 bg-gradient-to-l from-white via-white to-amber-50/60 transition-all cursor-pointer select-none flex items-center justify-between shadow-2xs ${
                    expandedType === 'well'
                      ? 'ring-2 ring-amber-500/25 shadow-xs border-amber-400'
                      : 'hover:border-amber-300'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleType('well');
                    }
                  }}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-amber-100/90 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0 shadow-2xs">
                      <Droplet className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
                    </div>
                    <div className="truncate">
                      <div className="text-[8.5px] font-bold text-amber-900">توريدات الآبار</div>
                      <div className="text-[10px] sm:text-[10.5px] font-black text-slate-900 font-mono">
                        {dashboardMetrics.wellCount} <span className="text-[8px] font-medium text-amber-700 font-['Tajawal',sans-serif]">توريد</span>
                      </div>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-3 h-3 text-amber-600 shrink-0 transition-transform duration-200 ${
                      expandedType === 'well' ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </div>
              </div>

              {/* Expanded Vehicles Rows (Section -> Rows) */}
              <AnimatePresence initial={false}>
                {expandedType !== null && (
                  <motion.div
                    key={expandedType}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden pt-0.5"
                  >
                    <div className="bg-slate-50/70 rounded-lg p-2 border border-slate-200/70 space-y-1">
                      <div className="text-[9px] font-bold text-slate-500 px-1 mb-0.5">
                        {expandedType === 'desalination'
                          ? 'شاحنات التحلية التابعة للأسطول:'
                          : 'شاحنات الآبار التابعة للأسطول:'}
                      </div>

                      {fleetDistribution[expandedType].map((item) => (
                        <div
                          key={item.id}
                          onClick={() => item.driver && onSelectDriver(item.driver)}
                          className={`w-full flex items-center justify-between p-1.5 rounded-lg bg-white border transition cursor-pointer group text-xs ${
                            expandedType === 'desalination'
                              ? 'border-slate-200/60 hover:border-sky-300 hover:bg-sky-50/40'
                              : 'border-slate-200/60 hover:border-amber-300 hover:bg-amber-50/40'
                          }`}
                          role="button"
                          tabIndex={0}
                          title={`اضغط لعرض تفاصيل السائق ${item.driverName}`}
                        >
                          {/* Right: Vehicle Name + Driver + Plate */}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${
                              expandedType === 'desalination'
                                ? 'bg-sky-50 border-sky-200/80 text-sky-700'
                                : 'bg-amber-50 border-amber-200/80 text-amber-700'
                            }`}>
                              <Truck className="w-3 h-3" />
                            </div>
                            <div className="truncate">
                              <span className={`font-bold text-slate-900 block truncate text-[10.5px] ${
                                expandedType === 'desalination' ? 'group-hover:text-sky-800' : 'group-hover:text-amber-800'
                              }`}>
                                {item.vehicleName}
                              </span>
                              <span className="text-[8.5px] text-slate-500 font-medium">
                                {item.driverName} · <span dir="ltr" className="font-mono text-slate-400">{item.plate}</span>
                              </span>
                            </div>
                          </div>

                          {/* Left: Deliveries count + Total value */}
                          <div className="flex items-center gap-1.5 shrink-0 text-left">
                            <div className="text-right">
                              <span className="text-[10px] font-black text-slate-900 block font-mono">
                                {item.count} توريدات
                              </span>
                              <span className={`text-[8.5px] font-bold ${
                                expandedType === 'desalination' ? 'text-sky-700' : 'text-amber-700'
                              }`}>
                                {item.sum.toLocaleString('en-US')} ر.س
                              </span>
                            </div>
                            <ChevronLeft className={`w-3 h-3 text-slate-300 transition ${
                              expandedType === 'desalination' ? 'group-hover:text-sky-600' : 'group-hover:text-amber-600'
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DeliveryDistributionSection;

import React from 'react';
import { useWaterData } from '../../context/WaterDataContext';
import { Truck, BadgeDollarSign, Banknote, Clock } from 'lucide-react';

interface TodaySummarySectionProps {
  formattedDate: string;
  dayName: string;
}

export const TodaySummarySection: React.FC<TodaySummarySectionProps> = ({
  formattedDate,
  dayName,
}) => {
  const { dashboardMetrics } = useWaterData();

  const formatCurrency = (amount: number) => {
    if (amount < 0) {
      return `−${Math.abs(amount).toLocaleString('en-US')} ر.س`;
    }
    return `${amount.toLocaleString('en-US')} ر.س`;
  };

  const metrics = [
    {
      id: 'total-deliveries',
      label: 'إجمالي التوريدات',
      value: `${dashboardMetrics.totalDeliveriesCount.toLocaleString('en-US')}`,
      unit: 'توريد',
      icon: Truck,
      cardBorder: 'border-blue-200/90 border-r-[4px] border-r-blue-600',
      cardBg: 'bg-gradient-to-l from-white via-white to-blue-50/60',
      iconBg: 'bg-blue-100/90 text-blue-700 border border-blue-200',
      labelColor: 'text-blue-900 font-bold',
      iconColor: 'text-blue-700',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      id: 'total-income',
      label: 'إجمالي الدخل العام',
      value: formatCurrency(dashboardMetrics.totalDailyIncome),
      icon: BadgeDollarSign,
      cardBorder: 'border-cyan-200/90 border-r-[4px] border-r-cyan-700',
      cardBg: 'bg-gradient-to-l from-white via-white to-cyan-50/60',
      iconBg: 'bg-cyan-100/90 text-cyan-800 border border-cyan-200',
      labelColor: 'text-cyan-900 font-bold',
      iconColor: 'text-cyan-800',
      badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    },
    {
      id: 'total-cash',
      label: 'إجمالي الدخل الكاش',
      value: formatCurrency(dashboardMetrics.totalCash),
      icon: Banknote,
      cardBorder: 'border-emerald-200/90 border-r-[4px] border-r-emerald-600',
      cardBg: 'bg-gradient-to-l from-white via-white to-emerald-50/60',
      iconBg: 'bg-emerald-100/90 text-emerald-700 border border-emerald-200',
      labelColor: 'text-emerald-900 font-bold',
      iconColor: 'text-emerald-700',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      id: 'total-deferred',
      label: 'إجمالي الآجل',
      value: formatCurrency(dashboardMetrics.totalDeferred),
      icon: Clock,
      cardBorder: 'border-amber-200/90 border-r-[4px] border-r-amber-500',
      cardBg: 'bg-gradient-to-l from-white via-white to-amber-50/60',
      iconBg: 'bg-amber-100/90 text-amber-700 border border-amber-200',
      labelColor: 'text-amber-900 font-bold',
      iconColor: 'text-amber-700',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  ];

  return (
    <section id="section-today-summary" className="space-y-2.5">
      {/* Section Header */}
      <div className="flex items-baseline justify-between px-0.5">
        <h2 className="text-[11px] font-extrabold text-[#03457a] font-['Tajawal',sans-serif] tracking-wide">
          ملخص اليوم
        </h2>
        <span className="text-[8.5px] font-medium text-slate-400">
          {dayName} · <span dir="ltr" className="font-mono">{formattedDate}</span>
        </span>
      </div>

      {/* 2x2 Metric Cards Grid - Matching Customer Profile Card Dimensions */}
      <div className="grid grid-cols-2 gap-1.5">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              id={`metric-card-${item.id}`}
              className={`rounded-lg px-2 py-1.5 shadow-2xs flex flex-col justify-center min-h-[44px] transition hover:shadow-xs border ${item.cardBorder} ${item.cardBg}`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className={`flex items-center gap-1.5 text-[8.5px] sm:text-[9px] font-bold ${item.labelColor}`}>
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 shadow-2xs ${item.iconBg}`}>
                    <Icon className={`w-2.5 h-2.5 ${item.iconColor}`} />
                  </div>
                  <span>{item.label}</span>
                </div>
              </div>

              <div className="pr-5.5">
                <div className="text-[10.5px] sm:text-[11px] font-black text-slate-900 font-mono leading-tight flex items-baseline gap-1">
                  <span>{item.value}</span>
                  {item.unit && (
                    <span className="text-[8px] font-medium text-slate-500 font-['Tajawal',sans-serif]">
                      {item.unit}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TodaySummarySection;

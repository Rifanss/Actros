import React, { useState, useMemo } from 'react';
import { useWaterData } from '../context/WaterDataContext';
import { FilterPeriod, SupplyType, Driver } from '../types';
import { Filter, Droplet, Users, Calendar } from 'lucide-react';
import { useScrollToTop } from '../utils/scrollUtils';

import TodaySummarySection from './dashboard/TodaySummarySection';
import SupplyOrdersSection from './dashboard/SupplyOrdersSection';
import DeliveryDistributionSection from './dashboard/DeliveryDistributionSection';
import DriverPerformanceSection from './dashboard/DriverPerformanceSection';
import { DriverManagementSection } from './dashboard/DriverManagementSection';
import OperationsSummarySection from './dashboard/OperationsSummarySection';
import RecentDeliveriesSection from './dashboard/RecentDeliveriesSection';

interface DashboardViewProps {
  onSelectDriver: (driver: Driver) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectDriver }) => {
  const {
    filterState,
    setFilterState,
    drivers,
  } = useWaterData();
  const [showCustomDate, setShowCustomDate] = useState(filterState.period === 'custom');

  // Guarantee dashboard starts at top (0, 0)
  useScrollToTop();

  // Format active day name (e.g. الثلاثاء) and date as YYYY/MM/DD
  const activeDateInfo = useMemo(() => {
    let targetDate = new Date();
    if (filterState.period === 'yesterday') {
      targetDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    } else if (filterState.period === 'custom' && filterState.customStartDate) {
      const parsed = new Date(filterState.customStartDate);
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed;
      }
    }

    const dayName = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(targetDate);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}/${month}/${day}`;

    return { dayName, formattedDate };
  }, [filterState.period, filterState.customStartDate]);

  const handlePeriodChange = (period: FilterPeriod) => {
    if (period === 'custom') {
      setShowCustomDate(true);
      setFilterState((prev) => ({ ...prev, period }));
    } else {
      setShowCustomDate(false);
      setFilterState((prev) => ({ ...prev, period }));
    }
  };

  return (
    <div className="operations-scope space-y-3 sm:space-y-3 pb-14 max-w-4xl mx-auto px-2 sm:px-3 text-right">
      {/* ========================================================
          FILTER BAR (Ultra-compact, 50% reduced size, Single Line)
          ======================================================== */}
      <div className="bg-white rounded-lg p-1 sm:p-1.5 shadow-2xs border border-slate-200/80">
        <div className="flex items-center gap-1 w-full">
          {/* Filter Period */}
          <div className="relative flex-1 min-w-0">
            <select
              id="filter-period-select"
              value={filterState.period}
              onChange={(e) => handlePeriodChange(e.target.value as FilterPeriod)}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-[9px] sm:text-[9.5px] font-bold h-6 pr-4 pl-1 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#03457a] transition appearance-none cursor-pointer truncate site-filter-select"
              title="الفترة"
            >
              <option value="today">اليوم</option>
              <option value="yesterday">أمس</option>
              <option value="this_week">هذا الأسبوع</option>
              <option value="this_month">هذا الشهر</option>
              <option value="custom">مخصص</option>
            </select>
            <Calendar className="w-2.5 h-2.5 text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter Supply Type */}
          <div className="relative flex-1 min-w-0">
            <select
              id="filter-supply-type-select"
              value={filterState.supplyType}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  supplyType: e.target.value as 'all' | SupplyType,
                }))
              }
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-[9px] sm:text-[9.5px] font-bold h-6 pr-4 pl-1 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#03457a] transition appearance-none cursor-pointer truncate site-filter-select"
              title="نوع التوريد"
            >
              <option value="all">النوع: الكل</option>
              <option value="تحلية">تحلية</option>
              <option value="آبار">آبار</option>
            </select>
            <Droplet className="w-2.5 h-2.5 text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter Driver */}
          <div className="relative flex-1 min-w-0">
            <select
              id="filter-driver-select"
              value={filterState.driverId}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  driverId: e.target.value,
                }))
              }
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-[9px] sm:text-[9.5px] font-bold h-6 pr-4 pl-1 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#03457a] transition appearance-none cursor-pointer truncate site-filter-select"
              title="السائق"
            >
              <option value="all">السائق: الكل</option>
              {drivers.map((drv) => (
                <option key={drv.id} value={drv.id}>
                  {drv.driver_name}
                </option>
              ))}
            </select>
            <Users className="w-2.5 h-2.5 text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter button */}
          <button
            id="filter-apply-btn"
            className="shrink-0 flex items-center justify-center gap-0.5 bg-[#03457a] hover:bg-[#023561] text-white font-bold text-[9px] sm:text-[9.5px] h-6 px-2 rounded-md shadow-2xs active:scale-95 transition cursor-pointer whitespace-nowrap site-filter-btn"
            title="تطبيق التصفية"
          >
            <Filter className="w-2.5 h-2.5 text-sky-200" />
            <span>تصفية</span>
          </button>
        </div>

        {/* Custom date range if selected */}
        {showCustomDate && (
          <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
            <div className="flex-1">
              <label className="text-[9px] font-medium text-slate-500 mb-0.5 block">من تاريخ</label>
              <input
                type="date"
                value={filterState.customStartDate || ''}
                onChange={(e) =>
                  setFilterState((prev) => ({ ...prev, customStartDate: e.target.value }))
                }
                className="w-full text-[9.5px] h-6 px-1.5 rounded-md border border-slate-200 bg-slate-50 site-filter-input"
              />
            </div>
            <div className="flex-1">
              <label className="text-[9px] font-medium text-slate-500 mb-0.5 block">إلى تاريخ</label>
              <input
                type="date"
                value={filterState.customEndDate || ''}
                onChange={(e) =>
                  setFilterState((prev) => ({ ...prev, customEndDate: e.target.value }))
                }
                className="w-full text-[9.5px] h-6 px-1.5 rounded-md border border-slate-200 bg-slate-50 site-filter-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          1. ملخص اليوم (Today's Summary)
          ======================================================== */}
      <TodaySummarySection
        formattedDate={activeDateInfo.formattedDate}
        dayName={activeDateInfo.dayName}
      />

      {/* ========================================================
          2. طلبات التوريد (Supply Orders)
          ======================================================== */}
      <SupplyOrdersSection />

      {/* ========================================================
          3. توزيع التوريدات (Deliveries Distribution)
          ======================================================== */}
      <DeliveryDistributionSection onSelectDriver={onSelectDriver} />

      {/* ========================================================
          4. أداء السائقين (Driver Performance)
          ======================================================== */}
      <DriverPerformanceSection onSelectDriver={onSelectDriver} />

      {/* ========================================================
          4.1 إدارة السائقين (Driver Management)
          ======================================================== */}
      <DriverManagementSection />

      {/* ========================================================
          5. آخر توريدات اليوم (Recent Deliveries)
          ======================================================== */}
      <RecentDeliveriesSection />

      {/* ========================================================
          6. التشغيل والمصروفات (Operations & Expenses)
          ======================================================== */}
      <OperationsSummarySection />
    </div>
  );
};

export default DashboardView;

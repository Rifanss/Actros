import React from 'react';
import { useWaterData } from '../../context/WaterDataContext';
import { Truck, ChevronLeft } from 'lucide-react';
import { scrollToTop } from '../../utils/scrollUtils';

export const OperationsSummarySection: React.FC = () => {
  const { setActiveTab } = useWaterData();

  const handleNavigate = () => {
    setActiveTab('operations');
    scrollToTop(true);
  };

  return (
    <section id="section-operations-and-expenses" className="space-y-2">
      {/* Clickable Header Card that navigates to the dedicated Operations & Fleet Trucks page */}
      <div
        id="btn-nav-operations-expenses"
        onClick={handleNavigate}
        className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/80 border-r-[3.5px] border-r-[#03457a] shadow-2xs hover:border-[#03457a]/40 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group select-none"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNavigate();
          }
        }}
      >
        {/* Right: Icon + Title */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[#03457a] group-hover:bg-[#03457a] group-hover:text-white transition-colors shrink-0">
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="truncate text-right">
            <h2 className="text-[11px] font-extrabold text-[#03457a] font-['Tajawal',sans-serif] group-hover:text-sky-800 transition-colors leading-tight">
              التشغيل والمصروفات
            </h2>
          </div>
        </div>

        {/* Left: Navigation indicator button */}
        <div className="flex items-center gap-1 text-slate-400 group-hover:text-[#03457a] transition-colors shrink-0">
          <span className="text-[9.5px] font-bold hidden sm:inline">
            الانتقال للصفحة
          </span>
          <div className="w-6 h-6 rounded-md bg-slate-50 group-hover:bg-sky-50 flex items-center justify-center border border-slate-200 group-hover:border-sky-200 text-slate-600 group-hover:text-[#03457a] transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OperationsSummarySection;

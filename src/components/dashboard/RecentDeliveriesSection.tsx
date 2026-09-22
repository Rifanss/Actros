import React from 'react';
import { useWaterData } from '../../context/WaterDataContext';
import { Clock, ChevronLeft, Droplets, Inbox } from 'lucide-react';

export const RecentDeliveriesSection: React.FC = () => {
  const { dashboardMetrics, setActiveTab, openCustomerRecordById } = useWaterData();

  // Show last 3 deliveries only as mandated
  const latestThree = dashboardMetrics.latestDeliveries.slice(0, 3);

  return (
    <section id="section-recent-deliveries" className="space-y-2.5">
      {/* Section Header */}
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-[11px] font-extrabold text-[#03457a] font-['Tajawal',sans-serif] tracking-wide">
          آخر توريدات اليوم
        </h2>
        <button
          onClick={() => setActiveTab('deliveries')}
          className="text-[8.5px] font-bold text-[#03457a] hover:text-[#023561] flex items-center gap-0.5 transition cursor-pointer"
        >
          <span>عرض جميع التوريدات</span>
          <ChevronLeft className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Deliveries Rows Container */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100">
        {latestThree.length === 0 ? (
          <div className="p-4 text-center text-slate-400">
            <Inbox className="w-6 h-6 mx-auto text-slate-300 mb-1" />
            <p className="text-[10.5px] font-semibold text-slate-600">لا توجد توريدات اليوم</p>
          </div>
        ) : (
          latestThree.map((del) => (
            <div
              key={del.id}
              onClick={() => openCustomerRecordById(del.customer_id)}
              className="p-2 sm:p-2.5 hover:bg-slate-50/70 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs"
              role="button"
              tabIndex={0}
              title="اضغط لعرض ملف العميل"
            >
              {/* Customer & Supply Type */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-md bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center shrink-0">
                  <Droplets className="w-3 h-3" />
                </div>
                <div className="truncate">
                  <div className="font-bold text-slate-900 truncate text-[10.5px]">{del.customer_name}</div>
                  <div className="text-[8.5px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                    <span
                      className={`font-semibold ${
                        del.supply_type === 'تحلية' ? 'text-sky-700' : 'text-emerald-700'
                      }`}
                    >
                      {del.supply_type}
                    </span>
                    <span>·</span>
                    <span>سعة {del.tank_capacity}</span>
                    <span>·</span>
                    <span>السائق: {del.driver_name}</span>
                  </div>
                </div>
              </div>

              {/* Price, Payment Method, Time */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="flex items-center gap-1 text-[9.5px]">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold ${
                      del.payment_method === 'كاش'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {del.payment_method}
                  </span>
                  <span className="text-slate-400 font-mono text-[8.5px] flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {del.supply_time || '08:00'}
                  </span>
                </div>

                <div className="font-black text-slate-900 font-['Tajawal',sans-serif] text-[10.5px]">
                  {del.price.toLocaleString('en-US')} ر.س
                </div>
              </div>
            </div>
          ))
        )}

        {/* View All Deliveries Footer Button */}
        <div className="p-1.5 bg-slate-50/60 text-center border-t border-slate-100">
          <button
            onClick={() => setActiveTab('deliveries')}
            className="w-full py-1 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[9.5px] font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
          >
            <span>عرض جميع التوريدات</span>
            <ChevronLeft className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecentDeliveriesSection;

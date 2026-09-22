import React, { useState } from 'react';
import { useWaterData } from '../context/WaterDataContext';
import {
  BarChart3,
  TrendingUp,
  Printer,
  Download,
  Calendar,
  Users,
  Coins,
  Droplet,
  PieChart,
  X,
  CheckCircle2,
} from 'lucide-react';
import TruckIcon from './TruckIcon';
import { useScrollToTop } from '../utils/scrollUtils';
import { A4DocumentPreviewModal } from './common/A4DocumentPreviewModal';
import { A4PageSheet } from './common/A4PageSheet';

export const ReportsView: React.FC = () => {
  const { deliveries, drivers, customers } = useWaterData();
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  // Guarantee reports view starts at top (0, 0)
  useScrollToTop();

  const totalDeliveries = deliveries.length;
  const totalIncome = deliveries.reduce((acc, d) => acc + d.price, 0);
  const totalCash = deliveries.filter((d) => d.payment_method === 'كاش').reduce((acc, d) => acc + d.price, 0);
  const totalDeferred = deliveries.filter((d) => d.payment_method === 'آجل').reduce((acc, d) => acc + d.price, 0);

  const desalinationDeliveries = deliveries.filter((d) => d.supply_type === 'تحلية');
  const wellDeliveries = deliveries.filter((d) => d.supply_type === 'آبار');

  const desalinationIncome = desalinationDeliveries.reduce((acc, d) => acc + d.price, 0);
  const wellIncome = wellDeliveries.reduce((acc, d) => acc + d.price, 0);

  const handleOpenPreview = () => {
    setIsPrintPreviewOpen(true);
  };

  const handleConfirmPrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-3 pb-16 space-y-2 text-right">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
        <p className="text-[10px] text-slate-500 font-medium">
          ملخص شامل لجميع عمليات التوريد والدخل وأداء الأسطول
        </p>

        <button
          id="btn-print-reports"
          onClick={handleOpenPreview}
          className="flex items-center gap-1.5 px-3 h-7 bg-[#03457a] hover:bg-[#023561] text-white rounded-lg text-xs font-bold shadow-2xs active:scale-98 transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>معاينة وطباعة التقرير</span>
        </button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Total Deliveries */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-semibold mb-0.5">إجمالي الردود</div>
          <div className="text-lg font-black text-slate-800">{totalDeliveries}</div>
          <div className="text-[9px] text-emerald-600 font-bold mt-0.5">عملية مكتملة</div>
        </div>

        {/* Total Income */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-semibold mb-0.5">إجمالي الدخل</div>
          <div className="text-sm sm:text-base font-black text-emerald-700 font-['Tajawal',sans-serif]">
            SAR {totalIncome.toLocaleString()}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">شامل التحصيل والآجل</div>
        </div>

        {/* Cash Collected */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-semibold mb-0.5">المتحصل كاش</div>
          <div className="text-sm sm:text-base font-black text-sky-700 font-['Tajawal',sans-serif]">
            SAR {totalCash.toLocaleString()}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">
            {totalIncome > 0 ? Math.round((totalCash / totalIncome) * 100) : 0}% من الإجمالي
          </div>
        </div>

        {/* Deferred Receivables */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] text-slate-500 font-semibold mb-0.5">المستحق الآجل</div>
          <div className="text-sm sm:text-base font-black text-amber-700 font-['Tajawal',sans-serif]">
            SAR {totalDeferred.toLocaleString()}
          </div>
          <div className="text-[9px] text-amber-600 font-bold mt-0.5">قيد التحصيل</div>
        </div>
      </div>

      {/* Comparison: Desalination vs Well */}
      <div className="bg-white rounded-xl p-2.5 sm:p-3 shadow-2xs border border-slate-200/70">
        <h2 className="text-xs sm:text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <Droplet className="w-3.5 h-3.5 text-sky-600" />
          <span>مقارنة نوع المياه (تحلية مقابل آبار)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Desalination */}
          <div className="bg-sky-50/60 p-2.5 rounded-lg border border-sky-100 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-900 text-xs">مياه تحلية</span>
              <TruckIcon className="w-7 h-4" variant="blue" />
            </div>
            <div className="text-lg font-black text-sky-950">
              {desalinationDeliveries.length} رد
            </div>
            <div className="text-[11px] text-sky-800 font-bold">
              إجمالي القيمة: SAR {desalinationIncome.toLocaleString()}
            </div>
            <div className="w-full bg-sky-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-600 h-full rounded-full"
                style={{
                  width: `${totalDeliveries > 0 ? (desalinationDeliveries.length / totalDeliveries) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Well Water */}
          <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 text-xs">مياه آبار</span>
              <TruckIcon className="w-7 h-4" variant="green" />
            </div>
            <div className="text-lg font-black text-emerald-950">
              {wellDeliveries.length} رد
            </div>
            <div className="text-[11px] text-emerald-800 font-bold">
              إجمالي القيمة: SAR {wellIncome.toLocaleString()}
            </div>
            <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{
                  width: `${totalDeliveries > 0 ? (wellDeliveries.length / totalDeliveries) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Driver Performance Ranking */}
      <div className="bg-white rounded-xl p-2.5 sm:p-3 shadow-2xs border border-slate-200/70">
        <h2 className="text-xs sm:text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-sky-600" />
          <span>ترتيب إنتاجية السائقين</span>
        </h2>

        <div className="space-y-1.5">
          {drivers.map((drv) => {
            const drvDeliveries = deliveries.filter((d) => d.driver_id === drv.id);
            const drvIncome = drvDeliveries.reduce((acc, d) => acc + d.price, 0);

            return (
              <div
                key={drv.id}
                className="p-2 bg-slate-50/80 rounded-lg border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                    {drv.driver_name.slice(0, 1)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">{drv.driver_name}</span>
                    <span className="text-[9px] text-slate-400">{drv.vehicle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-400 text-[9px] block">الردود:</span>
                    <span className="font-bold text-slate-800 text-xs">{drvDeliveries.length}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-slate-400 text-[9px] block">إجمالي الدخل:</span>
                    <span className="font-black text-sky-900 font-mono text-xs">
                      SAR {drvIncome.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          IN-APP REPORT PREVIEW MODAL (PREVIEW BEFORE PRINT)
          ======================================================== */}
      {isPrintPreviewOpen && (
        <A4DocumentPreviewModal
          title="معاينة التقرير المالي والتشغيلي الشامل"
          subtitle={`مؤسسة نبع لتوريد المياه • ${new Date().toLocaleDateString('ar-SA')}`}
          badge="ورقة A4 عمودية (210×297 مم)"
          pagesCount={1}
          onClose={() => setIsPrintPreviewOpen(false)}
          onConfirmPrint={handleConfirmPrint}
        >
          <A4PageSheet id="printable-reports-summary-a4" pageNumber={1} totalPages={1}>
            <div className="space-y-4 text-slate-800 font-sans flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-[#03457a] pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h1 className="text-base sm:text-lg font-extrabold text-[#03457a] font-['Tajawal',sans-serif]">
                        نبع لتوريد المياه
                      </h1>
                      <span className="text-[9px] font-bold text-[#03457a] bg-sky-100/70 border border-sky-300/60 px-1 py-0.2 rounded">
                        NABAA
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      التقرير المالي والتشغيلي الشامل
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      المملكة العربية السعودية - الطائف
                    </p>
                  </div>

                  <div className="text-left space-y-1">
                    <div className="px-2.5 py-1 bg-sky-50 text-[#03457a] border border-sky-200 rounded-md font-bold text-[10px] font-mono">
                      تقرير معتمد
                    </div>
                    <p className="text-[9.5px] text-slate-500 font-mono">
                      تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>

                {/* 4 Summary Cards in Report */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-right">
                    <div className="text-[9.5px] text-slate-500 font-semibold">إجمالي الردود</div>
                    <div className="text-base font-black text-slate-800 mt-0.5">{totalDeliveries} رد</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-right">
                    <div className="text-[9.5px] text-slate-500 font-semibold">إجمالي الدخل</div>
                    <div className="text-base font-black text-emerald-700 font-mono mt-0.5">
                      {totalIncome.toLocaleString()} ر.س
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-right">
                    <div className="text-[9.5px] text-slate-500 font-semibold">المتحصل كاش</div>
                    <div className="text-base font-black text-sky-700 font-mono mt-0.5">
                      {totalCash.toLocaleString()} ر.س
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-right">
                    <div className="text-[9.5px] text-slate-500 font-semibold">المستحق الآجل</div>
                    <div className="text-base font-black text-amber-700 font-mono mt-0.5">
                      {totalDeferred.toLocaleString()} ر.س
                    </div>
                  </div>
                </div>

                {/* Comparison breakdown */}
                <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                  <h3 className="text-xs font-bold text-[#03457a]">توزيع التوريدات حسب نوع المياه</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-sky-50/70 p-2.5 rounded-lg border border-sky-200">
                      <div className="font-bold text-sky-900">مياه تحلية</div>
                      <div className="text-sm font-black text-sky-950 mt-1">{desalinationDeliveries.length} رد</div>
                      <div className="text-[10.5px] font-mono text-sky-800 mt-0.5">
                        {desalinationIncome.toLocaleString()} ر.س
                      </div>
                    </div>
                    <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                      <div className="font-bold text-emerald-900">مياه آبار</div>
                      <div className="text-sm font-black text-emerald-950 mt-1">{wellDeliveries.length} رد</div>
                      <div className="text-[10.5px] font-mono text-emerald-800 mt-0.5">
                        {wellIncome.toLocaleString()} ر.س
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drivers Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs text-slate-800">
                    ملخص إنتاجية السائقين
                  </div>
                  <table className="w-full text-right text-xs">
                    <thead className="bg-[#03457a] text-white font-bold text-[10px]">
                      <tr>
                        <th className="py-1.5 px-2.5">السائق</th>
                        <th className="py-1.5 px-2.5">المركبة</th>
                        <th className="py-1.5 px-2.5 text-center">الردود</th>
                        <th className="py-1.5 px-2.5 text-left">إجمالي الدخل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {drivers.map((drv) => {
                        const drvDeliveries = deliveries.filter((d) => d.driver_id === drv.id);
                        const drvIncome = drvDeliveries.reduce((acc, d) => acc + d.price, 0);
                        return (
                          <tr key={drv.id} className="hover:bg-slate-50/50">
                            <td className="py-1.5 px-2.5 font-bold text-slate-800">{drv.driver_name}</td>
                            <td className="py-1.5 px-2.5 text-slate-500 text-[10.5px]">{drv.vehicle}</td>
                            <td className="py-1.5 px-2.5 text-center font-bold font-mono">{drvDeliveries.length}</td>
                            <td className="py-1.5 px-2.5 text-left font-bold font-mono text-slate-900">
                              {drvIncome.toLocaleString()} ر.س
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Report Signatures */}
              <div className="pt-6 border-t border-slate-200 flex justify-between text-center text-[10px] text-slate-500 mt-auto">
                <div>
                  <p className="font-bold text-slate-700">المحاسب المعتمد</p>
                  <div className="mt-5 border-b border-dashed border-slate-400 w-28 mx-auto"></div>
                </div>
                <div>
                  <p className="font-bold text-slate-700">إدارة التشغيل والأسطول</p>
                  <div className="mt-5 border-b border-dashed border-slate-400 w-28 mx-auto"></div>
                </div>
              </div>
            </div>
          </A4PageSheet>
        </A4DocumentPreviewModal>
      )}
    </div>
  );
};

export default ReportsView;

import React, { useState, useMemo } from 'react';
import { X, Calendar, FileText, ArrowLeft, Layers, CheckCircle2, Clock, Printer } from 'lucide-react';
import { Customer, Delivery } from '../../types';

export type ReportType = 'all' | 'due' | 'paid' | 'deliveries' | 'detailed';

interface PrintStatementModalProps {
  isOpen: boolean;
  customer: Customer;
  deliveries: Delivery[];
  onClose: () => void;
  onProceed: (config: {
    startDate: string;
    endDate: string;
    reportType: ReportType;
    filteredDeliveries: Delivery[];
  }) => void;
}

export const PrintStatementModal: React.FC<PrintStatementModalProps> = ({
  isOpen,
  customer,
  deliveries,
  onClose,
  onProceed,
}) => {
  if (!isOpen) return null;

  // Calculate default dates covering all customer's deliveries
  const sortedDates = deliveries
    .map((d) => d.supply_date)
    .filter(Boolean)
    .sort();
  const defaultStart = sortedDates[0] || '2026-09-01';
  const defaultEnd = sortedDates[sortedDates.length - 1] || new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [reportType, setReportType] = useState<ReportType>('all');

  // Filter deliveries by date range
  const dateFiltered = useMemo(() => {
    return deliveries.filter((d) => {
      if (!d.supply_date) return true;
      if (startDate && d.supply_date < startDate) return false;
      if (endDate && d.supply_date > endDate) return false;
      return true;
    });
  }, [deliveries, startDate, endDate]);

  // Counts for each of the 3 statement types
  const allCount = dateFiltered.length;
  const dueCount = dateFiltered.filter(
    (d) => d.payment_status === 'مستحق' || d.payment_method === 'آجل' || Number(d.remaining_amount) > 0
  ).length;
  const paidCount = dateFiltered.filter(
    (d) => d.payment_status === 'مدفوع' || d.payment_method === 'كاش'
  ).length;

  const handleLaunch = (selectedType: ReportType) => {
    let typeFiltered = dateFiltered;
    if (selectedType === 'due') {
      typeFiltered = dateFiltered.filter(
        (d) => d.payment_status === 'مستحق' || d.payment_method === 'آجل' || Number(d.remaining_amount) > 0
      );
    } else if (selectedType === 'paid') {
      typeFiltered = dateFiltered.filter(
        (d) => d.payment_status === 'مدفوع' || d.payment_method === 'كاش'
      );
    }

    onProceed({
      startDate,
      endDate,
      reportType: selectedType,
      filteredDeliveries: typeFiltered,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-sky-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#03457a] to-[#0284c7] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              <Printer className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black font-['Tajawal',sans-serif]">
                طباعة كشوفات الحساب
              </h3>
              <p className="text-[10.5px] text-sky-100 font-medium">
                العميل: {customer.customer_name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Statement Selection (3 Types strictly matching user request) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-800">
                اختر نوع الكشف المطلوب:
              </label>
              <span className="text-[10px] text-slate-500 font-bold">
                إجمالي التوريدات: {allCount}
              </span>
            </div>

            <div className="space-y-2.5">
              {/* 1. كشف حساب جميع التوريدات */}
              <div
                onClick={() => setReportType('all')}
                className={`p-2.5 sm:p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                  reportType === 'all' || reportType === 'detailed' || reportType === 'deliveries'
                    ? 'bg-sky-50/90 border-[#0284c7] shadow-xs'
                    : 'bg-white border-slate-200 hover:border-sky-300'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      reportType === 'all' || reportType === 'detailed' || reportType === 'deliveries'
                        ? 'bg-[#0284c7] text-white'
                        : 'bg-sky-100 text-[#0284c7]'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-nowrap">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-900 whitespace-nowrap">
                        1. كشف حساب جميع التوريدات
                      </span>
                      <span className="text-[8.5px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 text-[#0284c7] whitespace-nowrap shrink-0">
                        {allCount} توريد
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 leading-tight line-clamp-2">
                      شامل جميع التوريدات (المدفوعة والمستحقة) مع جدول تفصيلي وإجمالي المبلغ
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLaunch('all');
                  }}
                  className="px-2 sm:px-2.5 py-1 text-[9.5px] sm:text-[10.5px] font-bold text-[#0284c7] bg-white border border-sky-300 hover:bg-sky-100 rounded-lg transition shrink-0 mr-1.5"
                >
                  معاينة
                </button>
              </div>

              {/* 2. كشف حساب التوريدات المستحقه */}
              <div
                onClick={() => setReportType('due')}
                className={`p-2.5 sm:p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                  reportType === 'due'
                    ? 'bg-rose-50/90 border-rose-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      reportType === 'due'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-nowrap">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-900 whitespace-nowrap">
                        2. كشف حساب التوريدات المستحقه
                      </span>
                      <span
                        className={`text-[8.5px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                          dueCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {dueCount} مستحق
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 leading-tight line-clamp-2">
                      حصر التوريدات غير المسددة أو الآجلة مع بيان المبالغ المطلوب سدادها
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLaunch('due');
                  }}
                  className="px-2 sm:px-2.5 py-1 text-[9.5px] sm:text-[10.5px] font-bold text-rose-700 bg-white border border-rose-300 hover:bg-rose-100 rounded-lg transition shrink-0 mr-1.5"
                >
                  معاينة
                </button>
              </div>

              {/* 3. كشف حساب التوريدات المدفوعة */}
              <div
                onClick={() => setReportType('paid')}
                className={`p-2.5 sm:p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                  reportType === 'paid'
                    ? 'bg-emerald-50/90 border-emerald-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      reportType === 'paid'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-nowrap">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-900 whitespace-nowrap">
                        3. كشف حساب التوريدات المدفوعة
                      </span>
                      <span className="text-[8.5px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 whitespace-nowrap shrink-0">
                        {paidCount} مدفوع
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 leading-tight line-clamp-2">
                      حصر التوريدات المسددة بالكامل وإجمالي المبالغ المدفوعة
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLaunch('paid');
                  }}
                  className="px-2 sm:px-2.5 py-1 text-[9.5px] sm:text-[10.5px] font-bold text-emerald-700 bg-white border border-emerald-300 hover:bg-emerald-100 rounded-lg transition shrink-0 mr-1.5"
                >
                  معاينة
                </button>
              </div>
            </div>
          </div>

          {/* Date Filter (collapsible or compact) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[10.5px] font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#03457a]" />
              <span>فترة الكشف (اختياري)</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] text-slate-500 block mb-0.5">من تاريخ</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 h-7 text-[10.5px] font-bold text-slate-900 focus:outline-hidden focus:border-[#0284c7]"
                />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block mb-0.5">إلى تاريخ</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 h-7 text-[10.5px] font-bold text-slate-900 focus:outline-hidden focus:border-[#0284c7]"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-8 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => handleLaunch(reportType)}
              className="flex items-center gap-1.5 px-5 h-8 text-[11px] font-black text-white bg-[#03457a] hover:bg-[#0284c7] rounded-xl shadow-xs transition cursor-pointer"
            >
              <span>عرض الكشف وطباعته</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintStatementModal;

import React from 'react';
import { X, FileDown, Calendar, Truck, CheckCircle2, Clock } from 'lucide-react';
import { Delivery } from '../../types';

interface StatsBreakdownModalProps {
  isOpen: boolean;
  type: 'total' | 'paid' | 'due' | null;
  customerName: string;
  deliveries: Delivery[];
  onClose: () => void;
  onDownloadPdf: (filteredList: Delivery[], title: string, reportType?: 'all' | 'due' | 'paid') => void;
}

export const StatsBreakdownModal: React.FC<StatsBreakdownModalProps> = ({
  isOpen,
  type,
  customerName,
  deliveries,
  onClose,
  onDownloadPdf,
}) => {
  if (!isOpen || !type) return null;

  let title = 'سجل التوريدات والردود';
  let badgeColor = 'bg-slate-100 text-slate-800';
  let filteredList: Delivery[] = [];

  if (type === 'total') {
    title = 'إجمالي عدد ومبالغ الردود';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    filteredList = deliveries;
  } else if (type === 'paid') {
    title = 'سجل الردود والتوريدات المدفوعة';
    badgeColor = 'bg-sky-100 text-sky-800 border-sky-300';
    filteredList = deliveries.filter(
      (d) => d.payment_status === 'مدفوع' || d.payment_method === 'كاش'
    );
  } else if (type === 'due') {
    title = 'سجل الردود والتوريدات المستحقة (المتأخرات)';
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
    filteredList = deliveries.filter(
      (d) => d.payment_status === 'مستحق' || d.payment_method === 'آجل'
    );
  }

  const count = filteredList.length;
  const totalAmount = filteredList.reduce((sum, d) => sum + (Number(d.price) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#03457a] text-white px-3.5 py-2 flex items-center justify-between shrink-0">
          <div className="text-right">
            <h3 className="text-xs font-extrabold font-['Tajawal',sans-serif]">
              {title}
            </h3>
            <p className="text-[9.5px] text-sky-100">
              العميل: {customerName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Summary Pill Bar */}
        <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badgeColor}`}>
              {count} رد
            </span>
            <span className="text-[10px] font-black text-slate-800 font-mono">
              إجمالي: {totalAmount} ريال
            </span>
          </div>
          <span className="text-[9.5px] text-slate-500 font-medium">
            تفاصيل السجلات
          </span>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
          {filteredList.length === 0 ? (
            <div className="text-center py-6 text-slate-400 font-medium text-[10px]">
              لا توجد سجلات في هذا القسم حالياً
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredList.map((del) => {
                const isPaid =
                  del.payment_status === 'مدفوع' || del.payment_method === 'كاش';

                return (
                  <div
                    key={del.id}
                    className="bg-white border border-slate-200/90 hover:border-[#03457a]/50 rounded-lg p-2 shadow-2xs text-right transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 font-mono text-[9px] text-slate-600" dir="ltr">
                        <Calendar className="w-2.5 h-2.5 text-[#03457a]" />
                        <span>{del.supply_date}</span>
                        {del.supply_time && <span className="text-slate-400">({del.supply_time})</span>}
                      </div>

                      {isPaid ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[8.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>مدفوع</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[8.5px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <Clock className="w-2.5 h-2.5" />
                          <span>مستحق السداد</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-[9.5px]">
                      <div>
                        <span className="text-[8px] text-slate-400 block">النوع والسعة</span>
                        <span className="font-bold text-slate-800">
                          {del.supply_type} - {del.tank_capacity}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block">السائق</span>
                        <span className="font-bold text-slate-800">
                          {del.driver_name}
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="text-[8px] text-slate-400 block">المبلغ</span>
                        <span className="font-black text-slate-900 font-mono text-[10.5px]">
                          {del.price} ريال
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: Action Buttons */}
        <div className="bg-slate-50 p-2 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 h-7 text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition cursor-pointer flex items-center justify-center"
          >
            إغلاق
          </button>

          <button
            type="button"
            onClick={() =>
              onDownloadPdf(
                filteredList,
                title,
                type === 'due' ? 'due' : type === 'paid' ? 'paid' : 'all'
              )
            }
            className="flex items-center gap-1 px-3 h-7 text-[10px] font-black text-white bg-[#6a1b9a] hover:bg-[#4a148c] active:bg-[#4a148c] rounded-lg shadow-2xs transition cursor-pointer"
            title="تحميل ملف PDF وطباعة الكشف"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>تحميل ملف PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsBreakdownModal;

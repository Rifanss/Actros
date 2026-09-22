import React from 'react';
import { FileText, Calendar, AlertCircle } from 'lucide-react';
import { Customer, Delivery } from '../../types';

interface SummarySectionProps {
  customer: Customer;
  deliveries: Delivery[];
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  customer,
  deliveries,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  // Filter deliveries within selected date window
  const filteredDeliveries = deliveries.filter((d) => {
    if (!d.supply_date) return true;
    if (startDate && d.supply_date < startDate) return false;
    if (endDate && d.supply_date > endDate) return false;
    return true;
  });

  const dueFiltered = filteredDeliveries.filter(
    (d) => d.payment_status === 'مستحق' || d.payment_method === 'آجل'
  );

  const dueCount = dueFiltered.length;
  const dueAmount = dueFiltered.reduce(
    (sum, d) => sum + (d.remaining_amount !== undefined ? Number(d.remaining_amount) : Number(d.price) || 0),
    0
  );

  return (
    <div
      id="summary-card-section"
      className="bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden"
    >
      {/* Dark Blue Header Strip */}
      <div className="bg-[#03457a] text-white px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
            <FileText className="w-3 h-3 text-white" />
          </div>
          <span className="text-[11px] font-extrabold font-['Tajawal',sans-serif] tracking-wide">
            ملخص
          </span>
        </div>
      </div>

      <div className="p-2 space-y-1.5">
        {/* Date Filter: من تاريخ : [حقل التاريخ] إلى تاريخ : [حقل التاريخ] في سطر واحد بنمط أنيق ومصغر */}
        <div className="bg-[#f8fafc] border border-slate-200/80 rounded-lg px-1.5 py-0.5 flex items-center justify-between gap-1 shadow-2xs">
          {/* من تاريخ */}
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-0.5 text-[8px] font-semibold text-[#03457a] shrink-0">
              <Calendar className="w-2.5 h-2.5 text-[#03457a]" />
              <span>من تاريخ:</span>
            </div>
            <input
              id="summary-from-date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="summary-date-input w-full max-w-[92px] sm:max-w-none bg-white border border-slate-300/90 rounded px-1 py-0 h-[17px] text-[8px] font-medium text-slate-800 text-center font-mono focus:outline-hidden focus:border-[#03457a] leading-none"
            />
          </div>

          {/* فاصل وسطي */}
          <div className="w-[1px] h-3 bg-slate-200 shrink-0 mx-0.5" />

          {/* إلى تاريخ */}
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-0.5 text-[8px] font-semibold text-[#03457a] shrink-0">
              <Calendar className="w-2.5 h-2.5 text-[#03457a]" />
              <span>إلى تاريخ:</span>
            </div>
            <input
              id="summary-to-date"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="summary-date-input w-full max-w-[92px] sm:max-w-none bg-white border border-slate-300/90 rounded px-1 py-0 h-[17px] text-[8px] font-medium text-slate-800 text-center font-mono focus:outline-hidden focus:border-[#03457a] leading-none"
            />
          </div>
        </div>

        {/* Yellow / Amber Highlight Card */}
        <div className="bg-[#fffbeb] border border-[#fde047]/90 rounded-lg p-2 shadow-2xs text-slate-800 text-right leading-relaxed">
          <div className="flex items-start gap-1.5">
            <AlertCircle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[9.5px] font-medium space-y-0.5">
              <div>
                يتبقى لدي :{' '}
                <span className="font-semibold text-[#03457a]">
                  {customer.customer_name}
                </span>{' '}
                عدد ({' '}
                <span className="font-semibold text-rose-600">
                  {dueCount} رد
                </span>{' '}
                ) لم يتم سداده ، بمبلغ ({' '}
                <span className="font-semibold text-rose-600 font-mono">
                  {dueAmount} ريال
                </span>{' '}
                )
              </div>
              <div className="text-[8.5px] text-slate-600 font-normal">
                وذلك خلال الفترة من تاريخ :{' '}
                <span className="font-medium text-slate-800 font-mono" dir="ltr">
                  {startDate || 'البداية'}
                </span>{' '}
                إلى{' '}
                <span className="font-medium text-slate-800 font-mono" dir="ltr">
                  {endDate || 'اليوم'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarySection;

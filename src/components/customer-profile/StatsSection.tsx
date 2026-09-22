import React from 'react';
import { BarChart3, Coins, Wallet, Truck, Edit2, AlertTriangle, Check } from 'lucide-react';
import { Delivery } from '../../types';

interface StatsSectionProps {
  deliveries: Delivery[];
  editMode: boolean;
  onOpenWarningModal: () => void;
  onExitEditMode: () => void;
  onOpenDetailsModal: (type: 'total' | 'paid' | 'due') => void;
  onOpenEditDueModal: () => void;
  onOpenEditPaidModal: () => void;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  deliveries,
  editMode,
  onOpenWarningModal,
  onExitEditMode,
  onOpenDetailsModal,
  onOpenEditDueModal,
  onOpenEditPaidModal,
}) => {
  // Dynamically calculated statistics from actual customer deliveries
  const totalCount = deliveries.length;
  const totalAmount = deliveries.reduce((sum, d) => sum + (Number(d.price) || 0), 0);

  const paidDeliveries = deliveries.filter(
    (d) => d.payment_status === 'مدفوع' || d.payment_method === 'كاش'
  );
  const paidCount = paidDeliveries.length;
  const paidAmount = paidDeliveries.reduce(
    (sum, d) => sum + (d.paid_amount !== undefined ? Number(d.paid_amount) : Number(d.price) || 0),
    0
  );

  const dueDeliveries = deliveries.filter(
    (d) => d.payment_status === 'مستحق' || d.payment_method === 'آجل'
  );
  const dueCount = dueDeliveries.length;
  const dueAmount = dueDeliveries.reduce(
    (sum, d) => sum + (d.remaining_amount !== undefined ? Number(d.remaining_amount) : Number(d.price) || 0),
    0
  );

  return (
    <div
      id="financial-stats-section"
      className="bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden transition-all"
    >
      {/* Dark Blue Header Strip */}
      <div className="bg-[#03457a] text-white px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
            <BarChart3 className="w-3 h-3 text-white" />
          </div>
          <span className="text-[11px] font-extrabold font-['Tajawal',sans-serif] tracking-wide">
            إحصائيات التوريد والتعاملات المالية
          </span>
        </div>

        {/* Edit Controls: Top far-left opposite title */}
        <div className="flex items-center gap-1.5">
          {editMode && (
            <span className="text-[8px] font-bold bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>وضع التعديل</span>
            </span>
          )}

          {!editMode ? (
            <button
              id="btn-trigger-stats-warning"
              onClick={onOpenWarningModal}
              type="button"
              className="flex items-center gap-1 text-[8.5px] font-bold text-white bg-white/15 hover:bg-white/25 active:bg-white/30 px-2 py-0.5 rounded-md border border-white/30 transition cursor-pointer"
            >
              <Edit2 className="w-2.5 h-2.5" />
              <span>تعديل</span>
            </button>
          ) : (
            <button
              id="btn-exit-edit-mode"
              onClick={onExitEditMode}
              type="button"
              className="flex items-center gap-1 text-[8.5px] font-bold text-emerald-950 bg-emerald-300 hover:bg-emerald-200 px-2 py-0.5 rounded-md border border-emerald-400 transition cursor-pointer"
            >
              <Check className="w-2.5 h-2.5" />
              <span>إنهاء التعديل</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Interactive Color Cards */}
      <div className="p-1.5 sm:p-2.5">
        <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center">
          {/* Card 1 (Right in RTL): إجمالي عدد ومبالغ الردود (Green Card) */}
          <div
            id="stat-card-total"
            onClick={() => onOpenDetailsModal('total')}
            className="bg-[#f0faf4] border border-[#a7f3d0] hover:border-emerald-400 rounded-xl px-1 py-1.5 sm:p-2 flex flex-col justify-between shadow-2xs cursor-pointer hover:shadow-xs transition active:scale-[0.98] group"
            title="انقر لعرض تفاصيل جميع الردود والتوريدات"
          >
            <div>
              {/* Top Icon (Clean, floating without background circle) */}
              <div className="text-emerald-600 flex items-center justify-center mx-auto mb-1 group-hover:scale-105 transition">
                <Coins className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
              </div>
              {/* Title - Single Line */}
              <div className="text-[7.5px] min-[360px]:text-[8px] min-[400px]:text-[8.5px] sm:text-[9.5px] font-bold text-emerald-800 leading-tight mb-2 whitespace-nowrap overflow-hidden text-ellipsis px-0.5" title="إجمالي عدد ومبالغ الردود">
                إجمالي عدد ومبالغ الردود
              </div>
            </div>

            {/* 2 Sub-Columns with Vertical Divider Line (Amount column made wider than count column) */}
            <div className="flex items-center justify-between text-center pt-0.5">
              {/* Right Sub-Column: عدد الردود */}
              <div className="basis-[38%] shrink-0 text-center min-w-0 px-0.5">
                <div className="text-[8.5px] font-semibold text-emerald-700 leading-none">
                  عدد الردود
                </div>
                <div className="text-[10px] font-medium text-emerald-800 font-mono mt-0.5 whitespace-nowrap">
                  {totalCount} رد
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="w-[1px] h-6 sm:h-7 bg-emerald-300/80 shrink-0 mx-0.5" />

              {/* Left Sub-Column: إجمالي المبلغ (Wider) */}
              <div className="flex-1 text-center min-w-0 px-0.5">
                <div className="text-[8.5px] font-semibold text-emerald-700 leading-none whitespace-nowrap">
                  إجمالي المبلغ
                </div>
                <div className="text-[10px] font-medium text-emerald-800 font-mono mt-0.5 whitespace-nowrap">
                  {totalAmount} SAR
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 (Center in RTL): عدد ومبالغ الردود المدفوعة (Blue Card) */}
          <div className="flex flex-col justify-between">
            <div
              id="stat-card-paid"
              onClick={() => onOpenDetailsModal('paid')}
              className="bg-[#f0f9ff] border border-[#bae6fd] hover:border-sky-400 rounded-xl px-1 py-1.5 sm:p-2 flex-1 flex flex-col justify-between shadow-2xs cursor-pointer hover:shadow-xs transition active:scale-[0.98] group"
              title="انقر لعرض تفاصيل الردود المدفوعة"
            >
              <div>
                {/* Top Icon (Clean, floating without background circle) */}
                <div className="text-sky-600 flex items-center justify-center mx-auto mb-1 group-hover:scale-105 transition">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                </div>
                {/* Title - Single Line */}
                <div className="text-[7.5px] min-[360px]:text-[8px] min-[400px]:text-[8.5px] sm:text-[9.5px] font-bold text-sky-800 leading-tight mb-2 whitespace-nowrap overflow-hidden text-ellipsis px-0.5" title="عدد ومبالغ الردود المدفوعة">
                  عدد ومبالغ الردود المدفوعة
                </div>
              </div>

              {/* 2 Sub-Columns with Vertical Divider Line (Amount column made wider than count column) */}
              <div className="flex items-center justify-between text-center pt-0.5">
                {/* Right Sub-Column: عدد الردود */}
                <div className="basis-[38%] shrink-0 text-center min-w-0 px-0.5">
                  <div className="text-[8.5px] font-semibold text-sky-700 leading-none">
                    عدد الردود
                  </div>
                  <div className="text-[10px] font-medium text-sky-800 font-mono mt-0.5 whitespace-nowrap">
                    {paidCount} رد
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-[1px] h-6 sm:h-7 bg-sky-300/80 shrink-0 mx-0.5" />

                {/* Left Sub-Column: المبلغ المدفوع (Wider) */}
                <div className="flex-1 text-center min-w-0 px-0.5">
                  <div className="text-[8.5px] font-semibold text-sky-700 leading-none whitespace-nowrap">
                    المبلغ المدفوع
                  </div>
                  <div className="text-[10px] font-medium text-sky-800 font-mono mt-0.5 whitespace-nowrap">
                    {paidAmount} SAR
                  </div>
                </div>
              </div>
            </div>

            {/* In Edit Mode: Small "تعديل" Button Under Paid Card */}
            {editMode && (
              <button
                id="btn-edit-paid-stats"
                onClick={onOpenEditPaidModal}
                type="button"
                className="mt-1 py-0.5 px-1.5 text-[8.5px] font-bold text-sky-700 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-md transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs animate-fade-in"
              >
                <Edit2 className="w-2.5 h-2.5" />
                <span>تعديل المدفوع</span>
              </button>
            )}
          </div>

          {/* Card 3 (Left in RTL): عدد ومبالغ الردود المستحقة (Red Card) */}
          <div className="flex flex-col justify-between">
            <div
              id="stat-card-due"
              onClick={() => onOpenDetailsModal('due')}
              className="bg-[#fff1f2] border border-[#fecdd3] hover:border-rose-400 rounded-xl px-1 py-1.5 sm:p-2 flex-1 flex flex-col justify-between shadow-2xs cursor-pointer hover:shadow-xs transition active:scale-[0.98] group"
              title="انقر لعرض تفاصيل الردود المستحقة"
            >
              <div>
                {/* Top Icon (Clean, floating without background circle) */}
                <div className="text-rose-600 flex items-center justify-center mx-auto mb-1 group-hover:scale-105 transition">
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                </div>
                {/* Title - Single Line */}
                <div className="text-[7.5px] min-[360px]:text-[8px] min-[400px]:text-[8.5px] sm:text-[9.5px] font-bold text-rose-800 leading-tight mb-2 whitespace-nowrap overflow-hidden text-ellipsis px-0.5" title="عدد ومبالغ الردود المستحقة">
                  عدد ومبالغ الردود المستحقة
                </div>
              </div>

              {/* 2 Sub-Columns with Vertical Divider Line (Amount column made wider than count column) */}
              <div className="flex items-center justify-between text-center pt-0.5">
                {/* Right Sub-Column: عدد الردود */}
                <div className="basis-[38%] shrink-0 text-center min-w-0 px-0.5">
                  <div className="text-[8.5px] font-semibold text-rose-700 leading-none">
                    عدد الردود
                  </div>
                  <div className="text-[10px] font-medium text-rose-800 font-mono mt-0.5 whitespace-nowrap">
                    {dueCount} رد
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-[1px] h-6 sm:h-7 bg-rose-300/80 shrink-0 mx-0.5" />

                {/* Left Sub-Column: المبلغ المستحق (Wider) */}
                <div className="flex-1 text-center min-w-0 px-0.5">
                  <div className="text-[8.5px] font-semibold text-rose-700 leading-none whitespace-nowrap">
                    المبلغ المستحق
                  </div>
                  <div className="text-[10px] font-medium text-rose-800 font-mono mt-0.5 whitespace-nowrap">
                    {dueAmount} SAR
                  </div>
                </div>
              </div>
            </div>

            {/* In Edit Mode: Small "تعديل" Button Under Due Card */}
            {editMode && (
              <button
                id="btn-edit-due-stats"
                onClick={onOpenEditDueModal}
                type="button"
                className="mt-1 py-0.5 px-1.5 text-[8.5px] font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 border border-rose-300 rounded-md transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs animate-fade-in"
              >
                <Edit2 className="w-2.5 h-2.5" />
                <span>تعديل المستحق</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Hint of Stats Section */}
        <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between text-slate-400 text-[8.5px]">
          <span>* اضغط على أي بطاقة لعرض السجلات وتصدير PDF</span>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;

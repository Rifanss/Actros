import React, { useState } from 'react';
import { X, CheckCircle, Clock, Calendar, CheckSquare, Square } from 'lucide-react';
import { Delivery } from '../../types';

interface EditDueDeliveriesModalProps {
  isOpen: boolean;
  deliveries: Delivery[];
  onClose: () => void;
  onSettleDeliveries: (deliveryIds: string[]) => void;
}

export const EditDueDeliveriesModal: React.FC<EditDueDeliveriesModalProps> = ({
  isOpen,
  deliveries,
  onClose,
  onSettleDeliveries,
}) => {
  if (!isOpen) return null;

  const dueList = deliveries.filter(
    (d) => d.payment_status === 'مستحق' || d.payment_method === 'آجل'
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === dueList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(dueList.map((d) => d.id));
    }
  };

  const handleSettle = () => {
    if (selectedIds.length === 0) return;
    onSettleDeliveries(selectedIds);
    setSelectedIds([]);
    onClose();
  };

  const selectedTotalAmount = dueList
    .filter((d) => selectedIds.includes(d.id))
    .reduce((sum, d) => sum + (Number(d.price) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-xl border border-rose-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white px-3.5 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <div>
              <h3 className="text-xs font-extrabold font-['Tajawal',sans-serif]">
                تعديل وسداد الردود المستحقة
              </h3>
              <p className="text-[9px] text-rose-100">
                حدد الردود المسددة لتحويل حالتها إلى "مدفوع"
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Selection control bar */}
        <div className="bg-rose-50 px-3 py-1.5 border-b border-rose-100 flex items-center justify-between text-[10px]">
          <button
            type="button"
            onClick={selectAll}
            className="flex items-center gap-1 font-bold text-rose-800 hover:text-rose-950 cursor-pointer"
          >
            {selectedIds.length === dueList.length && dueList.length > 0 ? (
              <CheckSquare className="w-3.5 h-3.5 text-rose-700" />
            ) : (
              <Square className="w-3.5 h-3.5 text-rose-700" />
            )}
            <span>تحديد الكل ({dueList.length})</span>
          </button>

          {selectedIds.length > 0 && (
            <span className="font-bold text-rose-900 font-mono text-[9.5px]">
              المحدد: {selectedIds.length} رد ({selectedTotalAmount} ريال)
            </span>
          )}
        </div>

        {/* List of Due Deliveries */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
          {dueList.length === 0 ? (
            <div className="text-center py-6 text-slate-400 font-medium text-[10px]">
              رائع! لا توجد ردود مستحقة للعميل في الوقت الحالي
            </div>
          ) : (
            dueList.map((del) => {
              const isSelected = selectedIds.includes(del.id);

              return (
                <div
                  key={del.id}
                  onClick={() => toggleSelect(del.id)}
                  className={`border rounded-lg p-2 shadow-2xs text-right transition cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-rose-50/70 border-rose-400 ring-1 ring-rose-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-1 font-mono text-[9px] text-slate-600" dir="ltr">
                        <Calendar className="w-2.5 h-2.5 text-rose-500" />
                        <span>{del.supply_date}</span>
                        {del.supply_time && <span>({del.supply_time})</span>}
                      </div>
                      <div className="text-[10px] font-bold text-slate-800 mt-0.5">
                        {del.supply_type} - {del.tank_capacity} ({del.driver_name})
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="text-[11px] font-black text-rose-700 font-mono block">
                      {del.price} ريال
                    </span>
                    <span className="text-[8.5px] text-rose-500 font-bold">
                      غير مسدد
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-2 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 h-7 text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition cursor-pointer flex items-center justify-center"
          >
            إلغاء
          </button>

          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={handleSettle}
            className={`flex items-center gap-1 px-3 h-7 text-[10px] font-black rounded-lg shadow-2xs transition ${
              selectedIds.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>سداد الردود المحددة ({selectedIds.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDueDeliveriesModal;

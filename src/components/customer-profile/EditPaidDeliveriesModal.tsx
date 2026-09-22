import React from 'react';
import { X, Wallet, Calendar, RotateCcw } from 'lucide-react';
import { Delivery } from '../../types';

interface EditPaidDeliveriesModalProps {
  isOpen: boolean;
  deliveries: Delivery[];
  onClose: () => void;
  onRevertToDue: (deliveryId: string) => void;
}

export const EditPaidDeliveriesModal: React.FC<EditPaidDeliveriesModalProps> = ({
  isOpen,
  deliveries,
  onClose,
  onRevertToDue,
}) => {
  if (!isOpen) return null;

  const paidList = deliveries.filter(
    (d) => d.payment_status === 'مدفوع' || d.payment_method === 'كاش'
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#023561] to-[#03457a] text-white px-3.5 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <Wallet className="w-4 h-4" />
            <div>
              <h3 className="text-xs font-extrabold font-['Tajawal',sans-serif]">
                تعديل ومراجعة الردود المدفوعة
              </h3>
              <p className="text-[9px] text-sky-100">
                يمكنك إعادة الرد المسدد إلى حالة "مستحق" إذا تم تسجيله بالخطأ
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

        {/* List of Paid Deliveries */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
          {paidList.length === 0 ? (
            <div className="text-center py-6 text-slate-400 font-medium text-[10px]">
              لا توجد ردود مدفوعة مسجلة حالياً
            </div>
          ) : (
            paidList.map((del) => (
              <div
                key={del.id}
                className="bg-white border border-slate-200 hover:border-sky-300 rounded-lg p-2 shadow-2xs text-right transition flex items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1 font-mono text-[9px] text-slate-600" dir="ltr">
                    <Calendar className="w-2.5 h-2.5 text-sky-600" />
                    <span>{del.supply_date}</span>
                    {del.supply_time && <span>({del.supply_time})</span>}
                  </div>
                  <div className="text-[10px] font-bold text-slate-800 mt-0.5">
                    {del.supply_type} - {del.tank_capacity} ({del.driver_name})
                  </div>
                  <div className="text-[9.5px] font-bold text-emerald-700 font-mono mt-0.5">
                    المبلغ: {del.price} ريال (مدفوع)
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRevertToDue(del.id)}
                  className="flex items-center gap-1 px-2 h-6 text-[9.5px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition cursor-pointer"
                  title="إلغاء السداد وإعادة الرد إلى المستحقات"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>تحويل لمستحق</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-2 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 h-7 text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition cursor-pointer flex items-center justify-center"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPaidDeliveriesModal;

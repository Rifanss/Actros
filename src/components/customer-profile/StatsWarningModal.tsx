import React from 'react';
import { AlertTriangle, ArrowRight, Check } from 'lucide-react';

interface StatsWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const StatsWarningModal: React.FC<StatsWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-xs rounded-xl shadow-xl border border-amber-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-center">
        {/* Top Warning Icon */}
        <div className="pt-4 pb-1.5 px-4 flex justify-center">
          <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 text-amber-600 flex items-center justify-center shadow-inner">
            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xs font-black text-slate-900 font-['Tajawal',sans-serif] px-4">
          تنبيه
        </h3>

        {/* Warning Body Text */}
        <div className="px-4 py-1.5 text-slate-700 font-bold text-[10px] leading-relaxed">
          أي تعديل هنا يترتب عليه تعديل في سجلات التوريد والسجلات المالية والمبالغ المستحقة.
        </div>

        {/* Subtitle / notice */}
        <p className="px-4 pb-2 text-[9px] text-slate-500">
          هل تريد تفعيل وضع التعديل وتعديل السجلات المالية؟
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 border-t border-slate-150">
          {/* موافق */}
          <button
            type="button"
            id="btn-warning-confirm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center justify-center gap-1 h-7 px-3 rounded-lg font-black text-[10px] text-white bg-[#03457a] hover:bg-[#023561] active:bg-[#012544] shadow-2xs cursor-pointer transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>موافق</span>
          </button>

          {/* رجوع */}
          <button
            type="button"
            id="btn-warning-back"
            onClick={onClose}
            className="flex items-center justify-center gap-1 h-7 px-3 rounded-lg font-bold text-[10px] text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs cursor-pointer transition"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>رجوع</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsWarningModal;

import React from 'react';
import { PhoneCall, MessageCircle, Printer, PlusCircle } from 'lucide-react';

interface ActionButtonsRowProps {
  onCall: () => void;
  onWhatsApp: () => void;
  onPrint: () => void;
  onNewSupply: () => void;
}

export const ActionButtonsRow: React.FC<ActionButtonsRowProps> = ({
  onCall,
  onWhatsApp,
  onPrint,
  onNewSupply,
}) => {
  return (
    <div
      id="customer-action-buttons-row"
      className="grid grid-cols-4 gap-1 sm:gap-1.5 py-0.5"
    >
      {/* Button 1 (Rightmost RTL): إجراء اتصال (Red) */}
      <button
        id="btn-action-call"
        onClick={onCall}
        type="button"
        className="bg-[#d32f2f] hover:bg-[#c62828] active:bg-[#b71c1c] text-white rounded-lg py-1.5 px-1 flex items-center justify-center gap-1 shadow-2xs hover:shadow-xs transition active:scale-95 cursor-pointer text-center"
        title="إجراء اتصال هاتفي مباشر بالعميل"
      >
        <PhoneCall className="w-3 h-3 shrink-0" />
        <span className="text-[8.5px] font-bold whitespace-nowrap leading-none">
          إجراء اتصال
        </span>
      </button>

      {/* Button 2: تواصل واتساب (Green) */}
      <button
        id="btn-action-whatsapp"
        onClick={onWhatsApp}
        type="button"
        className="bg-[#2e7d32] hover:bg-[#1b5e20] active:bg-[#1b5e20] text-white rounded-lg py-1.5 px-1 flex items-center justify-center gap-1 shadow-2xs hover:shadow-xs transition active:scale-95 cursor-pointer text-center"
        title="تواصل عبر الواتساب"
      >
        <MessageCircle className="w-3 h-3 shrink-0" />
        <span className="text-[8.5px] font-bold whitespace-nowrap leading-none">
          تواصل واتساب
        </span>
      </button>

      {/* Button 3: طباعة الكشوفات (Purple) */}
      <button
        id="btn-action-print"
        onClick={onPrint}
        type="button"
        className="bg-[#6a1b9a] hover:bg-[#4a148c] active:bg-[#4a148c] text-white rounded-lg py-1.5 px-1 flex items-center justify-center gap-1 shadow-2xs hover:shadow-xs transition active:scale-95 cursor-pointer text-center"
        title="طباعة وتصدير كشوفات الحساب"
      >
        <Printer className="w-3 h-3 shrink-0" />
        <span className="text-[8.5px] font-bold whitespace-nowrap leading-none">
          طباعة الكشوفات
        </span>
      </button>

      {/* Button 4 (Leftmost RTL): توريد جديد (Dark Blue) */}
      <button
        id="btn-action-new-supply"
        onClick={onNewSupply}
        type="button"
        className="bg-[#03457a] hover:bg-[#023561] active:bg-[#012544] text-white rounded-lg py-1.5 px-1 flex items-center justify-center gap-1 shadow-2xs hover:shadow-xs transition active:scale-95 cursor-pointer text-center"
        title="تسجيل رد أو توريد جديد للعميل"
      >
        <PlusCircle className="w-3 h-3 shrink-0" />
        <span className="text-[8.5px] font-bold whitespace-nowrap leading-none">
          توريد جديد
        </span>
      </button>
    </div>
  );
};

export default ActionButtonsRow;

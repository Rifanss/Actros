import React, { useState } from 'react';
import { Customer } from '../types';
import { MessageSquareShare, Copy, Check, X, Phone } from 'lucide-react';
import BackButton from './BackButton';

interface PaymentReminderModalProps {
  customer: Customer;
  pendingAmount: number;
  onClose: () => void;
}

export const PaymentReminderModal: React.FC<PaymentReminderModalProps> = ({
  customer,
  pendingAmount,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  // Format Saudi phone for wa.me (e.g. 0551234567 -> 966551234567)
  const cleanPhone = customer.mobile.replace(/\D/g, '');
  const internationalPhone = cleanPhone.startsWith('0')
    ? `966${cleanPhone.slice(1)}`
    : cleanPhone.startsWith('966')
    ? cleanPhone
    : `966${cleanPhone}`;

  const messageText = `السلام عليكم ورحمة الله وبركاته،
عزيزنا العميل: ${customer.customer_name}
تحية طيبة من نبع لتوريد المياه (NABAA).

نود تذكيركم بوجود مبلغ مستحق عن توريدات المياه السابقة بقيمة:
*${pendingAmount.toLocaleString()} ريال سعودي*

نرجو التكرم بالتحويل على الحساب البنكي المعتمد:
مصرف الراجحي: SA4480000204608010123456
باسم: نبع لتوريد المياه

شاكرين لكم حسن تعاونكم الدائم وثقتكم بنا.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${internationalPhone}?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-sm w-full shadow-xl overflow-hidden border border-slate-200 text-right">
        {/* Header */}
        <div className="bg-[#03457a] text-white px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">
              <MessageSquareShare className="w-3.5 h-3.5 text-amber-200" />
            </div>
            <div>
              <h2 className="font-extrabold text-[11px] font-['Tajawal',sans-serif] leading-tight">
                إرسال تذكير بطلب السداد
              </h2>
              <p className="text-[8.5px] text-amber-200">إشعار العميل بالمستحقات المالية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2 text-[10px]">
          <div className="bg-[#f8fafc] rounded-lg p-2 border border-slate-200/70 min-h-[40px] space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 text-[8.5px] font-semibold">العميل:</span>
              <span className="font-bold text-slate-900 text-[10.5px]">{customer.customer_name}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 text-[8.5px] font-semibold">المبلغ المستحق:</span>
              <span className="font-black text-amber-700 font-mono text-[11px]">
                {pendingAmount.toLocaleString()} ر.س
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 text-[8.5px] font-semibold">رقم الجوال:</span>
              <span className="font-mono font-bold text-slate-700 text-[10px] dir-ltr">{customer.mobile}</span>
            </div>
          </div>

          <div>
            <label className="text-[8.5px] font-semibold text-slate-700 mb-1 block">
              نص الرسالة المعدة مسبقاً:
            </label>
            <div className="w-full bg-slate-50 text-slate-800 text-[9.5px] p-2 rounded-lg border border-slate-200 whitespace-pre-line leading-relaxed font-sans max-h-36 overflow-y-auto">
              {messageText}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-1.5 pt-1">
            <button
              onClick={handleSendWhatsApp}
              className="w-full h-7 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-[9.5px] rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageSquareShare className="w-3.5 h-3.5" />
              <span>إرسال عبر واتساب (WhatsApp)</span>
            </button>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleCopy}
                className="h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[9.5px] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ النص</span>
                  </>
                )}
              </button>

              <button
                onClick={() => (window.location.href = `tel:${customer.mobile}`)}
                className="h-7 bg-sky-50 hover:bg-sky-100 text-[#03457a] font-bold text-[9.5px] rounded-lg border border-sky-200 transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>اتصال بالعميل</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReminderModal;

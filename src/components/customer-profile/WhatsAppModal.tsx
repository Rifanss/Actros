import React, { useState } from 'react';
import { X, MessageCircle, Copy, Send, Check } from 'lucide-react';
import { Customer } from '../../types';

interface WhatsAppModalProps {
  isOpen: boolean;
  customer: Customer;
  dueAmount: number;
  dueCount: number;
  startDate?: string;
  endDate?: string;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  customer,
  dueAmount,
  dueCount,
  startDate,
  endDate,
  onClose,
}) => {
  if (!isOpen) return null;

  const [messageType, setMessageType] = useState<'reminder' | 'general'>('reminder');
  const [copied, setCopied] = useState(false);

  // Format dates as [DD/MM/YYYY] or use provided date bounds
  const formatPeriodDate = (dStr?: string) => {
    if (!dStr) return '01/09/2026';
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dStr;
  };

  const periodStart = formatPeriodDate(startDate);
  const periodEnd = formatPeriodDate(endDate || new Date().toISOString().split('T')[0]);

  // Exact template requested by user - STRICT, ZERO VARIATIONS
  const reminderTemplate = `السلام عليكم ورحمة الله وبركاته

*الأخ العزيز : ${customer.customer_name}*
يوجد لديك متأخرات مالية مستحقة لم يتم سدادها حتى تاريخه

بمبلغ : *${dueAmount} ريال* 
وذلك مقابل عدد : *${dueCount} رد* 
عن الفترة من :
*${periodStart} إلى ${periodEnd}*

ونظرًا لوجود التزامات مالية مرتبطة بأعمال التشغيل والتوريد، نأمل منكم التكرم بتحويل المبلغ المستحق كاملًا على الحساب التالي:

اسم المصرف : مصرف الراجحي
رقم الحساب : 335000010006086017564
رقم الآيبان : SA6080000335608016017564

بعد إتمام التحويل، نرجو التكرم بإرسال صورة من إيصال التحويل ليتم تحديث السداد في سجلاتنا.

*شاكر ومقدر لك تعاونك وتفهمك*`;

  const generalTemplate = `السلام عليكم ورحمة الله وبركاته
*الأخ العزيز : ${customer.customer_name}*
تحية طيبة وبعد ،
نحن في خدمتكم دائماً لتوريد وتوصيل مياه التحلية ومياه الآبار بأعلى معايير الجودة والسرعة.
يسعدنا تواصلكم وطلب أي رد جديد في أي وقت.`;

  const [customMessage, setCustomMessage] = useState(reminderTemplate);

  const handleTypeChange = (type: 'reminder' | 'general') => {
    setMessageType(type);
    setCustomMessage(type === 'reminder' ? reminderTemplate : generalTemplate);
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSend = () => {
    let cleanMobile = customer.mobile.replace(/\D/g, '');
    if (cleanMobile.startsWith('05')) {
      cleanMobile = '966' + cleanMobile.slice(1);
    } else if (cleanMobile.startsWith('5')) {
      cleanMobile = '966' + cleanMobile;
    }
    const encoded = encodeURIComponent(customMessage);
    const url = `https://api.whatsapp.com/send?phone=${cleanMobile}&text=${encoded}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-xl border border-emerald-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#2e7d32] text-white px-3.5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-white" />
            <div>
              <h3 className="text-xs font-black font-['Tajawal',sans-serif]">
                مراسلة العميل عبر الواتساب
              </h3>
              <p className="text-[9.5px] text-emerald-100">
                {customer.customer_name} ({customer.mobile})
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

        <div className="p-3 space-y-2 text-right font-['Cairo',sans-serif]">
          {/* Choice Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange('reminder')}
              className={`py-1 px-1.5 text-[10px] font-bold rounded-md transition cursor-pointer ${
                messageType === 'reminder'
                  ? 'bg-[#2e7d32] text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              رسالة سداد المتأخرات
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('general')}
              className={`py-1 px-1.5 text-[10px] font-bold rounded-md transition cursor-pointer ${
                messageType === 'general'
                  ? 'bg-[#2e7d32] text-white shadow-2xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              رسالة عامة للعميل
            </button>
          </div>

          {/* Editable Text Area */}
          <div>
            <label className="block text-[9.5px] font-bold text-slate-700 mb-0.5">
              نص الرسالة المعتمدة للإرسال (WhatsApp)
            </label>
            <textarea
              rows={7}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-[9.5px] font-medium text-slate-900 leading-relaxed focus:outline-hidden focus:border-emerald-600 focus:bg-white resize-none font-sans"
              dir="rtl"
            />
          </div>

          {/* Bank details highlight */}
          {messageType === 'reminder' && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-1.5 text-[9px] text-emerald-900 leading-tight">
              <div className="font-extrabold text-[#2e7d32] mb-0.5">بيانات التحويل المعتمدة:</div>
              <div>مصرف الراجحي | حساب: <span className="font-mono font-bold">335000010006086017564</span></div>
              <div>الآيبان: <span className="font-mono font-bold" dir="ltr">SA6080000335608016017564</span></div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 h-7 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 h-7 text-[10px] font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer flex items-center justify-center"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSend}
                className="flex items-center gap-1 px-3 h-7 text-[10px] font-black text-white bg-[#2e7d32] hover:bg-[#1b5e20] rounded-lg shadow-2xs transition cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>إرسال عبر الواتساب</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppModal;

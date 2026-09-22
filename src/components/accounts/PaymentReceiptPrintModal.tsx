import React, { useRef } from 'react';
import { Payment } from '../../types';
import { CheckCircle2, DollarSign } from 'lucide-react';
import { A4DocumentPreviewModal } from '../common/A4DocumentPreviewModal';
import { A4PageSheet } from '../common/A4PageSheet';

interface PaymentReceiptPrintModalProps {
  payment: Payment;
  onClose: () => void;
}

export const PaymentReceiptPrintModal: React.FC<PaymentReceiptPrintModalProps> = ({
  payment,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `سند قبض رقم: ${payment.payment_number}\n` +
      `استلمنا من السيد/السادة: ${payment.customer_name}\n` +
      `مبلغ وقدره: ${payment.amount} ر.س\n` +
      `طريقة الدفع: ${payment.payment_method}\n` +
      `تاريخ القبض: ${payment.payment_date}\n` +
      (payment.invoice_number ? `سداداً للفاتورة: ${payment.invoice_number}\n` : '') +
      `شكراً لتعاملكم معنا - نبع لتوريد المياه (NABAA).`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <A4DocumentPreviewModal
      title={`معاينة سند قبض #${payment.payment_number}`}
      subtitle={`العميل: ${payment.customer_name} • ${payment.payment_date}`}
      badge="ورقة A4 عمودية (210×297 مم)"
      pagesCount={1}
      onClose={onClose}
      onConfirmPrint={handlePrint}
      onShareWhatsApp={handleShareWhatsApp}
      shareWhatsAppLabel="واتساب"
    >
      <A4PageSheet id="printable-payment-receipt-a4" pageNumber={1} totalPages={1}>
        <div ref={receiptRef} className="space-y-4 text-slate-800 font-sans flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-emerald-800/30 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold text-emerald-950 font-['Tajawal',sans-serif]">
                    نبع لتوريد المياه
                  </h1>
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                    NABAA
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">سند قبض رسمي معتمد - توريد وتوزيع المياه</p>
                <p className="text-[9px] text-slate-400 mt-0.5">المملكة العربية السعودية - الطائف</p>
              </div>

              <div className="text-left font-mono text-[9.5px]">
                <div className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-md font-bold">
                  {payment.payment_number}
                </div>
                <p className="text-slate-500 mt-1">التاريخ: {payment.payment_date}</p>
              </div>
            </div>

            {/* Receipt Content Body */}
            <div className="space-y-2.5 text-xs text-slate-700 bg-[#f8fafc] p-3.5 rounded-lg border border-slate-200/80">
              <div className="flex items-baseline justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500 font-semibold text-[10px]">استلمنا من السيد / السادة:</span>
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  {payment.customer_name}
                </span>
              </div>

              <div className="flex items-baseline justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500 font-semibold text-[10px]">مبلغ وقدره:</span>
                <div className="text-left">
                  <span className="text-sm sm:text-base font-black text-emerald-700 font-mono">
                    {payment.amount.toLocaleString()} ر.س
                  </span>
                </div>
              </div>

              <div className="flex items-baseline justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500 font-semibold text-[10px]">طريقة القبض:</span>
                <span className="font-bold text-slate-800 px-2.5 py-0.5 bg-white border border-slate-200 rounded text-[10.5px]">
                  {payment.payment_method}
                </span>
              </div>

              {payment.reference_number && (
                <div className="flex items-baseline justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500 font-semibold text-[10px]">رقم الحوالة / المرجع:</span>
                  <span className="font-mono font-bold text-slate-800">{payment.reference_number}</span>
                </div>
              )}

              {payment.invoice_number && (
                <div className="flex items-baseline justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500 font-semibold text-[10px]">وذلك سداداً للفاتورة:</span>
                  <span className="font-mono text-[#03457a] font-bold">{payment.invoice_number}</span>
                </div>
              )}

              {payment.notes && (
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-slate-500 font-semibold text-[10px]">ملاحظات:</span>
                  <span className="text-slate-600 text-[10.5px]">{payment.notes}</span>
                </div>
              )}
            </div>

            {/* Receipt Image if available */}
            {payment.receipt_attachment && (
              <div className="border border-slate-200 rounded-lg p-2.5 bg-white">
                <p className="text-[10px] font-bold text-slate-700 mb-1.5">صورة إشعار السداد المرفقة:</p>
                <div className="max-h-48 overflow-hidden rounded-md border border-slate-100 flex items-center justify-center bg-slate-50">
                  <img
                    src={payment.receipt_attachment}
                    alt="إيصال السداد"
                    className="max-h-48 object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Signatures */}
          <div className="pt-4 border-t border-slate-200 flex justify-between text-center text-[10px] text-slate-500 mt-auto">
            <div>
              <p className="font-bold text-slate-700">توقيع المستلم</p>
              <div className="mt-5 border-b border-dashed border-slate-400 w-28 mx-auto"></div>
            </div>
            <div>
              <p className="font-bold text-slate-700">توقيع وختم أمين الصندوق</p>
              <div className="mt-5 border-b border-dashed border-slate-400 w-28 mx-auto"></div>
            </div>
          </div>
        </div>
      </A4PageSheet>
    </A4DocumentPreviewModal>
  );
};

export default PaymentReceiptPrintModal;

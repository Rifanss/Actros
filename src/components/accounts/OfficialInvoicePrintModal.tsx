import React, { useRef } from 'react';
import { Invoice } from '../../types';
import { QrCode, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { A4DocumentPreviewModal } from '../common/A4DocumentPreviewModal';
import { A4PageSheet } from '../common/A4PageSheet';

interface OfficialInvoicePrintModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export const OfficialInvoicePrintModal: React.FC<OfficialInvoicePrintModalProps> = ({
  invoice,
  onClose,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `فاتورة نبع لتوريد المياه (NABAA) رقم: ${invoice.invoice_number}\n` +
      `العميل: ${invoice.customer_name}\n` +
      `تاريخ الإصدار: ${invoice.issue_date}\n` +
      `تاريخ الاستحقاق: ${invoice.due_date}\n` +
      `إجمالي المبلغ: ${invoice.total_amount} ر.س\n` +
      `المدفوع: ${invoice.paid_amount} ر.س\n` +
      `المتبقي: ${invoice.remaining_amount} ر.س\n` +
      `الحالة: ${invoice.status}\n` +
      `شكراً لتعاملكم معنا.`
    );
    window.open(`https://wa.me/${invoice.mobile.replace(/\+/g, '').replace(/\s/g, '')}?text=${text}`, '_blank');
  };

  return (
    <A4DocumentPreviewModal
      title={`معاينة فاتورة التوريد المعتمدة #${invoice.invoice_number}`}
      subtitle={`العميل: ${invoice.customer_name} • ${invoice.issue_date}`}
      badge="ورقة A4 عمودية (210×297 مم)"
      pagesCount={1}
      onClose={onClose}
      onConfirmPrint={handlePrint}
      onShareWhatsApp={handleShareWhatsApp}
      shareWhatsAppLabel="واتساب"
    >
      <A4PageSheet id="printable-official-invoice-a4" pageNumber={1} totalPages={1}>
        <div ref={invoiceRef} className="space-y-4 text-slate-800 font-sans flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-[#03457a] pb-3">
              <div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-lg font-extrabold text-[#03457a] font-['Tajawal',sans-serif]">
                      نبع لتوريد المياه
                    </h1>
                    <span className="text-[9px] font-bold text-[#03457a] bg-sky-100/70 border border-sky-300/60 px-1 py-0.2 rounded">
                      NABAA
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    توريد وتوزيع مياه التحلية والآبار - الطائف
                  </p>
                </div>
                <div className="text-[9.5px] text-slate-500 mt-1.5 space-y-0.5">
                  <p>المملكة العربية السعودية - الطائف</p>
                </div>
              </div>

              {/* QR Code and Invoice Meta */}
              <div className="text-left space-y-1">
                <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-lg flex flex-col items-center justify-center p-1 shadow-2xs">
                  <QrCode className="w-9 h-9 text-slate-800" />
                  <span className="text-[7.5px] text-slate-500 font-mono">فاتورة معتمدة</span>
                </div>
                <div className="text-[9.5px] font-mono text-slate-600 mt-0.5">
                  <p className="font-bold text-[#03457a]">{invoice.invoice_number}</p>
                  <p>إصدار: {invoice.issue_date}</p>
                  <p className="text-rose-700 font-bold">استحقاق: {invoice.due_date}</p>
                </div>
              </div>
            </div>

            {/* Customer & Status Bar */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[9.5px] text-slate-500 font-semibold block">
                  بيانات العميل
                </span>
                <p className="font-black text-slate-900 text-xs sm:text-sm">{invoice.customer_name}</p>
                <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                  <span>رقم المعرف: {invoice.customer_identifier}</span>
                  <span>•</span>
                  <span>الجوال: {invoice.mobile}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-left">
                  <span className="text-[9px] text-slate-500 font-semibold block">حالة السداد</span>
                  <span
                    className={`inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-md ${
                      invoice.status === 'مسدد'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : invoice.status === 'متأخر'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {invoice.status === 'مسدد' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : invoice.status === 'متأخر' ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    <span>{invoice.status}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#03457a] text-white font-bold text-[10px]">
                  <tr>
                    <th className="py-2 px-2 w-8 text-center">#</th>
                    <th className="py-2 px-2">تاريخ التوريد</th>
                    <th className="py-2 px-2">نوع المياه</th>
                    <th className="py-2 px-2">سعة الصهريج</th>
                    <th className="py-2 px-2 text-center">الكمية</th>
                    <th className="py-2 px-2 text-left">السعر (ر.س)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-1.5 px-2 text-center text-slate-400 font-mono text-[10.5px]">{idx + 1}</td>
                      <td className="py-1.5 px-2 font-mono text-[10.5px]">{item.delivery_date}</td>
                      <td className="py-1.5 px-2 font-bold text-slate-800 text-[10.5px]">{item.supply_type}</td>
                      <td className="py-1.5 px-2 text-slate-600 text-[10.5px]">{item.tank_capacity}</td>
                      <td className="py-1.5 px-2 text-center font-mono text-[10.5px]">{item.quantity}</td>
                      <td className="py-1.5 px-2 text-left font-bold font-mono text-slate-900 text-[10.5px]">
                        {item.total_amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Calculation Box */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 pt-2">
              <div className="text-[10px] text-slate-500 max-w-xs space-y-1">
                <p className="font-bold text-slate-700 text-[10.5px]">ملاحظات وشروط الدفع:</p>
                <p className="text-[9px] leading-relaxed">
                  {invoice.notes ||
                    'تعتبر هذه الفاتورة معتمدة رسمياً ومستحقة السداد في التاريخ المحدد أعلاه. يرجى التحويل على الحساب البنكي المعتمد.'}
                </p>
                <div className="text-[9.5px] text-slate-600 pt-1 font-mono">
                  IBAN: SA0380000293608016144888 - مصرف الراجحي
                </div>
              </div>

              <div className="w-full sm:w-60 bg-[#f8fafc] border border-slate-200 rounded-lg p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="text-[10px]">إجمالي قيمة التوريد:</span>
                  <span className="font-bold font-mono">{invoice.total_amount.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span className="text-[10px]">المبلغ المسدد:</span>
                  <span className="font-mono">{invoice.paid_amount.toLocaleString()} ر.س</span>
                </div>
                <div className="border-t border-slate-300 pt-1.5 flex justify-between text-xs sm:text-sm font-extrabold text-[#03457a]">
                  <span>المبلغ المتبقي:</span>
                  <span className="font-mono text-rose-700">
                    {invoice.remaining_amount.toLocaleString()} ر.س
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Signatures & Stamp */}
          <div className="pt-5 border-t border-slate-200 flex justify-between text-center text-[10px] text-slate-500 mt-auto">
            <div>
              <p className="font-bold text-slate-700">توقيع المستلم / العميل</p>
              <div className="mt-5 border-b border-dashed border-slate-400 w-28 mx-auto"></div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-dashed border-sky-800/30 rounded-full flex flex-col items-center justify-center text-[7px] text-sky-800/50 font-bold mx-auto select-none rotate-6">
                <span>مؤسسة نبع</span>
                <span className="text-[6px]">معتمد رسمياً</span>
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-700">ختم وتوقيع المحاسب</p>
              <div className="mt-5 border-b border-dashed border-slate-400 w-28 mx-auto"></div>
            </div>
          </div>
        </div>
      </A4PageSheet>
    </A4DocumentPreviewModal>
  );
};

export default OfficialInvoicePrintModal;

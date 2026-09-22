import React, { useRef } from 'react';
import { Customer, Delivery } from '../types';
import { QrCode } from 'lucide-react';
import { A4DocumentPreviewModal } from './common/A4DocumentPreviewModal';
import { A4PageSheet } from './common/A4PageSheet';

interface InvoiceModalProps {
  customer: Customer;
  deliveries: Delivery[];
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  customer,
  deliveries,
  onClose,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const subtotal = deliveries.reduce((acc, d) => acc + d.price, 0);
  const grandTotal = subtotal;

  const todayStr = new Intl.DateTimeFormat('ar-SA', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <A4DocumentPreviewModal
      title={`معاينة فاتورة التوريد #${invoiceNumber}`}
      subtitle={`العميل: ${customer.customer_name}`}
      badge="ورقة A4 عمودية (210×297 مم)"
      pagesCount={1}
      onClose={onClose}
      onConfirmPrint={handlePrint}
    >
      <A4PageSheet id="printable-invoice-a4" pageNumber={1} totalPages={1}>
        <div ref={invoiceRef} className="space-y-4 text-slate-800 font-sans flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Invoice Header */}
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
                  <p className="font-bold text-[#03457a]">{invoiceNumber}</p>
                  <p>{todayStr}</p>
                </div>
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="bg-[#f8fafc] rounded-lg p-3 border border-slate-200/70">
              <h3 className="text-[11px] font-bold text-[#03457a] mb-1.5 font-['Tajawal',sans-serif]">بيانات العميل</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[9.5px] font-semibold">اسم العميل:</span>
                  <span className="font-bold text-slate-800 text-[11.5px]">{customer.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9.5px] font-semibold">رقم المعرف:</span>
                  <span className="font-bold font-mono text-slate-800">{customer.customer_identifier}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9.5px] font-semibold">رقم الجوال:</span>
                  <span className="font-bold font-mono text-slate-800" dir="ltr">{customer.mobile}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9.5px] font-semibold">الموقع:</span>
                  <span className="font-bold text-slate-800 truncate block">{customer.location}</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#03457a] text-white font-bold text-[10px]">
                    <th className="py-2 px-2 text-center w-8">#</th>
                    <th className="py-2 px-2 text-right">بيان الخدمة</th>
                    <th className="py-2 px-2 text-center">السعة</th>
                    <th className="py-2 px-2 text-center">التاريخ</th>
                    <th className="py-2 px-2 text-center">السائق</th>
                    <th className="py-2 px-2 text-left">المبلغ (SAR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deliveries.map((del, i) => (
                    <tr key={del.id} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 text-center font-bold text-slate-400 text-[10.5px]">{i + 1}</td>
                      <td className="py-1.5 px-2 font-semibold text-slate-800 text-[10.5px]">
                        توريد مياه {del.supply_type}
                      </td>
                      <td className="py-1.5 px-2 text-center text-slate-600 text-[10.5px]">{del.tank_capacity}</td>
                      <td className="py-1.5 px-2 text-center font-mono text-slate-500 text-[10.5px]">{del.supply_date}</td>
                      <td className="py-1.5 px-2 text-center text-slate-700 text-[10.5px]">{del.driver_name}</td>
                      <td className="py-1.5 px-2 text-left font-bold font-mono text-slate-900 text-[10.5px]">
                        {del.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Totals */}
            <div className="flex justify-between items-start pt-2 border-t border-slate-200">
              <div className="text-[10px] text-slate-500 max-w-xs space-y-1">
                <p className="font-bold text-slate-700 text-[10.5px]">بيانات الحساب البنكي:</p>
                <p className="text-[9.5px] font-mono text-[#03457a] font-bold" dir="ltr">
                  IBAN: SA0380000293608016144888
                </p>
                <p className="text-[9px] text-slate-500">مصرف الراجحي - مؤسسة نبع لتوريد المياه</p>
              </div>

              <div className="w-56 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span className="text-[10px]">إجمالي الردود:</span>
                  <span className="font-bold font-mono">{deliveries.length} رد</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm font-extrabold text-[#03457a] pt-1.5 border-t border-slate-300">
                  <span>الإجمالي المستحق:</span>
                  <span className="font-mono">{grandTotal.toFixed(2)} ريال</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-slate-200 pt-3 text-center text-[9px] text-slate-400 space-y-0.5 mt-auto">
            <p>شكراً لتعاملكم مع نبع لتوريد المياه (NABAA) - شريككم الموثوق لإمدادات المياه النقية ومياه التحلية</p>
            <p>هذه الفاتورة تم إنشاؤها إلكترونياً من نظام توريدات المياه المعتمد</p>
          </div>
        </div>
      </A4PageSheet>
    </A4DocumentPreviewModal>
  );
};

export default InvoiceModal;

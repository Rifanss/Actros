import React, { useState, useMemo } from 'react';
import { useWaterData } from '../../context/WaterDataContext';
import { PaymentMethodType } from '../../types';
import {
  X,
  CreditCard,
  Calendar,
  DollarSign,
  AlertCircle,
  FileText,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { getTodayDateString } from '../../data/initialData';

interface RecordPaymentModalProps {
  initialCustomerId?: string;
  initialInvoiceId?: string;
  onClose: () => void;
  onSuccess?: (paymentId: string) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  initialCustomerId,
  initialInvoiceId,
  onClose,
  onSuccess,
}) => {
  const {
    customers,
    invoices,
    addPayment,
    getCustomerAccountSummary,
  } = useWaterData();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialCustomerId || (customers.length > 0 ? customers[0].id : '')
  );
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(initialInvoiceId || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('تحويل بنكي');
  const [paymentDate, setPaymentDate] = useState<string>(getTodayDateString());
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Invoices for selected customer with remaining balance
  const customerInvoices = useMemo(() => {
    if (!selectedCustomerId) return [];
    return invoices.filter((i) => i.customer_id === selectedCustomerId);
  }, [invoices, selectedCustomerId]);

  const unpaidCustomerInvoices = useMemo(() => {
    return customerInvoices.filter((i) => i.remaining_amount > 0);
  }, [customerInvoices]);

  // Target invoice if selected
  const targetInvoice = useMemo(() => {
    return customerInvoices.find((i) => i.id === selectedInvoiceId);
  }, [customerInvoices, selectedInvoiceId]);

  // Customer Summary
  const customerSummary = useMemo(() => {
    if (!selectedCustomerId) return null;
    return getCustomerAccountSummary(selectedCustomerId);
  }, [selectedCustomerId, getCustomerAccountSummary]);

  // Set default amount when invoice or customer changes
  const handleSelectInvoice = (invId: string) => {
    setSelectedInvoiceId(invId);
    if (invId) {
      const inv = customerInvoices.find((i) => i.id === invId);
      if (inv) {
        setAmount(inv.remaining_amount);
      }
    } else {
      if (customerSummary) {
        setAmount(customerSummary.remainingAmount > 0 ? customerSummary.remainingAmount : '');
      }
    }
  };

  // Quick fill full remaining amount
  const handleFillFullRemaining = () => {
    if (targetInvoice) {
      setAmount(targetInvoice.remaining_amount);
    } else if (customerSummary && customerSummary.remainingAmount > 0) {
      setAmount(customerSummary.remainingAmount);
    }
  };

  // Handle file upload preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedCustomerId) {
      setErrorMsg('يرجى اختيار العميل');
      return;
    }
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('يرجى إدخال مبلغ دفع صحيح أكبر من صفر');
      return;
    }
    if (!paymentDate) {
      setErrorMsg('يرجى تحديد تاريخ السداد');
      return;
    }

    const res = addPayment({
      customer_id: selectedCustomerId,
      invoice_id: selectedInvoiceId || undefined,
      amount: numAmount,
      payment_method: paymentMethod,
      payment_date: paymentDate,
      reference_number: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      receipt_attachment: attachmentPreview || undefined,
    });

    if (res.success && res.payment) {
      if (onSuccess) onSuccess(res.payment.id);
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#03457a] text-white px-3 py-1.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">
              <CreditCard className="w-3.5 h-3.5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-[11px] font-extrabold font-['Tajawal',sans-serif] leading-tight">تسجيل سند قبض / دفعة</h2>
              <p className="text-[8.5px] text-sky-200">
                تسجيل استلام مبلغ مالي وتحديث الأرصدة تلقائياً
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 overflow-y-auto space-y-2.5 flex-1 text-[10px]">
          {errorMsg && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[9.5px] text-rose-800 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Customer Selection */}
          <div>
            <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
              العميل <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setSelectedInvoiceId('');
                setAmount('');
              }}
              className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition cursor-pointer"
            >
              <option value="" disabled>
                اختر العميل...
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customer_name} ({c.customer_identifier}) - {c.mobile}
                </option>
              ))}
            </select>
          </div>

          {/* Outstanding Summary banner if customer has debt */}
          {customerSummary && (
            <div className="p-2 bg-[#f8fafc] border border-slate-200/70 rounded-lg flex items-center justify-between min-h-[40px]">
              <div>
                <span className="text-slate-500 text-[8.5px] block">إجمالي مديونية العميل الحالية:</span>
                <span className="font-extrabold text-slate-800 text-[10.5px]">
                  {customerSummary.remainingAmount.toLocaleString()} ر.س
                </span>
              </div>
              {customerSummary.remainingAmount > 0 && (
                <button
                  type="button"
                  onClick={handleFillFullRemaining}
                  className="h-6 px-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-md text-[8.5px] font-bold transition cursor-pointer"
                >
                  سداد كامل المتبقي
                </button>
              )}
            </div>
          )}

          {/* 2. Target Invoice Selection (Optional) */}
          <div>
            <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
              تخصيص السداد لفاتورة معينة (اختياري)
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleSelectInvoice(e.target.value)}
              className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-[9.5px] focus:bg-white focus:border-[#03457a] focus:outline-none transition cursor-pointer"
            >
              <option value="">-- سداد عام على الحساب (يسدد أقدم الفواتير المستحقة تلقائياً) --</option>
              {unpaidCustomerInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  فاتورة {inv.invoice_number} | إجمالي: {inv.total_amount} ر.س | متبقي:{' '}
                  {inv.remaining_amount} ر.س (استحقاق: {inv.due_date})
                </option>
              ))}
            </select>
            {targetInvoice && (
              <p className="text-[8.5px] text-emerald-700 font-medium mt-0.5">
                المبلغ المتبقي على هذه الفاتورة: {targetInvoice.remaining_amount} ر.س
              </p>
            )}
          </div>

          {/* 3. Amount & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                المبلغ المسدد (ر.س) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                طريقة الدفع <span className="text-rose-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition cursor-pointer"
              >
                <option value="تحويل بنكي">تحويل بنكي</option>
                <option value="كاش">كاش (نقدي)</option>
                <option value="شيك">شيك بنكي</option>
                <option value="نقاط بيع">نقاط بيع / مدى</option>
              </select>
            </div>
          </div>

          {/* 4. Date & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                تاريخ السداد <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-[9.5px] font-mono focus:bg-white focus:border-[#03457a] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                رقم الحوالة / المرجع / الشيك (اختياري)
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none"
              />
            </div>
          </div>

          {/* 5. Notes */}
          <div>
            <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
              ملاحظات السند (اختياري)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none"
            />
          </div>

          {/* 6. Receipt Image Upload */}
          <div>
            <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
              إرفاق صورة الإيصال أو إشعار التحويل (اختياري)
            </label>
            <div className="mt-0.5 flex items-center gap-2">
              <label className="h-7 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[9px] font-semibold flex items-center gap-1 cursor-pointer transition">
                <Upload className="w-3 h-3 text-slate-600" />
                <span>اختر صورة الإيصال</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {attachmentPreview && (
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2 h-7 rounded-lg text-[8.5px] font-bold border border-emerald-200">
                  <ImageIcon className="w-3 h-3" />
                  <span>تم الإرفاق</span>
                  <button
                    type="button"
                    onClick={() => setAttachmentPreview(null)}
                    className="text-rose-600 hover:text-rose-800 text-[8.5px] mr-1 cursor-pointer"
                  >
                    حذف
                  </button>
                </div>
              )}
            </div>
            {attachmentPreview && (
              <div className="mt-1.5 w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                <img
                  src={attachmentPreview}
                  alt="إيصال السداد"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-7 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition text-[9.5px] font-semibold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!amount || Number(amount) <= 0}
              className="h-7 px-3 rounded-lg bg-[#03457a] hover:bg-[#023561] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg shadow-2xs transition flex items-center gap-1 text-[9.5px] font-bold cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>حفظ سند القبض وتحديث الحساب</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;

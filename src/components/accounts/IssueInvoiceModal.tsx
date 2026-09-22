import React, { useState, useMemo } from 'react';
import { useWaterData } from '../../context/WaterDataContext';
import { Customer, Delivery } from '../../types';
import {
  X,
  FilePlus,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckSquare,
  Square,
  Check,
  Truck,
  Droplet,
} from 'lucide-react';
import { getTodayDateString, getRelativeDateString } from '../../data/initialData';

interface IssueInvoiceModalProps {
  initialCustomerId?: string;
  onClose: () => void;
  onSuccess?: (invoiceId: string) => void;
}

export const IssueInvoiceModal: React.FC<IssueInvoiceModalProps> = ({
  initialCustomerId,
  onClose,
  onSuccess,
}) => {
  const {
    customers,
    getUninvoicedDeliveries,
    addInvoice,
  } = useWaterData();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialCustomerId || (customers.length > 0 ? customers[0].id : '')
  );
  const [issueDate, setIssueDate] = useState<string>(getTodayDateString());
  const [dueDate, setDueDate] = useState<string>(getRelativeDateString(7));
  const [selectedDeliveryIds, setSelectedDeliveryIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Get uninvoiced deliveries for this customer
  const availableDeliveries = useMemo(() => {
    if (!selectedCustomerId) return [];
    return getUninvoicedDeliveries(selectedCustomerId);
  }, [selectedCustomerId, getUninvoicedDeliveries]);

  // Selected deliveries objects
  const selectedDeliveries = useMemo(() => {
    return availableDeliveries.filter((d) => selectedDeliveryIds.includes(d.id));
  }, [availableDeliveries, selectedDeliveryIds]);

  // Calculated totals
  const totalAmount = useMemo(() => {
    return selectedDeliveries.reduce((sum, d) => sum + d.price, 0);
  }, [selectedDeliveries]);

  // Handle select all deliveries
  const handleToggleSelectAll = () => {
    if (selectedDeliveryIds.length === availableDeliveries.length) {
      setSelectedDeliveryIds([]);
    } else {
      setSelectedDeliveryIds(availableDeliveries.map((d) => d.id));
    }
  };

  // Toggle single delivery
  const handleToggleDelivery = (id: string) => {
    setSelectedDeliveryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedCustomerId) {
      setErrorMsg('يرجى اختيار العميل');
      return;
    }
    if (selectedDeliveryIds.length === 0) {
      setErrorMsg('يرجى تحديد عملية توريد واحدة على الأقل لإصدار الفاتورة');
      return;
    }
    if (!dueDate) {
      setErrorMsg('يرجى تحديد تاريخ استحقاق الفاتورة');
      return;
    }

    const res = addInvoice({
      customer_id: selectedCustomerId,
      issue_date: issueDate,
      due_date: dueDate,
      delivery_ids: selectedDeliveryIds,
      notes: notes.trim() || undefined,
    });

    if (res.success && res.invoice) {
      if (onSuccess) onSuccess(res.invoice.id);
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#03457a] text-white px-3 py-1.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">
              <FilePlus className="w-3.5 h-3.5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-[11px] font-extrabold font-['Tajawal',sans-serif] leading-tight">إصدار فاتورة جديدة</h2>
              <p className="text-[8.5px] text-sky-200">
                تجميع عمليات التوريد غير المفوترة في فاتورة رسمية
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

        {/* Modal Form */}
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
                setSelectedDeliveryIds([]); // reset selection when customer changes
              }}
              className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition cursor-pointer"
            >
              <option value="" disabled>
                اختر العميل...
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customer_name} - ({c.customer_identifier}) - {c.mobile}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Dates Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                تاريخ الإصدار <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-[9.5px] font-mono focus:bg-white focus:border-[#03457a] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                تاريخ الاستحقاق <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-[9.5px] font-mono focus:bg-white focus:border-[#03457a] focus:outline-none"
                required
              />
              <div className="flex gap-1 mt-1">
                <button
                  type="button"
                  onClick={() => setDueDate(getRelativeDateString(7))}
                  className="text-[8.5px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition font-medium cursor-pointer"
                >
                  بعد أسبوع
                </button>
                <button
                  type="button"
                  onClick={() => setDueDate(getRelativeDateString(15))}
                  className="text-[8.5px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition font-medium cursor-pointer"
                >
                  بعد 15 يوم
                </button>
                <button
                  type="button"
                  onClick={() => setDueDate(getRelativeDateString(30))}
                  className="text-[8.5px] px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition font-medium cursor-pointer"
                >
                  بعد شهر
                </button>
              </div>
            </div>
          </div>

          {/* 3. Delivery Selection (Uninvoiced deliveries for this customer) */}
          <div className="border border-slate-200/80 rounded-lg p-2 bg-slate-50/50">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1">
                <Droplet className="w-3 h-3 text-sky-600" />
                <span className="text-[9.5px] font-bold text-slate-800">
                  التوريدات غير المفوترة ({availableDeliveries.length})
                </span>
              </div>
              {availableDeliveries.length > 0 && (
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-[9px] text-sky-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {selectedDeliveryIds.length === availableDeliveries.length ? (
                    <>
                      <CheckSquare className="w-3 h-3" />
                      إلغاء تحديد الكل
                    </>
                  ) : (
                    <>
                      <Square className="w-3 h-3" />
                      تحديد الكل
                    </>
                  )}
                </button>
              )}
            </div>

            {availableDeliveries.length === 0 ? (
              <div className="text-center py-4 px-2 bg-white rounded-lg border border-dashed border-slate-200">
                <p className="text-[9.5px] text-slate-500 font-medium">
                  لا توجد عمليات توريد غير مفوترة لهذا العميل حالياً.
                </p>
                <p className="text-[8.5px] text-slate-400 mt-0.5">
                  جميع عمليات التوريد السابقة تم إصدار فواتير لها أو لم يتم تسجيل توريدات جديدة.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                {availableDeliveries.map((del) => {
                  const isChecked = selectedDeliveryIds.includes(del.id);
                  return (
                    <div
                      key={del.id}
                      onClick={() => handleToggleDelivery(del.id)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 min-h-[40px] ${
                        isChecked
                          ? 'bg-sky-50 border-sky-400 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                            isChecked
                              ? 'bg-sky-600 border-sky-600 text-white'
                              : 'border-slate-300 bg-white text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-800">
                            <span>#{del.sequence_num}</span>
                            <span>-</span>
                            <span>{del.supply_type}</span>
                            <span className="text-[9px] font-normal text-slate-500">
                              ({del.tank_capacity})
                            </span>
                            <span
                              className={`text-[8.5px] px-1 py-0.2 rounded font-bold ${
                                del.payment_method === 'آجل'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {del.payment_method}
                            </span>
                          </div>
                          <div className="text-[8.5px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>{del.supply_date}</span>
                            <span>•</span>
                            <span>السائق: {del.driver_name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left font-bold text-[10px] text-sky-900 shrink-0">
                        {del.price} ر.س
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Notes */}
          <div>
            <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
              ملاحظات أو شروط الفاتورة (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition"
            />
          </div>

          {/* 5. Summary Footer in form */}
          <div className="p-2 bg-[#03457a] text-white rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[8.5px] text-sky-200 block">
                التوريدات المحددة: {selectedDeliveryIds.length} من أصل {availableDeliveries.length}
              </span>
              <span className="text-[10px] font-bold">إجمالي الفاتورة المطلوب:</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-amber-300">
                {totalAmount.toLocaleString()} ر.س
              </span>
            </div>
          </div>

          {/* Modal Action Buttons */}
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
              disabled={selectedDeliveryIds.length === 0}
              className="h-7 px-3 rounded-lg bg-[#03457a] hover:bg-[#023561] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[9.5px] font-bold shadow-2xs transition flex items-center gap-1 cursor-pointer"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>إصدار الفاتورة وحفظها</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueInvoiceModal;

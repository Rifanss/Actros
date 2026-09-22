import React, { useState } from 'react';
import { useWaterData } from '../../context/WaterDataContext';
import { ExpenseCategory } from '../../types';
import { X, Wrench, CheckCircle, Tag, Store } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedVehicleId?: string | null;
}

const CATEGORIES: { label: ExpenseCategory; icon: string }[] = [
  { label: 'صيانة', icon: '🔧' },
  { label: 'زيوت', icon: '🛢️' },
  { label: 'إطارات', icon: '🛞' },
  { label: 'قطع غيار', icon: '⚙️' },
  { label: 'غسيل', icon: '🚿' },
  { label: 'رسوم', icon: '📄' },
  { label: 'مخالفات', icon: '⚠️' },
  { label: 'مصروف سائق', icon: '👤' },
  { label: 'أخرى', icon: '📦' },
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  preselectedVehicleId,
}) => {
  const { vehicles, drivers, addVehicleExpense } = useWaterData();

  const [vehicleId, setVehicleId] = useState<string>(
    preselectedVehicleId || vehicles[0]?.id || ''
  );
  const [category, setCategory] = useState<ExpenseCategory>('صيانة');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [vendorName, setVendorName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'كاش' | 'شبكة' | 'تحويل بنكي' | 'آجل'>('شبكة');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [time, setTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('الرجاء إدخال مبلغ صحيح');
      return;
    }
    if (!description.trim()) {
      alert('الرجاء إدخال وصف أو بيان المصروف');
      return;
    }

    const veh = vehicles.find((v) => v.id === vehicleId);
    const drv = drivers.find((d) => d.id === veh?.assigned_driver_id);

    addVehicleExpense({
      vehicle_id: vehicleId,
      driver_id: drv?.id,
      driver_name: drv?.driver_name,
      category,
      amount: numAmount,
      description: description.trim(),
      vendor_name: vendorName.trim() || 'جهة عامة',
      payment_method: paymentMethod,
      date,
      time,
      notes: notes.trim() || undefined,
      attachment: null,
    });

    setAmount('');
    setDescription('');
    setVendorName('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="operations-scope bg-white w-full max-w-sm rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#03457a] text-white px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">
              <Wrench className="w-3.5 h-3.5 text-rose-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-[11px] leading-tight font-['Tajawal',sans-serif]">إضافة مصروف تشغيلي</h3>
              <p className="text-[8.5px] text-rose-200">صيانة، زيوت، كفرات، قطع غيار، غسيل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3 space-y-2 overflow-y-auto text-[10px]">
          {/* Vehicle and Amount */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                السيارة <span className="text-rose-500">*</span>
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                required
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition cursor-pointer"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.plate_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                المبلغ (ر.س) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-bold text-[10px] font-mono focus:bg-white focus:border-[#03457a] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div>
            <label className="block text-[8.5px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Tag className="w-2.5 h-2.5 text-rose-500" />
              <span>تصنيف المصروف <span className="text-rose-500">*</span></span>
            </label>
            <div className="grid grid-cols-3 gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setCategory(cat.label)}
                  className={`py-0.5 px-1 rounded-md border text-center transition flex items-center justify-center gap-1 text-[9px] font-medium cursor-pointer ${
                    category === cat.label
                      ? 'bg-rose-50 border-rose-400 text-rose-800 font-bold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[10px]">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
              بيان / وصف المصروف <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition"
            />
          </div>

          {/* Vendor / Workshop and Payment Method */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5 flex items-center gap-1">
                <Store className="w-2.5 h-2.5 text-slate-500" />
                <span>الورشة / المحل</span>
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                طريقة الدفع
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition cursor-pointer"
              >
                <option value="شبكة">شبكة (مدى)</option>
                <option value="كاش">كاش (نقدي)</option>
                <option value="تحويل بنكي">تحويل بنكي</option>
                <option value="آجل">آجل (فاتورة)</option>
              </select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                التاريخ
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-7 px-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono text-[9.5px] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                الوقت
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-7 px-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono text-[9.5px] focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
              ملاحظات إضافية
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-7 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition text-[9.5px] font-semibold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="h-7 px-3 rounded-lg bg-[#03457a] hover:bg-[#023561] text-white font-bold transition text-[9.5px] shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle className="w-3 h-3" />
              <span>حفظ المصروف</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;

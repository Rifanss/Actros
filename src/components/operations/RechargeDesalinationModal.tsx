import React, { useState } from 'react';
import { useWaterData } from '../../context/WaterDataContext';
import { Vehicle, DesalinationTxType } from '../../types';
import { X, Droplets, CreditCard, Building2, FileText, CheckCircle } from 'lucide-react';

interface RechargeDesalinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedVehicleId?: string | null;
}

export const RechargeDesalinationModal: React.FC<RechargeDesalinationModalProps> = ({
  isOpen,
  onClose,
  preselectedVehicleId,
}) => {
  const { vehicles, addDesalinationTransaction, getVehicleFinancialSummary } = useWaterData();

  const [vehicleId, setVehicleId] = useState<string>(
    preselectedVehicleId || vehicles[0]?.id || ''
  );
  const [type, setType] = useState<DesalinationTxType>('recharge');
  const [amount, setAmount] = useState<string>('');
  const [stationName, setStationName] = useState<string>('محطة تحلية الشميسي');
  const [paymentMethod, setPaymentMethod] = useState<'كاش' | 'شبكة' | 'تحويل بنكي' | 'آجل'>('شبكة');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
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

  const currentSummary = vehicleId ? getVehicleFinancialSummary(vehicleId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('الرجاء إدخال مبلغ صحيح');
      return;
    }
    if (!vehicleId) {
      alert('الرجاء تحديد الشاحنة');
      return;
    }

    addDesalinationTransaction({
      vehicle_id: vehicleId,
      type,
      date,
      time,
      amount: numAmount,
      station_name: stationName.trim() || 'محطة تحلية',
      payment_method: paymentMethod,
      reference_number: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      attachment: null,
    });

    setAmount('');
    setReferenceNumber('');
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
              <Droplets className="w-3.5 h-3.5 text-cyan-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-[11px] leading-tight font-['Tajawal',sans-serif]">
                {type === 'recharge' ? 'شحن رصيد تحلية' : 'تسجيل استهلاك يدوي للرصيد'}
              </h3>
              <p className="text-[8.5px] text-cyan-200">إدارة أرصدة مياه التحلية للصهاريج</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Current Vehicle Balance Banner */}
        {currentSummary && (
          <div className="bg-cyan-50/80 px-3 py-1 border-b border-cyan-100 flex items-center justify-between text-[9.5px]">
            <span className="text-cyan-900 font-bold">الرصيد المتبقي الحالي:</span>
            <span className="font-black text-cyan-800 text-[10px] font-mono">
              <span className="tabular-nums" dir="ltr">{currentSummary.remainingDesalinationBalance.toLocaleString('en-US')}</span> ر.س
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3 space-y-2 overflow-y-auto text-[10px]">
          {/* Operation Type Switch */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setType('recharge')}
              className={`py-1 text-[9.5px] font-bold rounded-md transition-all cursor-pointer ${
                type === 'recharge'
                  ? 'bg-white text-[#03457a] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + شحن رصيد جديد
            </button>
            <button
              type="button"
              onClick={() => setType('consumption')}
              className={`py-1 text-[9.5px] font-bold rounded-md transition-all cursor-pointer ${
                type === 'consumption'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              - استهلاك مباشر
            </button>
          </div>

          {/* Vehicle Selection */}
          <div>
            <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
              السيارة / الصهريج <span className="text-rose-500">*</span>
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition cursor-pointer"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} - ({v.plate_number}) - سعة {v.tank_capacity}
                </option>
              ))}
            </select>
          </div>

          {/* Amount and Station Name in one row */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                المبلغ (ر.س) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-bold text-[10px] font-mono focus:bg-white focus:border-[#03457a] focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                اسم المحطة / الأشياب
              </label>
              <input
                type="text"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                طريقة الدفع
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition cursor-pointer"
              >
                <option value="شبكة">شبكة (مدى/بطاقة)</option>
                <option value="كاش">كاش (نقدي)</option>
                <option value="تحويل بنكي">تحويل بنكي</option>
                <option value="آجل">آجل (فاتورة)</option>
              </select>
            </div>

            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                رقم السند / الإيصال
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                التاريخ
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono text-[9.5px] focus:bg-white focus:border-[#03457a] focus:outline-none transition"
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
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono text-[9.5px] focus:bg-white focus:border-[#03457a] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
              ملاحظات
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
              <span>{type === 'recharge' ? 'حفظ شحن الرصيد' : 'حفظ الاستهلاك'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RechargeDesalinationModal;

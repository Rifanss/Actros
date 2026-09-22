import React, { useState, useEffect } from 'react';
import { useWaterData } from '../../context/WaterDataContext';
import { FuelTransaction } from '../../types';
import { X, Fuel, Gauge, CheckCircle, Calculator } from 'lucide-react';

interface AddFuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedVehicleId?: string | null;
}

export const AddFuelModal: React.FC<AddFuelModalProps> = ({
  isOpen,
  onClose,
  preselectedVehicleId,
}) => {
  const { vehicles, drivers, addFuelTransaction } = useWaterData();

  const [vehicleId, setVehicleId] = useState<string>(
    preselectedVehicleId || vehicles[0]?.id || ''
  );
  const [driverId, setDriverId] = useState<string>('');
  const [liters, setLiters] = useState<string>('100');
  const [pricePerLiter, setPricePerLiter] = useState<string>('1.15');
  const [totalAmount, setTotalAmount] = useState<string>('115');
  const [gasStation, setGasStation] = useState<string>('محطة الدريس');
  const [paymentMethod, setPaymentMethod] = useState<'كاش' | 'شبكة' | 'بطاقة وقود' | 'آجل'>('بطاقة وقود');
  const [odometerReading, setOdometerReading] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [time, setTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  // Auto-sync driver and current odometer when vehicle changes
  useEffect(() => {
    const selectedVeh = vehicles.find((v) => v.id === vehicleId);
    if (selectedVeh) {
      if (selectedVeh.assigned_driver_id) {
        setDriverId(selectedVeh.assigned_driver_id);
      }
      if (!odometerReading || odometerReading === '0') {
        setOdometerReading(String(selectedVeh.current_odometer || ''));
      }
    }
  }, [vehicleId, vehicles]);

  // Recalculate total amount when liters or price per liter changes
  const handleLitersChange = (val: string) => {
    setLiters(val);
    const l = parseFloat(val);
    const p = parseFloat(pricePerLiter);
    if (!isNaN(l) && !isNaN(p)) {
      setTotalAmount((l * p).toFixed(2));
    }
  };

  const handlePriceChange = (val: string) => {
    setPricePerLiter(val);
    const l = parseFloat(liters);
    const p = parseFloat(val);
    if (!isNaN(l) && !isNaN(p)) {
      setTotalAmount((l * p).toFixed(2));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numLiters = parseFloat(liters);
    const numPrice = parseFloat(pricePerLiter);
    const numTotal = parseFloat(totalAmount);
    const numOdo = parseFloat(odometerReading) || 0;

    if (isNaN(numLiters) || numLiters <= 0) {
      alert('الرجاء إدخال عدد لترات صحيح');
      return;
    }
    if (isNaN(numTotal) || numTotal <= 0) {
      alert('الرجاء إدخال إجمالي المبلغ');
      return;
    }

    addFuelTransaction({
      vehicle_id: vehicleId,
      driver_id: driverId || (vehicles.find((v) => v.id === vehicleId)?.assigned_driver_id || 'drv-1'),
      date,
      time,
      liters: numLiters,
      price_per_liter: numPrice || 1.15,
      total_amount: numTotal,
      gas_station: gasStation.trim() || 'محطة وقود',
      payment_method: paymentMethod,
      odometer_reading: numOdo,
      notes: notes.trim() || undefined,
      attachment: null,
    });

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
              <Fuel className="w-3.5 h-3.5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-[11px] leading-tight font-['Tajawal',sans-serif]">إضافة تعبئة ديزل جديدة</h3>
              <p className="text-[8.5px] text-amber-200">تسجيل مشتريات الديزل ومتابعة العداد</p>
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
          {/* Vehicle and Driver in one row */}
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
                السائق <span className="text-rose-500">*</span>
              </label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                required
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition cursor-pointer"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.driver_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Liters, Price per Liter, and Total */}
          <div className="grid grid-cols-3 gap-1.5 bg-amber-50/70 p-1.5 rounded-lg border border-amber-200/60">
            <div>
              <label className="block text-[8.5px] font-semibold text-amber-900 mb-0.5">
                الكمية (لتر) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                required
                value={liters}
                onChange={(e) => handleLitersChange(e.target.value)}
                className="w-full h-6.5 px-1.5 bg-white border border-amber-300 rounded-md text-amber-950 font-bold text-[10px] font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[8.5px] font-semibold text-amber-900 mb-0.5">
                سعر اللتر (ر.س)
              </label>
              <input
                type="number"
                step="0.01"
                value={pricePerLiter}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full h-6.5 px-1.5 bg-white border border-amber-300 rounded-md text-amber-950 font-bold text-[10px] font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[8.5px] font-semibold text-amber-900 mb-0.5">
                الإجمالي (ر.س) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full h-6.5 px-1.5 bg-amber-100/90 border border-amber-400 rounded-md text-amber-950 font-black text-[10px] font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Gas Station and Payment Method */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                اسم المحطة
              </label>
              <input
                type="text"
                value={gasStation}
                onChange={(e) => setGasStation(e.target.value)}
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
                <option value="بطاقة وقود">بطاقة وقود (أرامكو/الدريس)</option>
                <option value="شبكة">شبكة (مدى)</option>
                <option value="كاش">كاش (نقدي)</option>
                <option value="آجل">آجل</option>
              </select>
            </div>
          </div>

          {/* Odometer and Date */}
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5 flex items-center gap-1">
                <Gauge className="w-2.5 h-2.5 text-slate-500" />
                <span>قراءة العداد (كم)</span>
              </label>
              <input
                type="number"
                value={odometerReading}
                onChange={(e) => setOdometerReading(e.target.value)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-bold text-[10px] font-mono focus:bg-white focus:border-[#03457a] focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                التاريخ والوقت
              </label>
              <div className="flex gap-1">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-7 px-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-[9.5px] font-mono focus:outline-none"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-20 h-7 px-1 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-[9.5px] font-mono focus:outline-none"
                />
              </div>
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
              <span>حفظ تعبئة الديزل</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFuelModal;

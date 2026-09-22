import React, { useState } from 'react';
import { useWaterData } from '../../context/WaterDataContext';
import { TankCapacity } from '../../types';
import { X, Truck, CheckCircle } from 'lucide-react';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose }) => {
  const { drivers, addVehicle } = useWaterData();

  const [name, setName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [assignedDriverId, setAssignedDriverId] = useState(drivers[0]?.id || '');
  const [tankCapacity, setTankCapacity] = useState<TankCapacity>('30 طن');
  const [modelYear, setModelYear] = useState('2023');
  const [initialDesalBalance, setInitialDesalBalance] = useState('1000');
  const [currentOdometer, setCurrentOdometer] = useState('100000');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !plateNumber.trim()) {
      alert('الرجاء إدخال اسم الشاحنة ورقم اللوحة');
      return;
    }

    addVehicle({
      name: name.trim(),
      plate_number: plateNumber.trim(),
      assigned_driver_id: assignedDriverId,
      status: 'active',
      tank_capacity: tankCapacity,
      model_year: modelYear.trim() || undefined,
      initial_desalination_balance: parseFloat(initialDesalBalance) || 0,
      current_odometer: parseFloat(currentOdometer) || 0,
      notes: notes.trim() || undefined,
    });

    setName('');
    setPlateNumber('');
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
              <Truck className="w-3.5 h-3.5 text-sky-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-[11px] leading-tight font-['Tajawal',sans-serif]">إضافة شاحنة / صهريج جديد</h3>
              <p className="text-[8.5px] text-sky-200">تسجيل صهريج جديد في أسطول التوريد</p>
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
          <div>
            <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
              اسم وتسمية الشاحنة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                رقم اللوحة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                سعة الصهريج
              </label>
              <select
                value={tankCapacity}
                onChange={(e) => setTankCapacity(e.target.value as TankCapacity)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition cursor-pointer"
              >
                <option value="30 طن">30 طن (تريلا - كبير)</option>
                <option value="18 طن">18 طن (وايت سكس - وسط)</option>
                <option value="12 طن">12 طن (وايت عايدي - صغير)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                السائق المعين
              </label>
              <select
                value={assignedDriverId}
                onChange={(e) => setAssignedDriverId(e.target.value)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition cursor-pointer"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.driver_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                سنة الموديل
              </label>
              <input
                type="text"
                value={modelYear}
                onChange={(e) => setModelYear(e.target.value)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                رصيد التحلية الافتتاحي (ر.س)
              </label>
              <input
                type="number"
                value={initialDesalBalance}
                onChange={(e) => setInitialDesalBalance(e.target.value)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold text-[10px] font-mono focus:bg-white focus:border-[#03457a] focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                قراءة العداد الحالية (كم)
              </label>
              <input
                type="number"
                value={currentOdometer}
                onChange={(e) => setCurrentOdometer(e.target.value)}
                className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold text-[10px] font-mono focus:bg-white focus:border-[#03457a] focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
              ملاحظات
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-[10px] focus:bg-white focus:border-[#03457a] focus:outline-none transition"
            />
          </div>

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
              <CheckCircle className="w-3.5 h-3.5" />
              <span>إضافة الشاحنة للأسطول</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleModal;

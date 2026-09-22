import React, { useState } from 'react';
import { X, Save, Truck, Droplet, Coins, UserCheck } from 'lucide-react';
import { Customer, Driver } from '../../types';

interface EditSupplyModalProps {
  isOpen: boolean;
  customer: Customer;
  drivers: Driver[];
  onClose: () => void;
  onSave: (updatedData: Partial<Customer>) => void;
}

export const EditSupplyModal: React.FC<EditSupplyModalProps> = ({
  isOpen,
  customer,
  drivers,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const initialType = customer.default_supply_type?.includes('آبار') ? 'مياة آبار' : 'مياة تحلية';
  const [supplyType, setSupplyType] = useState(initialType);
  const [tankCapacity, setTankCapacity] = useState(customer.default_tank_capacity || '30 طن');
  const [agreedPrice, setAgreedPrice] = useState(
    customer.agreed_supply_price || customer.agreed_price_30 || 250
  );
  const [driverName, setDriverName] = useState(customer.assigned_driver || 'أحمد كريم');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      default_supply_type: supplyType,
      default_tank_capacity: tankCapacity,
      agreed_supply_price: Number(agreedPrice),
      agreed_price_30: Number(agreedPrice),
      assigned_driver: driverName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#023561] to-[#03457a] text-white px-3.5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-white" />
            <h3 className="text-xs font-extrabold font-['Tajawal',sans-serif]">
              تعديل بيانات التوريد للعميل
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 space-y-2 text-right">
          {/* Supply Type */}
          <div>
            <label className="flex items-center gap-1 text-[9px] font-bold text-slate-700 mb-0.5">
              <Droplet className="w-3 h-3 text-[#03457a]" />
              <span>نوع التوريد</span>
            </label>
            <select
              value={supplyType}
              onChange={(e) => setSupplyType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 h-7 text-[10px] font-bold text-slate-900 focus:outline-hidden focus:border-[#03457a] focus:bg-white"
            >
              <option value="مياة تحلية">مياة تحلية</option>
              <option value="مياة آبار">مياة آبار</option>
            </select>
          </div>

          {/* Tank Capacity */}
          <div>
            <label className="flex items-center gap-1 text-[9px] font-bold text-slate-700 mb-0.5">
              <Truck className="w-3 h-3 text-[#03457a]" />
              <span>سعة التوريد الافتراضية</span>
            </label>
            <select
              value={tankCapacity}
              onChange={(e) => setTankCapacity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 h-7 text-[10px] font-bold text-slate-900 focus:outline-hidden focus:border-[#03457a] focus:bg-white"
            >
              <option value="30 طن">30 طن (تريلا)</option>
              <option value="18 طن">18 طن (سكس)</option>
              <option value="12 طن">12 طن (عايدي)</option>
              <option value="11 طن">11 طن</option>
            </select>
          </div>

          {/* Agreed Price */}
          <div>
            <label className="flex items-center gap-1 text-[9px] font-bold text-slate-700 mb-0.5">
              <Coins className="w-3 h-3 text-[#03457a]" />
              <span>سعر التوريد المتفق عليه (ريال)</span>
            </label>
            <input
              type="number"
              min="0"
              step="10"
              required
              value={agreedPrice}
              onChange={(e) => setAgreedPrice(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 h-7 text-[10px] font-black text-[#03457a] font-mono focus:outline-hidden focus:border-[#03457a] focus:bg-white text-center"
            />
          </div>

          {/* Assigned Driver */}
          <div>
            <label className="flex items-center gap-1 text-[9px] font-bold text-slate-700 mb-0.5">
              <UserCheck className="w-3 h-3 text-[#03457a]" />
              <span>السائق المكلف الافتراضي</span>
            </label>
            <select
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 h-7 text-[10px] font-bold text-slate-900 focus:outline-hidden focus:border-[#03457a] focus:bg-white"
            >
              {drivers.length > 0 ? (
                drivers.map((d) => (
                  <option key={d.id} value={d.driver_name}>
                    {d.driver_name} - {d.vehicle || 'سائق معتمد'}
                  </option>
                ))
              ) : (
                <>
                  <option value="أحمد كريم">أحمد كريم</option>
                  <option value="كريم">كريم</option>
                  <option value="أحمد">أحمد</option>
                  <option value="غلام">غلام</option>
                  <option value="مختار تريلا">مختار تريلا</option>
                  <option value="مختار عايدي">مختار عايدي</option>
                </>
              )}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 h-7 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer flex items-center justify-center"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-3 h-7 text-[10px] font-black text-white bg-[#03457a] hover:bg-[#023561] rounded-lg shadow-2xs transition cursor-pointer"
            >
              <Save className="w-3 h-3" />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSupplyModal;

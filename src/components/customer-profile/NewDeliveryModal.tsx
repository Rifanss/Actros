import React, { useState } from 'react';
import { X, PlusCircle, Calendar, Clock, Droplet, Truck, Coins, CreditCard, UserCheck } from 'lucide-react';
import { Customer, Driver, DeliveryFormData, SupplyType, TankCapacity, PaymentMethod } from '../../types';

interface NewDeliveryModalProps {
  isOpen: boolean;
  customer: Customer;
  drivers: Driver[];
  onClose: () => void;
  onSubmit: (data: DeliveryFormData) => void;
}

export const NewDeliveryModal: React.FC<NewDeliveryModalProps> = ({
  isOpen,
  customer,
  drivers,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  const defaultType: SupplyType = customer.default_supply_type?.includes('آبار') ? 'آبار' : 'تحلية';
  const defaultCapacity: TankCapacity =
    (customer.default_tank_capacity as TankCapacity) || '18 طن';
  const defaultPrice =
    customer.agreed_supply_price ||
    (defaultCapacity === '30 طن' ? Number(customer.agreed_price_30) : Number(customer.agreed_price_18)) ||
    250;

  const [supplyDate, setSupplyDate] = useState(todayStr);
  const [supplyTime, setSupplyTime] = useState(currentTime);
  const [supplyType, setSupplyType] = useState<SupplyType>(defaultType);
  const [tankCapacity, setTankCapacity] = useState<TankCapacity>(defaultCapacity);
  const [price, setPrice] = useState<number>(defaultPrice);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('آجل');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(() => {
    const match = drivers.find((d) => d.driver_name === customer.assigned_driver);
    return match ? match.id : drivers[0]?.id || 'drv-1';
  });
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const drv = drivers.find((d) => d.id === selectedDriverId);
    const driverName = drv ? drv.driver_name : customer.assigned_driver || 'أحمد كريم';

    onSubmit({
      customer_id: customer.id,
      customer_name: customer.customer_name,
      customer_identifier: customer.customer_identifier || 'NB-1001',
      mobile: customer.mobile,
      location: customer.location,
      supply_type: supplyType,
      tank_capacity: tankCapacity,
      price: Number(price),
      payment_method: paymentMethod,
      driver_id: selectedDriverId,
      driver_name: driverName,
      supply_date: supplyDate,
      supply_time: supplyTime,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#023561] to-[#03457a] text-white px-3.5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-white" />
            <div>
              <h3 className="text-xs font-extrabold font-['Tajawal',sans-serif]">
                تسجيل توريد جديد
              </h3>
              <p className="text-[9.5px] text-sky-100">
                للعميل: {customer.customer_name}
              </p>
            </div>
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
        <form onSubmit={handleSubmit} className="p-3 space-y-2.5 text-right">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="flex items-center gap-1 text-[9px] font-bold text-slate-700 mb-0.5">
                <Calendar className="w-3 h-3 text-[#03457a]" />
                <span>تاريخ التوريد</span>
              </label>
              <input
                type="date"
                required
                value={supplyDate}
                onChange={(e) => setSupplyDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 h-7 text-[10px] font-bold text-slate-900 focus:outline-hidden focus:border-[#03457a]"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-[9px] font-bold text-slate-700 mb-0.5">
                <Clock className="w-3 h-3 text-[#03457a]" />
                <span>وقت التوريد</span>
              </label>
              <input
                type="time"
                value={supplyTime}
                onChange={(e) => setSupplyTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 h-7 text-[10px] font-bold text-slate-900 focus:outline-hidden focus:border-[#03457a]"
              />
            </div>
          </div>

          {/* Type & Capacity */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="flex items-center gap-1 text-[9px] font-bold text-slate-700 mb-0.5">
                <Droplet className="w-3 h-3 text-[#03457a]" />
                <span>نوع المياه</span>
              </label>
              <select
                value={supplyType}
                onChange={(e) => setSupplyType(e.target.value as SupplyType)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 h-7 text-[10px] font-bold text-slate-900 focus:outline-hidden focus:border-[#03457a]"
              >
                <option value="تحلية">مياة تحلية</option>
                <option value="آبار">مياة آبار</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1 text-[9px] font-bold text-slate-700 mb-0.5">
                <Truck className="w-3 h-3 text-[#03457a]" />
                <span>سعة الوايت</span>
              </label>
              <select
                value={tankCapacity}
                onChange={(e) => setTankCapacity(e.target.value as TankCapacity)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 h-7 text-[10px] font-bold text-slate-900 focus:outline-hidden focus:border-[#03457a]"
              >
                <option value="30 طن">30 طن (تريلا)</option>
                <option value="18 طن">18 طن (سكس)</option>
                <option value="12 طن">12 طن (عايدي)</option>
                <option value="11 طن">11 طن</option>
              </select>
            </div>
          </div>

          {/* Price & Payment Method */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="flex items-center gap-1 text-[9px] font-bold text-slate-700 mb-0.5">
                <Coins className="w-3 h-3 text-[#03457a]" />
                <span>المبلغ (ريال)</span>
              </label>
              <input
                type="number"
                min="0"
                step="10"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 h-7 text-[10px] font-black text-[#03457a] font-mono focus:outline-hidden focus:border-[#03457a] text-center"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-[9px] font-bold text-slate-700 mb-0.5">
                <CreditCard className="w-3 h-3 text-[#03457a]" />
                <span>طريقة السداد</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 h-7 text-[10px] font-bold text-slate-900 focus:outline-hidden focus:border-[#03457a]"
              >
                <option value="آجل">آجل (مستحق)</option>
                <option value="كاش">كاش (مدفوع فوراً)</option>
              </select>
            </div>
          </div>

          {/* Assigned Driver */}
          <div>
            <label className="flex items-center gap-1 text-[9px] font-bold text-slate-700 mb-0.5">
              <UserCheck className="w-3 h-3 text-[#03457a]" />
              <span>السائق المنفذ للرد</span>
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 h-7 text-[10px] font-bold text-slate-900 focus:outline-hidden focus:border-[#03457a]"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.driver_name} - {d.vehicle || 'سائق'}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[9px] font-bold text-slate-700 mb-0.5">
              ملاحظات التوريد
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تم التوصيل للخزان العلوي"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 h-7 text-[10px] text-slate-800 focus:outline-hidden focus:border-[#03457a]"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 h-7 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer flex items-center justify-center"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-3.5 h-7 text-[10px] font-black text-white bg-[#03457a] hover:bg-[#023561] rounded-lg shadow-2xs transition cursor-pointer"
            >
              <PlusCircle className="w-3 h-3" />
              <span>تأكيد وتسجيل الرد</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDeliveryModal;

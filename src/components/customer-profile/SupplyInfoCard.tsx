import React, { useState, useEffect } from 'react';
import {
  Truck,
  Droplet,
  Coins,
  UserCheck,
  ChevronDown,
  Edit2,
  Check,
  X,
  Maximize2,
} from 'lucide-react';
import { Customer, Driver } from '../../types';

interface SupplyInfoCardProps {
  customer: Customer;
  drivers?: Driver[];
  onEdit: () => void;
  onSave?: (updatedData: Partial<Customer>) => void;
}

export const SupplyInfoCard: React.FC<SupplyInfoCardProps> = ({
  customer,
  drivers = [],
  onEdit,
  onSave,
}) => {
  const formatSupplyType = (val?: string) => {
    if (!val) return 'مياة تحلية';
    if (val.includes('آبار')) return 'مياة آبار';
    return 'مياة تحلية';
  };

  const [isEditing, setIsEditing] = useState(false);

  // Local state when editing
  const [tempSupplyType, setTempSupplyType] = useState(formatSupplyType(customer.default_supply_type));
  const [tempCapacity, setTempCapacity] = useState(customer.default_tank_capacity || '30 طن');
  const [tempPrice, setTempPrice] = useState<number | string>(
    customer.agreed_supply_price || customer.agreed_price_30 || 250
  );
  const [tempDriver, setTempDriver] = useState(customer.assigned_driver || 'أحمد كريم');

  // Keep in sync when customer changes
  useEffect(() => {
    setTempSupplyType(formatSupplyType(customer.default_supply_type));
    setTempCapacity(customer.default_tank_capacity || '30 طن');
    setTempPrice(customer.agreed_supply_price || customer.agreed_price_30 || 250);
    setTempDriver(customer.assigned_driver || 'أحمد كريم');
  }, [customer]);

  const handleSave = () => {
    if (onSave) {
      onSave({
        default_supply_type: tempSupplyType,
        default_tank_capacity: tempCapacity,
        agreed_supply_price: Number(tempPrice),
        agreed_price_30: Number(tempPrice),
        assigned_driver: tempDriver,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempSupplyType(formatSupplyType(customer.default_supply_type));
    setTempCapacity(customer.default_tank_capacity || '30 طن');
    setTempPrice(customer.agreed_supply_price || customer.agreed_price_30 || 250);
    setTempDriver(customer.assigned_driver || 'أحمد كريم');
    setIsEditing(false);
  };

  return (
    <div
      id="supply-info-section"
      className="bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden"
    >
      {/* Dark Blue Header Strip */}
      <div className="bg-[#03457a] text-white px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
            <Truck className="w-3 h-3 text-white" />
          </div>
          <span className="text-[11px] font-extrabold font-['Tajawal',sans-serif] tracking-wide">
            بيانات التوريد
          </span>
        </div>

        {/* Buttons on Far Left (Top) */}
        {!isEditing ? (
          <button
            id="btn-edit-supply-info"
            onClick={() => setIsEditing(true)}
            type="button"
            className="flex items-center gap-1 text-[8.5px] font-bold text-white bg-white/15 hover:bg-white/25 active:bg-white/30 px-2 py-0.5 rounded-md border border-white/30 transition cursor-pointer"
          >
            <Edit2 className="w-2.5 h-2.5" />
            <span>تعديل</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
            <button
              id="btn-save-supply-info"
              onClick={handleSave}
              type="button"
              className="flex items-center gap-1 text-[8.5px] font-bold text-emerald-950 bg-emerald-300 hover:bg-emerald-200 px-2 py-0.5 rounded-md border border-emerald-400 transition cursor-pointer shadow-2xs"
            >
              <Check className="w-2.5 h-2.5" />
              <span>حفظ</span>
            </button>
            <button
              id="btn-cancel-supply-info"
              onClick={handleCancel}
              type="button"
              className="flex items-center gap-1 text-[8.5px] font-bold text-white bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-md border border-white/30 transition cursor-pointer"
            >
              <X className="w-2.5 h-2.5" />
              <span>إلغاء</span>
            </button>
            <button
              id="btn-modal-supply-info"
              onClick={onEdit}
              type="button"
              title="تعديل تفصيلي في نافذة"
              className="p-1 rounded-md text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition cursor-pointer"
            >
              <Maximize2 className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>

      {/* 4 Cards in Horizontal Row (Centered Data) */}
      <div className="p-2">
        <div className="grid grid-cols-4 gap-1.5 text-center">
          {/* Card 1 (Right): نوع التوريد */}
          <div
            className={`border rounded-lg px-1.5 py-1 shadow-2xs flex flex-col justify-between min-h-[42px] transition-all text-center ${
              isEditing
                ? 'bg-sky-50/50 border-sky-300 ring-1 ring-sky-200/60'
                : 'bg-[#f8fafc] border-slate-200/70'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[8.5px] font-semibold text-[#03457a] text-center">
              <Droplet className="w-2.5 h-2.5 text-[#03457a] shrink-0" />
              <span className="truncate">نوع التوريد</span>
            </div>

            {!isEditing ? (
              <div className="flex items-center justify-center mt-0.5 text-[10px] font-medium text-slate-800 text-center">
                <span className="truncate">{tempSupplyType}</span>
              </div>
            ) : (
              <div className="relative mt-0.5 flex items-center justify-center">
                <select
                  value={tempSupplyType}
                  onChange={(e) => setTempSupplyType(e.target.value)}
                  className="w-full text-center text-[10px] font-medium text-slate-900 bg-white border border-sky-300 rounded px-1 py-0.5 pr-4 pl-1 cursor-pointer focus:outline-hidden appearance-none"
                >
                  <option value="مياة تحلية">مياة تحلية</option>
                  <option value="مياة آبار">مياة آبار</option>
                </select>
                <ChevronDown className="w-2.5 h-2.5 text-[#03457a] absolute right-1 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Card 2: سعة التوريد */}
          <div
            className={`border rounded-lg px-1.5 py-1 shadow-2xs flex flex-col justify-between min-h-[42px] transition-all text-center ${
              isEditing
                ? 'bg-sky-50/50 border-sky-300 ring-1 ring-sky-200/60'
                : 'bg-[#f8fafc] border-slate-200/70'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[8.5px] font-semibold text-[#03457a] text-center">
              <Truck className="w-2.5 h-2.5 text-[#03457a] shrink-0" />
              <span className="truncate">سعة التوريد</span>
            </div>

            {!isEditing ? (
              <div className="flex items-center justify-center mt-0.5 text-[10px] font-medium text-slate-800 text-center">
                <span className="truncate">{tempCapacity}</span>
              </div>
            ) : (
              <div className="relative mt-0.5 flex items-center justify-center">
                <select
                  value={tempCapacity}
                  onChange={(e) => setTempCapacity(e.target.value)}
                  className="w-full text-center text-[10px] font-medium text-slate-900 bg-white border border-sky-300 rounded px-1 py-0.5 pr-4 pl-1 cursor-pointer focus:outline-hidden appearance-none"
                >
                  <option value="30 طن">30 طن</option>
                  <option value="18 طن">18 طن</option>
                  <option value="12 طن">12 طن</option>
                  <option value="11 طن">11 طن</option>
                </select>
                <ChevronDown className="w-2.5 h-2.5 text-[#03457a] absolute right-1 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Card 3: سعر التوريد */}
          <div
            className={`border rounded-lg px-1.5 py-1 shadow-2xs flex flex-col justify-between min-h-[42px] transition-all text-center ${
              isEditing
                ? 'bg-sky-50/50 border-sky-300 ring-1 ring-sky-200/60'
                : 'bg-[#f8fafc] border-slate-200/70'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[8.5px] font-semibold text-[#03457a] text-center">
              <Coins className="w-2.5 h-2.5 text-[#03457a] shrink-0" />
              <span className="truncate">سعر التوريد</span>
            </div>

            {!isEditing ? (
              <div className="flex items-center justify-center mt-0.5 text-[10px] font-medium text-slate-800 text-center font-mono">
                <span className="truncate">{tempPrice} ريال</span>
              </div>
            ) : (
              <div className="relative mt-0.5 flex items-center justify-center">
                <input
                  type="number"
                  value={tempPrice}
                  onChange={(e) => setTempPrice(Number(e.target.value))}
                  className="w-full text-center text-[10px] font-medium text-slate-900 bg-white border border-sky-300 rounded px-1 py-0.5 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Card 4 (Left): السائق المكلف */}
          <div
            className={`border rounded-lg px-1.5 py-1 shadow-2xs flex flex-col justify-between min-h-[42px] transition-all text-center ${
              isEditing
                ? 'bg-sky-50/50 border-sky-300 ring-1 ring-sky-200/60'
                : 'bg-[#f8fafc] border-slate-200/70'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-[8.5px] font-semibold text-[#03457a] text-center">
              <UserCheck className="w-2.5 h-2.5 text-[#03457a] shrink-0" />
              <span className="truncate">السائق المكلف</span>
            </div>

            {!isEditing ? (
              <div className="flex items-center justify-center mt-0.5 text-[10px] font-medium text-slate-800 text-center">
                <span className="truncate">{tempDriver}</span>
              </div>
            ) : (
              <div className="relative mt-0.5 flex items-center justify-center">
                <select
                  value={tempDriver}
                  onChange={(e) => setTempDriver(e.target.value)}
                  className="w-full text-center text-[10px] font-medium text-slate-900 bg-white border border-sky-300 rounded px-1 py-0.5 pr-4 pl-1 cursor-pointer focus:outline-hidden appearance-none"
                >
                  {drivers && drivers.length > 0 ? (
                    drivers.map((d) => (
                      <option key={d.id} value={d.driver_name}>
                        {d.driver_name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="غلام">غلام</option>
                      <option value="أحمد">أحمد</option>
                      <option value="كريم">كريم</option>
                      <option value="مختار تريلا">مختار تريلا</option>
                      <option value="مختار عايدي">مختار عايدي</option>
                      <option value="أحمد كريم">أحمد كريم</option>
                    </>
                  )}
                </select>
                <ChevronDown className="w-2.5 h-2.5 text-[#03457a] absolute right-1 pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyInfoCard;

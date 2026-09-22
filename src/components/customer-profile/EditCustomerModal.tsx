import React, { useState } from 'react';
import { X, Save, User, MapPin, Hash, Phone } from 'lucide-react';
import { Customer } from '../../types';

interface EditCustomerModalProps {
  isOpen: boolean;
  customer: Customer;
  onClose: () => void;
  onSave: (updatedData: Partial<Customer>) => void;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  customer,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState(customer.customer_name);
  const [customerIdentifier, setCustomerIdentifier] = useState(customer.customer_identifier || '');
  const [mobile, setMobile] = useState(customer.mobile);
  const [location, setLocation] = useState(customer.location);
  const [notes, setNotes] = useState(customer.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    onSave({
      customer_name: customerName.trim(),
      customer_identifier: customerIdentifier.trim(),
      mobile: mobile.trim(),
      location: location.trim(),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#023561] to-[#03457a] text-white px-3.5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-white" />
            <h3 className="text-xs font-extrabold font-['Tajawal',sans-serif]">
              تعديل بيانات العميل
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
          {/* Customer Name */}
          <div>
            <label className="flex items-center gap-1 text-[9px] font-bold text-slate-700 mb-0.5">
              <User className="w-3 h-3 text-[#03457a]" />
              <span>اسم العميل</span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 h-7 text-[10px] font-bold text-slate-900 focus:outline-hidden focus:border-[#03457a] focus:bg-white"
            />
          </div>

          {/* Customer ID & Mobile */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="flex items-center gap-1 text-[9px] font-bold text-slate-700 mb-0.5">
                <Hash className="w-3 h-3 text-[#03457a]" />
                <span>رقم العميل (المعرف)</span>
              </label>
              <input
                type="text"
                value={customerIdentifier}
                onChange={(e) => setCustomerIdentifier(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 h-7 text-[10px] font-bold text-[#03457a] font-mono focus:outline-hidden focus:border-[#03457a] focus:bg-white text-center"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-[9px] font-bold text-slate-700 mb-0.5">
                <Phone className="w-3 h-3 text-[#03457a]" />
                <span>رقم الجوال</span>
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 h-7 text-[10px] font-bold text-slate-900 font-mono focus:outline-hidden focus:border-[#03457a] focus:bg-white text-center"
                dir="ltr"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-1 text-[9px] font-bold text-slate-700 mb-0.5">
              <MapPin className="w-3 h-3 text-[#03457a]" />
              <span>الموقع / العنوان</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 h-7 text-[10px] font-bold text-slate-900 focus:outline-hidden focus:border-[#03457a] focus:bg-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[9px] font-bold text-slate-700 mb-0.5">
              ملاحظات إضافية
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 h-7 text-[10px] text-slate-800 focus:outline-hidden focus:border-[#03457a] focus:bg-white"
              placeholder="أي ملاحظات تخص العميل..."
            />
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

export default EditCustomerModal;

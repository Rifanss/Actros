import React from 'react';
import { User, MapPin, Hash, Phone, Edit2 } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerInfoCardProps {
  customer: Customer;
  onEdit: () => void;
}

export const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({
  customer,
  onEdit,
}) => {
  return (
    <div
      id="customer-info-section"
      className="bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden"
    >
      {/* Dark Blue Header Strip */}
      <div className="bg-[#03457a] text-white px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <span className="text-[11px] font-extrabold font-['Tajawal',sans-serif] tracking-wide">
            بيانات العميل
          </span>
        </div>

        {/* Edit Button: Top far-left opposite title */}
        <button
          id="btn-edit-customer-info"
          onClick={onEdit}
          type="button"
          className="flex items-center gap-1 text-[8.5px] font-bold text-white bg-white/15 hover:bg-white/25 active:bg-white/30 px-2 py-0.5 rounded-md border border-white/30 transition cursor-pointer"
        >
          <Edit2 className="w-2.5 h-2.5" />
          <span>تعديل</span>
        </button>
      </div>

      {/* Card Content: 2x2 Unified Grid (Slimmer & Reduced Height) */}
      <div className="p-2">
        <div className="grid grid-cols-2 gap-1.5 text-right">
          {/* Customer Name */}
          <div className="bg-[#f8fafc] border border-slate-200/70 rounded-lg px-2 py-1 shadow-2xs flex flex-col justify-center min-h-[40px]">
            <div className="flex items-center gap-1 text-[8.5px] font-semibold text-[#03457a] mb-0.5">
              <User className="w-2.5 h-2.5 shrink-0" />
              <span>اسم العميل</span>
            </div>
            <div
              className="text-[10px] font-medium text-slate-800 leading-tight break-words"
              title={customer.customer_name}
            >
              {customer.customer_name}
            </div>
          </div>

          {/* Customer Identifier */}
          <div className="bg-[#f8fafc] border border-slate-200/70 rounded-lg px-2 py-1 shadow-2xs flex flex-col justify-center min-h-[40px]">
            <div className="flex items-center gap-1 text-[8.5px] font-semibold text-[#03457a] mb-0.5">
              <Hash className="w-2.5 h-2.5 shrink-0" />
              <span>رقم العميل</span>
            </div>
            <div className="text-[10px] font-medium text-slate-800 font-mono leading-tight">
              {customer.customer_identifier || 'NB-1001'}
            </div>
          </div>

          {/* Location */}
          <div className="bg-[#f8fafc] border border-slate-200/70 rounded-lg px-2 py-1 shadow-2xs flex flex-col justify-center min-h-[40px]">
            <div className="flex items-center gap-1 text-[8.5px] font-semibold text-[#03457a] mb-0.5">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              <span>الموقع</span>
            </div>
            <div
              className="text-[10px] font-medium text-slate-800 leading-tight break-words"
              title={customer.location}
            >
              {customer.location}
            </div>
          </div>

          {/* Mobile Number */}
          <div className="bg-[#f8fafc] border border-slate-200/70 rounded-lg px-2 py-1 shadow-2xs flex flex-col justify-center min-h-[40px]">
            <div className="flex items-center gap-1 text-[8.5px] font-semibold text-[#03457a] mb-0.5">
              <Phone className="w-2.5 h-2.5 shrink-0" />
              <span>رقم الجوال</span>
            </div>
            <div className="text-[10px] font-medium text-slate-800 font-mono leading-tight text-right">
              <span dir="ltr">{customer.mobile}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoCard;

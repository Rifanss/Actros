import React from 'react';
import { User, X } from 'lucide-react';

interface CustomerHeaderProps {
  customerName: string;
  onClose?: () => void;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  customerName,
  onClose,
}) => {
  return (
    <div
      id="customer-profile-top-header"
      className="relative w-full bg-gradient-to-r from-[#023561] via-[#03457a] to-[#023561] text-white rounded-xl shadow-md px-3 py-2 flex items-center justify-between transition-all"
    >
      {/* Right Side (RTL): User Icon + Customer Name */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 shrink-0 shadow-xs">
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
        <div
          id="customer-header-name"
          className="customer-header-name text-[10.5px] sm:text-[11px] font-bold tracking-tight text-white truncate drop-shadow-xs font-['Tajawal',sans-serif]"
        >
          {customerName}
        </div>
      </div>

      {/* Left Side (RTL): X Close Button */}
      <button
        id="btn-close-customer-profile"
        onClick={onClose}
        type="button"
        title="إغلاق ملف العميل"
        aria-label="إغلاق"
        className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 flex items-center justify-center text-white transition cursor-pointer border border-white/25 shrink-0"
      >
        <X className="w-4 h-4 text-white stroke-[2.5]" />
      </button>
    </div>
  );
};

export default CustomerHeader;

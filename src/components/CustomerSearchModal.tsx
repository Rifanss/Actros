import React, { useState } from 'react';
import { useWaterData } from '../context/WaterDataContext';
import { Search, User, Phone, Hash, MapPin, X, ArrowLeft } from 'lucide-react';
import { Customer } from '../types';
import BackButton from './BackButton';
import { scrollToTop } from '../utils/scrollUtils';

interface CustomerSearchModalProps {
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
}

export const CustomerSearchModal: React.FC<CustomerSearchModalProps> = ({
  onClose,
  onSelectCustomer,
}) => {
  const { customers, setActiveTab } = useWaterData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      c.customer_name.toLowerCase().includes(term) ||
      c.mobile.includes(term) ||
      c.customer_identifier.toLowerCase().includes(term) ||
      c.location.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-3 pt-12 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-sm w-full shadow-xl overflow-hidden border border-slate-200 text-right">
        {/* Search Input Bar */}
        <div className="p-2 border-b border-slate-200 flex items-center gap-1.5 bg-[#03457a] text-white">
          <Search className="w-3.5 h-3.5 text-sky-200 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم العميل أو رقم الجوال..."
            className="w-full h-7 px-2 bg-white/10 text-white placeholder-sky-200 rounded-lg text-[10px] font-medium focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 focus:outline-none transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-white/70 hover:text-white text-[10px] px-1 py-0.5 rounded-full"
            >
              ✕
            </button>
          )}
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-1.5 divide-y divide-slate-100 text-[10px]">
          {customers.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-[10px]">
              لا يوجد عملاء مسجلون حالياً في النظام
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-[10px]">
              لم يتم العثور على عميل يطابق &quot;{searchTerm}&quot;
            </div>
          ) : (
            filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                onClick={() => {
                  onSelectCustomer(cust);
                  onClose();
                  scrollToTop(true);
                }}
                className="p-2 hover:bg-[#f8fafc] rounded-lg transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-sky-100 text-[#03457a] flex items-center justify-center font-bold">
                    <User className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-[10.5px] font-bold text-slate-800 group-hover:text-[#03457a] transition">
                      {cust.customer_name}
                    </div>
                    <div className="text-[8.5px] text-slate-400 font-mono">
                      {cust.mobile}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#03457a] font-bold text-[9.5px]">
                  <span>ملف العميل</span>
                  <ArrowLeft className="w-3 h-3" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal footer */}
        <div className="bg-slate-50 px-3 py-1.5 flex items-center justify-between gap-2 border-t border-slate-200">
          <span className="text-[8.5px] text-slate-500 font-medium">
            اختر أي عميل لفتح سجله
          </span>
          <button
            onClick={() => {
              setActiveTab('customers');
              onClose();
              scrollToTop(true);
            }}
            className="h-7 text-[9.5px] font-bold text-[#03457a] hover:text-[#023561] bg-sky-50 hover:bg-sky-100 px-2.5 rounded-lg border border-sky-200 transition cursor-pointer flex items-center gap-1"
          >
            <span>فتح قسم العملاء</span>
            <ArrowLeft className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerSearchModal;

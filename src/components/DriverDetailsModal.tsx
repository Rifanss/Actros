import React from 'react';
import { Driver, Delivery } from '../types';
import { Users, X } from 'lucide-react';

interface DriverDetailsModalProps {
  driver: Driver;
  deliveries: Delivery[];
  onClose: () => void;
  onOpenCustomerRecord: (customerId: string) => void;
}

export const DriverDetailsModal: React.FC<DriverDetailsModalProps> = ({
  driver,
  deliveries,
  onClose,
  onOpenCustomerRecord,
}) => {
  const driverDeliveries = deliveries.filter((d) => d.driver_id === driver.id);

  const totalAmount = driverDeliveries.reduce((sum, d) => sum + d.price, 0);
  const cashDeliveries = driverDeliveries.filter((d) => d.payment_method === 'كاش');
  const deferredDeliveries = driverDeliveries.filter((d) => d.payment_method === 'آجل');
  const cashAmount = cashDeliveries.reduce((sum, d) => sum + d.price, 0);
  const deferredAmount = deferredDeliveries.reduce((sum, d) => sum + d.price, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-3">
      <div className="operations-scope bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-fade-in text-right">
        {/* Modal Header - Compact Micro-UI style matching Customer Profile */}
        <div className="bg-[#03457a] text-white px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-[11px] font-extrabold font-['Tajawal',sans-serif] leading-tight">
                {driver.driver_name}
              </h2>
              <p className="text-[8.5px] text-sky-200">{driver.vehicle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            title="إغلاق"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Driver Performance Summary */}
        <div className="p-3 space-y-2.5">
          {/* 4 Cards matching Customer Profile min-h-[40px] px-2 py-1 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
            {/* Total Deliveries */}
            <div className="bg-[#f8fafc] border border-slate-200/70 rounded-lg px-2 py-1 shadow-2xs flex flex-col justify-center min-h-[40px]">
              <div className="text-[8.5px] font-semibold text-[#03457a]">عدد الردود</div>
              <div className="text-[10px] font-bold text-slate-800 font-mono mt-0.5">
                {driverDeliveries.length}
              </div>
            </div>

            {/* Cash */}
            <div className="bg-[#f8fafc] border border-slate-200/70 rounded-lg px-2 py-1 shadow-2xs flex flex-col justify-center min-h-[40px]">
              <div className="text-[8.5px] font-semibold text-emerald-700">كاش ({cashDeliveries.length})</div>
              <div className="text-[10px] font-bold text-emerald-900 font-mono mt-0.5">
                {cashAmount.toLocaleString()} ر.س
              </div>
            </div>

            {/* Deferred */}
            <div className="bg-[#f8fafc] border border-slate-200/70 rounded-lg px-2 py-1 shadow-2xs flex flex-col justify-center min-h-[40px]">
              <div className="text-[8.5px] font-semibold text-amber-700">آجل ({deferredDeliveries.length})</div>
              <div className="text-[10px] font-bold text-amber-900 font-mono mt-0.5">
                {deferredAmount.toLocaleString()} ر.س
              </div>
            </div>

            {/* Total */}
            <div className="bg-[#f8fafc] border border-slate-200/70 rounded-lg px-2 py-1 shadow-2xs flex flex-col justify-center min-h-[40px]">
              <div className="text-[8.5px] font-semibold text-[#03457a]">الإجمالي</div>
              <div className="text-[10px] font-bold text-[#03457a] font-mono mt-0.5">
                {totalAmount.toLocaleString()} ر.س
              </div>
            </div>
          </div>

          {/* List of Deliveries */}
          <div>
            <h3 className="text-[10px] font-bold text-[#03457a] mb-1.5 font-['Tajawal',sans-serif]">
              توريدات السائق:
            </h3>
            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
              {driverDeliveries.length === 0 ? (
                <div className="p-3 text-center text-[10px] text-slate-400">
                  لا توجد توريدات مسجلة لهذا السائق في الفترة المحددة
                </div>
              ) : (
                driverDeliveries.map((del) => (
                  <div
                    key={del.id}
                    onClick={() => {
                      onOpenCustomerRecord(del.customer_id);
                      onClose();
                    }}
                    className="p-2 hover:bg-sky-50 flex items-center justify-between text-[10px] cursor-pointer transition"
                  >
                    <div>
                      <div className="font-bold text-slate-800 text-[10px]">{del.customer_name}</div>
                      <div className="text-[8.5px] text-slate-400">
                        {del.supply_type} - {del.tank_capacity} | {del.supply_time || '08:00'}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-900 font-mono text-[10px]">
                        {del.price} ر.س
                      </div>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded-md text-[8.5px] font-bold ${
                          del.payment_method === 'كاش'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {del.payment_method}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverDetailsModal;

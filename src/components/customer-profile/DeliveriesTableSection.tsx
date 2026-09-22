import React from 'react';
import { ClipboardList, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Delivery } from '../../types';

interface DeliveriesTableSectionProps {
  deliveries: Delivery[];
  onSelectDelivery?: (delivery: Delivery) => void;
}

export const DeliveriesTableSection: React.FC<DeliveriesTableSectionProps> = ({
  deliveries,
  onSelectDelivery,
}) => {
  return (
    <div
      id="customer-deliveries-log-section"
      className="bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden"
    >
      {/* Dark Blue Header Strip */}
      <div className="bg-[#03457a] text-white px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
            <ClipboardList className="w-3 h-3 text-white" />
          </div>
          <span className="text-[11px] font-extrabold font-['Tajawal',sans-serif] tracking-wide">
            سجل التوريدات
          </span>
        </div>
        <span className="text-[8.5px] font-bold bg-white/15 px-2 py-0.5 rounded-full">
          {deliveries.length} توريد
        </span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse text-[10px]">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[8.5px]">
              <th className="py-1.5 px-2 text-right">التاريخ</th>
              <th className="py-1.5 px-1.5 text-center">النوع</th>
              <th className="py-1.5 px-1.5 text-center">السعة</th>
              <th className="py-1.5 px-1.5 text-center">السائق</th>
              <th className="py-1.5 px-1.5 text-center">المبلغ</th>
              <th className="py-1.5 px-1.5 text-center">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[10px]">
            {deliveries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-5 text-slate-400 font-medium text-[10px]">
                  لا توجد ردود مسجلة لهذا العميل حتى الآن
                </td>
              </tr>
            ) : (
              deliveries.map((delivery) => {
                const isPaid =
                  delivery.payment_status === 'مدفوع' || delivery.payment_method === 'كاش';

                return (
                  <tr
                    key={delivery.id}
                    onClick={() => onSelectDelivery?.(delivery)}
                    className="hover:bg-sky-50/60 transition cursor-pointer"
                  >
                    {/* التاريخ */}
                    <td className="py-1.5 px-2 font-medium text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-mono text-[10px]" dir="ltr">
                        <Calendar className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span>{delivery.supply_date}</span>
                      </div>
                    </td>

                    {/* النوع */}
                    <td className="py-1.5 px-1.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[8.5px] font-medium ${
                          delivery.supply_type === 'تحلية'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {delivery.supply_type}
                      </span>
                    </td>

                    {/* السعة */}
                    <td className="py-1.5 px-1.5 text-center font-medium text-slate-800 whitespace-nowrap text-[10px]">
                      {delivery.tank_capacity}
                    </td>

                    {/* السائق */}
                    <td className="py-1.5 px-1.5 text-center font-medium text-slate-800 whitespace-nowrap text-[10px]">
                      {delivery.driver_name}
                    </td>

                    {/* المبلغ */}
                    <td className="py-1.5 px-1.5 text-center font-medium text-slate-900 font-mono whitespace-nowrap text-[10px]">
                      {delivery.price} <span className="text-[8.5px] font-normal">ريال</span>
                    </td>

                    {/* الحالة */}
                    <td className="py-1.5 px-1.5 text-center whitespace-nowrap">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8.5px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                          <span>مدفوع</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8.5px] font-medium bg-rose-100 text-rose-800 border border-rose-200">
                          <Clock className="w-2.5 h-2.5 shrink-0" />
                          <span>مستحق</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveriesTableSection;

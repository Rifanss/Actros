import React, { useState } from 'react';
import { useWaterData } from '../context/WaterDataContext';
import { SupplyType, PaymentMethod, Delivery } from '../types';
import { useScrollToTop } from '../utils/scrollUtils';
import { ProofImageModal } from './common/ProofImageModal';
import {
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Plus,
  ArrowUpDown,
  Download,
  CheckCircle2,
  Clock,
  User,
  Camera,
  Eye,
  Navigation,
} from 'lucide-react';

export const DeliveriesLogView: React.FC = () => {
  const {
    deliveries,
    drivers,
    deleteDelivery,
    updateDelivery,
    openCustomerRecordById,
    setActiveTab,
  } = useWaterData();

  // Guarantee deliveries log starts at top (0, 0)
  useScrollToTop();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | SupplyType>('all');
  const [filterPayment, setFilterPayment] = useState<'all' | PaymentMethod>('all');
  const [filterDriver, setFilterDriver] = useState<'all' | string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'price_desc'>('date_desc');
  const [selectedProofDelivery, setSelectedProofDelivery] = useState<Delivery | null>(null);

  // Filtered and sorted
  const filtered = deliveries
    .filter((d) => {
      if (filterType !== 'all' && d.supply_type !== filterType) return false;
      if (filterPayment !== 'all' && d.payment_method !== filterPayment) return false;
      if (filterDriver !== 'all' && d.driver_id !== filterDriver && d.driver_name !== filterDriver) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        return (
          d.customer_name.toLowerCase().includes(term) ||
          d.mobile.includes(term) ||
          d.driver_name.toLowerCase().includes(term) ||
          (d.order_number && d.order_number.toLowerCase().includes(term)) ||
          (d.customer_identifier && d.customer_identifier.toLowerCase().includes(term))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') {
        return (b.supply_date + (b.supply_time || '')).localeCompare(a.supply_date + (a.supply_time || ''));
      }
      if (sortBy === 'date_asc') {
        return (a.supply_date + (a.supply_time || '')).localeCompare(b.supply_date + (b.supply_time || ''));
      }
      if (sortBy === 'price_desc') {
        return b.price - a.price;
      }
      return 0;
    });

  const handleDelete = (del: Delivery) => {
    if (window.confirm(`هل أنت متأكد من حذف توريد العميل "${del.customer_name}"؟`)) {
      deleteDelivery(del.id);
    }
  };

  const togglePayment = (del: Delivery) => {
    const newMethod = del.payment_method === 'كاش' ? 'آجل' : 'كاش';
    updateDelivery(del.id, {
      payment_method: newMethod,
      payment_status: newMethod === 'كاش' ? 'مدفوع' : 'آجل',
      paid_amount: newMethod === 'كاش' ? del.price : 0,
      remaining_amount: newMethod === 'آجل' ? del.price : 0,
    });
  };

  return (
    <div className="operations-scope max-w-4xl mx-auto px-2 sm:px-3 pb-16 space-y-2 text-right">
      {/* Top Action & Summary Bar */}
      <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
        <span className="text-[10px] sm:text-[10.5px] text-slate-600 font-medium">
          إجمالي التوريدات المسجلة: <strong className="text-[#03457a] font-bold font-mono">{deliveries.length}</strong> توريد
        </span>

        <button
          id="btn-deliveries-log-add-new"
          onClick={() => setActiveTab('add')}
          className="flex items-center gap-1 px-2.5 h-6 bg-[#03457a] hover:bg-[#023561] text-white rounded-md text-[9.5px] font-bold shadow-2xs active:scale-98 transition cursor-pointer justify-center"
        >
          <Plus className="w-3 h-3" />
          <span>تسجيل توريد جديد</span>
        </button>
      </div>

      {/* Filter and Search Bar (Compact design system matching customer profile) */}
      <div className="bg-white rounded-lg p-1 sm:p-1.5 shadow-2xs border border-slate-200/70">
        <div className="flex items-center gap-1 w-full">
          {/* Search box */}
          <div className="relative flex-[1.4] min-w-0">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالعميل أو الجوال أو السائق..."
              className="w-full text-[8.5px] font-medium pr-5 pl-1.5 h-[17px] bg-slate-50/80 rounded border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#03457a] truncate site-filter-input"
            />
            <Search className="w-2.5 h-2.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter Type */}
          <div className="flex-1 min-w-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full text-[8.5px] font-bold h-[17px] px-1 bg-slate-50/80 rounded border border-slate-200 focus:bg-white focus:outline-none cursor-pointer truncate site-filter-select"
            >
              <option value="all">كل الأنواع</option>
              <option value="تحلية">تحلية</option>
              <option value="آبار">آبار</option>
            </select>
          </div>

          {/* Filter Payment */}
          <div className="flex-1 min-w-0">
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value as any)}
              className="w-full text-[8.5px] font-bold h-[17px] px-1 bg-slate-50/80 rounded border border-slate-200 focus:bg-white focus:outline-none cursor-pointer truncate site-filter-select"
            >
              <option value="all">كل الدفع</option>
              <option value="كاش">كاش</option>
              <option value="آجل">آجل</option>
            </select>
          </div>

          {/* Driver Filter */}
          <div className="flex-1 min-w-[70px]">
            <select
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
              className="w-full text-[8.5px] font-bold h-[17px] px-1 bg-slate-50/80 rounded border border-slate-200 focus:bg-white focus:outline-none cursor-pointer truncate site-filter-select"
            >
              <option value="all">كل السائقين</option>
              {drivers.map((drv) => (
                <option key={drv.id} value={drv.id}>
                  {drv.driver_name}
                </option>
              ))}
            </select>
          </div>

          {/* Small Filter button */}
          <button
            className="shrink-0 flex items-center justify-center gap-0.5 bg-[#03457a] hover:bg-[#023561] text-white font-bold text-[8.5px] h-[17px] px-2 rounded shadow-2xs active:scale-95 transition cursor-pointer whitespace-nowrap site-filter-btn"
            title="تصفية"
          >
            <Filter className="w-2.5 h-2.5" />
            <span>تصفية</span>
          </button>
        </div>
      </div>

      {/* Table of Deliveries */}
      <div className="bg-white rounded-xl p-1.5 sm:p-2 shadow-2xs border border-slate-200/70">
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-[#03457a] text-white font-bold text-[9px] sm:text-[9.5px]">
                <th className="py-1 px-1.5 text-center w-7">#</th>
                <th className="py-1 px-1.5">رقم الطلب</th>
                <th className="py-1 px-1.5">العميل</th>
                <th className="py-1 px-1.5 text-center">النوع</th>
                <th className="py-1 px-1.5 text-center">السعة</th>
                <th className="py-1 px-1.5 text-center">السعر</th>
                <th className="py-1 px-1.5 text-center">الدفع</th>
                <th className="py-1 px-1.5 text-center">السائق المكلف</th>
                <th className="py-1 px-1.5 text-center">حالة التوريد</th>
                <th className="py-1 px-1.5 text-center">التاريخ والوقت</th>
                <th className="py-1 px-1.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[10px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-6 text-center text-slate-400 text-[10px]">
                    لا توجد توريدات تطابق معايير البحث
                  </td>
                </tr>
              ) : (
                filtered.map((del, i) => {
                  const hasProof = !!del.delivery_proof_image;
                  const isDelivered = del.order_status === 'تم التوريد';

                  return (
                    <tr key={del.id} className="hover:bg-sky-50/50 transition">
                      <td className="py-1 px-1.5 text-center font-bold text-slate-400 text-[8.5px]">
                        {del.sequence_num || i + 1}
                      </td>
                      <td className="py-1 px-1.5 font-mono font-bold text-[9px] text-[#03457a]">
                        {del.order_number || `NB-${1040 + (del.sequence_num || i + 1)}`}
                      </td>
                      <td className="py-1 px-1.5">
                        <button
                          onClick={() => openCustomerRecordById(del.customer_id)}
                          className="font-bold text-slate-800 hover:text-sky-700 text-right transition cursor-pointer text-[10px]"
                        >
                          {del.customer_name}
                        </button>
                        <div className="text-[8px] text-slate-400 font-mono">{del.mobile}</div>
                      </td>
                      <td className="py-1 px-1.5 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded-full text-[8px] font-bold ${
                            del.supply_type === 'تحلية'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {del.supply_type}
                        </span>
                      </td>
                      <td className="py-1 px-1.5 text-center font-medium text-slate-700 text-[8.5px]">
                        {del.tank_capacity}
                      </td>
                      <td className="py-1 px-1.5 text-center font-bold font-mono text-slate-900 text-[9.5px]">
                        SAR {del.price}
                      </td>
                      <td className="py-1 px-1.5 text-center">
                        <button
                          onClick={() => togglePayment(del)}
                          title="انقر لتغيير حالة الدفع"
                          className={`px-1.5 py-0.2 rounded-full text-[8px] font-bold transition cursor-pointer ${
                            del.payment_method === 'كاش'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {del.payment_method}
                        </button>
                      </td>

                      {/* السائق المكلف (Editable by manager) */}
                      <td className="py-1 px-1.5 text-center">
                        <select
                          value={del.driver_id || del.driver_name}
                          onChange={(e) => {
                            const newDriver = drivers.find((d) => d.id === e.target.value);
                            if (newDriver) {
                              updateDelivery(del.id, {
                                driver_id: newDriver.id,
                                driver_name: newDriver.driver_name,
                                order_status: del.order_status === 'جديد' ? 'مسند للسائق' : del.order_status,
                              });
                            }
                          }}
                          className="text-[8.5px] font-bold py-0.5 px-1 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-sky-500 cursor-pointer"
                        >
                          {drivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.driver_name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* حالة التوريد + زر إثبات الكاميرا */}
                      <td className="py-1 px-1.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isDelivered ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              تم التوريد
                            </span>
                          ) : del.order_status === 'في الطريق' ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                              في الطريق
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              مسند للسائق
                            </span>
                          )}

                          {/* View Proof Button */}
                          {hasProof && (
                            <button
                              onClick={() => setSelectedProofDelivery(del)}
                              title="عرض صورة التوثيق بالكاميرا"
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[8px] flex items-center gap-0.5 shadow-2xs transition cursor-pointer"
                            >
                              <Camera className="w-2.5 h-2.5" />
                              <span>صورة</span>
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-1 px-1.5 text-center font-mono text-[8.5px] text-slate-600">
                        <div>{del.supply_date}</div>
                        <div className="text-[7.5px] text-slate-400">{del.supply_time || '08:00'}</div>
                      </td>
                      <td className="py-1 px-1.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openCustomerRecordById(del.customer_id)}
                            title="عرض ملف العميل"
                            className="p-0.5 text-sky-600 hover:bg-sky-100 rounded transition cursor-pointer"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(del)}
                            title="حذف التوريد"
                            className="p-0.5 text-rose-500 hover:bg-rose-100 rounded transition cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof of Delivery Image Modal */}
      <ProofImageModal
        isOpen={!!selectedProofDelivery}
        onClose={() => setSelectedProofDelivery(null)}
        delivery={selectedProofDelivery}
      />
    </div>
  );
};

export default DeliveriesLogView;

import React, { useState } from 'react';
import { useWaterData } from '../../context/WaterDataContext';
import { CustomerOrder, CustomerOrderStatus } from '../../types';
import CustomerOrderDetailsModal from '../CustomerOrderDetailsModal';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MapPin,
  Eye,
  Inbox,
} from 'lucide-react';

export const SupplyOrdersSection: React.FC = () => {
  const {
    customerOrders,
    pendingOrdersCount,
    updateCustomerOrderStatus,
  } = useWaterData();

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | CustomerOrderStatus>('all');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<CustomerOrder | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Counts
  const allCount = customerOrders.length;
  const acceptedCount = customerOrders.filter((o) => o.status === 'مقبول').length;
  const cancelledCount = customerOrders.filter((o) => o.status === 'ملغي').length;

  // Filtered orders list
  const filteredOrders = customerOrders.filter((order) => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  const handleOpenOrder = (order: CustomerOrder) => {
    setSelectedOrderForModal(order);
    setIsDetailsModalOpen(true);
  };

  const handleQuickAccept = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateCustomerOrderStatus(orderId, 'مقبول');
    if (selectedOrderForModal && selectedOrderForModal.id === orderId) {
      setSelectedOrderForModal((prev) => (prev ? { ...prev, status: 'مقبول' } : null));
    }
  };

  const handleQuickCancel = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateCustomerOrderStatus(orderId, 'ملغي');
    if (selectedOrderForModal && selectedOrderForModal.id === orderId) {
      setSelectedOrderForModal((prev) => (prev ? { ...prev, status: 'ملغي' } : null));
    }
  };

  return (
    <section id="section-supply-orders" className="space-y-2">
      {/* Header Container - Clean & Unified */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden transition hover:border-slate-300">
        <div
          id="toggle-supply-orders-header"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-2 flex items-center justify-between gap-1.5 cursor-pointer select-none text-right"
          role="button"
          aria-expanded={isOpen}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
        >
          {/* Right: Title & Stats summary */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[11px] font-extrabold text-[#03457a] font-['Tajawal',sans-serif] leading-tight">
                طلبات التوريد
              </h2>

              {pendingOrdersCount > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {pendingOrdersCount} بانتظار الموافقة
                </span>
              )}
            </div>
          </div>

          {/* Left: Accordion chevron */}
          <div className="shrink-0 flex items-center gap-1 text-slate-400">
            <div className="w-5 h-5 rounded bg-slate-50 flex items-center justify-center border border-slate-200 text-slate-600">
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Expandable Body */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="supply-orders-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-slate-100"
            >
              <div className="p-2 sm:p-2.5 space-y-2 bg-slate-50/40">
                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[9.5px] font-bold overflow-x-auto">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-2 py-0.5 rounded-md transition ${
                      activeFilter === 'all'
                        ? 'bg-[#03457a] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    الكل ({allCount})
                  </button>
                  <button
                    onClick={() => setActiveFilter('جديد')}
                    className={`px-2 py-0.5 rounded-md transition flex items-center gap-0.5 ${
                      activeFilter === 'جديد'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>بانتظار الموافقة ({pendingOrdersCount})</span>
                  </button>
                  <button
                    onClick={() => setActiveFilter('مقبول')}
                    className={`px-2 py-0.5 rounded-md transition ${
                      activeFilter === 'مقبول'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    المقبولة ({acceptedCount})
                  </button>
                  <button
                    onClick={() => setActiveFilter('ملغي')}
                    className={`px-2 py-0.5 rounded-md transition ${
                      activeFilter === 'ملغي'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    الملغاة ({cancelledCount})
                  </button>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                  <div className="bg-white rounded-lg p-4 border border-slate-200 text-center">
                    <Inbox className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                    <p className="text-[10.5px] font-semibold text-slate-600">لا توجد طلبات في هذا التصنيف</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredOrders.map((order) => {
                      const isPending = order.status === 'جديد';
                      const isAccepted = order.status === 'مقبول';

                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-2xs space-y-1.5"
                        >
                          {/* Row 1: Order Number, Time, Status */}
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-900 font-mono">
                                {order.order_number.startsWith('N-') ? order.order_number : `#${order.order_number}`}
                              </span>
                              <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{order.order_date} · {order.order_time}</span>
                              </span>
                            </div>

                            <span
                              className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full border ${
                                isPending
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : isAccepted
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}
                            >
                              {isPending ? 'بانتظار الموافقة' : order.status}
                            </span>
                          </div>

                          {/* Row 2: Customer Name, Phone, Specs */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-slate-700">
                            <div>
                              <span className="font-bold text-slate-900 text-[10.5px]">{order.customer_name}</span>
                              <span className="text-[9.5px] text-slate-500 mr-1.5 font-mono" dir="ltr">
                                {order.mobile}
                              </span>
                            </div>
                            <div className="text-[9.5px] text-slate-600 flex items-center gap-1">
                              <span className="font-semibold text-sky-700">{order.supply_type}</span>
                              <span>•</span>
                              <span>سعة {order.tank_capacity}</span>
                              {order.location && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5 truncate">
                                    <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                    {order.location}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Row 3: Action Buttons */}
                          <div className="pt-1 border-t border-slate-100 flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenOrder(order)}
                              className="px-2 py-0.5 rounded-md text-[9.5px] font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center gap-0.5 transition cursor-pointer"
                            >
                              <Eye className="w-3 h-3 text-slate-500" />
                              <span>عرض التفاصيل</span>
                            </button>

                            {isPending && (
                              <>
                                <button
                                  onClick={(e) => handleQuickAccept(order.id, e)}
                                  className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-0.5 transition cursor-pointer shadow-2xs"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>قبول الطلب</span>
                                </button>
                                <button
                                  onClick={(e) => handleQuickCancel(order.id, e)}
                                  className="px-2 py-0.5 rounded-md text-[9.5px] font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 flex items-center gap-0.5 transition cursor-pointer"
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span>إلغاء</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Details Modal */}
      <CustomerOrderDetailsModal
        order={selectedOrderForModal}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </section>
  );
};

export default SupplyOrdersSection;

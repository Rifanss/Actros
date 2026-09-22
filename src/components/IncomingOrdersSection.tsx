import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  MessageSquare,
  MapPin,
  ExternalLink,
  Droplets,
  Truck,
  Eye,
  AlertTriangle,
  Bell,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWaterData } from '../context/WaterDataContext';
import { CustomerOrder, CustomerOrderStatus } from '../types';
import CustomerOrderDetailsModal from './CustomerOrderDetailsModal';

export const IncomingOrdersSection: React.FC = () => {
  const {
    customerOrders,
    pendingOrdersCount,
    updateCustomerOrderStatus,
    clearAllCustomerOrders,
    setActiveTab,
  } = useWaterData();

  const [isCurtainOpen, setIsCurtainOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | CustomerOrderStatus>('all');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<CustomerOrder | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Filtered orders based on selected tab
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
    // If the modal is currently open for this order, keep it updated
    if (selectedOrderForModal && selectedOrderForModal.id === orderId) {
      setSelectedOrderForModal((prev) => (prev ? { ...prev, status: 'مقبول' } : null));
    }
  };

  const handleQuickCancel = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateCustomerOrderStatus(orderId, 'ملغي');
    // If the modal is currently open for this order, keep it updated
    if (selectedOrderForModal && selectedOrderForModal.id === orderId) {
      setSelectedOrderForModal((prev) => (prev ? { ...prev, status: 'ملغي' } : null));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xs border border-slate-200/80 p-2 sm:p-2.5 space-y-2">
      {/* ========================================================
          SIDE-TITLE HEADER BAR (عنوان جانبي لقسم طلبات العملاء)
          Collapsible like a curtain (طي القسم مثل الستاره)
          ======================================================== */}
      <div
        id="customer-orders-side-title-header"
        onClick={() => setIsCurtainOpen(!isCurtainOpen)}
        className={`w-full text-right p-2.5 sm:p-3 rounded-xl border transition-all duration-300 cursor-pointer select-none flex items-center justify-between gap-2.5 ${
          pendingOrdersCount > 0
            ? 'bg-gradient-to-l from-amber-500/15 via-amber-500/5 to-white border-amber-300 hover:border-amber-400 hover:shadow-xs'
            : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
        role="button"
        aria-expanded={isCurtainOpen}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsCurtainOpen(!isCurtainOpen);
          }
        }}
        title={isCurtainOpen ? 'اضغط لطي قسم طلبات العملاء مثل الستارة' : 'اضغط لفتح قسم طلبات العملاء'}
      >
        {/* Right side: Distinctive Side Marker & Section Titles */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Side Accent Marker Line (العنوان الجانبي المميز) */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`w-1.5 h-10 rounded-full shrink-0 transition-colors ${
                pendingOrdersCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-sky-600'
              }`}
            />
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                pendingOrdersCount > 0
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}
            >
              <Bell className="w-4 h-4" />
            </div>
          </div>

          <div className="truncate">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500">قسم طلبات العملاء</span>
              <span className="text-slate-300 text-xs">•</span>
              <h3 className="font-black text-xs sm:text-sm text-slate-900 truncate">
                طلبات توريد المياه الجديدة
              </h3>
            </div>
            <p className="text-[10px] sm:text-[11px] font-extrabold text-amber-800 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
              <span>
                {pendingOrdersCount > 0
                  ? `يوجد ${pendingOrdersCount} طلب توريد جديد بانتظار اتخاذ القرار`
                  : 'لا توجد طلبات توريد جديدة بانتظار اتخاذ القرار'}
              </span>
            </p>
          </div>
        </div>

        {/* Left side: Quick count badge & Curtain folding toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Clear all orders button */}
          {customerOrders.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('هل أنت متأكد من رغبتك في حذف كافة طلبات التوريد؟')) {
                  clearAllCustomerOrders();
                }
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
              title="حذف كافة طلبات التوريد"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">حذف الكل</span>
            </button>
          )}

          {/* Total orders count badge */}
          <div className="hidden xs:flex flex-col items-end text-left pl-1">
            <span className="text-[9px] font-bold text-slate-400">إجمالي الطلبات</span>
            <span className="text-xs font-black text-slate-800 font-mono">
              {customerOrders.length}
            </span>
          </div>

          {/* Curtain Fold Toggle Button */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 ${
              isCurtainOpen
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-2xs'
                : 'bg-amber-500 text-white border-amber-600 shadow-2xs hover:bg-amber-600'
            }`}
          >
            <span className="text-[10px] hidden sm:inline">
              {isCurtainOpen ? 'طي مثل الستارة' : 'فتح القسم'}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                isCurtainOpen ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </div>
        </div>
      </div>

      {/* ========================================================
          CURTAIN FOLDABLE BODY (طي القسم وفردة مثل الستارة)
          ======================================================== */}
      <AnimatePresence initial={false}>
        {isCurtainOpen && (
          <motion.div
            key="incoming-orders-curtain"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-1.5 space-y-2.5">
              {/* Prominent Pending Notification Banner when opened */}
              {pendingOrdersCount > 0 && (
                <div className="p-2.5 bg-gradient-to-r from-amber-50 via-amber-100/60 to-orange-50 border border-amber-300 rounded-xl flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 font-black text-xs shadow-2xs">
                      {pendingOrdersCount}
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-amber-950 block text-[11px] sm:text-xs">
                        يوجد {pendingOrdersCount} طلب توريد جديد بانتظار اتخاذ القرار
                      </span>
                      <span className="text-[10px] text-amber-800">
                        يرجى مراجعة بيانات الطلبات والموافقة عليها أو إلغائها
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveFilter('بانتظار الموافقة')}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition shadow-2xs shrink-0 cursor-pointer"
                  >
                    عرض المعلقة
                  </button>
                </div>
              )}

              {/* Filter Tabs (50% smaller) */}
              <div className="flex items-center gap-0.5 bg-slate-100/80 p-0.5 rounded-md text-[9px] sm:text-[9.5px] font-bold">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`flex-1 py-0.5 px-1.5 h-6 rounded transition text-center cursor-pointer site-filter-chip ${
                    activeFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الكل ({customerOrders.length})
                </button>

                <button
                  onClick={() => setActiveFilter('بانتظار الموافقة')}
                  className={`flex-1 py-0.5 px-1.5 h-6 rounded transition text-center cursor-pointer flex items-center justify-center gap-1 site-filter-chip ${
                    activeFilter === 'بانتظار الموافقة'
                      ? 'bg-amber-500 text-white shadow-2xs font-black'
                      : 'text-amber-800 hover:text-amber-950'
                  }`}
                >
                  <span>بانتظار الموافقة</span>
                  {pendingOrdersCount > 0 && (
                    <span className="w-3.5 h-3.5 rounded-full bg-white text-amber-700 text-[8.5px] flex items-center justify-center font-black">
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveFilter('مقبول')}
                  className={`flex-1 py-0.5 px-1.5 h-6 rounded transition text-center cursor-pointer site-filter-chip ${
                    activeFilter === 'مقبول'
                      ? 'bg-emerald-600 text-white shadow-2xs font-black'
                      : 'text-emerald-800 hover:text-emerald-950'
                  }`}
                >
                  المقبولة ({customerOrders.filter((o) => o.status === 'مقبول').length})
                </button>

                <button
                  onClick={() => setActiveFilter('ملغي')}
                  className={`flex-1 py-0.5 px-1.5 h-6 rounded transition text-center cursor-pointer site-filter-chip ${
                    activeFilter === 'ملغي'
                      ? 'bg-rose-600 text-white shadow-2xs font-black'
                      : 'text-rose-700 hover:text-rose-900'
                  }`}
                >
                  الملغاة ({customerOrders.filter((o) => o.status === 'ملغي').length})
                </button>
              </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-6 px-3 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
          <Clock className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
          <p className="text-xs font-bold text-slate-600">لا توجد طلبات في هذا القسم حالياً</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            عند قيام أي عميل بطلب توريد من الموقع، سيظهر طلبه هنا فوراً
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-0.5">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'بانتظار الموافقة';
            const isAccepted = order.status === 'مقبول';
            const isCancelled = order.status === 'ملغي';

            return (
              <div
                key={order.id}
                onClick={() => handleOpenOrder(order)}
                className={`p-3 rounded-xl border transition cursor-pointer hover:shadow-xs ${
                  isPending
                    ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                    : isAccepted
                    ? 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-300'
                    : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Top: Order Number, Date/Time & Status */}
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-[#0a2540]">
                      طلب {order.order_number.startsWith('N-') ? order.order_number : `#${order.order_number}`}
                    </span>
                    <span className="text-[9.5px] text-slate-400">
                      • {order.created_date} ({order.created_time})
                    </span>
                  </div>

                  <div>
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>بانتظار الموافقة</span>
                      </span>
                    )}
                    {isAccepted && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>مقبول</span>
                      </span>
                    )}
                    {isCancelled && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>ملغي</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body: Customer & Supply Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 text-xs">
                  {/* Customer details */}
                  <div className="space-y-0.5">
                    <div className="font-black text-slate-900 text-sm flex items-center gap-1">
                      <span>{order.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="font-mono text-xs font-bold dir-ltr">{order.mobile}</span>
                      <a
                        href={`tel:${order.mobile}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                        title="اتصال"
                      >
                        <Phone className="w-3 h-3" />
                      </a>
                      <a
                        href={`https://wa.me/${order.mobile.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded bg-green-50 text-green-700 hover:bg-green-100 transition"
                        title="واتساب"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Supply details */}
                  <div className="space-y-1 text-[11px] text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 font-bold text-sky-900 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                        <Droplets className="w-3 h-3 text-sky-600" />
                        {order.supply_type}
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                        <Truck className="w-3 h-3 text-slate-600" />
                        {order.tank_capacity}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-600 truncate">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      <span className="truncate">{order.location}</span>
                      {order.google_maps_url && (
                        <a
                          href={order.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-sky-700 hover:text-sky-900 shrink-0 mr-1"
                          title="عرض في خرائط Google"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acceptance / Cancellation Timestamp note */}
                {order.accepted_at && (
                  <p className="text-[9.5px] text-emerald-700 font-bold mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>تم قبول الطلب في: {order.accepted_at}</span>
                  </p>
                )}
                {order.cancelled_at && (
                  <p className="text-[9.5px] text-rose-700 font-bold mb-1.5 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    <span>تم إلغاء الطلب في: {order.cancelled_at}</span>
                  </p>
                )}

                {/* Card Actions: Two clear buttons «قبول الطلب» and «إلغاء الطلب» */}
                <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60">
                  {/* قبول الطلب */}
                  <button
                    id={`accept-order-btn-${order.id}`}
                    type="button"
                    onClick={(e) => handleQuickAccept(order.id, e)}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer ${
                      isAccepted
                        ? 'bg-emerald-700 text-white ring-1 ring-emerald-400'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs active:scale-95'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAccepted ? 'تم القبول ✓' : 'قبول الطلب'}</span>
                  </button>

                  {/* إلغاء الطلب */}
                  <button
                    id={`cancel-order-btn-${order.id}`}
                    type="button"
                    onClick={(e) => handleQuickCancel(order.id, e)}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer ${
                      isCancelled
                        ? 'bg-rose-700 text-white ring-1 ring-rose-400'
                        : 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs active:scale-95'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{isCancelled ? 'تم الإلغاء ✕' : 'إلغاء الطلب'}</span>
                  </button>

                  {/* تفاصيل كاملة */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenOrder(order);
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                    title="عرض كامل بيانات الطلب"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
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

      {/* Details Modal */}
      <CustomerOrderDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrderForModal(null);
        }}
        order={selectedOrderForModal}
        onConvertToDelivery={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrderForModal(null);
          setActiveTab('add');
        }}
      />
    </div>
  );
};

export default IncomingOrdersSection;

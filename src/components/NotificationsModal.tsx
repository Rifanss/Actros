import React, { useState } from 'react';
import {
  X,
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  MessageSquare,
  MapPin,
  Eye,
  ChevronLeft,
} from 'lucide-react';
import { useWaterData } from '../context/WaterDataContext';
import { CustomerOrder } from '../types';
import CustomerOrderDetailsModal from './CustomerOrderDetailsModal';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    customerOrders,
    pendingOrdersCount,
    updateCustomerOrderStatus,
    setActiveTab,
  } = useWaterData();

  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  if (!isOpen) return null;

  // Pending orders first, then other orders
  const pendingOrders = customerOrders.filter((o) => o.status === 'بانتظار الموافقة');
  const otherOrders = customerOrders.filter((o) => o.status !== 'بانتظار الموافقة');
  const allDisplayOrders = [...pendingOrders, ...otherOrders];

  const handleQuickAccept = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateCustomerOrderStatus(orderId, 'مقبول');
  };

  const handleQuickCancel = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateCustomerOrderStatus(orderId, 'ملغي');
  };

  const handleOpenDetails = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div
          className="bg-white w-full max-w-sm rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
          dir="rtl"
        >
          {/* Header */}
          <div className="bg-[#03457a] text-white px-3 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold shrink-0">
                <Bell className="w-3.5 h-3.5 text-sky-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-[11px] leading-tight font-['Tajawal',sans-serif]">
                    مركز الإشعارات والتنبيهات
                  </h3>
                  {pendingOrdersCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black font-mono">
                      {pendingOrdersCount}
                    </span>
                  )}
                </div>
                <p className="text-[8.5px] text-sky-200">
                  {pendingOrdersCount > 0
                    ? `يوجد ${pendingOrdersCount} طلب توريد جديد بانتظار الموافقة`
                    : 'سجل إشعارات وطلبات العملاء'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body: Notifications List */}
          <div className="p-2.5 overflow-y-auto flex-1 space-y-1.5 bg-[#f8fafc] text-[10px]">
            {allDisplayOrders.length === 0 ? (
              <div className="text-center py-8 px-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-1.5">
                  <Bell className="w-5 h-5" />
                </div>
                <h4 className="text-[10.5px] font-bold text-slate-700">لا توجد إشعارات حالياً</h4>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  عند قيام العملاء بإرسال أي طلبات جديدة ستظهر إشعاراتها هنا فوراً
                </p>
              </div>
            ) : (
              allDisplayOrders.map((order) => {
                const isPending = order.status === 'بانتظار الموافقة';
                const isAccepted = order.status === 'مقبول';

                return (
                  <div
                    key={order.id}
                    onClick={() => handleOpenDetails(order)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer hover:shadow-2xs ${
                      isPending
                        ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-300/40'
                        : isAccepted
                        ? 'bg-white border-emerald-200'
                        : 'bg-white border-slate-200/80'
                    }`}
                  >
                    {/* Item Header */}
                    <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-slate-200/60">
                      <div className="flex items-center gap-1.5">
                        {isPending && (
                          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-500 animate-ping" />
                        )}
                        <span className="text-[10px] font-black text-slate-900">
                          طلب توريد {order.order_number.startsWith('N-') ? order.order_number : `#${order.order_number}`}
                        </span>
                        <span className="text-[8.5px] text-slate-400">
                          {order.created_date} ({order.created_time})
                        </span>
                      </div>

                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[8.5px] font-bold bg-amber-200 text-amber-950 border border-amber-300">
                          <Clock className="w-2.5 h-2.5 text-amber-700" />
                          <span>بانتظار الموافقة</span>
                        </span>
                      ) : isAccepted ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[8.5px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>مقبول</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[8.5px] font-bold bg-rose-100 text-rose-800">
                          <XCircle className="w-2.5 h-2.5 text-rose-600" />
                          <span>ملغي</span>
                        </span>
                      )}
                    </div>

                    {/* Customer & Supply Details */}
                    <div className="grid grid-cols-1 gap-1 my-1 text-[10px]">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900 text-[10.5px]">
                          {order.customer_name}
                        </div>
                        <div className="flex items-center gap-1 text-slate-600 text-[9.5px]">
                          <span className="font-mono font-bold dir-ltr">{order.mobile}</span>
                          <a
                            href={`tel:${order.mobile}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                            title="اتصال"
                          >
                            <Phone className="w-2.5 h-2.5" />
                          </a>
                          <a
                            href={`https://wa.me/${order.mobile.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-0.5 rounded bg-green-50 text-green-700 hover:bg-green-100 transition"
                            title="واتساب"
                          >
                            <MessageSquare className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-700">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-[#03457a] bg-sky-50 px-1 py-0.2 rounded border border-sky-100">
                            {order.supply_type}
                          </span>
                          <span className="font-bold text-slate-800 bg-slate-100 px-1 py-0.2 rounded">
                            {order.tank_capacity}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 text-slate-500 text-[8.5px] truncate max-w-[140px]">
                          <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                          <span className="truncate">{order.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-1 pt-1 border-t border-slate-200/60">
                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => handleQuickAccept(order.id, e)}
                            className="flex-1 h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9.5px] font-bold flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>قبول الطلب</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleQuickCancel(order.id, e)}
                            className="flex-1 h-7 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9.5px] font-bold flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition cursor-pointer"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>إلغاء</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(order);
                        }}
                        className="h-7 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[9.5px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                        title="عرض تفاصيل الطلب الكاملة"
                      >
                        <Eye className="w-3 h-3" />
                        <span>التفاصيل</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                onClose();
              }}
              className="text-[9.5px] font-bold text-[#03457a] hover:text-[#023561] flex items-center gap-1 cursor-pointer transition"
            >
              <span>الانتقال إلى لوحة التحكم والعمليات</span>
              <ChevronLeft className="w-3 h-3" />
            </button>

            <button
              onClick={onClose}
              className="h-7 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[9.5px] font-bold transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modal: Full Order Details */}
      <CustomerOrderDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onConvertToDelivery={() => {
          setIsDetailsOpen(false);
          setSelectedOrder(null);
          onClose();
          setActiveTab('add');
        }}
      />
    </>
  );
};

export default NotificationsModal;

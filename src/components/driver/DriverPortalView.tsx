import React, { useState, useMemo } from 'react';
import {
  Truck,
  LogOut,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Camera,
  CheckCircle2,
  Navigation,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useWaterData } from '../../context/WaterDataContext';
import { Delivery, DeliveryOrderStatus } from '../../types';
import { DocumentDeliveryModal } from './DocumentDeliveryModal';
import { ProofImageModal } from '../common/ProofImageModal';

export const DriverPortalView: React.FC = () => {
  const {
    authenticatedDriver,
    logoutDriver,
    deliveries,
    setActiveTab,
    updateDeliveryOrderStatus,
    getDriverStats,
  } = useWaterData();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [documentingDelivery, setDocumentingDelivery] = useState<Delivery | null>(null);
  const [viewingProofDelivery, setViewingProofDelivery] = useState<Delivery | null>(null);

  // If not logged in, redirect or display prompt
  if (!authenticatedDriver) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center" dir="rtl">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">يرجى تسجيل الدخول أولاً</h2>
        <p className="text-xs text-slate-500 mb-4">يجب الدخول بحساب السائق لعرض التوريدات والطلبات المسندة</p>
        <button
          onClick={() => setActiveTab('driver_login')}
          className="px-6 py-2.5 bg-[#03457a] text-white rounded-xl text-xs font-bold shadow-md"
        >
          الانتقال لصفحة دخول السائق
        </button>
      </div>
    );
  }

  // Strictly filter deliveries assigned to this driver
  const driverDeliveries = useMemo(() => {
    return deliveries.filter(
      (d) =>
        d.driver_id === authenticatedDriver.id ||
        d.driver_name?.trim() === authenticatedDriver.driver_name?.trim()
    );
  }, [deliveries, authenticatedDriver]);

  // Driver statistics
  const stats = useMemo(() => {
    return getDriverStats(authenticatedDriver.id);
  }, [getDriverStats, authenticatedDriver.id, driverDeliveries]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return driverDeliveries.filter((order) => {
      const isCompleted = order.order_status === 'تم التوريد';
      if (statusFilter === 'pending') return !isCompleted;
      if (statusFilter === 'completed') return isCompleted;
      return true;
    });
  }, [driverDeliveries, statusFilter]);

  // Open maps handler
  const handleOpenMaps = (order: Delivery) => {
    const url =
      order.google_maps_url ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        order.location ? `${order.location}, الطائف` : 'الطائف'
      )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Quick toggle to "في الطريق"
  const handleSetOnTheWay = (order: Delivery) => {
    if (order.order_status === 'تم التوريد') return;
    updateDeliveryOrderStatus(order.id, 'في الطريق');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20 select-none font-['Tajawal',sans-serif]" dir="rtl">
      {/* Sticky Mobile Header */}
      <header className="sticky top-0 z-30 bg-[#03457a] text-white shadow-md">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-sky-200">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-wide text-sky-200">نبع لتوريد المياه</h1>
              <div className="text-sm font-bold flex items-center gap-1">
                <span>مرحبًا، {authenticatedDriver.driver_name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={logoutDriver}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border border-white/10 active:scale-95"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        {/* Assigned Vehicle Subtitle */}
        <div className="bg-[#023561] px-4 py-1.5 text-[10.5px] text-sky-200 text-center flex items-center justify-center gap-1.5 border-t border-white/5">
          <span className="opacity-75">المركبة المكلف بها:</span>
          <span className="font-bold text-white">{authenticatedDriver.vehicle}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-3.5 pt-3.5 space-y-3">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-3 gap-2">
          {/* Today Orders */}
          <div
            onClick={() => setStatusFilter('all')}
            className={`p-2.5 rounded-xl border text-center transition cursor-pointer shadow-2xs ${
              statusFilter === 'all'
                ? 'bg-white border-sky-500 ring-2 ring-sky-500/20'
                : 'bg-white border-slate-200/90'
            }`}
          >
            <span className="text-[10px] text-slate-500 font-bold block mb-0.5">طلبات اليوم</span>
            <span className="text-lg font-black text-slate-900 font-mono">
              {stats.todayOrdersCount}
            </span>
          </div>

          {/* Pending Orders */}
          <div
            onClick={() => setStatusFilter('pending')}
            className={`p-2.5 rounded-xl border text-center transition cursor-pointer shadow-2xs ${
              statusFilter === 'pending'
                ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                : 'bg-white border-slate-200/90'
            }`}
          >
            <span className="text-[10px] text-amber-700 font-bold block mb-0.5">المتبقية</span>
            <span className="text-lg font-black text-amber-600 font-mono">
              {stats.activeOrdersCount}
            </span>
          </div>

          {/* Completed Orders */}
          <div
            onClick={() => setStatusFilter('completed')}
            className={`p-2.5 rounded-xl border text-center transition cursor-pointer shadow-2xs ${
              statusFilter === 'completed'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-white border-slate-200/90'
            }`}
          >
            <span className="text-[10px] text-emerald-700 font-bold block mb-0.5">تم إنجازها</span>
            <span className="text-lg font-black text-emerald-600 font-mono">
              {stats.todayCompletedCount}
            </span>
          </div>
        </div>

        {/* Section Heading & Filter Tabs */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <span>التوريدات المسندة</span>
            <span className="px-2 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
              {filteredOrders.length}
            </span>
          </h2>

          <div className="flex items-center gap-1 text-[10.5px] bg-slate-200/80 p-0.5 rounded-lg font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 py-0.5 rounded-md transition ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2 py-0.5 rounded-md transition ${
                statusFilter === 'pending' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              بانتظار التوريد
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2 py-0.5 rounded-md transition ${
                statusFilter === 'completed' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              تم التوريد
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-2xs space-y-2">
            <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">لا توجد طلبات في هذه القائمة</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              عندما يسند مدير النظام طلب توريد جديد لحسابك سيظهر هنا فوراً.
            </p>
          </div>
        )}

        {/* Orders Cards List */}
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isCompleted = order.order_status === 'تم التوريد';
            const isOnTheWay = order.order_status === 'في الطريق';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : isOnTheWay
                    ? 'border-sky-300 ring-1 ring-sky-300/40'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Card Header */}
                <div className="p-3.5 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                      {order.order_number || `NB-${order.sequence_num}`}
                    </span>

                    {/* Order Status Badge */}
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        تم التوريد ✓
                      </span>
                    ) : isOnTheWay ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                        <Navigation className="w-3 h-3 text-sky-600 animate-bounce" />
                        في الطريق
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        بانتظار التوريد
                      </span>
                    )}
                  </div>

                  {/* Supply date & time */}
                  <div className="text-[10px] text-slate-400 font-mono text-left">
                    <div>{order.supply_date}</div>
                    <div>{order.supply_time || '08:00'}</div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 space-y-2.5 text-xs">
                  {/* Customer Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">العميل:</div>
                      <div className="text-sm font-bold text-slate-900 leading-tight">
                        {order.customer_name}
                      </div>
                    </div>

                    {/* Direct Call Button */}
                    {order.mobile && (
                      <a
                        href={`tel:${order.mobile}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs active:scale-95 transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>اتصال</span>
                      </a>
                    )}
                  </div>

                  {/* Location & Maps Button */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center justify-between gap-2">
                    <div className="flex items-start gap-1.5 min-w-0">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-slate-400">الموقع:</div>
                        <div className="text-[11px] font-bold text-slate-800 truncate">
                          {order.location || 'الطائف'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenMaps(order)}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[10.5px] font-bold transition active:scale-95 cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-sky-600" />
                      <span>فتح الموقع 📍</span>
                    </button>
                  </div>

                  {/* Supply Specs Grid */}
                  <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50/80 rounded-xl border border-slate-200/50 text-center text-[10.5px]">
                    <div>
                      <span className="text-slate-400 block text-[9.5px]">نوع التوريد</span>
                      <span
                        className={`font-bold inline-block px-1.5 py-0.2 rounded text-[10px] ${
                          order.supply_type === 'تحلية'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {order.supply_type}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[9.5px]">السعة</span>
                      <span className="font-bold text-slate-800">{order.tank_capacity}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[9.5px]">المبلغ</span>
                      <span className="font-bold font-mono text-slate-900 text-[11px]">
                        {order.price} ريال
                      </span>
                      <span className="text-[9px] text-slate-400 block">({order.payment_method})</span>
                    </div>
                  </div>

                  {/* Notes if present */}
                  {order.notes && (
                    <div className="text-[10.5px] text-slate-500 bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                      <span className="font-bold text-amber-800">ملاحظة: </span>
                      {order.notes}
                    </div>
                  )}

                  {/* If Completed: Proof thumbnail and info */}
                  {isCompleted && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {order.delivery_proof_image ? (
                          <div
                            onClick={() => setViewingProofDelivery(order)}
                            className="w-11 h-11 rounded-lg overflow-hidden border border-emerald-300 shrink-0 cursor-pointer group relative"
                          >
                            <img
                              src={order.delivery_proof_image}
                              alt="إثبات التوريد"
                              className="w-full h-full object-cover group-hover:scale-110 transition"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-bold text-emerald-900 block">
                            تم توثيق التوريد بنجاح
                          </span>
                          <span className="text-[10px] text-emerald-700 font-mono">
                            {order.delivery_documented_at || order.delivered_time || 'تم التوثيق'}
                          </span>
                        </div>
                      </div>

                      {order.delivery_proof_image && (
                        <button
                          onClick={() => setViewingProofDelivery(order)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض الصورة</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                {!isCompleted && (
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                    {/* On the way button toggle */}
                    {!isOnTheWay && (
                      <button
                        onClick={() => handleSetOnTheWay(order)}
                        className="px-3 py-2.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <Navigation className="w-3.5 h-3.5 text-sky-600" />
                        <span>في الطريق</span>
                      </button>
                    )}

                    {/* Primary Camera Documentation Button */}
                    <button
                      onClick={() => setDocumentingDelivery(order)}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition cursor-pointer"
                    >
                      <Camera className="w-5 h-5" />
                      <span>📷 توثيق التوريد</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Switcher to Manager Panel */}
        <div className="pt-6 text-center">
          <button
            onClick={() => setActiveTab('home')}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium underline transition cursor-pointer"
          >
            الانتقال إلى لوحة تحكم المدير
          </button>
        </div>
      </main>

      {/* Camera Documentation Modal */}
      {documentingDelivery && (
        <DocumentDeliveryModal
          isOpen={!!documentingDelivery}
          onClose={() => setDocumentingDelivery(null)}
          delivery={documentingDelivery}
        />
      )}

      {/* Full Size Proof Image Viewer Modal */}
      {viewingProofDelivery && (
        <ProofImageModal
          isOpen={!!viewingProofDelivery}
          onClose={() => setViewingProofDelivery(null)}
          delivery={viewingProofDelivery}
        />
      )}
    </div>
  );
};

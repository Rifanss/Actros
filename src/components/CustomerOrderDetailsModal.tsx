import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Phone,
  Droplets,
  Truck,
  MapPin,
  ExternalLink,
  MessageSquare,
  Calendar,
  AlertCircle,
  PlusCircle,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { CustomerOrder } from '../types';
import { useWaterData } from '../context/WaterDataContext';

interface CustomerOrderDetailsModalProps {
  order: CustomerOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onConvertToDelivery?: (order: CustomerOrder) => void;
}

export const CustomerOrderDetailsModal: React.FC<CustomerOrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onConvertToDelivery,
}) => {
  const { updateCustomerOrderStatus } = useWaterData();

  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const orderNumberDisplay = order.order_number.startsWith('N-')
    ? order.order_number
    : `#${order.order_number}`;

  const getWhatsAppMessage = () => {
    const cleanedLocation = (order.location || '')
      .trim()
      .replace(/\s*\(موقعي الفعلي\)\s*/g, '')
      .trim();

    const mapLink =
      order.google_maps_url?.trim() ||
      (cleanedLocation
        ? `https://maps.google.com/?q=${encodeURIComponent(cleanedLocation)}`
        : '');

    let msg =
      `*طلب توريد مياه جديد*\n\n` +
      `- *رقم الطلب* : ${order.order_number}\n` +
      `- *نوع المياه* : ${order.supply_type}\n` +
      `- *سعة الصهريج* : ${order.tank_capacity}\n\n` +
      `- *اسم العميل* : ${order.customer_name}\n` +
      `- *رقم الجوال* : ${order.mobile}\n` +
      `- *الموقع* : ${cleanedLocation}`;

    if (mapLink) {
      msg += `\n\nرابط الموقع على خرائط جوجل : ${mapLink}`;
    }
    return msg;
  };

  const handleShareWhatsApp = () => {
    const text = getWhatsAppMessage();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyMessage = async () => {
    const text = getWhatsAppMessage();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleAccept = () => {
    updateCustomerOrderStatus(order.id, 'مقبول');
  };

  const handleCancel = () => {
    updateCustomerOrderStatus(order.id, 'ملغي');
  };

  const getStatusBadge = () => {
    switch (order.status) {
      case 'مقبول':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>طلب مقبول</span>
          </span>
        );
      case 'ملغي':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>طلب ملغي</span>
          </span>
        );
      case 'بانتظار الموافقة':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>بانتظار الموافقة</span>
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="operations-scope bg-white rounded-xl max-w-sm w-full shadow-xl overflow-hidden border border-slate-200 text-right my-auto max-h-[92vh] flex flex-col"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#03457a] text-white px-3 py-2 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-extrabold text-[12px] leading-tight font-['Tajawal',sans-serif]">
              طلب توريد {orderNumberDisplay}
            </h3>
            <p className="text-[9px] text-sky-200">
              وارد من الموقع • {order.created_date} ({order.created_time})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 space-y-2 overflow-y-auto text-[10px]">
          {/* Status & Timing Banner */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#f8fafc] border border-slate-200/70 min-h-[40px]">
            <div>
              <span className="text-[8.5px] text-slate-500 font-semibold block mb-0.5">حالة الطلب الحالية</span>
              <div>{getStatusBadge()}</div>
            </div>
            <div className="text-left">
              <span className="text-[8.5px] text-slate-500 font-semibold block mb-0.5">وقت التسجيل</span>
              <span className="text-[10px] font-bold text-slate-800 dir-ltr">{order.created_time}</span>
            </div>
          </div>

          {/* If accepted or cancelled timestamps exist */}
          {order.accepted_at && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[9px] text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">تم قبول الطلب في: </span>
                <span className="font-mono">{order.accepted_at}</span>
              </div>
            </div>
          )}

          {order.cancelled_at && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[9px] text-rose-900 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold">تم إلغاء الطلب في: </span>
                <span className="font-mono">{order.cancelled_at}</span>
              </div>
            </div>
          )}

          {/* Customer Information Card */}
          <div className="bg-[#f8fafc] border border-slate-200/70 rounded-lg p-2 space-y-1.5">
            <h4 className="text-[9.5px] font-extrabold text-[#03457a] flex items-center gap-1 border-b border-slate-200/70 pb-1 font-['Tajawal',sans-serif]">
              <User className="w-3 h-3 text-sky-600" />
              <span>بيانات العميل</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-[8.5px] text-slate-400 block font-semibold">اسم العميل</span>
                <span className="font-bold text-slate-900 text-[10.5px]">{order.customer_name}</span>
              </div>

              <div>
                <span className="text-[8.5px] text-slate-400 block font-semibold">رقم الجوال</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="font-mono font-bold text-slate-800 dir-ltr text-[10px]">{order.mobile}</span>
                  <a
                    href={`tel:${order.mobile}`}
                    className="p-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition"
                    title="اتصال هاتفي"
                  >
                    <Phone className="w-2.5 h-2.5" />
                  </a>
                  <a
                    href={`https://wa.me/${order.mobile.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded bg-green-100 hover:bg-green-200 text-green-700 transition"
                    title="محادثة واتساب"
                  >
                    <MessageSquare className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Supply Order Details Card */}
          <div className="bg-[#f8fafc] border border-slate-200/70 rounded-lg p-2 space-y-1.5">
            <h4 className="text-[9.5px] font-extrabold text-[#03457a] flex items-center gap-1 border-b border-slate-200/70 pb-1 font-['Tajawal',sans-serif]">
              <Droplets className="w-3 h-3 text-sky-600" />
              <span>تفاصيل التوريد المطلوب</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-[8.5px] text-slate-400 block font-semibold">نوع التوريد</span>
                <span className="font-bold text-sky-900 flex items-center gap-1">
                  <Droplets className="w-2.5 h-2.5 text-sky-600" />
                  {order.supply_type}
                </span>
              </div>

              <div>
                <span className="text-[8.5px] text-slate-400 block font-semibold">سعة الصهريج</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Truck className="w-2.5 h-2.5 text-sky-600" />
                  {order.tank_capacity}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[8.5px] text-slate-400 block font-semibold">الموقع والعنوان</span>
              <div className="mt-0.5 p-1.5 bg-white rounded-lg border border-slate-200 flex items-start gap-1">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                <span className="text-[9.5px] font-semibold text-slate-800 leading-relaxed">{order.location}</span>
              </div>
            </div>

            {order.google_maps_url && (
              <div className="pt-0.5">
                <a
                  href={order.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[8.5px] text-sky-700 hover:text-sky-900 font-bold bg-sky-50 px-2 py-1 rounded-md border border-sky-200 transition"
                >
                  <MapPin className="w-2.5 h-2.5 text-rose-600" />
                  <span>فتح الموقع في خرائط Google</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}
          </div>

          {/* Action Buttons: Accept and Cancel buttons */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-[8.5px] font-bold text-slate-600 block">إجراءات الإدارة:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {/* زر قبول الطلب */}
              <button
                id="modal-accept-order-btn"
                type="button"
                onClick={handleAccept}
                className={`h-7 px-2 rounded-lg font-bold text-[9.5px] flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs ${
                  order.status === 'مقبول'
                    ? 'bg-emerald-700 text-white ring-1 ring-emerald-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{order.status === 'مقبول' ? 'تم القبول ✓' : 'قبول الطلب'}</span>
              </button>

              {/* زر إلغاء الطلب */}
              <button
                id="modal-cancel-order-btn"
                type="button"
                onClick={handleCancel}
                className={`h-7 px-2 rounded-lg font-bold text-[9.5px] flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs ${
                  order.status === 'ملغي'
                    ? 'bg-rose-700 text-white ring-1 ring-rose-300'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                <XCircle className="w-3 h-3" />
                <span>{order.status === 'ملغي' ? 'تم الإلغاء ✕' : 'إلغاء الطلب'}</span>
              </button>
            </div>

            {/* زر مشاركة الطلب عبر واتساب بصيغة الرسالة الرسمية */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="h-7 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[9.5px] font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs"
                title="إرسال الطلب برسالة واتساب"
              >
                <MessageSquare className="w-3 h-3" />
                <span>واتساب</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="h-7 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[9.5px] font-bold flex items-center justify-center gap-1 transition cursor-pointer border border-slate-200"
                title="نسخ نص الرسالة"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-600" />
                    <span>نسخ الرسالة</span>
                  </>
                )}
              </button>
            </div>

            {/* Optional Convert to Delivery button if accepted */}
            {onConvertToDelivery && (
              <button
                type="button"
                onClick={() => onConvertToDelivery(order)}
                className="w-full h-7 px-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#03457a] text-[9.5px] font-bold flex items-center justify-center gap-1 border border-sky-200 transition cursor-pointer"
              >
                <PlusCircle className="w-3 h-3 text-sky-600" />
                <span>تسجيل كتوريد في السجل</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderDetailsModal;

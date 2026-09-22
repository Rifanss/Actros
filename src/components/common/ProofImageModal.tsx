import React from 'react';
import { X, CheckCircle2, Calendar, Clock, User, MapPin, Truck, ExternalLink, Download } from 'lucide-react';
import { Delivery } from '../../types';

interface ProofImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: Delivery | null;
}

export const ProofImageModal: React.FC<ProofImageModalProps> = ({ isOpen, onClose, delivery }) => {
  if (!isOpen || !delivery) return null;

  const imageUrl = delivery.delivery_proof_image || delivery.attachment?.url;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#03457a] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">إثبات وتوثيق التوريد</h3>
              <p className="text-[10px] text-sky-200 font-mono">
                طلب رقم: {delivery.order_number || `NB-${delivery.sequence_num}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Image Container */}
          <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center min-h-[220px] max-h-[360px] group">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`إثبات توريد للطلب ${delivery.order_number || delivery.sequence_num}`}
                className="w-full h-full object-contain max-h-[360px]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-center p-6 text-slate-400">
                <p className="text-xs">لا توجد صورة إثبات مرفقة لهذا الطلب</p>
              </div>
            )}
            {imageUrl && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1">
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black/70 hover:bg-black text-white text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1 transition backdrop-blur-xs"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>فتح بحجم كامل</span>
                </a>
              </div>
            )}
          </div>

          {/* Delivery Details Summary */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-800 text-sm">{delivery.customer_name}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                تم التوريد
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                <span>السائق: <strong className="text-slate-800">{delivery.driver_name}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                <span>النوع: <strong className="text-slate-800">{delivery.supply_type} ({delivery.tank_capacity})</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                <span>التاريخ: <strong className="text-slate-800 font-mono">{delivery.delivered_date || delivery.supply_date}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                <span>الوقت: <strong className="text-slate-800 font-mono">{delivery.delivered_time || delivery.supply_time || '08:35'}</strong></span>
              </div>
            </div>

            {delivery.location && (
              <div className="flex items-start gap-1.5 pt-1 text-[11px] text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>الموقع: <strong className="text-slate-800">{delivery.location}</strong></span>
              </div>
            )}

            {delivery.notes && (
              <div className="pt-1 text-[10.5px] text-slate-500 border-t border-slate-200">
                <span className="font-bold text-slate-700">ملاحظات:</span> {delivery.notes}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-100/80 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-2xs"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

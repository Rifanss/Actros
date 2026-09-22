import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Droplets,
  Truck,
  MapPin,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import { useWaterData } from '../context/WaterDataContext';
import { CustomerOrder } from '../types';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewOrder?: () => void;
}

// Normalize phone numbers for resilient matching
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('966')) {
    return digits.slice(3);
  }
  if (digits.startsWith('05')) {
    return digits.slice(1);
  }
  return digits;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  onOpenNewOrder,
}) => {
  const { customerOrders } = useWaterData();
  const [mobileInput, setMobileInput] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedMobile, setSearchedMobile] = useState('');
  const [matchingOrders, setMatchingOrders] = useState<CustomerOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Reset search when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmed = mobileInput.trim();
    const digitsOnly = trimmed.replace(/\D/g, '');

    if (!digitsOnly || digitsOnly.length < 8) {
      setError('يرجى إدخال رقم جوال صحيح (مثال: 055XXXXXXX)');
      return;
    }

    setError(null);
    setSearchedMobile(trimmed);
    setHasSearched(true);

    const normInput = normalizePhone(digitsOnly);

    // Filter matching orders
    const matches = customerOrders.filter((order) => {
      const normOrderMobile = normalizePhone(order.mobile);
      return (
        normOrderMobile === normInput ||
        order.mobile.replace(/\D/g, '').includes(digitsOnly) ||
        digitsOnly.includes(order.mobile.replace(/\D/g, ''))
      );
    });

    // Sort newest first
    matches.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setMatchingOrders(matches);
  };

  const handleClose = () => {
    onClose();
  };

  const handleResetSearch = () => {
    setHasSearched(false);
    setMatchingOrders([]);
    setError(null);
    setMobileInput('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-3 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl max-w-sm w-full shadow-xl overflow-hidden border border-slate-200 text-right animate-in zoom-in-95 duration-200"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#03457a] text-white px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">
              <Search className="w-3.5 h-3.5 text-sky-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-[11px] text-white font-['Tajawal',sans-serif] leading-tight">
                متابعة حالة طلبك
              </h3>
              <p className="text-[8.5px] text-sky-200">الاستعلام المباشر برقم الجوال</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-3 space-y-2 text-[10px]">
          {/* Phone Input Form */}
          <form onSubmit={handleSearch} className="space-y-1.5">
            <div>
              <label className="block text-[8.5px] font-semibold text-slate-700 mb-0.5">
                رقم الجوال المسجل به الطلب <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={mobileInput}
                  placeholder="05XXXXXXXX"
                  onChange={(e) => {
                    setMobileInput(e.target.value);
                    if (error) setError(null);
                  }}
                  className={`w-full h-9 text-base bg-slate-50 focus:bg-white text-slate-900 px-3 pl-8 rounded-lg border font-mono text-right ${
                    error
                      ? 'border-rose-400 ring-1 ring-rose-300'
                      : 'border-slate-300 focus:border-[#03457a] focus:ring-1 focus:ring-sky-200'
                  } transition outline-none`}
                  dir="ltr"
                  autoFocus
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {error && (
                <p className="text-[8.5px] text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                  <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                  <span>{error}</span>
                </p>
              )}
            </div>

            <button
              id="submit-track-order-btn"
              type="submit"
              className="w-full h-7 bg-[#03457a] hover:bg-[#023561] active:scale-98 text-white font-bold px-3 rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition cursor-pointer text-[9.5px]"
            >
              <Search className="w-3 h-3" />
              <span>متابعة الطلب</span>
            </button>
          </form>

          {/* Results Area */}
          {hasSearched && (
            <div className="pt-1.5 border-t border-slate-100 space-y-2 max-h-[300px] overflow-y-auto">
              <div className="flex items-center justify-between text-[8.5px]">
                <span className="font-semibold text-slate-500">
                  نتائج البحث عن ({searchedMobile}):
                </span>
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="text-[#03457a] hover:underline font-bold cursor-pointer"
                >
                  بحث برقم آخر
                </button>
              </div>

              {matchingOrders.length === 0 ? (
                /* No Orders Found State */
                <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center space-y-1.5">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-800">
                      لا يوجد طلب مسجل بهذا الرقم
                    </h4>
                    <p className="text-[8.5px] text-slate-500 mt-0.5 leading-relaxed">
                      تأكد من إدخال رقم الجوال المستخدم في الطلب أو تفضل بتقديم طلب جديد الآن.
                    </p>
                  </div>

                  {onOpenNewOrder && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        onOpenNewOrder();
                      }}
                      className="inline-flex items-center gap-1 h-7 px-3 bg-[#03457a] hover:bg-[#023561] text-white rounded-lg text-[9.5px] font-bold transition shadow-2xs cursor-pointer"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>تقديم طلب توريد الآن</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Orders List */
                <div className="space-y-1.5">
                  {matchingOrders.map((order) => {
                    const isPending = order.status === 'بانتظار الموافقة';
                    const isAccepted = order.status === 'مقبول';
                    const isCancelled = order.status === 'ملغي';

                    return (
                      <div
                        key={order.id}
                        className={`p-2 rounded-lg border text-[10px] space-y-1.5 transition ${
                          isPending
                            ? 'bg-amber-50/60 border-amber-200'
                            : isAccepted
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : 'bg-rose-50/40 border-rose-200'
                        }`}
                      >
                        {/* Order Header */}
                        <div className="flex items-center justify-between gap-1 border-b border-slate-200/60 pb-1">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-900 text-[10px]">
                              طلب {order.order_number.startsWith('N-') ? order.order_number : `#${order.order_number}`}
                            </span>
                            <span className="text-[8.5px] text-slate-400">
                              • {order.created_date}
                            </span>
                          </div>

                          {/* Status Badge */}
                          {isPending && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[8.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-2.5 h-2.5 text-amber-600" />
                              <span>بانتظار الموافقة</span>
                            </span>
                          )}
                          {isAccepted && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[8.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              <span>مقبول</span>
                            </span>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[8.5px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <XCircle className="w-2.5 h-2.5 text-rose-600" />
                              <span>ملغي</span>
                            </span>
                          )}
                        </div>

                        {/* Status Message Description */}
                        <div className="rounded-md p-1.5 bg-white/80 border border-slate-200/60 text-[9.5px] leading-relaxed">
                          {isPending && (
                            <p className="text-amber-900 font-medium flex items-start gap-1">
                              <Clock className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                              <span>
                                طلبك قيد المراجعة حالياً وسيتم التواصل معك لتأكيد الموعد بأسرع وقت.
                              </span>
                            </p>
                          )}
                          {isAccepted && (
                            <div className="text-emerald-900 font-medium space-y-0.5">
                              <p className="flex items-start gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                <span>تم قبول طلبك وجاري جدولة الصهريج للتوجه إلى موقعك.</span>
                              </p>
                              {order.accepted_at && (
                                <p className="text-[8.5px] text-emerald-700 font-mono pr-4">
                                  وقت الاعتماد: {order.accepted_at}
                                </p>
                              )}
                            </div>
                          )}
                          {isCancelled && (
                            <div className="text-rose-900 font-medium space-y-0.5">
                              <p className="flex items-start gap-1">
                                <XCircle className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
                                <span>تم إلغاء هذا الطلب. نعتذر عن عدم التمكن من خدمتك في هذا الوقت.</span>
                              </p>
                              {order.cancelled_at && (
                                <p className="text-[8.5px] text-rose-700 font-mono pr-4">
                                  وقت الإلغاء: {order.cancelled_at}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-2 gap-1 text-[9px]">
                          <div className="flex items-center gap-1 text-slate-700">
                            <Droplets className="w-2.5 h-2.5 text-[#03457a] shrink-0" />
                            <span className="truncate">{order.supply_type}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-700">
                            <Truck className="w-2.5 h-2.5 text-[#03457a] shrink-0" />
                            <span>{order.tank_capacity}</span>
                          </div>
                          <div className="col-span-2 flex items-center gap-1 text-slate-600 truncate">
                            <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                            <span className="truncate">{order.location}</span>
                          </div>
                        </div>

                        {/* Order WhatsApp Support Inquiry Action */}
                        <div className="pt-0.5 flex items-center gap-1">
                          <a
                            href={`https://wa.me/966567071399?text=${encodeURIComponent(
                              `السلام عليكم، أود الاستفسار عن حالة طلب التوريد رقم ${order.order_number.startsWith('N-') ? order.order_number : '#' + order.order_number} المسجل باسم ${order.customer_name}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9.5px] flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>استفسار واتساب</span>
                          </a>

                          <a
                            href="tel:0567071399"
                            className="h-7 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[9.5px] flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <Phone className="w-3 h-3 text-slate-600" />
                            <span>اتصال</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer help note */}
        <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-100 text-center">
          <p className="text-[8.5px] text-slate-500 font-medium">
            لأي مساعدة فورية تواصل معنا على الرقم{' '}
            <a href="tel:0567071399" className="text-[#03457a] font-bold underline dir-ltr">
              0567071399
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderModal;

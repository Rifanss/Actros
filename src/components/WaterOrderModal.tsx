import React, { useState } from 'react';
import {
  X,
  AlertCircle,
  MapPin,
  Truck,
  User,
  Phone,
  Send,
  ExternalLink,
  LocateFixed,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GoogleMapPickerModal from './GoogleMapPickerModal';
import { useWaterData } from '../context/WaterDataContext';
import { TankerIllustration } from './TankerIllustration';

interface WaterOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type OrderStage = 1 | 2 | 3;
type WaterType = 'مياه صالحة للشرب' | 'مياه غير صالحة للشرب';

export const WaterOrderModal: React.FC<WaterOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addCustomerOrder } = useWaterData();

  // 3-stage wizard state
  const [step, setStep] = useState<OrderStage>(1);
  const [waterType, setWaterType] = useState<WaterType>('مياه صالحة للشرب');
  const [tankCapacity, setTankCapacity] = useState<string>('18 طن');

  // Customer form details
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // Modals & submission states
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [errors, setErrors] = useState<{
    customerName?: string;
    mobile?: string;
    location?: string;
  }>({});

  if (!isOpen) return null;

  const handleClose = () => {
    setIsSubmitting(false);
    setIsLocatingGps(false);
    setGpsError(null);
    setStep(1);
    onClose();
  };

  // Saudi Mobile Validation Helper
  const validateSaudiPhone = (phone: string): { isValid: boolean; message?: string } => {
    const clean = phone.replace(/[\s\-\(\)]/g, '');
    if (!clean.trim()) {
      return { isValid: false, message: 'يرجى إدخال رقم الجوال' };
    }
    // Accept 05xxxxxxxx, 5xxxxxxxx, +9665xxxxxxxx, 009665xxxxxxxx, 9665xxxxxxxx
    const saudiRegex = /^((\+?966)|00966)?0?5[0-9]{8}$/;
    if (!saudiRegex.test(clean)) {
      return {
        isValid: false,
        message: 'يرجى إدخال رقم جوال سعودي صحيح (مثال: 0512345678)',
      };
    }
    return { isValid: true };
  };

  const normalizeSaudiPhone = (phone: string): string => {
    let clean = phone.replace(/[\s\-\(\)]/g, '');
    if (clean.startsWith('+966')) clean = '0' + clean.slice(4);
    else if (clean.startsWith('00966')) clean = '0' + clean.slice(5);
    else if (clean.startsWith('966')) clean = '0' + clean.slice(3);
    else if (clean.startsWith('5') && clean.length === 9) clean = '0' + clean;
    return clean;
  };

  // Stage 1 Action: Select Water Type and advance to Stage 2
  const handleSelectWaterType = (selectedType: WaterType) => {
    setWaterType(selectedType);
    // Set appropriate default capacity for the chosen type
    if (selectedType === 'مياه صالحة للشرب') {
      if (tankCapacity !== '18 طن' && tankCapacity !== '30 طن') {
        setTankCapacity('18 طن');
      }
    } else {
      if (tankCapacity !== '12 طن' && tankCapacity !== '18 طن' && tankCapacity !== '30 طن') {
        setTankCapacity('12 طن');
      }
    }
    setStep(2);
  };

  // Stage 2 Action: Select Tank Capacity and advance to Stage 3
  const handleSelectCapacity = (capacity: string) => {
    setTankCapacity(capacity);
    setStep(3);
  };

  // Quick GPS Geolocation
  const handleQuickGpsLocate = () => {
    if (!navigator.geolocation) {
      setGpsError('خاصية تحديد الموقع الجغرافي (GPS) غير مدعومة في متصفحك.');
      return;
    }

    setIsLocatingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const cLat = Number(pos.coords.latitude.toFixed(6));
        const cLng = Number(pos.coords.longitude.toFixed(6));
        const mapUrl = `https://www.google.com/maps?q=${cLat},${cLng}`;
        setGoogleMapsUrl(mapUrl);

        let locText = `الموقع الحالي (${cLat}, ${cLng})`;
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3500);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${cLat}&lon=${cLng}&zoom=18&addressdetails=1&accept-language=ar`,
            { signal: controller.signal, headers: { 'User-Agent': 'NabaaApp/1.0' } }
          );
          clearTimeout(timer);
          if (res.ok) {
            const data = await res.json();
            if (data?.address) {
              const district =
                data.address.suburb ||
                data.address.neighbourhood ||
                data.address.quarter ||
                data.address.residential ||
                '';
              const city =
                data.address.city || data.address.town || data.address.state || '';
              const road = data.address.road || '';
              const parts = [city, district, road].filter(Boolean);
              if (parts.length > 0) {
                locText = parts.join(' - ');
              }
            }
          }
        } catch (e) {
          // fallback already assigned
        }

        setLocation(locText);
        setIsLocatingGps(false);
        if (errors.location) {
          setErrors((prev) => ({ ...prev, location: undefined }));
        }
      },
      (err) => {
        setIsLocatingGps(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('يرجى السماح بصلاحية الموقع في المتصفح أو فتح الخريطة لتحديده');
        } else {
          setGpsError('تعذر جلب إحداثيات موقعك حالياً. يرجى الضغط على زر الخريطة');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Stage 3 Action: Submit Complete Order
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors: {
      customerName?: string;
      mobile?: string;
      location?: string;
    } = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'يرجى إدخال اسم العميل';
    }

    const phoneValidation = validateSaudiPhone(mobile);
    if (!phoneValidation.isValid) {
      newErrors.mobile = phoneValidation.message;
    }

    if (!location.trim()) {
      newErrors.location = 'يرجى إدخال الموقع أو تحديده من الخريطة';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const normalizedMobile = normalizeSaudiPhone(mobile);

    try {
      // 1. Save customer order in local system & database
      const newOrder = addCustomerOrder({
        customer_name: customerName.trim(),
        mobile: normalizedMobile,
        supply_type: waterType,
        tank_capacity: tankCapacity,
        location: location.trim(),
        google_maps_url: googleMapsUrl.trim() || undefined,
      });

      const cleanedLocation = location
        .trim()
        .replace(/\s*\(موقعي الفعلي\)\s*/g, '')
        .trim();

      // 2. Prepare pre-filled WhatsApp message matching requested template and spacing
      const mapLink =
        googleMapsUrl.trim() ||
        (cleanedLocation
          ? `https://maps.google.com/?q=${encodeURIComponent(cleanedLocation)}`
          : '');

      let message =
        `*طلب توريد مياه جديد*\n\n` +
        `- *رقم الطلب* : ${newOrder.order_number}\n` +
        `- *نوع المياه* : ${waterType}\n` +
        `- *سعة الصهريج* : ${tankCapacity}\n\n` +
        `- *اسم العميل* : ${customerName.trim()}\n` +
        `- *رقم الجوال* : ${normalizedMobile}\n` +
        `- *الموقع* : ${cleanedLocation}`;

      if (mapLink) {
        message += `\n\nرابط الموقع على خرائط جوجل : ${mapLink}`;
      }

      // 3. Open WhatsApp chat directly with pre-filled message
      const phoneNumber = '966567071399';
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

      window.open(whatsappUrl, '_blank');

      if (onSuccess) {
        onSuccess();
      }

      // Reset form and close
      setCustomerName('');
      setMobile('');
      setLocation('');
      setGoogleMapsUrl('');
      setStep(1);
      handleClose();
    } catch (error) {
      console.error('Error submitting water supply order:', error);
      setIsSubmitting(false);
    }
  };

  const isPotable = waterType === 'مياه صالحة للشرب';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto"
      onClick={handleClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-[440px] sm:max-w-[480px] w-full shadow-2xl overflow-hidden border border-slate-200/90 text-right my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================
            MODAL HEADER: Step Title, Back Button, and Close Button
            ======================================================== */}
        <div className="bg-[#042b57] text-white px-3.5 py-3 sm:px-4 sm:py-3.5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as OrderStage) : 1))}
                className="flex items-center gap-1 text-sky-200 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer active:scale-95"
                title="الرجوع للخطوة السابقة"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>رجوع</span>
              </button>
            )}
            <div>
              <h3 className="font-extrabold text-[11px] font-['Tajawal',sans-serif] text-white leading-tight">
                {step === 1 && 'اختيار نوع المياه'}
                {step === 2 && 'اختيار سعة الصهريج'}
                {step === 3 && 'بيانات العميل والتوصيل'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 flex shrink-0">
          <div
            className={`h-full transition-all duration-300 ${
              step === 1 ? 'w-1/3 bg-[#0066d6]' : step === 2 ? 'w-2/3 bg-[#0066d6]' : 'w-full bg-[#009b32]'
            }`}
          />
        </div>

        {/* ========================================================
            MODAL CONTENT: 3 STAGES
            ======================================================== */}
        <div className="overflow-y-auto p-3 sm:p-4 space-y-2.5">
          <AnimatePresence mode="wait">
            {/* ----------------------------------------------------
                STAGE 1: اختيار نوع المياه (مطابق للصورة الأولى)
                ---------------------------------------------------- */}
            {step === 1 && (
              <motion.div
                key="stage-1-water-type"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                {/* 1. قسم المياه الصالحة للشرب - بتصميم أزرق مطابق 100% للصورة المرفقة */}
                <div
                  onClick={() => handleSelectWaterType('مياه صالحة للشرب')}
                  className="relative overflow-hidden rounded-[22px] sm:rounded-[26px] p-2.5 sm:p-3 transition-all duration-200 hover:shadow-xl group cursor-pointer"
                  style={{
                    background: 'linear-gradient(180deg, #007bf8 0%, #0066ee 50%, #0050d5 100%)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    boxShadow:
                      '0 10px 24px -5px rgba(0, 102, 238, 0.38), inset 0 2px 3px rgba(255, 255, 255, 0.7), inset 0 -2px 3px rgba(0, 0, 0, 0.18)',
                  }}
                >
                  {/* Glossy top-left highlight sheen */}
                  <div
                    className="absolute -top-12 -left-12 w-64 sm:w-80 h-44 sm:h-52 rounded-full pointer-events-none transform -rotate-12"
                    style={{
                      background:
                        'radial-gradient(ellipse at center, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0) 72%)',
                    }}
                  />

                  {/* Truck Image - صهريج مياه صالحة للشرب المطابق 100% */}
                  <div className="relative z-10 flex items-center justify-center px-1 py-1 sm:py-1.5">
                    <TankerIllustration
                      type="potable"
                      className="w-auto h-24 sm:h-32 max-w-[92%] sm:max-w-[88%] object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>

                  {/* Bottom Row: النص في المنتصف */}
                  <div className="relative z-10 flex items-center justify-center w-full pt-1.5 sm:pt-2 px-2 sm:px-3 text-center">
                    <h4
                      className="text-white font-black text-lg sm:text-xl md:text-2xl tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] text-center"
                      dir="rtl"
                    >
                      مياه صالحة للشرب
                    </h4>
                  </div>
                </div>

                {/* 2. قسم المياه غير الصالحة للشرب - بتصميم أخضر مطابق 100% للصورة المرفقة */}
                <div
                  onClick={() => handleSelectWaterType('مياه غير صالحة للشرب')}
                  className="relative overflow-hidden rounded-[22px] sm:rounded-[26px] p-2.5 sm:p-3 transition-all duration-200 hover:shadow-xl group cursor-pointer"
                  style={{
                    background: 'linear-gradient(180deg, #00af3a 0%, #00932c 50%, #007722 100%)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    boxShadow:
                      '0 10px 24px -5px rgba(0, 160, 50, 0.38), inset 0 2px 3px rgba(255, 255, 255, 0.7), inset 0 -2px 3px rgba(0, 0, 0, 0.18)',
                  }}
                >
                  {/* Glossy top-left highlight sheen */}
                  <div
                    className="absolute -top-12 -left-12 w-64 sm:w-80 h-44 sm:h-52 rounded-full pointer-events-none transform -rotate-12"
                    style={{
                      background:
                        'radial-gradient(ellipse at center, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0) 72%)',
                    }}
                  />

                  {/* Truck Image - صهريج مياه غير صالحة للشرب بحجم مطابق لشاحنة مياه التحلية */}
                  <div className="relative z-10 flex items-center justify-center px-1 py-1 sm:py-1.5">
                    <TankerIllustration
                      type="non-potable"
                      className="w-auto h-24 sm:h-32 max-w-[92%] sm:max-w-[88%] object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>

                  {/* Bottom Row: النص في المنتصف */}
                  <div className="relative z-10 flex items-center justify-center w-full pt-1.5 sm:pt-2 px-2 sm:px-3 text-center">
                    <h4
                      className="text-white font-black text-lg sm:text-xl md:text-2xl tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] text-center"
                      dir="rtl"
                    >
                      مياه غير صالحة للشرب
                    </h4>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ----------------------------------------------------
                STAGE 2: اختيار سعة الصهريج (مطابق للصورة الثانية)
                ---------------------------------------------------- */}
            {step === 2 && (
              <motion.div
                key="stage-2-capacity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                {/* البطاقة العلوية للسعة باللون الأزرق أو الأخضر مع صورة الصهريج في الأعلى */}
                <div
                  className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] p-3 sm:p-4 transition-all duration-200 shadow-xl"
                  style={{
                    background: isPotable
                      ? 'linear-gradient(180deg, #008efc 0%, #0070ea 50%, #005bd4 100%)'
                      : 'linear-gradient(180deg, #00b83e 0%, #009930 50%, #007c24 100%)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    boxShadow: isPotable
                      ? '0 14px 30px -6px rgba(0, 102, 214, 0.4), inset 0 2px 2px rgba(255, 255, 255, 0.65), inset 0 -2px 3px rgba(0, 0, 0, 0.18)'
                      : '0 14px 30px -6px rgba(0, 153, 48, 0.4), inset 0 2px 2px rgba(255, 255, 255, 0.65), inset 0 -2px 3px rgba(0, 0, 0, 0.18)',
                  }}
                >
                  {/* Glossy top-left highlight sheen */}
                  <div
                    className="absolute top-0 left-0 w-3/4 h-full pointer-events-none"
                    style={{
                      background:
                        'radial-gradient(ellipse at 15% 15%, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.12) 42%, rgba(255,255,255,0) 70%)',
                    }}
                  />

                  {/* نوع المياه المختار */}
                  <div className="relative z-10 flex items-center justify-between pb-1">
                    <span className="text-[11px] font-bold text-white/90 bg-black/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      {waterType}
                    </span>
                    <span className="text-[10px] text-white/80">اختر السعة المناسبة:</span>
                  </div>

                  {/* صورة الصهريج في أعلى النافذة */}
                  <div className="relative z-10 flex items-center justify-center py-2 sm:py-3">
                    <TankerIllustration
                      type={isPotable ? 'potable' : 'non-potable'}
                      className="w-auto h-24 sm:h-32 max-w-[88%] object-contain drop-shadow-lg"
                    />
                  </div>

                  {/* أزرار السعات أسفل الصهريج - مطابقة للصورة الثانية */}
                  <div className="relative z-10 pt-2 pb-1">
                    {isPotable ? (
                      /* مياه صالحة للشرب: 18 طن و 30 طن */
                      <div className="grid grid-cols-2 gap-3 max-w-[320px] mx-auto">
                        <button
                          type="button"
                          onClick={() => handleSelectCapacity('18 طن')}
                          className="bg-white hover:bg-slate-50 active:scale-95 text-[#0066d6] font-black text-sm sm:text-base py-2.5 px-4 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
                        >
                          18 طن
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectCapacity('30 طن')}
                          className="bg-white hover:bg-slate-50 active:scale-95 text-[#0066d6] font-black text-sm sm:text-base py-2.5 px-4 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
                        >
                          30 طن
                        </button>
                      </div>
                    ) : (
                      /* مياه غير صالحة للشرب: 12 طن و 18 طن و 30 طن */
                      <div className="grid grid-cols-3 gap-2 max-w-[360px] mx-auto">
                        <button
                          type="button"
                          onClick={() => handleSelectCapacity('12 طن')}
                          className="bg-white hover:bg-slate-50 active:scale-95 text-[#008e2f] font-black text-xs sm:text-sm py-2.5 px-2 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
                        >
                          12 طن
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectCapacity('18 طن')}
                          className="bg-white hover:bg-slate-50 active:scale-95 text-[#008e2f] font-black text-xs sm:text-sm py-2.5 px-2 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
                        >
                          18 طن
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectCapacity('30 طن')}
                          className="bg-white hover:bg-slate-50 active:scale-95 text-[#008e2f] font-black text-xs sm:text-sm py-2.5 px-2 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
                        >
                          30 طن
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 text-center font-medium">
                  اضغط على السعة المطلوبة للانتقال لتسجيل بيانات الطلب
                </p>
              </motion.div>
            )}

            {/* ----------------------------------------------------
                STAGE 3: بيانات العميل وتأكيد الطلب
                ---------------------------------------------------- */}
            {step === 3 && (
              <motion.div
                key="stage-3-customer-info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-2"
              >
                {/* ملخص الاختيارين السابقين (نوع المياه + السعة) مع إمكانية التعديل */}
                <div
                  className={`p-2 rounded-lg border flex items-center justify-between ${
                    isPotable
                      ? 'bg-sky-50/80 border-sky-200 text-sky-950'
                      : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0 ${
                        isPotable ? 'bg-[#0066d6]' : 'bg-[#009b32]'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold flex items-center gap-1">
                        <span>{waterType}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white font-bold shadow-2xs">
                          {tankCapacity}
                        </span>
                      </div>
                      <span className="text-[9.5px] text-slate-500">تم اختيار نوع المياه والسعة بنجاح</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-[10px] font-bold text-slate-600 hover:text-slate-900 underline px-1 cursor-pointer"
                  >
                    تغيير
                  </button>
                </div>

                {/* نموذج بيانات العميل */}
                <form onSubmit={handleSubmit} className="space-y-2">
                  {/* 1. اسم العميل */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      اسم العميل <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customerName}
                        placeholder="أدخل اسمك الكريم"
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (errors.customerName) {
                            setErrors((prev) => ({ ...prev, customerName: undefined }));
                          }
                        }}
                        className={`w-full h-9 text-base bg-slate-50/70 focus:bg-white text-slate-900 px-3 pl-8 rounded-lg border ${
                          errors.customerName
                            ? 'border-rose-400 ring-1 ring-rose-300'
                            : 'border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200'
                        } transition outline-none`}
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {errors.customerName && (
                      <p className="text-[10px] text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.customerName}</span>
                      </p>
                    )}
                  </div>

                  {/* 2. رقم الجوال مع التحقق من صحة رقم الجوال السعودي */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      رقم الجوال <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={mobile}
                        placeholder="05XXXXXXXX"
                        onChange={(e) => {
                          setMobile(e.target.value);
                          if (errors.mobile) {
                            setErrors((prev) => ({ ...prev, mobile: undefined }));
                          }
                        }}
                        className={`w-full h-9 text-base bg-slate-50/70 focus:bg-white text-slate-900 px-3 pl-8 rounded-lg border font-mono text-right ${
                          errors.mobile
                            ? 'border-rose-400 ring-1 ring-rose-300'
                            : 'border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200'
                        } transition outline-none`}
                        dir="ltr"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {errors.mobile && (
                      <p className="text-[10px] text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.mobile}</span>
                      </p>
                    )}
                  </div>

                  {/* 3. الموقع مع إمكانية التحديد من الخريطة ونظام GPS */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      الموقع والتوصيل <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={location}
                        placeholder="الحي، الشارع أو حدد من الخريطة"
                        onChange={(e) => {
                          setLocation(e.target.value);
                          if (errors.location) {
                            setErrors((prev) => ({ ...prev, location: undefined }));
                          }
                          if (gpsError) {
                            setGpsError(null);
                          }
                        }}
                        className={`w-full h-9 text-base bg-slate-50/70 focus:bg-white text-slate-900 px-3 pl-[110px] rounded-lg border ${
                          errors.location
                            ? 'border-rose-400 ring-1 ring-rose-300'
                            : 'border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200'
                        } transition outline-none`}
                      />

                      {/* أدوات الخريطة و GPS السريعة */}
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleQuickGpsLocate}
                          disabled={isLocatingGps}
                          className="px-2 py-1 h-7 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer disabled:opacity-60"
                          title="تحديد موقعي الفعلي الحالي عبر GPS فوراً"
                        >
                          <LocateFixed className={`w-3 h-3 ${isLocatingGps ? 'animate-spin' : ''}`} />
                          <span>{isLocatingGps ? 'جارٍ...' : 'موقعي'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsMapPickerOpen(true)}
                          className="px-2 py-1 h-7 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                          title="تحديد الموقع عبر خرائط Google"
                        >
                          <MapPin className="w-3 h-3 text-rose-200" />
                          <span>الخريطة</span>
                        </button>
                      </div>
                    </div>

                    {/* GPS Feedback error if any */}
                    {gpsError && (
                      <p className="text-[10px] text-amber-700 font-semibold mt-0.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{gpsError}</span>
                      </p>
                    )}

                    {/* Selected Google Maps feedback badge */}
                    {googleMapsUrl && (
                      <div className="mt-1 p-1 px-2.5 bg-emerald-50 border border-emerald-200 rounded-md flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1 text-emerald-800 font-bold truncate">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">تم تثبيت إحداثيات موقعك عبر خرائط Google</span>
                        </div>
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-0.5 underline shrink-0 mr-1"
                        >
                          <span>معاينة</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {errors.location && (
                      <p className="text-[10px] text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.location}</span>
                      </p>
                    )}
                  </div>

                  {/* زر تأكيد الطلب */}
                  <div className="pt-1">
                    <button
                      id="submit-water-order-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full font-bold h-9 sm:h-9.5 px-3 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs text-white disabled:opacity-75 ${
                        isPotable
                          ? 'bg-[#0066d6] hover:bg-[#0052b3] shadow-blue-500/20'
                          : 'bg-[#009b32] hover:bg-[#008028] shadow-emerald-500/20'
                      } active:scale-98`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>جاري تسجيل الطلب والتحويل لواتساب...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 rotate-180" />
                          <span>تأكيد الطلب</span>
                        </>
                      )}
                    </button>

                    <p className="text-[9.5px] text-slate-400 text-center mt-1">
                      سيتم تسجيل وتثبيت طلبك فوراً وتحويلك إلى واتساب الطلبات المعتمد (<span className="font-mono font-bold text-emerald-600 dir-ltr">0567071399</span>)
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Google Maps Location Picker Modal */}
      <GoogleMapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        initialLocation={location}
        onSelectLocation={(data) => {
          setLocation(data.formattedLocation);
          setGoogleMapsUrl(data.googleMapsUrl);
          if (errors.location) {
            setErrors((prev) => ({ ...prev, location: undefined }));
          }
        }}
      />
    </div>
  );
};

export default WaterOrderModal;


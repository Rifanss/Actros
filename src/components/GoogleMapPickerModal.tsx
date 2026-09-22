import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  MapPin,
  Navigation,
  Search,
  ExternalLink,
  Check,
  LocateFixed,
  Compass,
  AlertCircle,
  Copy,
  CheckCircle2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface GoogleMapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocation?: string;
  initialCoordinates?: { lat: number; lng: number };
  onSelectLocation: (data: {
    address: string;
    lat: number;
    lng: number;
    googleMapsUrl: string;
    formattedLocation: string;
  }) => void;
}

// Popular districts and areas in Taif with accurate coordinates
const POPULAR_AREAS: { name: string; city: string; lat: number; lng: number }[] = [
  { name: 'حي الحوية', city: 'الطائف', lat: 21.4167, lng: 40.4950 },
  { name: 'حي شهار', city: 'الطائف', lat: 21.2505, lng: 40.4105 },
  { name: 'حي الوسام', city: 'الطائف', lat: 21.2415, lng: 40.3872 },
  { name: 'حي الردف', city: 'الطائف', lat: 21.2290, lng: 40.4180 },
  { name: 'حي الفيصلية', city: 'الطائف', lat: 21.2820, lng: 40.4250 },
  { name: 'حي السداد', city: 'الطائف', lat: 21.2380, lng: 40.4050 },
  { name: 'حي قروى', city: 'الطائف', lat: 21.2720, lng: 40.4120 },
  { name: 'حي شبرا', city: 'الطائف', lat: 21.2870, lng: 40.4200 },
  { name: 'حي المثناة', city: 'الطائف', lat: 21.2610, lng: 40.3890 },
  { name: 'حي القيم', city: 'الطائف', lat: 21.3650, lng: 40.4700 },
  { name: 'حي وادي وج', city: 'الطائف', lat: 21.2780, lng: 40.4150 },
  { name: 'حي مسرة', city: 'الطائف', lat: 21.2950, lng: 40.4050 },
  { name: 'الهدا', city: 'الطائف', lat: 21.3550, lng: 40.2850 },
  { name: 'الشفا', city: 'الطائف', lat: 21.0850, lng: 40.3200 },
  { name: 'حي الجال', city: 'الطائف', lat: 21.3050, lng: 40.4350 },
  { name: 'حي السيل الكبير', city: 'الطائف', lat: 21.6150, lng: 40.4250 },
];

export const GoogleMapPickerModal: React.FC<GoogleMapPickerModalProps> = ({
  isOpen,
  onClose,
  initialLocation = '',
  initialCoordinates,
  onSelectLocation,
}) => {
  // Default coordinates: Taif center (or initial coordinates)
  const [lat, setLat] = useState<number>(initialCoordinates?.lat || 21.2854);
  const [lng, setLng] = useState<number>(initialCoordinates?.lng || 40.4244);
  const [zoom, setZoom] = useState<number>(15);
  const [addressInput, setAddressInput] = useState<string>(initialLocation);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isGpsLocated, setIsGpsLocated] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Handle GPS Current Location via Geolocation API
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('خاصية تحديد الموقع الجغرافي (GPS) غير مدعومة في متصفحك.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentLat = Number(position.coords.latitude.toFixed(6));
        const currentLng = Number(position.coords.longitude.toFixed(6));
        setLat(currentLat);
        setLng(currentLng);
        setZoom(16);
        setIsLocating(false);
        setIsGpsLocated(true);

        // Try reverse geocoding to retrieve readable address/district
        let readableAddress = `الموقع الحالي (${currentLat}, ${currentLng})`;
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3500);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLat}&lon=${currentLng}&zoom=18&addressdetails=1&accept-language=ar`,
            { signal: controller.signal, headers: { 'User-Agent': 'NabaaWaterSupply/1.0' } }
          );
          clearTimeout(timer);
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const district = data.address.suburb || data.address.neighbourhood || data.address.quarter || data.address.residential || '';
              const city = data.address.city || data.address.town || data.address.municipality || data.address.state || '';
              const road = data.address.road || '';
              const parts = [city, district, road].filter(Boolean);
              if (parts.length > 0) {
                readableAddress = parts.join(' - ');
              }
            }
          }
        } catch (e) {
          // Graceful fallback already assigned
        }

        setAddressInput(readableAddress);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('يرجى السماح بصلاحية الوصول للموقع في المتصفح لتحديد موقعك الفعلي تلقائياً.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError('تعذر جلب إحداثيات الموقع حالياً. تأكد من تشغيل الـ GPS أو حدد موقعك على الخريطة.');
        } else {
          setLocationError('انتهت مهلة البحث عن الموقع. اضغط على زر تحديد موقعي لإعادة المحاولة.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Parse initial location or auto-detect user actual location on modal open
  useEffect(() => {
    if (!isOpen) {
      setIsGpsLocated(false);
      return;
    }

    if (initialCoordinates) {
      setLat(initialCoordinates.lat);
      setLng(initialCoordinates.lng);
      return;
    }

    if (initialLocation) {
      setAddressInput(initialLocation);
      const coordMatch = initialLocation.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
      if (coordMatch) {
        const parsedLat = parseFloat(coordMatch[1]);
        const parsedLng = parseFloat(coordMatch[2]);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          setLat(parsedLat);
          setLng(parsedLng);
          return;
        }
      }
    }

    // Auto-detect actual location immediately upon opening without requiring manual search
    handleGetCurrentLocation();
  }, [isOpen]);

  // Filtered areas for quick selection
  const filteredAreas = useMemo(() => {
    if (!searchQuery.trim()) return POPULAR_AREAS.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return POPULAR_AREAS.filter(
      (a) => a.name.toLowerCase().includes(q) || a.city.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Google Maps URL
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  // Live embed iframe URL with responsive query
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed&hl=ar`;

  // Handle manual coordinate or link paste
  const handlePastedSearch = (value: string) => {
    setSearchQuery(value);
    // Check if user pasted a Google Maps URL containing coordinates
    const urlCoordMatch = value.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                          value.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                          value.match(/(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/);
    if (urlCoordMatch) {
      const parsedLat = parseFloat(urlCoordMatch[1]);
      const parsedLng = parseFloat(urlCoordMatch[2]);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setLat(parsedLat);
        setLng(parsedLng);
        setZoom(16);
        setAddressInput(`موقع محدد (${parsedLat}, ${parsedLng})`);
        setLocationError(null);
      }
    }
  };

  // Select a preset area
  const handleSelectArea = (area: typeof POPULAR_AREAS[0]) => {
    setLat(area.lat);
    setLng(area.lng);
    setZoom(15);
    setAddressInput(`${area.city} - ${area.name}`);
    setLocationError(null);
  };

  // Handle Map Pin Movement / Fine-tuning
  const handleNudge = (dLat: number, dLng: number) => {
    setLat((prev) => Number((prev + dLat).toFixed(6)));
    setLng((prev) => Number((prev + dLng).toFixed(6)));
  };

  // Confirm selection
  const handleConfirm = () => {
    const finalAddress = addressInput.trim() || `موقع على الخريطة [${lat}, ${lng}]`;
    const formattedLocation = `${finalAddress} (${lat}, ${lng})`;

    onSelectLocation({
      address: finalAddress,
      lat,
      lng,
      googleMapsUrl,
      formattedLocation,
    });
    onClose();
  };

  // Copy Google Maps Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(googleMapsUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-3 overflow-y-auto font-sans text-right animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[94vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#03457a] text-white px-3 py-1.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">
              <MapPin className="w-3.5 h-3.5 text-rose-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-[11px] font-['Tajawal',sans-serif] leading-tight text-white">
                  تحديد الموقع عبر خرائط Google
                </h3>
                <span className="text-[8.5px] font-bold px-1 rounded bg-sky-400/20 text-sky-200 border border-sky-300/30">
                  Google Maps
                </span>
              </div>
              <p className="text-[8.5px] text-sky-200">
                حدد موقع خزان العميل لتسهيل وصول صهريج المياه بدقة
              </p>
            </div>
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

        {/* Body Container */}
        <div className="p-2.5 sm:p-3 overflow-y-auto space-y-2 text-[10px]">
          {/* Action Bar: Current Location (GPS) & Search */}
          <div className="space-y-1.5">
            {/* GPS Detection Status Highlights */}
            {isLocating && (
              <div className="p-2 bg-sky-50 border border-sky-300 rounded-lg flex items-center gap-2 text-[10px] text-sky-900 animate-pulse">
                <LocateFixed className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
                <div>
                  <p className="font-bold text-sky-950 text-[10px]">جارٍ تحديد موقعك الفعلي الحالي عبر GPS...</p>
                  <p className="text-[8.5px] text-sky-700">يتم جلب موقعك بدقة دون الحاجة للبحث في الخريطة</p>
                </div>
              </div>
            )}

            {isGpsLocated && !isLocating && (
              <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 text-[10px] text-emerald-950 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[10px] text-emerald-900">تم تحديد موقعك:</span>
                      <span className="text-[8.5px] px-1 rounded bg-emerald-200/80 text-emerald-900 font-mono font-bold dir-ltr">
                        {lat.toFixed(5)}, {lng.toFixed(5)}
                      </span>
                    </div>
                    <p className="text-[8.5px] text-emerald-800 font-semibold truncate max-w-[240px]">
                      {addressInput || 'موقعك الفعلي الحالي'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-lg font-bold text-[9.5px] flex items-center justify-center gap-1 shadow-2xs transition cursor-pointer shrink-0"
                >
                  <Check className="w-3 h-3" />
                  <span>اعتماد موقعي</span>
                </button>
              </div>
            )}

            {/* GPS Locate Button & External Google Maps */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="flex-1 h-7 flex items-center justify-center gap-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-[9.5px] font-bold rounded-lg shadow-2xs transition cursor-pointer disabled:opacity-60"
              >
                {isLocating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جارٍ التقاط موقعك عبر GPS...</span>
                  </>
                ) : (
                  <>
                    <LocateFixed className="w-3.5 h-3.5 text-emerald-100" />
                    <span>تحديد موقعي الفعلي الحالي الآن (GPS)</span>
                  </>
                )}
              </button>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-7 flex items-center justify-center gap-1 px-2.5 bg-sky-50 hover:bg-sky-100 text-[#03457a] border border-sky-200 rounded-lg text-[9.5px] font-bold transition cursor-pointer shrink-0"
              >
                <span>خرائط Google</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Error Message if GPS blocked */}
            {locationError && (
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-1.5 text-[9px] text-amber-800">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{locationError}</span>
              </div>
            )}

            {/* Search Box / Paste Coordinates or Maps Link */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                placeholder="ابحث باسم الحي أو الصق رابط خرائط جوجل أو الإحداثيات..."
                onChange={(e) => handlePastedSearch(e.target.value)}
                className="w-full h-9 bg-slate-50 focus:bg-white text-slate-800 text-base px-3 pr-9 pl-3 rounded-lg border border-slate-300 focus:border-[#03457a] outline-none transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Popular Neighborhoods Quick Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[9.5px] no-scrollbar">
              <span className="text-[8.5px] font-bold text-slate-400 shrink-0 flex items-center gap-0.5">
                <Compass className="w-2.5 h-2.5 text-[#03457a]" />
                أحياء شائعة:
              </span>
              {filteredAreas.map((area) => {
                const isSelected = Math.abs(lat - area.lat) < 0.005 && Math.abs(lng - area.lng) < 0.005;
                return (
                  <button
                    key={`${area.city}-${area.name}`}
                    type="button"
                    onClick={() => handleSelectArea(area)}
                    className={`px-1.5 py-0.5 rounded-md shrink-0 font-medium transition cursor-pointer border ${
                      isSelected
                        ? 'bg-[#03457a] text-white border-[#03457a] shadow-2xs font-bold'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {area.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Map Display */}
          <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-inner bg-slate-100 h-56 sm:h-64">
            {/* Google Maps Embedded iframe */}
            <iframe
              title="Google Map Location Preview"
              src={embedUrl}
              className="w-full h-full border-0 pointer-events-auto"
              loading="lazy"
              referrerPolicy="no-referrer"
            />

            {/* Map Center Target Overlay Pin */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative -mt-5 flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border border-white animate-bounce">
                  <MapPin className="w-3.5 h-3.5 fill-white" />
                </div>
                <div className="w-2 h-0.5 bg-black/40 rounded-full blur-[1px]" />
                <span className="mt-0.5 px-1.5 py-0.2 rounded bg-slate-900/80 text-white text-[8px] font-bold tracking-tight shadow">
                  موقع التوريد المعتمد
                </span>
              </div>
            </div>

            {/* Map Controls (Zoom & Fine-tune adjustments) */}
            <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(z + 1, 19))}
                className="w-6 h-6 bg-white/95 hover:bg-white text-slate-700 rounded-md shadow border border-slate-200 flex items-center justify-center transition cursor-pointer"
                title="تكبير الخريطة"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(z - 1, 9))}
                className="w-6 h-6 bg-white/95 hover:bg-white text-slate-700 rounded-md shadow border border-slate-200 flex items-center justify-center transition cursor-pointer"
                title="تصغير الخريطة"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
            </div>

            {/* Micro Nudge Controls for exact pin placement */}
            <div className="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur-xs p-0.5 rounded-md shadow border border-slate-200 text-[9px] text-slate-600 flex items-center gap-0.5 z-10">
              <span className="font-bold px-0.5 text-[8px]">ضبط:</span>
              <button
                type="button"
                onClick={() => handleNudge(0.0005, 0)}
                className="px-1 py-0.2 bg-slate-100 hover:bg-slate-200 rounded font-bold"
                title="تحريك شمالاً"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => handleNudge(-0.0005, 0)}
                className="px-1 py-0.2 bg-slate-100 hover:bg-slate-200 rounded font-bold"
                title="تحريك جنوباً"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => handleNudge(0, 0.0005)}
                className="px-1 py-0.2 bg-slate-100 hover:bg-slate-200 rounded font-bold"
                title="تحريك شرقاً"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => handleNudge(0, -0.0005)}
                className="px-1 py-0.2 bg-slate-100 hover:bg-slate-200 rounded font-bold"
                title="تحريك غرباً"
              >
                →
              </button>
            </div>
          </div>

          {/* Location Description Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
              اسم وتفاصيل الموقع أو الحي
            </label>
            <input
              type="text"
              value={addressInput}
              placeholder="مثال: الطائف - حي الوسام بجوار المسجد"
              onChange={(e) => setAddressInput(e.target.value)}
              className="w-full h-9 bg-slate-50 focus:bg-white text-slate-800 text-base px-3 rounded-lg border border-slate-300 focus:border-[#03457a] outline-none transition"
            />
          </div>

          {/* Coordinates and Link Summary Card */}
          <div className="p-2 bg-[#f8fafc] border border-slate-200/70 rounded-lg flex items-center justify-between text-[10px] min-h-[40px]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-[#03457a] font-bold">
                <Navigation className="w-3 h-3 text-[#03457a]" />
                <span className="text-[8.5px]">الإحداثيات المحددة:</span>
                <span className="font-mono text-[9.5px] text-slate-800 dir-ltr font-bold">
                  {lat.toFixed(5)}, {lng.toFixed(5)}
                </span>
              </div>
              <p className="text-[8.5px] text-slate-500">
                جاهز لربطه بمسار الملاحة الفورية لسائق الصهريج
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="h-7 flex items-center gap-1 px-2 bg-white hover:bg-sky-50 text-[#03457a] border border-sky-200 rounded-lg text-[9px] font-bold transition cursor-pointer shrink-0"
              title="نسخ رابط خرائط قوقل"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-7 px-3 bg-white hover:bg-slate-100 text-slate-700 text-[9.5px] font-semibold rounded-lg border border-slate-200 transition cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 h-7 flex items-center justify-center gap-1.5 px-3 bg-[#03457a] hover:bg-[#023561] active:scale-[0.99] text-white text-[9.5px] font-bold rounded-lg shadow-2xs transition cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>تأكيد واعتماد هذا الموقع للتوريد</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapPickerModal;

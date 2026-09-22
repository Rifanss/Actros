import React, { useState, useEffect, useRef } from 'react';
import { useWaterData } from '../context/WaterDataContext';
import { SupplyType, TankCapacity, PaymentMethod, Attachment } from '../types';
import { generateCustomerIdentifier, formatCustomerIdentifier } from '../utils/customerUtils';
import TruckIcon from './TruckIcon';
import GoogleMapPickerModal from './GoogleMapPickerModal';
import { scrollToTop, useScrollToTop } from '../utils/scrollUtils';
import {
  User,
  Hash,
  Phone,
  MapPin,
  ListFilter,
  CreditCard,
  Calendar,
  Coins,
  Upload,
  UserCheck,
  Save,
  History,
  FileCheck,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Truck,
} from 'lucide-react';
import { getTodayDateString } from '../data/initialData';

export const SupplyCardForm: React.FC = () => {
  const {
    drivers,
    vehicles,
    priceConfig,
    addDelivery,
    setActiveTab,
    findCustomerByPhoneOrIdentifier,
    customers,
    selectedCustomerForRecord,
    generateNewCustomerIdentifier,
  } = useWaterData();

  // Guarantee form starts at top (0, 0) on mount
  useScrollToTop();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerIdentifier, setCustomerIdentifier] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [supplyType, setSupplyType] = useState<SupplyType>('تحلية');
  const [tankCapacity, setTankCapacity] = useState<TankCapacity>('30 طن');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('كاش');
  const [price, setPrice] = useState<number>(300);
  const [supplyDate, setSupplyDate] = useState<string>(getTodayDateString());
  const [driverId, setDriverId] = useState<string>(drivers[0]?.id || 'drv-1');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [notes, setNotes] = useState('');

  // Handle driver change with auto vehicle and supply type matching
  const handleDriverChange = (newDriverId: string) => {
    setDriverId(newDriverId);
    const drv = drivers.find((d) => d.id === newDriverId);
    if (drv) {
      const veh = vehicles.find((v) => v.id === drv.vehicle_id || v.assigned_driver_id === drv.id);
      if (veh) {
        setTankCapacity(veh.tank_capacity);
        if (veh.name.includes('آبار') || veh.notes?.includes('آبار') || drv.vehicle.includes('آبار')) {
          setSupplyType('آبار');
        } else if (veh.name.includes('تحلية') || veh.notes?.includes('تحلية') || drv.vehicle.includes('تحلية')) {
          setSupplyType('تحلية');
        }
      }
    }
  };

  // UI status states
  const [isCustomerFound, setIsCustomerFound] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-calculate default price when supply type or capacity changes
  useEffect(() => {
    const key = `${supplyType}_${tankCapacity.replace(' طن', '')}` as keyof typeof priceConfig;
    if (priceConfig[key]) {
      setPrice(priceConfig[key]);
    }
  }, [supplyType, tankCapacity, priceConfig]);

  // Pre-fill if a customer was selected from Customers section
  useEffect(() => {
    if (selectedCustomerForRecord) {
      setCustomerName(selectedCustomerForRecord.customer_name);
      setCustomerIdentifier(selectedCustomerForRecord.customer_identifier || '');
      setMobile(selectedCustomerForRecord.mobile || '');
      setLocation(selectedCustomerForRecord.location || '');
      setIsCustomerFound(true);
    }
  }, [selectedCustomerForRecord]);

  // Auto-lookup existing customer when phone or identifier changes
  const handleMobileOrIdLookup = (value: string, field: 'mobile' | 'identifier') => {
    if (field === 'mobile') setMobile(value);
    if (field === 'identifier') setCustomerIdentifier(value);

    if (value.trim().length >= 4) {
      const match = findCustomerByPhoneOrIdentifier(value.trim());
      if (match) {
        setCustomerName(match.customer_name);
        if (field === 'mobile' && match.customer_identifier) {
          setCustomerIdentifier(match.customer_identifier);
        }
        if (field === 'identifier' && match.mobile) {
          setMobile(match.mobile);
        }
        if (match.location) {
          setLocation(match.location);
        }
        setIsCustomerFound(true);
        return;
      }
    }
    setIsCustomerFound(false);
  };

  // Quick select customer from suggestions
  const handleSelectCustomer = (cust: typeof customers[0]) => {
    setCustomerName(cust.customer_name);
    setCustomerIdentifier(cust.customer_identifier);
    setMobile(cust.mobile);
    setLocation(cust.location);
    if (cust.assigned_driver) {
      const matchDrv = drivers.find((d) => d.driver_name === cust.assigned_driver);
      if (matchDrv) {
        handleDriverChange(matchDrv.id);
      }
    }
    if (tankCapacity === '18 طن' && cust.agreed_price_18) {
      setPrice(cust.agreed_price_18);
    } else if (tankCapacity === '30 طن' && cust.agreed_price_30) {
      setPrice(cust.agreed_price_30);
    }
    setIsCustomerFound(true);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setValidationError('حجم الملف المرفق كبير جداً، الحد الأقصى 10 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const isImage = file.type.startsWith('image/');
      setAttachment({
        name: file.name,
        type: isImage ? 'image' : 'document',
        url: reader.result as string,
        size: file.size,
      });
      setValidationError(null);
    };
    reader.readAsDataURL(file);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    // Validation
    if (!customerName.trim()) {
      setValidationError('يرجى كتابة اسم العميل');
      return;
    }
    if (!mobile.trim()) {
      setValidationError('يرجى كتابة رقم الجوال');
      return;
    }
    if (!location.trim()) {
      setValidationError('يرجى تحديد موقع التوريد');
      return;
    }
    if (!price || price <= 0) {
      setValidationError('يرجى تحديد سعر التوريد');
      return;
    }

    const selectedDriver = drivers.find((d) => d.id === driverId) || drivers[0];

    const result = addDelivery({
      customer_name: customerName.trim(),
      customer_identifier: customerIdentifier.trim()
        ? formatCustomerIdentifier(customerIdentifier.trim(), customers)
        : generateNewCustomerIdentifier(),
      mobile: mobile.trim(),
      location: location.trim(),
      supply_type: supplyType,
      tank_capacity: tankCapacity,
      price: Number(price),
      payment_method: paymentMethod,
      supply_date: supplyDate,
      driver_id: selectedDriver.id,
      driver_name: selectedDriver.driver_name,
      attachment,
      notes: notes.trim(),
    });

    if (result.success) {
      setSuccessMessage('تم حفظ كرت التوريد بنجاح وربطه بالعميل والسائق وتحديث التقارير!');
      // Scroll to top
      scrollToTop(true);

      // Reset form fields after 2.5 seconds or keep customer for multi-delivery
      setTimeout(() => {
        setCustomerName('');
        setCustomerIdentifier('');
        setMobile('');
        setLocation('');
        setAttachment(null);
        setNotes('');
        setIsCustomerFound(false);
        setSuccessMessage(null);
      }, 3000);
    } else {
      setValidationError(result.message);
    }
  };

  return (
    <div className="operations-scope max-w-3xl mx-auto px-2 sm:px-3 pb-16 space-y-2.5">
      {/* ========================================================
          CARD TOP HEADER (Matching Image 2)
          "كرت التوريد / معلومات التوريد والخدمة"
          Left: "شركاء في استمرارية العملاء"
          ======================================================== */}
      <div className="bg-gradient-to-l from-[#023561] to-[#044c85] text-white p-2.5 sm:p-3 rounded-xl shadow-xs border-b border-sky-400/30 flex items-center justify-between">
        {/* Right side: Truck icon + Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-8 sm:w-12 sm:h-9 bg-white/15 p-0.5 rounded-lg flex items-center justify-center border border-white/20">
            <TruckIcon className="w-9 h-6 sm:w-10 sm:h-7" variant="white" />
          </div>
          <div className="border-r border-white/20 pr-2.5">
            <h1 className="text-base sm:text-lg font-black font-['Tajawal',sans-serif] leading-tight">
              كرت التوريد
            </h1>
            <p className="text-[10px] sm:text-[11px] text-sky-200 font-medium">
              معلومات التوريد والخدمة
            </p>
          </div>
        </div>

        {/* Left side: Tagline */}
        <div className="flex items-center gap-2">
          <div className="text-left border-b border-sky-300 pb-0.5">
            <div className="text-[11px] sm:text-xs font-bold text-sky-100">شركاء</div>
            <div className="text-[9px] sm:text-[10px] text-sky-200">في استمرارية العملاء</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-500 text-emerald-900 p-2.5 rounded-xl flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs font-bold">{successMessage}</div>
        </div>
      )}

      {validationError && (
        <div className="bg-rose-50 border border-rose-500 text-rose-900 p-2.5 rounded-xl flex items-center gap-2 animate-fade-in shadow-2xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="text-xs font-bold">{validationError}</div>
        </div>
      )}

      {/* Auto-found customer badge */}
      {isCustomerFound && (
        <div className="bg-sky-50 border border-sky-300 text-sky-900 px-3 py-1.5 rounded-lg text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>تم التعرف على بيانات العميل المسجل مسبقاً تلقائياً.</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setCustomerName('');
              setCustomerIdentifier('');
              setMobile('');
              setLocation('');
              setIsCustomerFound(false);
            }}
            className="text-sky-700 underline text-[10px] font-bold cursor-pointer"
          >
            مسح لإدخال عميل جديد
          </button>
        </div>
      )}

      {/* ========================================================
          FORM FIELDS (Clean White Cards matching User Request)
          - Row 1: اسم العميل | رقم المعرف | رقم الجوال في صف واحد
          - Row 2: نوع التوريد | سعة صهريج | سعر التوريد في صف واحد
          - Row 3: طريقة الدفع | تاريخ التوريد | اسم السائق في صف واحد
          - Row 4: الموقع | توثيق التوريد في صف واحد
          ======================================================== */}
      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Quick Customer Pill Suggestions */}
        {!isCustomerFound && customers.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs">
            <span className="text-slate-400 text-[10px] shrink-0">اختيار سريع:</span>
            {customers.slice(0, 4).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectCustomer(c)}
                className="px-2 py-0.5 bg-white hover:bg-sky-50 border border-slate-200 text-slate-700 rounded-md shrink-0 text-[10px] font-medium transition cursor-pointer"
              >
                {c.customer_name}
              </button>
            ))}
          </div>
        )}

        {/* ========================================================
            CARD MAIN BODY - Compact Field & Text Sizing
            - Outer container: bg-white rounded-xl p-2.5 sm:p-3 shadow-2xs border border-slate-200 space-y-1.5 sm:space-y-2
            - Field Label: block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 truncate
            - Field Control: compact-field supply-card-field h-[28px] text-[10.5px] sm:text-xs
            ======================================================== */}
        <div className="bg-white rounded-xl p-2.5 sm:p-3 shadow-2xs border border-slate-200 space-y-1.5 sm:space-y-2">
          {/* ROW 1: اسم العميل | رقم المعرف | رقم الجوال في صف واحد */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {/* اسم العميل */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 truncate flex items-center gap-1 leading-tight">
                <User className="w-3 h-3 text-sky-600 shrink-0" />
                <span className="truncate">اسم العميل</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                id="supply-customer-name-input"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="compact-field supply-card-field w-full bg-slate-50 focus:bg-white text-slate-800 text-[10.5px] sm:text-xs font-medium px-2 py-0.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 h-[28px] box-border transition"
              />
            </div>

            {/* رقم العميل */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 truncate flex items-center gap-1 leading-tight">
                <Hash className="w-3 h-3 text-sky-600 shrink-0" />
                <span className="truncate">رقم العميل</span>
              </label>
              <input
                id="supply-customer-id-input"
                type="text"
                placeholder="NB-1001"
                value={customerIdentifier}
                onChange={(e) => handleMobileOrIdLookup(e.target.value, 'identifier')}
                className="compact-field supply-card-field w-full bg-slate-50 focus:bg-white text-slate-800 text-[10.5px] sm:text-xs font-mono text-right px-2 py-0.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 h-[28px] box-border placeholder:text-slate-300 transition"
              />
            </div>

            {/* رقم الجوال */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 truncate flex items-center gap-1 leading-tight">
                <Phone className="w-3 h-3 text-sky-600 shrink-0" />
                <span className="truncate">رقم الجوال</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                id="supply-mobile-input"
                type="tel"
                dir="ltr"
                required
                inputMode="numeric"
                value={mobile}
                onChange={(e) => handleMobileOrIdLookup(e.target.value, 'mobile')}
                className="compact-field supply-card-field w-full bg-slate-50 focus:bg-white text-slate-800 text-[10.5px] sm:text-xs font-mono text-right px-2 py-0.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 h-[28px] box-border transition"
              />
            </div>
          </div>

          {/* ROW 2: نوع التوريد | سعة صهريج | سعر التوريد في صف واحد */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {/* نوع التوريد */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 truncate flex items-center gap-1 leading-tight">
                <ListFilter className="w-3 h-3 text-sky-600 shrink-0" />
                <span className="truncate">نوع التوريد</span>
              </label>
              <div className="relative">
                <select
                  id="supply-type-select"
                  value={supplyType}
                  onChange={(e) => setSupplyType(e.target.value as SupplyType)}
                  className="compact-field supply-card-field w-full bg-slate-50 focus:bg-white text-slate-800 text-[10.5px] sm:text-xs font-medium px-2 py-0.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 appearance-none cursor-pointer h-[28px] box-border transition"
                >
                  <option value="تحلية">مياه تحلية</option>
                  <option value="آبار">مياه آبار</option>
                </select>
              </div>
            </div>

            {/* سعة صهريج */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 truncate flex items-center gap-1 leading-tight">
                <TruckIcon className="w-3 h-2 text-sky-600 shrink-0" variant="blue" />
                <span className="truncate">سعة الصهريج</span>
              </label>
              <div className="relative">
                <select
                  id="supply-capacity-select"
                  value={tankCapacity}
                  onChange={(e) => setTankCapacity(e.target.value as TankCapacity)}
                  className="compact-field supply-card-field w-full bg-slate-50 focus:bg-white text-slate-800 text-[10.5px] sm:text-xs font-medium px-2 py-0.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 appearance-none cursor-pointer h-[28px] box-border transition"
                >
                  <option value="12 طن">12 طن (عايدي)</option>
                  <option value="18 طن">18 طن (سكس)</option>
                  <option value="30 طن">30 طن (تريلا)</option>
                </select>
              </div>
            </div>

            {/* سعر التوريد */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 truncate flex items-center gap-1 leading-tight">
                  <Coins className="w-3 h-3 text-sky-600 shrink-0" />
                  <span className="truncate">سعر التوريد</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="hidden sm:flex gap-1 text-[8.5px]">
                  <button
                    type="button"
                    onClick={() => setPrice(180)}
                    className={`px-1 py-0.2 rounded font-bold transition cursor-pointer ${price === 180 ? 'bg-sky-600 text-white' : 'bg-slate-200/80 text-slate-600'}`}
                  >
                    180
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrice(250)}
                    className={`px-1 py-0.2 rounded font-bold transition cursor-pointer ${price === 250 ? 'bg-sky-600 text-white' : 'bg-slate-200/80 text-slate-600'}`}
                  >
                    250
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrice(300)}
                    className={`px-1 py-0.2 rounded font-bold transition cursor-pointer ${price === 300 ? 'bg-sky-600 text-white' : 'bg-slate-200/80 text-slate-600'}`}
                  >
                    300
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  id="supply-price-input"
                  type="number"
                  min="0"
                  step="10"
                  inputMode="decimal"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="compact-field supply-card-field w-full bg-slate-50 focus:bg-white text-slate-800 text-[10.5px] sm:text-xs font-bold px-2 pl-6 py-0.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 h-[28px] box-border transition"
                />
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold pointer-events-none">
                  ر.س
                </span>
              </div>
            </div>
          </div>

          {/* ROW 3: طريقة الدفع | تاريخ التوريد | اسم السائق في صف واحد */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {/* طريقة الدفع */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 truncate flex items-center gap-1 leading-tight">
                <CreditCard className="w-3 h-3 text-sky-600 shrink-0" />
                <span className="truncate">طريقة الدفع</span>
              </label>
              <div className="relative">
                <select
                  id="supply-payment-method-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="compact-field supply-card-field w-full bg-slate-50 focus:bg-white text-slate-800 text-[10.5px] sm:text-xs font-medium px-2 py-0.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 appearance-none cursor-pointer h-[28px] box-border transition"
                >
                  <option value="كاش">كاش</option>
                  <option value="آجل">آجل</option>
                </select>
              </div>
            </div>

            {/* تاريخ التوريد */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 truncate flex items-center gap-1 leading-tight">
                <Calendar className="w-3 h-3 text-sky-600 shrink-0" />
                <span className="truncate">تاريخ التوريد</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                id="supply-date-input"
                type="date"
                required
                value={supplyDate}
                onChange={(e) => setSupplyDate(e.target.value)}
                className="compact-field supply-card-field w-full bg-slate-50 focus:bg-white text-slate-800 text-[10px] sm:text-xs font-mono px-1.5 py-0.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 h-[28px] box-border transition"
              />
            </div>

            {/* السائق المكلف */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 truncate flex items-center gap-1 leading-tight">
                <User className="w-3 h-3 text-sky-600 shrink-0" />
                <span className="truncate">السائق المكلف</span>
              </label>
              <div className="relative">
                <select
                  id="supply-driver-select"
                  value={driverId}
                  onChange={(e) => handleDriverChange(e.target.value)}
                  className="compact-field supply-card-field w-full bg-slate-50 focus:bg-white text-slate-800 text-[10.5px] sm:text-xs font-medium px-1.5 pl-6 py-0.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 appearance-none cursor-pointer h-[28px] box-border truncate transition"
                >
                  {drivers.map((drv) => (
                    <option key={drv.id} value={drv.id}>
                      {drv.driver_name} - {drv.vehicle}
                    </option>
                  ))}
                </select>
                <Truck className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ROW 4: الموقع | توثيق التوريد في صف واحد */}
          <div className="grid grid-cols-2 gap-1 sm:gap-2">
            {/* الموقع */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 truncate flex items-center gap-1 leading-tight">
                <MapPin className="w-3 h-3 text-sky-600 shrink-0" />
                <span className="truncate">الموقع أو العنوان</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="supply-location-input"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="compact-field supply-card-field w-full bg-slate-50 focus:bg-white text-slate-800 text-[10.5px] sm:text-xs font-medium px-2 py-0.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 h-[28px] box-border transition"
                />
                <button
                  type="button"
                  onClick={() => setIsMapPickerOpen(true)}
                  className="h-[28px] px-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md transition shrink-0 cursor-pointer flex items-center justify-center shadow-2xs"
                  title="تحديد الموقع عبر خرائط Google"
                  aria-label="خرائط Google"
                >
                  <MapPin className="w-3.5 h-3.5" />
                </button>
                {location && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-[28px] px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 shrink-0 transition flex items-center justify-center"
                    title="فتح في Google Maps"
                  >
                    <ExternalLink className="w-3 h-3 text-sky-700" />
                  </a>
                )}
              </div>
            </div>

            {/* توثيق التوريد (File Upload) */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-0.5 truncate flex items-center gap-1 leading-tight">
                <Upload className="w-3 h-3 text-sky-600 shrink-0" />
                <span className="truncate">توثيق التوريد</span>
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,application/pdf"
                className="hidden"
                id="supply-file-upload-input"
              />

              {!attachment ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-[28px] bg-slate-50 hover:bg-white text-slate-700 text-[10px] sm:text-[11px] font-medium px-2 rounded-md border border-dashed border-slate-300 hover:border-sky-500 flex items-center justify-center gap-1 transition cursor-pointer box-border truncate"
                >
                  <Upload className="w-3 h-3 text-sky-600 shrink-0" />
                  <span className="truncate">رفع مستند أو صورة</span>
                </button>
              ) : (
                <div className="w-full h-[28px] bg-sky-50 px-2 rounded-md border border-sky-200 flex items-center justify-between box-border">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    {attachment.type === 'image' ? (
                      <img
                        src={attachment.url}
                        alt="مرفق التوريد"
                        className="w-4 h-4 object-cover rounded border border-sky-300 shrink-0"
                      />
                    ) : (
                      <FileCheck className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                    )}
                    <div className="text-right truncate">
                      <p className="text-[10px] font-bold text-slate-800 truncate">{attachment.name}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachment(null)}
                    className="p-0.5 text-rose-600 hover:bg-rose-100 rounded transition shrink-0 cursor-pointer"
                    title="حذف المرفق"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            WATER TANKER BANNER
            "الماء أثمن من أن يهدر .. نلتزم بالجودة .. لنصل إليكم دائماً"
            ======================================================== */}
        <div className="bg-gradient-to-r from-sky-100/90 via-sky-50 to-white rounded-xl p-1.5 sm:p-2 border border-sky-200/80 flex flex-col sm:flex-row items-center justify-between gap-1.5 shadow-2xs overflow-hidden relative">
          {/* Left truck graphic representation */}
          <div className="flex items-center gap-2">
            <div className="w-12 h-8 sm:w-16 sm:h-10 bg-white rounded-lg shadow-2xs border border-sky-200 p-0.5 flex items-center justify-center">
              <TruckIcon className="w-10 h-6 sm:w-12 sm:h-8" variant="blue" />
            </div>
          </div>

          {/* Right text message */}
          <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-r border-sky-300/60 pt-0.5 sm:pt-0 sm:pr-2">
            <h3 className="text-[11px] sm:text-xs font-black text-sky-950 font-['Tajawal',sans-serif]">
              الماء أثمن من أن يهدر
            </h3>
            <p className="text-[9.5px] sm:text-[10px] text-sky-700 font-medium">
              نلتزم بالجودة .. لنصل إليكم دائماً
            </p>
          </div>
        </div>

        {/* ========================================================
            BOTTOM ACTION BUTTONS
            "حفظ البيانات" (Blue primary) & "عرض سجل التوريدات السابقة" (White)
            ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
          {/* Button 1: حفظ البيانات */}
          <button
            id="supply-submit-btn"
            type="submit"
            className="w-full py-2 px-3 bg-[#03457a] hover:bg-[#023561] active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer h-[36px]"
          >
            <Save className="w-3.5 h-3.5 text-sky-300" />
            <span>حفظ البيانات</span>
          </button>

          {/* Button 2: عرض سجل التوريدات السابقة */}
          <button
            id="supply-view-history-btn"
            type="button"
            onClick={() => setActiveTab('deliveries')}
            className="w-full py-2 px-3 bg-white hover:bg-slate-50 active:scale-98 text-[#03457a] font-bold text-xs rounded-xl border border-[#03457a]/40 hover:border-[#03457a] shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer h-[36px]"
          >
            <History className="w-3.5 h-3.5 text-sky-700" />
            <span>عرض سجل التوريدات السابقة</span>
          </button>
        </div>
      </form>

      {/* Google Maps Location Picker Modal */}
      <GoogleMapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        initialLocation={location}
        onSelectLocation={(data) => {
          setLocation(data.formattedLocation);
        }}
      />
    </div>
  );
};

export default SupplyCardForm;

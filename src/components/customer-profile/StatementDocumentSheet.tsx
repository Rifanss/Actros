import React from 'react';
import { Calendar, MapPin, User, Phone, CheckCircle2, Clock, Coins, Layers } from 'lucide-react';
import { Customer, Delivery } from '../../types';
import { ReportType } from './PrintStatementModal';

interface StatementDocumentSheetProps {
  customer: Customer;
  deliveries: Delivery[];
  reportType: ReportType;
  customTitle?: string;
  startDate?: string;
  endDate?: string;
  pageNumber?: number;
  totalPages?: number;
  groupMode?: 'unified' | 'grouped';
  gregorianDate?: string;
  hijriDate?: string;
}

// Formats number to Arabic Locale with commas (e.g. 1,650)
const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('en-US').format(amount);
};

// Clean water type string
const normalizeWaterType = (type?: string): string => {
  if (!type) return 'تحلية';
  const clean = type.replace(/مياة|مياه/g, '').trim();
  return clean || 'تحلية';
};

// Clean capacity string
const normalizeCapacity = (capacity?: string | number): string => {
  if (!capacity) return '18 طن';
  const capStr = String(capacity).trim();
  if (capStr.includes('طن')) return capStr;
  return `${capStr} طن`;
};

export const StatementDocumentSheet: React.FC<StatementDocumentSheetProps> = ({
  customer,
  deliveries,
  reportType,
  customTitle,
  startDate,
  endDate,
  pageNumber = 1,
  totalPages = 1,
  groupMode = 'unified',
  gregorianDate,
}) => {
  // Determine dates
  const today = new Date();
  const defaultGreg = gregorianDate || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Calculate period from/to dates
  const { periodFrom, periodTo } = React.useMemo(() => {
    let from = startDate;
    let to = endDate;
    if (!from || !to) {
      const dates = deliveries
        .map((d) => d.supply_date)
        .filter(Boolean)
        .sort();
      if (dates.length > 0) {
        if (!from) from = dates[0];
        if (!to) to = dates[dates.length - 1];
      }
    }
    return {
      periodFrom: from || '2026-09-01',
      periodTo: to || defaultGreg,
    };
  }, [startDate, endDate, deliveries, defaultGreg]);

  // Document title exactly as requested
  const documentTitle = React.useMemo(() => {
    if (customTitle) return customTitle;
    if (reportType === 'due') return 'كشف حساب التوريدات المستحقه';
    if (reportType === 'paid') return 'كشف حساب التوريدات المدفوعة';
    return 'كشف حساب جميع التوريدات';
  }, [customTitle, reportType]);

  // Separate deliveries for grouped view if needed
  const dueDeliveries = deliveries.filter(
    (d) => d.payment_status === 'مستحق' || d.payment_method === 'آجل' || Number(d.remaining_amount) > 0
  );
  const paidDeliveries = deliveries.filter(
    (d) => d.payment_status === 'مدفوع' || d.payment_method === 'كاش'
  );

  const totalAmount = deliveries.reduce((sum, d) => sum + (Number(d.price) || 0), 0);
  const totalDueAmount = dueDeliveries.reduce((sum, d) => sum + (Number(d.price) || 0), 0);
  const totalPaidAmount = paidDeliveries.reduce((sum, d) => sum + (Number(d.price) || 0), 0);

  // Render a single table card
  const renderTableCard = (
    items: Delivery[],
    subTitle: string,
    subTotal: number,
    theme: 'due' | 'paid' | 'all' = 'all',
    startIndex: number = 1
  ) => {
    const isDue = theme === 'due';
    const borderColor = isDue ? 'border-rose-200' : 'border-sky-200';
    const headerTitleColor = isDue ? 'text-rose-600' : 'text-[#0284c7]';

    return (
      <div className={`rounded-lg sm:rounded-xl border ${borderColor} bg-white overflow-hidden shadow-2xs mb-2 sm:mb-2.5`}>
        {/* Card Header Badge - تم تصغير حجم الخط والأيقونة */}
        <div className="px-2 sm:px-3 pt-1 sm:pt-1.5 pb-0.5 sm:pb-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className={`flex items-center gap-1 ${headerTitleColor} font-bold text-[8.5px] sm:text-[9.5px]`}>
              <Coins className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${headerTitleColor}`} />
              <span>{subTitle}</span>
            </div>
          </div>
          {items.length > 0 && (
            <span className="text-[7.5px] sm:text-[8.5px] text-slate-500 font-medium">
              {items.length} {items.length === 1 ? 'توريد' : 'توريدات'}
            </span>
          )}
        </div>

        {/* Table - تقليل ارتفاع الصفوف وتصغير حجم النصوص */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#e0f2fe] text-[#0369a1] font-bold text-[8px] sm:text-[9px]">
                <th className="py-1 px-1 sm:py-1.5 sm:px-2 text-center w-5 sm:w-7">#</th>
                <th className="py-1 px-1 sm:py-1.5 sm:px-2 text-center whitespace-nowrap">التاريخ</th>
                <th className="py-1 px-1 sm:py-1.5 sm:px-2 text-center whitespace-nowrap">نوع المياه</th>
                <th className="py-1 px-1 sm:py-1.5 sm:px-2 text-center whitespace-nowrap">السعة</th>
                <th className="py-1 px-1 sm:py-1.5 sm:px-2 text-center whitespace-nowrap">المبلغ</th>
                <th className="py-1 px-1 sm:py-1.5 sm:px-2 text-center whitespace-nowrap">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100/60 font-medium">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 sm:py-5 text-slate-400 font-bold text-[9px] sm:text-[10px]">
                    {theme === 'due'
                      ? 'لا توجد توريدات مستحقة على العميل خلال هذه الفترة (الحساب مسدد بالكامل)'
                      : theme === 'paid'
                      ? 'لا توجد توريدات مدفوعة مسجلة خلال هذه الفترة'
                      : 'لا توجد توريدات مسجلة خلال الفترة المحددة'}
                  </td>
                </tr>
              ) : (
                items.map((delivery, idx) => {
                  const isItemPaid = delivery.payment_status === 'مدفوع' || delivery.payment_method === 'كاش';
                  const rowNumber = startIndex + idx;
                  const price = Number(delivery.price) || 0;

                  return (
                    <tr
                      key={delivery.id || idx}
                      className="hover:bg-sky-50/40 transition-colors text-[8px] sm:text-[9px]"
                    >
                      {/* # */}
                      <td className="py-1 px-1 sm:py-1 sm:px-2 text-center font-bold text-slate-500 text-[7.5px] sm:text-[8.5px]">
                        {rowNumber}
                      </td>

                      {/* التاريخ */}
                      <td className="py-1 px-1 sm:py-1 sm:px-2 text-center font-mono font-medium text-slate-800 text-[8px] sm:text-[9px] whitespace-nowrap" dir="ltr">
                        {delivery.supply_date || defaultGreg}
                      </td>

                      {/* نوع المياه */}
                      <td className="py-1 px-1 sm:py-1 sm:px-2 text-center font-medium text-slate-900 whitespace-nowrap">
                        {normalizeWaterType(delivery.supply_type)}
                      </td>

                      {/* السعة */}
                      <td className="py-1 px-1 sm:py-1 sm:px-2 text-center font-medium text-slate-800 whitespace-nowrap">
                        {normalizeCapacity(delivery.tank_capacity)}
                      </td>

                      {/* المبلغ - مصغر حسب المشار إليه بالأحمر */}
                      <td className="py-1 px-1 sm:py-1 sm:px-2 text-center font-bold text-[8px] sm:text-[9px] text-slate-800 whitespace-nowrap">
                        {formatMoney(price)} ريال
                      </td>

                      {/* الحالة */}
                      <td className="py-1 px-1 sm:py-1 sm:px-2 text-center whitespace-nowrap">
                        {isItemPaid ? (
                          <span className="inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0 sm:py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-[7.5px] sm:text-[8px] font-bold">
                            <CheckCircle2 className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-emerald-600 shrink-0" />
                            <span>مدفوع</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0 sm:py-0.5 rounded-full bg-rose-50 border border-rose-300 text-rose-600 text-[7.5px] sm:text-[8px] font-bold">
                            <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-rose-600 shrink-0" />
                            <span>مستحق</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Card Footer: المجموع - مصغر حسب المشار إليه بالأحمر */}
        <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#f0f9ff]/70 border-t border-sky-100 flex items-center justify-between text-[8.5px] sm:text-[9.5px]">
          <span className="font-bold text-[#03457a]">المجموع</span>
          <span className="font-bold text-[#03457a] font-mono" dir="ltr">
            {formatMoney(subTotal)} ريال
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      data-a4-sheet="true"
      className="statement-document-sheet relative w-full max-w-[210mm] min-h-[auto] sm:min-h-[297mm] bg-white text-slate-900 
        shadow-[0_4px_20px_rgba(0,0,0,0.15)] sm:shadow-[0_12px_40px_rgba(0,0,0,0.35)] 
        border border-slate-200 sm:border-slate-300/80 rounded-xl sm:rounded-2xl
        flex flex-col justify-between overflow-hidden
        p-2.5 sm:p-5 md:p-6 pb-14 sm:pb-18 md:pb-20
        print:min-h-[297mm] print:max-w-none print:w-full print:p-8 print:pb-20 print:shadow-none print:border-none print:rounded-none print:break-after-page"
      style={{ boxSizing: 'border-box' }}
      dir="rtl"
    >
      {/* ========================================================
          PAGE HEADER (Top Logo & Slogan + Smooth Wave Divider)
          ======================================================== */}
      <div>
        <div className="flex items-center justify-between gap-2">
          {/* Top Right: Brand Logo: "نبع لتوريد المياه" + اسم الكشف */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            {/* Droplet vector icon with concentric rings */}
            <div className="w-7 h-9 sm:w-8 sm:h-10 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 120" className="w-full h-full" fill="none">
                {/* Outer droplet */}
                <path
                  d="M50 10 C50 10 15 65 15 88 C15 106 31 118 50 118 C69 118 85 106 85 88 C85 65 50 10 50 10Z"
                  fill="#0284c7"
                />
                {/* Inner droplet ring */}
                <path
                  d="M50 26 C50 26 25 70 25 88 C25 102 36 110 50 110 C64 110 75 102 75 88 C75 70 50 26 50 26Z"
                  fill="#ffffff"
                />
                {/* Core water drop */}
                <path
                  d="M50 40 C50 40 33 74 33 88 C33 98 41 104 50 104 C59 104 67 98 67 88 C67 74 50 40 50 40Z"
                  fill="#38bdf8"
                />
              </svg>
            </div>

            <div className="min-w-0">
              {/* الشعار: نبع لتوريد المياه */}
              <div className="flex items-baseline gap-1">
                <h1 className="text-sm sm:text-base md:text-lg font-black text-[#032e5b] tracking-tight font-['Tajawal',sans-serif]">
                  نبع
                </h1>
                <span className="text-[10px] sm:text-xs md:text-sm font-black text-[#0284c7] font-['Tajawal',sans-serif]">
                  لتوريد المياه
                </span>
              </div>
              {/* حذف جملة توريد وتوزيع.. ووضع اسم الكشف بدالها */}
              <p className="text-[9px] sm:text-[10.5px] font-black text-[#0369a1] mt-0.5 leading-tight font-['Tajawal',sans-serif]">
                {documentTitle}
              </p>
              {/* وتحت اسم الكشف اكتب عن الفترة من إلى */}
              <p className="text-[7.5px] sm:text-[8.5px] font-bold text-slate-500 mt-0.5 leading-tight font-['Tajawal',sans-serif] flex items-center gap-1">
                <span>عن الفترة من</span>
                <span className="font-mono text-slate-700 font-bold" dir="ltr">{periodFrom}</span>
                <span>إلى</span>
                <span className="font-mono text-slate-700 font-bold" dir="ltr">{periodTo}</span>
              </p>
            </div>
          </div>

          {/* Top Left: Slogan - بخط صغير */}
          <div className="text-left shrink-0">
            <span className="text-[8.5px] sm:text-[10px] font-bold text-[#0284c7] tracking-tight font-['Tajawal',sans-serif] whitespace-nowrap">
              «مياه نقية .. لحياة أفضل»
            </span>
          </div>
        </div>

        {/* Decorative Cyan Wave Divider Line */}
        <div className="w-full my-1 sm:my-1.5">
          <svg viewBox="0 0 1000 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-2.5 sm:h-3 text-sky-400">
            <path
              d="M0,12 C250,24 450,0 750,16 C850,22 920,8 1000,12"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* ========================================================
            DETAILS SECTION: بيانات العميل في اليمين والتاريخ في اليسار
            ======================================================== */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 py-1 sm:py-1 mb-1.5 sm:mb-2">
          {/* Right Column: Customer Information (بيانات العميل في اليمين - مصغرة حسب الطلب) */}
          <div className="space-y-0.5 sm:space-y-1 pr-0.5">
            {/* Customer Name - مصغر */}
            <div className="flex items-start gap-1 text-[8px] sm:text-[9.5px] text-slate-800">
              <div className="w-3.5 h-3.5 rounded-full bg-sky-100 flex items-center justify-center text-[#0284c7] shrink-0 mt-0.5">
                <User className="w-2 h-2" />
              </div>
              <div className="min-w-0 leading-tight">
                <span className="text-slate-500 text-[7.5px] sm:text-[8.5px]">العميل: </span>
                <span className="text-slate-900 font-bold text-[8px] sm:text-[9.5px]">
                  {customer.customer_name}
                </span>
              </div>
            </div>

            {/* Customer Phone - مصغر */}
            <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-slate-800">
              <div className="w-3.5 h-3.5 rounded-full bg-sky-100 flex items-center justify-center text-[#0284c7] shrink-0">
                <Phone className="w-2 h-2" />
              </div>
              <div className="leading-tight">
                <span className="text-slate-500 text-[7.5px] sm:text-[8.5px]">هاتف: </span>
                <span className="font-mono text-slate-800 font-medium text-[8px] sm:text-[9px]" dir="ltr">
                  {customer.mobile || '0563042478'}
                </span>
              </div>
            </div>

            {/* Customer Location */}
            <div className="flex items-start gap-1 text-[7.5px] sm:text-[8.5px] text-slate-800">
              <div className="w-3.5 h-3.5 rounded-full bg-sky-100 flex items-center justify-center text-[#0284c7] shrink-0 mt-0.5">
                <MapPin className="w-2 h-2" />
              </div>
              <div className="min-w-0 leading-tight">
                <span className="text-slate-500 text-[7.5px] sm:text-[8.5px]">الموقع: </span>
                <span className="text-slate-800 font-medium text-[7.5px] sm:text-[8.5px]">
                  {customer.location || 'الطائف - حي الوسام'}
                </span>
              </div>
            </div>
          </div>

          {/* Left Column: Issue Date (تاريخ الإصدار في سطر مستقل ومنظم تماماً لمنع أي تداخل) */}
          <div className="border-r border-slate-200/90 pr-2 sm:pr-3.5 flex flex-col justify-start">
            {/* السطر الأول: الأيقونة والعنوان */}
            <div className="flex items-center gap-1 text-[8.5px] sm:text-[9.5px] font-bold text-slate-700 leading-none">
              <Calendar className="w-3 h-3 text-[#0284c7] shrink-0" />
              <span className="whitespace-nowrap">تاريخ الإصدار</span>
            </div>

            {/* السطر الثاني المستقل تماماً: تاريخ اليوم المكتوب بدون أي تداخل مع الأيقونة أو العنوان */}
            <div className="mt-1 sm:mt-1.5 pr-4 flex items-center gap-1 leading-normal" dir="rtl">
              <span className="font-mono font-bold text-[8.5px] sm:text-[9.5px] text-slate-900 tracking-wider select-text whitespace-nowrap" dir="ltr">
                {defaultGreg}
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-600 select-none">
                م
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            TABLE CONTENT (Grouped or Unified based on reportType)
            ======================================================== */}
        {reportType === 'due' ? (
          // Statement 2: المستحق فقط
          renderTableCard(deliveries, 'المستحق', totalAmount, 'due', 1)
        ) : reportType === 'paid' ? (
          // Statement 3: المدفوع فقط
          renderTableCard(deliveries, 'المدفوع', totalAmount, 'paid', 1)
        ) : groupMode === 'grouped' ? (
          // Statement 1: جميع التوريدات (مقسمة كما في النموذج 3)
          <div className="space-y-3">
            {paidDeliveries.length > 0 &&
              renderTableCard(paidDeliveries, 'المدفوع', totalPaidAmount, 'paid', 1)}
            {dueDeliveries.length > 0 &&
              renderTableCard(
                dueDeliveries,
                'المستحق',
                totalDueAmount,
                'due',
                paidDeliveries.length + 1
              )}
            {paidDeliveries.length === 0 && dueDeliveries.length === 0 &&
              renderTableCard([], 'جميع التوريدات', 0, 'all', 1)}

            {/* Grand Total when both exist */}
            {paidDeliveries.length > 0 && dueDeliveries.length > 0 && (
              <div className="rounded-lg border border-sky-300 bg-sky-50/70 p-1.5 sm:p-2 flex items-center justify-between text-[8.5px] sm:text-[9.5px] font-bold text-[#03457a]">
                <span>إجمالي كافة التوريدات (المدفوع والمستحق)</span>
                <span className="text-[8.5px] sm:text-[9.5px] font-bold font-mono" dir="ltr">
                  {formatMoney(totalAmount)} ريال
                </span>
              </div>
            )}
          </div>
        ) : (
          // Statement 1: جميع التوريدات (جدول موحد مع تمييز الحالات)
          renderTableCard(deliveries, 'جميع التوريدات', totalAmount, 'all', 1)
        )}
      </div>

      {/* ========================================================
          PAGE FOOTER (Calligraphy left, Watermark right, Bottom Waves)
          ======================================================== */}
      <div className="relative pt-4 sm:pt-6">
        <div className="flex items-end justify-between relative z-10">
          {/* Right side: Page Number indicator */}
          <div>
            {totalPages > 1 && (
              <div className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-bold">
                صفحة {pageNumber} من {totalPages}
              </div>
            )}
          </div>

          {/* Far Left: Tilted Calligraphy "شكراً لثقتكم" (أقصى اليسار) */}
          <div className="relative -rotate-6 select-none pb-1 sm:pb-1.5 pl-1 sm:pl-2 text-left">
            <div className="font-['Tajawal',sans-serif] text-xs sm:text-base font-black text-[#0f3d62] tracking-wide">
              شكراً لثقتكم
            </div>
            {/* Elegant curved underline */}
            <svg className="w-16 sm:w-20 h-2 sm:h-2.5 text-[#0f3d62]" viewBox="0 0 100 12" fill="none">
              <path
                d="M5 4 C35 12 70 2 95 6"
                stroke="#0f3d62"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Translucent Water Droplet Watermark (Bottom Right) */}
        <div className="absolute -bottom-2 sm:-bottom-4 right-1 sm:right-2 opacity-40 sm:opacity-50 pointer-events-none select-none">
          <svg width="60" height="72" viewBox="0 0 100 120" fill="none" className="w-12 h-14 sm:w-20 sm:h-24">
            <path
              d="M50 10 C50 10 10 65 10 85 C10 105 28 118 50 118 C72 118 90 105 90 85 C90 65 50 10 50 10Z"
              fill="#e0f2fe"
            />
            <path
              d="M50 25 C50 25 20 70 20 86 C20 102 33 112 50 112 C67 112 80 102 80 86 C80 70 50 25 50 25Z"
              fill="#bae6fd"
              opacity="0.6"
            />
            <path
              d="M50 42 C50 42 32 75 32 88 C32 98 40 105 50 105 C60 105 68 98 68 88 C68 75 50 42 50 42Z"
              fill="#7dd3fc"
              opacity="0.5"
            />
          </svg>
        </div>

        {/* Multi-layered Cyan & Sky Blue Bottom Waves spanning entire bottom */}
        <div className="absolute -bottom-3 sm:-bottom-6 md:-bottom-8 -left-3 sm:-left-6 md:-left-8 -right-3 sm:-right-6 md:-right-8 overflow-hidden leading-none pointer-events-none select-none">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-10 sm:h-16 md:h-20"
          >
            {/* Soft background wave */}
            <path
              d="M0,40 C150,90 350,10 500,50 C650,90 900,20 1200,60 L1200,120 L0,120 Z"
              fill="#bae6fd"
              opacity="0.45"
            />
            {/* Middle wave */}
            <path
              d="M0,65 C200,20 450,85 700,45 C950,10 1100,65 1200,50 L1200,120 L0,120 Z"
              fill="#7dd3fc"
              opacity="0.6"
            />
            {/* Foreground ocean wave */}
            <path
              d="M0,80 C250,55 450,100 800,65 C1050,40 1150,80 1200,75 L1200,120 L0,120 Z"
              fill="#38bdf8"
              opacity="0.8"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  ChevronLeft,
  CheckCircle2,
  Search,
  Droplets,
  Sparkles,
  Landmark,
  HardHat,
  Building2,
  Home,
  Truck,
} from 'lucide-react';
import WaterOrderModal from '../WaterOrderModal';
import TrackOrderModal from '../TrackOrderModal';
import AnimatedPosterHeadline from './AnimatedPosterHeadline';
import AnimatedPosterTitle from './AnimatedPosterTitle';
import StackedCardsSlider from './StackedCardsSlider';
import Footer from '../Footer';
import { useWaterData } from '../../context/WaterDataContext';
import { scrollToTop, useScrollToTop } from '../../utils/scrollUtils';

interface PublicHomeViewProps {
  onOpenAdminDashboard?: () => void;
  onOpenCustomersView?: () => void;
}

export const PublicHomeView: React.FC<PublicHomeViewProps> = ({
  onOpenAdminDashboard,
  onOpenCustomersView,
}) => {
  const { pendingOrdersCount, setActiveTab, authenticatedDriver } = useWaterData();

  // Guarantee Home View always starts at top (0, 0)
  useScrollToTop();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isTrackOrderModalOpen, setIsTrackOrderModalOpen] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [isClientsModalOpen, setIsClientsModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure the video plays immediately without showing any poster or frozen state
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback for mobile
      });
    }
  }, []);

  return (
    <div
      className="min-h-screen bg-[#eaf1f7] text-slate-800 font-['Cairo',sans-serif] flex flex-col antialiased selection:bg-[#0066d6] selection:text-white relative"
      dir="rtl"
    >
      {/* ========================================================
          1. HEADER (الهيدر الشفاف المدمج طبيعياً مع خلفية البوستر والقسم الرئيسي)
          ======================================================== */}
      <header className="absolute top-0 inset-x-0 z-40 bg-transparent px-4 sm:px-6 py-2.5 sm:py-3.5 pointer-events-none">
        <div className="relative max-w-md mx-auto flex items-center justify-between">
          {/* Spacer to keep menu button aligned to the left side */}
          <div />

          {/* Left Side: White Hamburger Menu Button */}
          <button
            onClick={() => setIsMenuDrawerOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-white/15 active:scale-95 transition cursor-pointer relative pointer-events-auto"
            aria-label="القائمة"
          >
            <div className="w-6 h-4 flex flex-col justify-between items-end">
              <span className="w-6 h-[2.5px] bg-white rounded-full drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"></span>
              <span className="w-6 h-[2.5px] bg-white rounded-full drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"></span>
              <span className="w-6 h-[2.5px] bg-white rounded-full drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"></span>
            </div>
            {pendingOrdersCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white animate-pulse shadow-xs" />
            )}
          </button>
        </div>
      </header>

      {/* ========================================================
          HERO SECTION (فيديو بنسبة أبعاد 5:7.8 في الواجهة الرئيسية)
          ======================================================== */}
      <section className="relative w-full max-w-md mx-auto overflow-hidden select-none rounded-none pointer-events-auto">
        {/* حاوية الفيديو مع تعطيل قائمة الزر الأيمن لمنع الحفظ */}
        <div
          className="relative w-full overflow-hidden rounded-none select-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* تحديد نسبة العرض إلى الارتفاع الطولية (Aspect Ratio) */}
          <div
            className="relative w-full aspect-[5/7.8] overflow-hidden rounded-none select-none"
            style={{ aspectRatio: '5 / 7.8' }}
          >
            {/* وسم الفيديو (HTML5 Video Element) بدون أي صورة بوستر سابقة */}
            <video
              ref={videoRef}
              src="/assets/nabaa_hero_video.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              controlsList="nodownload nofullscreen noremoteplayback"
              onContextMenu={(e) => e.preventDefault()}
              className="w-full h-full object-cover object-top block rounded-none pointer-events-none select-none bg-slate-900"
              style={{
                objectPosition: 'center top',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
              }}
              aria-hidden="true"
            >
              <source src="/assets/nabaa_hero_video.mp4" type="video/mp4" />
            </video>

            {/* 1. العنوان والشعار الرسمي المثبت في أعلى الفيديو */}
            <AnimatedPosterTitle />

            {/* 2. شريط السلايدر والنصوص التفاعلية المثبتة في أسفل الفيديو */}
            <AnimatedPosterHeadline onOpenOrderModal={() => setIsOrderModalOpen(true)} />
          </div>
        </div>
      </section>

      {/* ========================================================
          2.5 نبذة تعريفية عن نبع لتوريد المياه تحت الصورة بالجزء الأول (مفتوحة بدون بطاقة أو إطار)
          ======================================================== */}
      <section className="max-w-md mx-auto w-full px-4 pt-3 touch-pan-y" style={{ touchAction: 'pan-y' }}>
        <div className="relative text-right space-y-3 touch-pan-y" style={{ touchAction: 'pan-y' }}>
          {/* Header Bar: Logo & Title */}
          <div className="flex items-center gap-2.5 pb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0066d6] to-[#042b57] text-white flex items-center justify-center shadow-xs shrink-0">
              <Droplets className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#042b57] tracking-tight">
                في نبع لتوريد المياه
              </h2>
            </div>
          </div>

          {/* Body Paragraphs */}
          <div className="space-y-2.5 text-xs sm:text-[13px] text-slate-700 leading-relaxed font-medium text-right">
            <p className="text-right">
              نصنع تجربة توريد ترتقي بالتوقعات، من خلال حلول متكاملة تجمع بين الجودة، والموثوقية، وسرعة الاستجابة، والانضباط التشغيلي، من خلال أسطول متكامل من الصهاريج متعددة السعات لتلبية احتياجات الأفراد والمنشآت على مدار الساعة.
            </p>

            <p className="text-right">
              نوفر مياه التحلية النقية الصالحة للاستخدام الآدمي عبر صهاريج مخصصة لهذا النوع من التوريد، إلى جانب مياه الآبار عبر صهاريج مستقلة، مع تطبيق فصل تشغيلي واضح بين نوعي المياه؛ بما يعزز سلامة وجودة عمليات التوريد ويحافظ على موثوقية الخدمة.
            </p>

            <p className="text-right">
              كما نقدم حلول توريد مرنة تلبي مختلف الاحتياجات، تشمل الطلبات الفورية والمجدولة، والعقود الشهرية والسنوية، إضافة إلى توفير مضخات المياه عند الحاجة، بما يضمن سهولة التنفيذ ومرونة أكبر في تلبية متطلبات العملاء.
            </p>

            <p className="text-right">
              نعمل على مدار الساعة لتقديم تجربة توريد تتسم بالسهولة والسرعة والموثوقية، مع الحرص على تقديم خدمة احترافية تلبي احتياجات العملاء بكفاءة واستمرارية.
            </p>
          </div>

          {/* Slogan Banner */}
          <div className="pt-2 flex items-center justify-center gap-2 text-[#0066d6] font-black text-xs sm:text-sm py-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="tracking-tight">نبع لتوريد المياه — جاهزية تروي احتياجك.</span>
          </div>
        </div>
      </section>

      {/* ========================================================
          MAIN APP CONTENT (Mobile First - Identical to Mockup)
          ======================================================== */}
      <main className="max-w-md mx-auto w-full px-3 pt-3 space-y-3 touch-pan-y" style={{ touchAction: 'pan-y' }}>
        {/* ========================================================
            3. ORDER REQUEST CARD (بطاقة طلب الصهريج)
            ======================================================== */}
        <section
          id="order-request-card"
          className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100/90 relative text-center touch-pan-y z-10"
          style={{ touchAction: 'pan-y' }}
        >
          {/* Texts in the Center */}
          <div className="px-4 pt-1 touch-pan-y" style={{ touchAction: 'pan-y' }}>
            <h2 className="text-lg sm:text-xl font-black text-[#0066d6] tracking-tight touch-pan-y" style={{ touchAction: 'pan-y' }}>
              تقدم الآن بطلب صهريج مياه
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1 touch-pan-y" style={{ touchAction: 'pan-y' }}>
              خدمة سريعة وموثوقة لتلبية احتياجاتك من المياه
            </p>
          </div>

          {/* Center Blue Order Button with Order Icon & Circular Arrow */}
          <div className="my-4 flex flex-col items-center gap-2 touch-pan-y" style={{ touchAction: 'pan-y' }}>
            <button
              id="hero-order-now-btn"
              onClick={() => setIsOrderModalOpen(true)}
              className="bg-[#0066d6] hover:bg-[#0054b3] active:scale-95 text-white py-3 px-5 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-between w-full max-w-[270px] transition-all cursor-pointer group touch-pan-y"
              style={{ touchAction: 'pan-y' }}
            >
              {/* Right Inside: Order Document Icon */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-white/95 shrink-0 pointer-events-none"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>

              {/* Center: Button Text */}
              <span className="text-base sm:text-lg font-black tracking-wide pointer-events-none">
                اطلب الآن
              </span>

              {/* Left Inside: Circular Arrow Button */}
              <div className="w-7 h-7 rounded-full bg-white text-[#0066d6] flex items-center justify-center shadow-xs group-hover:-translate-x-0.5 transition-transform shrink-0 pointer-events-none">
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
              </div>
            </button>

            {/* زر متابعة طلبك تحت زر اطلب الآن مباشرة */}
            <button
              id="hero-track-order-btn"
              type="button"
              onClick={() => setIsTrackOrderModalOpen(true)}
              className="bg-white hover:bg-sky-50 active:scale-95 text-[#0066d6] border-2 border-sky-200 hover:border-sky-300 py-2 px-5 rounded-full shadow-xs flex items-center justify-center gap-2 w-full max-w-[270px] transition-all cursor-pointer font-bold text-xs sm:text-sm group touch-pan-y"
              style={{ touchAction: 'pan-y' }}
            >
              <Search className="w-4 h-4 text-[#0066d6] group-hover:scale-110 transition-transform pointer-events-none" />
              <span className="pointer-events-none">متابعة طلبك</span>
            </button>
          </div>
        </section>

        {/* ========================================================
            3.5 STACKED CARDS SLIDER (سلايدر بطاقات متراكبة)
            بطاقات متراكبة أنيقة تحت قسم طلب الصهريج بتأثير انزلاق حقيقي
            ======================================================== */}
        <StackedCardsSlider />

        {/* ========================================================
            4. SERVICES SECTION (قسم خدماتنا - تصميم مخصص وعالي الوضوح)
            ======================================================== */}
        <section className="space-y-3 pt-2">
          {/* عنوان القسم */}
          <div className="text-center">
            <h2 className="text-base sm:text-lg font-black text-[#042b57] tracking-tight">
              خدماتنا
            </h2>
            <div className="w-10 h-1 bg-[#38bdf8] rounded-full mx-auto mt-1 mb-1.5" />
            <div className="text-[11px] sm:text-xs text-slate-500 font-semibold space-y-0.5 leading-relaxed">
              <p>حلول توريد متكاملة تلبي كافة الاحتياجات</p>
              <p>بأعلى معايير الجودة والسرعة</p>
            </div>
          </div>

          {/* شبكة الخدمات 2×2 لتوفير مساحة قراءة مريحة */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {/* بطاقة 1: المنازل */}
            <div className="group relative bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 text-center flex flex-col items-center justify-center shadow-2xs hover:shadow-sm transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100/80 flex items-center justify-center shadow-2xs mb-2.5 mx-auto">
                <Home className="w-5 h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug text-center">
                المنازل
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed mt-1 text-center">
                توفير مياه التحلية
                <br />
                للمنازل والفلل
              </p>
            </div>

            {/* بطاقة 2: المشاريع */}
            <div className="group relative bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 text-center flex flex-col items-center justify-center shadow-2xs hover:shadow-sm transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/80 flex items-center justify-center shadow-2xs mb-2.5 mx-auto">
                <HardHat className="w-5 h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug text-center">
                المشاريع
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed mt-1 text-center">
                دعم مواقع العمل
                <br />
                والمشاريع الإنشائية
              </p>
            </div>

            {/* بطاقة 3: الجهات الحكومية */}
            <div className="group relative bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 text-center flex flex-col items-center justify-center shadow-2xs hover:shadow-sm transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center shadow-2xs mb-2.5 mx-auto">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug text-center">
                الجهات الحكومية
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed mt-1 text-center">
                إمداد مستمر ومنتظم
                <br />
                للمنشآت الحكومية
              </p>
            </div>

            {/* بطاقة 4: الشركات */}
            <div className="group relative bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 text-center flex flex-col items-center justify-center shadow-2xs hover:shadow-sm transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center shadow-2xs mb-2.5 mx-auto">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug text-center">
                الشركات
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed mt-1 text-center">
                توريد للمؤسسات
                <br />
                والشركات والمصانع
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            5. WATER BANNER (بانر المياه)
            ======================================================== */}
        <section className="bg-[#072448] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 relative overflow-hidden shadow-md flex items-center justify-between mt-3 mb-6">
          {/* Water Splash Ripple Graphic on Left */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden relative opacity-95">
            <img
              src="/assets/water_drop_ripple.jpg"
              alt="المياه أثمن من أن تهدر"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover scale-125"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#072448]/90"></div>
          </div>

          {/* Right Text */}
          <div className="text-right pr-2">
            <h3 className="text-base sm:text-xl font-black text-white leading-tight">
              المياه أثمن من أن تهدر
            </h3>
            <p className="text-sky-200 text-xs sm:text-sm font-semibold mt-1">
              نلتزم بالجودة ... لخدمة مجتمعنا
            </p>
          </div>
        </section>
      </main>

      {/* ========================================================
          FOOTER (فوتر احترافي وبسيط ومناسب لشاشات الجوال)
          ======================================================== */}
      <Footer />

      {/* ========================================================
          7. ORDER & TRACK MODALS (نوافذ طلب صهريج مياه ومتابعة الطلب)
          ======================================================== */}
      <WaterOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />

      <TrackOrderModal
        isOpen={isTrackOrderModalOpen}
        onClose={() => setIsTrackOrderModalOpen(false)}
        onOpenNewOrder={() => setIsOrderModalOpen(true)}
      />

      {/* ========================================================
          SIDE MENU DRAWER (Hamburger)
          ======================================================== */}
      {isMenuDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
          onClick={() => setIsMenuDrawerOpen(false)}
        >
          <div
            className="w-72 sm:w-80 bg-white h-full shadow-2xl p-4 flex flex-col justify-between text-right animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    نبع لتوريد المياه
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    NABAA - DESALINATED WATER SUPPLY
                  </p>
                </div>
                <button
                  onClick={() => setIsMenuDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="py-4 space-y-1.5">
                <button
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    scrollToTop(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-800 text-xs font-bold transition"
                >
                  <span>🏠</span>
                  <span>الرئيسية</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    setIsOrderModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-sky-50 text-[#0066d6] text-xs font-bold transition"
                >
                  <span>📋</span>
                  <span>طلب صهريج مياه فوري</span>
                </button>

                <button
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    setIsTrackOrderModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-800 text-xs font-bold transition"
                >
                  <Search className="w-4 h-4 text-sky-600" />
                  <span>متابعة حالة طلبك</span>
                </button>

                <a
                  href="tel:0567071399"
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-800 text-xs font-bold transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>الاتصال المباشر</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-bold dir-ltr">
                    0567071399
                  </span>
                </a>

                <a
                  href={`https://wa.me/966567071399?text=${encodeURIComponent('السلام عليكم، أرغب في طلب صهريج مياه')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-800 text-xs font-bold transition"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>طلب واتساب المعتمد</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-600 font-bold dir-ltr">
                    0567071399
                  </span>
                </a>
              </div>

              {/* Administrative Portal Toggle */}
              {onOpenAdminDashboard && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    خاص بإدارة العمليات والتوريدات
                  </span>
                  <button
                    onClick={() => {
                      setIsMenuDrawerOpen(false);
                      if (onOpenAdminDashboard) {
                        onOpenAdminDashboard();
                      }
                      scrollToTop(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#0a2540] text-white text-xs font-bold shadow-xs hover:bg-slate-900 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>لوحة إدارة العمليات والتوريدات</span>
                      {pendingOrdersCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black font-mono animate-pulse">
                          {pendingOrdersCount}
                        </span>
                      )}
                    </div>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Driver Portal Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    setActiveTab(authenticatedDriver ? 'driver_portal' : 'driver_login');
                    scrollToTop(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-100" />
                    <span>بوابة السائقين (توثيق التوريد بالكاميرا)</span>
                  </div>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-slate-100">
              نبع لتوريد المياه (NABAA) © {new Date().getFullYear()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CLIENTS MODAL (عملاؤنا)
          ======================================================== */}
      {isClientsModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsClientsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl text-right animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">عملاؤنا الكرام</h3>
              <button
                onClick={() => setIsClientsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-800">
                  المنازل والفلل والمجمعات السكنية
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-800">
                  شركات المقاولات والإنشاءات الكبرى
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-slate-800">
                  المزارع والاستراحات والمنشآت
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setIsClientsModalOpen(false);
                  setIsOrderModalOpen(true);
                }}
                className="flex-1 py-2 bg-[#0066d6] hover:bg-[#0054b3] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                اطلب صهريجك الآن
              </button>
              {onOpenCustomersView && (
                <button
                  onClick={() => {
                    setIsClientsModalOpen(false);
                    onOpenCustomersView();
                    scrollToTop(true);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  سجل العملاء
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicHomeView;


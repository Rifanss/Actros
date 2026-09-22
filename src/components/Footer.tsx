import React from 'react';
import {
  MapPin,
  Clock,
  ChevronUp,
} from 'lucide-react';
import { scrollToTop } from '../utils/scrollUtils';

interface FooterProps {
  onOpenOrderModal?: () => void;
  onOpenTrackModal?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-gradient-to-b from-[#061d36] to-[#031326] text-white pt-8 pb-10 sm:pb-8 px-4 sm:px-6 relative overflow-hidden border-t border-sky-900/40"
      dir="rtl"
    >
      {/* Decorative subtle water wave glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />
      <div className="absolute -top-24 right-1/2 translate-x-1/2 w-96 h-48 bg-sky-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Top Bar: Brand + Scroll to Top */}
        <div className="flex items-center justify-between gap-3 pb-5 border-b border-white/10">
          <div>
            <h2 className="text-sm font-black tracking-wide text-white">
              نبع لتوريد المياه
            </h2>
            <p className="text-[10px] text-sky-300 font-mono tracking-wider">
              NABAA WATER SUPPLY
            </p>
          </div>

          <button
            onClick={() => scrollToTop(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-sky-200 text-[11px] font-bold border border-white/10 transition active:scale-95 cursor-pointer"
            title="الرجوع لأعلى الصفحة"
            aria-label="الرجوع لأعلى الصفحة"
          >
            <span>للأعلى</span>
            <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
          </button>
        </div>

        {/* Essential Info Badges: Location & Operating Hours */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-3 px-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5 min-w-0">
            <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">خدمة التوريد على مدار الساعة 24/7</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">تغطية سريعة لجميع الأحياء والمواقع</span>
          </div>
        </div>

        {/* WhatsApp & Call Direct Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-2 px-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px]">
          <a
            href={`https://wa.me/966567071399?text=${encodeURIComponent('السلام عليكم، أرغب في طلب صهريج مياه')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition"
          >
            <span>واتساب الطلبات:</span>
            <span className="font-mono font-bold dir-ltr">0567071399</span>
          </a>
          <span className="text-white/20 hidden sm:inline">|</span>
          <a
            href="tel:0567071399"
            className="flex items-center gap-1.5 text-sky-300 hover:text-sky-200 transition"
          >
            <span>الاتصال المباشر:</span>
            <span className="font-mono font-bold dir-ltr">0567071399</span>
          </a>
        </div>

        {/* Bottom Copyright & Guarantee */}
        <div className="pt-2 text-center space-y-1 text-slate-400">
          <p className="text-[11px] font-medium">
            نبع لتوريد المياه (NABAA) — مياه تحلية مطابقة للمواصفات القياسية
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            جميع الحقوق محفوظة © {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

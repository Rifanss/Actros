import React, { useState } from 'react';
import { useWaterData } from '../context/WaterDataContext';
import { Calendar, User, Search, RefreshCw, Bell, Truck } from 'lucide-react';
import NotificationsModal from './NotificationsModal';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { resetToDefaultData, pendingOrdersCount, setActiveTab, authenticatedDriver } = useWaterData();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Arabic formatted date
  const todayDateFormatted = new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <>
      <header className="bg-gradient-to-b from-[#023561] to-[#03457a] text-white py-2 px-3 sm:px-4 shadow-sm rounded-b-xl border-b border-sky-400/30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* User profile info & Date */}
          <div className="flex items-center gap-2.5 text-right flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/30 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">مدير النظام : مرحبا ثامر</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="متصل الآن"></span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-md border border-white/15 text-[10px] text-sky-100">
              <Calendar className="w-3 h-3 text-sky-300 shrink-0" />
              <span>{todayDateFormatted}</span>
            </div>
          </div>

          {/* Quick actions: Notifications icon with count, Search & Reset */}
          <div className="flex items-center gap-1.5">
            {/* Small Notifications button with icon & count beside it, without text */}
            <button
              id="header-notifications-btn"
              onClick={() => setIsNotificationsOpen(true)}
              aria-label="الإشعارات"
              title={pendingOrdersCount > 0 ? `الإشعارات (${pendingOrdersCount})` : 'الإشعارات'}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black transition cursor-pointer active:scale-95 border ${
                pendingOrdersCount > 0
                  ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 border-amber-300 shadow-2xs animate-pulse'
                  : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] font-black leading-none">
                {pendingOrdersCount}
              </span>
            </button>

            {/* Driver Portal Access Button */}
            <button
              id="header-driver-portal-btn"
              onClick={() => setActiveTab(authenticatedDriver ? 'driver_portal' : 'driver_login')}
              aria-label="بوابة السائقين"
              title="الدخول إلى واجهة السائقين وتوثيق التوريد"
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition rounded-lg text-[11px] font-bold text-white border border-emerald-500 shadow-2xs cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-100" />
              <span>{authenticatedDriver ? `السائق (${authenticatedDriver.driver_name})` : 'دخول السائق'}</span>
            </button>

            <button
              id="header-quick-search-btn"
              onClick={onOpenSearch}
              aria-label="بحث سريع عن عميل"
              className="flex items-center gap-1 px-2.5 py-1 bg-white/15 hover:bg-white/25 active:scale-95 transition rounded-lg text-[11px] text-white border border-white/20 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-sky-200" />
              <span className="hidden sm:inline">بحث عن عميل</span>
            </button>

            <button
              id="header-reset-defaults-btn"
              onClick={() => {
                if (window.confirm('هل تريد استعادة البيانات الافتراضية المتطابقة مع لوحة القيادة؟')) {
                  resetToDefaultData();
                }
              }}
              title="استعادة البيانات التجريبية"
              className="p-1.5 bg-white/10 hover:bg-white/20 active:rotate-180 transition-all rounded-lg text-white border border-white/15 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-200" />
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Details Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
};

export default Header;

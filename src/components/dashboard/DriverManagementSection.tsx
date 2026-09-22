import React, { useState } from 'react';
import { Users, Truck, CheckCircle2, Clock, LogIn, Shield, ChevronDown, Award } from 'lucide-react';
import { useWaterData } from '../../context/WaterDataContext';
import { Driver } from '../../types';

export const DriverManagementSection: React.FC = () => {
  const { drivers, getDriverStats, loginDriver, setActiveTab, showNotification } = useWaterData();
  const [isOpen, setIsOpen] = useState(true);

  const handleLoginAsDriver = (driver: Driver) => {
    const username = driver.username || driver.driver_name;
    const result = loginDriver(username, '123456');
    if (result.success) {
      setActiveTab('driver_portal');
    } else {
      showNotification(result.message, 'error');
    }
  };

  return (
    <section id="section-driver-management" className="space-y-2">
      <div className="bg-gradient-to-l from-white via-white to-sky-50/40 rounded-xl border border-sky-200/90 border-r-[4px] border-r-[#03457a] shadow-2xs overflow-hidden transition hover:border-sky-300">
        {/* Header Toggle */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-2.5 sm:p-3 flex items-center justify-between gap-2 cursor-pointer select-none text-right"
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-6 h-6 rounded-md bg-[#03457a]/10 border border-[#03457a]/20 text-[#03457a] flex items-center justify-center shrink-0 shadow-2xs">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-[11.5px] font-extrabold text-slate-900 font-['Tajawal',sans-serif] leading-tight">
                إدارة حسابات السائقين
              </h2>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-sky-100 text-sky-900 border border-sky-200">
                {drivers.length} حسابات نشطة
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1 text-slate-400">
            <span className="text-[9.5px] hidden sm:inline font-medium text-sky-800">
              {isOpen ? 'إخفاء' : 'عرض السائقين'}
            </span>
            <div className="w-6 h-6 rounded-md bg-sky-50 flex items-center justify-center border border-sky-200 text-sky-800">
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Content Body */}
        {isOpen && (
          <div className="p-2 sm:p-2.5 border-t border-slate-100 bg-slate-50/40 space-y-2">
            <div className="flex items-center justify-between text-[9.5px] text-slate-500 px-1">
              <span>قائمة السائقين المعتمدين في النظام وصلاحيات التوريد الميداني</span>
              <button
                onClick={() => setActiveTab('driver_login')}
                className="font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 underline cursor-pointer"
              >
                <LogIn className="w-3 h-3" />
                <span>شاشة دخول السائق</span>
              </button>
            </div>

            {/* Drivers Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-bold text-[9px] border-b border-slate-200">
                    <th className="py-1.5 px-2">السائق</th>
                    <th className="py-1.5 px-2 text-center">اسم المستخدم</th>
                    <th className="py-1.5 px-2 text-center">حالة الحساب</th>
                    <th className="py-1.5 px-2 text-center">الطلبات الحالية</th>
                    <th className="py-1.5 px-2 text-center">توريدات اليوم</th>
                    <th className="py-1.5 px-2 text-center">آخر نشاط</th>
                    <th className="py-1.5 px-2 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[10px]">
                  {drivers.map((driver) => {
                    const stats = getDriverStats(driver.id);
                    return (
                      <tr key={driver.id} className="hover:bg-sky-50/40 transition">
                        {/* Driver Name & Vehicle */}
                        <td className="py-1.5 px-2">
                          <div className="font-bold text-slate-900 text-[10.5px]">
                            {driver.driver_name}
                          </div>
                          <div className="text-[8.5px] text-slate-400 truncate max-w-[150px]">
                            {driver.vehicle}
                          </div>
                        </td>

                        {/* Username */}
                        <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-700 text-[10px]">
                          {driver.username || driver.driver_name}
                        </td>

                        {/* Status */}
                        <td className="py-1.5 px-2 text-center">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[8.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            نشط
                          </span>
                        </td>

                        {/* Active Orders Count */}
                        <td className="py-1.5 px-2 text-center">
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded font-bold font-mono text-[9.5px] ${
                              stats.activeOrdersCount > 0
                                ? 'bg-amber-100 text-amber-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {stats.activeOrdersCount} طلبات
                          </span>
                        </td>

                        {/* Completed Today Count */}
                        <td className="py-1.5 px-2 text-center">
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded font-bold font-mono text-[9.5px] ${
                              stats.todayCompletedCount > 0
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {stats.todayCompletedCount} منجز
                          </span>
                        </td>

                        {/* Last Active */}
                        <td className="py-1.5 px-2 text-center font-mono text-[8.5px] text-slate-500">
                          {driver.last_active || 'اليوم 08:30'}
                        </td>

                        {/* Quick Login Action */}
                        <td className="py-1.5 px-2 text-center">
                          <button
                            onClick={() => handleLoginAsDriver(driver)}
                            className="inline-flex items-center gap-1 px-2 py-0.8 rounded-md bg-[#03457a] hover:bg-[#023561] text-white font-bold text-[9px] shadow-2xs transition active:scale-95 cursor-pointer"
                            title={`الدخول بحساب ${driver.driver_name}`}
                          >
                            <LogIn className="w-2.5 h-2.5" />
                            <span>دخول كـ {driver.driver_name}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

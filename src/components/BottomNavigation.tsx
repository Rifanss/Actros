import React from 'react';
import { useWaterData } from '../context/WaterDataContext';
import { ActiveTab } from '../types';
import { Home, ClipboardList, Plus, BarChart3, Settings, Truck, Receipt, Users } from 'lucide-react';
import { scrollToTop } from '../utils/scrollUtils';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useWaterData();

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    scrollToTop(true);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl pb-[env(safe-area-inset-bottom,0px)] print:hidden">
      <div className="max-w-md sm:max-w-xl md:max-w-4xl mx-auto px-1 sm:px-2 py-1 flex items-center justify-between relative">
        {/* 1. الرئيسية */}
        <button
          id="nav-home-btn"
          onClick={() => handleTabClick('home')}
          className={`flex-1 flex flex-col items-center justify-center py-0.5 transition-all ${
            activeTab === 'home'
              ? 'text-sky-700 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-0.5 sm:p-1 rounded-md transition ${activeTab === 'home' ? 'bg-sky-50 text-sky-700' : ''}`}>
            <Home className="w-3.5 h-3.5" />
          </div>
          <span className="text-[7.5px] sm:text-[8.5px] whitespace-nowrap leading-none mt-0.5">الرئيسية</span>
        </button>

        {/* 2. سجل التوريدات */}
        <button
          id="nav-deliveries-btn"
          onClick={() => handleTabClick('deliveries')}
          className={`flex-1 flex flex-col items-center justify-center py-0.5 transition-all ${
            activeTab === 'deliveries'
              ? 'text-sky-700 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-0.5 sm:p-1 rounded-md transition ${activeTab === 'deliveries' ? 'bg-sky-50 text-sky-700' : ''}`}>
            <ClipboardList className="w-3.5 h-3.5" />
          </div>
          <span className="text-[7.5px] sm:text-[8.5px] whitespace-nowrap leading-none mt-0.5">التوريدات</span>
        </button>

        {/* 3. قسم العملاء */}
        <button
          id="nav-customers-btn"
          onClick={() => handleTabClick('customers')}
          className={`flex-1 flex flex-col items-center justify-center py-0.5 transition-all ${
            activeTab === 'customers'
              ? 'text-sky-700 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-0.5 sm:p-1 rounded-md transition ${activeTab === 'customers' ? 'bg-sky-50 text-sky-700' : ''}`}>
            <Users className="w-3.5 h-3.5" />
          </div>
          <span className="text-[7.5px] sm:text-[8.5px] whitespace-nowrap leading-none mt-0.5">العملاء</span>
        </button>

        {/* 4. الحسابات والفواتير */}
        <button
          id="nav-accounts-btn"
          onClick={() => handleTabClick('accounts')}
          className={`flex-1 flex flex-col items-center justify-center py-0.5 transition-all ${
            activeTab === 'accounts'
              ? 'text-sky-700 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-0.5 sm:p-1 rounded-md transition ${activeTab === 'accounts' ? 'bg-sky-50 text-sky-700' : ''}`}>
            <Receipt className="w-3.5 h-3.5" />
          </div>
          <span className="text-[7.5px] sm:text-[8.5px] whitespace-nowrap leading-none mt-0.5">الحسابات</span>
        </button>

        {/* 5. إضافة توريد (+) */}
        <div className="flex-1 flex flex-col items-center justify-center relative -top-1.5">
          <button
            id="nav-add-supply-btn"
            onClick={() => handleTabClick('add')}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-sky-600 to-sky-400 text-white shadow-xs shadow-sky-500/30 flex items-center justify-center border-2 border-white active:scale-90 transition-transform cursor-pointer group"
            aria-label="إضافة توريد جديد"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
          </button>
          <span
            className={`text-[7.5px] sm:text-[8.5px] font-bold mt-0.5 whitespace-nowrap leading-none ${
              activeTab === 'add' ? 'text-sky-700' : 'text-slate-400'
            }`}
          >
            إضافة
          </span>
        </div>

        {/* 6. التشغيل والمصروفات */}
        <button
          id="nav-operations-btn"
          onClick={() => handleTabClick('operations')}
          className={`flex-1 flex flex-col items-center justify-center py-0.5 transition-all ${
            activeTab === 'operations'
              ? 'text-sky-700 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-0.5 sm:p-1 rounded-md transition ${activeTab === 'operations' ? 'bg-sky-50 text-sky-700' : ''}`}>
            <Truck className="w-3.5 h-3.5" />
          </div>
          <span className="text-[7.5px] sm:text-[8.5px] whitespace-nowrap leading-none mt-0.5">التشغيل</span>
        </button>

        {/* 7. التقارير */}
        <button
          id="nav-reports-btn"
          onClick={() => handleTabClick('reports')}
          className={`flex-1 flex flex-col items-center justify-center py-0.5 transition-all ${
            activeTab === 'reports'
              ? 'text-sky-700 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-0.5 sm:p-1 rounded-md transition ${activeTab === 'reports' ? 'bg-sky-50 text-sky-700' : ''}`}>
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <span className="text-[7.5px] sm:text-[8.5px] whitespace-nowrap leading-none mt-0.5">التقارير</span>
        </button>

        {/* 8. الإعدادات */}
        <button
          id="nav-settings-btn"
          onClick={() => handleTabClick('settings')}
          className={`flex-1 flex flex-col items-center justify-center py-0.5 transition-all ${
            activeTab === 'settings'
              ? 'text-sky-700 font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-0.5 sm:p-1 rounded-md transition ${activeTab === 'settings' ? 'bg-sky-50 text-sky-700' : ''}`}>
            <Settings className="w-3.5 h-3.5" />
          </div>
          <span className="text-[7.5px] sm:text-[8.5px] whitespace-nowrap leading-none mt-0.5">الإعدادات</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;


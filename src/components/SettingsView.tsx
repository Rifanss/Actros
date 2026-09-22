import React, { useState } from 'react';
import { useWaterData } from '../context/WaterDataContext';
import { PriceConfig, Driver } from '../types';
import { Settings, Coins, Users, Plus, Save, RotateCcw, Check, Trash2 } from 'lucide-react';
import { useScrollToTop } from '../utils/scrollUtils';

export const SettingsView: React.FC = () => {
  const {
    priceConfig,
    updatePriceConfig,
    drivers,
    addDriver,
    updateDriver,
    deleteDriver,
    resetToDefaultData,
    clearAllCustomers,
    clearAllDeliveries,
    clearAllCustomerOrders,
    clearAllData,
  } = useWaterData();

  // Guarantee settings view starts at top (0, 0)
  useScrollToTop();

  // Local prices state
  const [localPrices, setLocalPrices] = useState<PriceConfig>(priceConfig);
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverVehicle, setNewDriverVehicle] = useState('');
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [savedPricesSuccess, setSavedPricesSuccess] = useState(false);

  const handleSavePrices = (e: React.FormEvent) => {
    e.preventDefault();
    updatePriceConfig(localPrices);
    setSavedPricesSuccess(true);
    setTimeout(() => setSavedPricesSuccess(false), 2000);
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim()) return;

    addDriver({
      driver_name: newDriverName.trim(),
      mobile: newDriverPhone.trim(),
      phone: newDriverPhone.trim(),
      vehicle: newDriverVehicle.trim() || 'صهريج مياه',
      status: 'active',
    });

    setNewDriverName('');
    setNewDriverPhone('');
    setNewDriverVehicle('');
    setShowAddDriver(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-3 pb-16 space-y-2 text-right">
      {/* Pricing Configuration */}
      <div className="bg-white rounded-xl p-2.5 sm:p-3 shadow-2xs border border-slate-200/70">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-sky-700" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800">
              تسعير صهاريج المياه الافتراضي (SAR)
            </h2>
          </div>
          {savedPricesSuccess && (
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              تم حفظ الأسعار!
            </span>
          )}
        </div>

        <form onSubmit={handleSavePrices} className="space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* Desalination 12t */}
            <div className="p-2 bg-sky-50/60 rounded-lg border border-sky-100">
              <label className="text-[11px] font-bold text-sky-900 block mb-0.5">
                تحلية (12 طن - عايدي)
              </label>
              <input
                type="number"
                value={localPrices['تحلية_12'] ?? localPrices['تحلية_11'] ?? 200}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLocalPrices((prev) => ({ ...prev, تحلية_12: val, تحلية_11: val }));
                }}
                className="w-full text-xs font-bold py-1 px-2 bg-white rounded border border-sky-200 font-mono"
              />
            </div>

            {/* Desalination 18t */}
            <div className="p-2 bg-sky-50/60 rounded-lg border border-sky-100">
              <label className="text-[11px] font-bold text-sky-900 block mb-0.5">
                تحلية (18 طن - سكس)
              </label>
              <input
                type="number"
                value={localPrices['تحلية_18']}
                onChange={(e) =>
                  setLocalPrices((prev) => ({ ...prev, تحلية_18: Number(e.target.value) }))
                }
                className="w-full text-xs font-bold py-1 px-2 bg-white rounded border border-sky-200 font-mono"
              />
            </div>

            {/* Desalination 30t */}
            <div className="p-2 bg-sky-50/60 rounded-lg border border-sky-100">
              <label className="text-[11px] font-bold text-sky-900 block mb-0.5">
                تحلية (30 طن - تريلا)
              </label>
              <input
                type="number"
                value={localPrices['تحلية_30']}
                onChange={(e) =>
                  setLocalPrices((prev) => ({ ...prev, تحلية_30: Number(e.target.value) }))
                }
                className="w-full text-xs font-bold py-1 px-2 bg-white rounded border border-sky-200 font-mono"
              />
            </div>

            {/* Well 12t */}
            <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100">
              <label className="text-[11px] font-bold text-emerald-900 block mb-0.5">
                آبار (12 طن - عايدي)
              </label>
              <input
                type="number"
                value={localPrices['آبار_12'] ?? localPrices['آبار_11'] ?? 180}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLocalPrices((prev) => ({ ...prev, آبار_12: val, آبار_11: val }));
                }}
                className="w-full text-xs font-bold py-1 px-2 bg-white rounded border border-emerald-200 font-mono"
              />
            </div>

            {/* Well 18t */}
            <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100">
              <label className="text-[11px] font-bold text-emerald-900 block mb-0.5">
                آبار (18 طن - سكس)
              </label>
              <input
                type="number"
                value={localPrices['آبار_18']}
                onChange={(e) =>
                  setLocalPrices((prev) => ({ ...prev, آبار_18: Number(e.target.value) }))
                }
                className="w-full text-xs font-bold py-1 px-2 bg-white rounded border border-emerald-200 font-mono"
              />
            </div>

            {/* Well 30t */}
            <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100">
              <label className="text-[11px] font-bold text-emerald-900 block mb-0.5">
                آبار (30 طن - تريلا)
              </label>
              <input
                type="number"
                value={localPrices['آبار_30']}
                onChange={(e) =>
                  setLocalPrices((prev) => ({ ...prev, آبار_30: Number(e.target.value) }))
                }
                className="w-full text-xs font-bold py-1 px-2 bg-white rounded border border-emerald-200 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>حفظ الأسعار</span>
          </button>
        </form>
      </div>

      {/* Driver Management */}
      <div className="bg-white rounded-xl p-2.5 sm:p-3 shadow-2xs border border-slate-200/70">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-sky-700" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800">
              إدارة السائقين والأسطول
            </h2>
          </div>
          <button
            onClick={() => setShowAddDriver(!showAddDriver)}
            className="flex items-center gap-1 px-2 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>إضافة سائق</span>
          </button>
        </div>

        {/* Add Driver form */}
        {showAddDriver && (
          <form onSubmit={handleAddDriver} className="bg-slate-50 p-2 rounded-lg border border-slate-200 mb-2 space-y-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <input
                type="text"
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
                className="py-1 px-2 text-xs bg-white rounded border border-slate-200"
                required
              />
              <input
                type="tel"
                value={newDriverPhone}
                onChange={(e) => setNewDriverPhone(e.target.value)}
                className="py-1 px-2 text-xs bg-white rounded border border-slate-200"
              />
              <input
                type="text"
                value={newDriverVehicle}
                onChange={(e) => setNewDriverVehicle(e.target.value)}
                className="py-1 px-2 text-xs bg-white rounded border border-slate-200"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1 bg-sky-700 text-white rounded text-xs font-bold cursor-pointer"
            >
              حفظ السائق
            </button>
          </form>
        )}

        <div className="space-y-1.5">
          {drivers.map((drv) => (
            <div
              key={drv.id}
              className="p-2 bg-slate-50/80 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block text-xs">{drv.driver_name}</span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {drv.vehicle}
                    {(drv.mobile || drv.phone) ? ` - ${drv.mobile || drv.phone}` : ''}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] rounded-full font-bold">
                نشط
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Customers and Deliveries Data (Preserve Drivers and Vehicles) */}
      <div className="bg-sky-50/70 rounded-xl p-2.5 sm:p-3 border border-sky-200 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-[#03457a]">حذف بيانات العملاء والتوريدات (مع الإبقاء على السائقين والسيارات)</h3>
          <p className="text-[10px] text-slate-600">
            حذف كافة سجلات العملاء والتوريدات وطلبات المياه بالكامل، مع الحفاظ التام على السائقين والشاحنات وإعداداتها.
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('هل أنت متأكد من رغبتك في حذف بيانات العملاء والتوريدات؟ سيتم الحفاظ على السائقين والسيارات دون أي مساس.')) {
              clearAllCustomers();
              clearAllDeliveries();
              clearAllCustomerOrders();
            }
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#03457a] hover:bg-[#023561] text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0 shadow-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>حذف العملاء والتوريدات</span>
        </button>
      </div>

      {/* Clear All Data Danger Zone */}
      <div className="bg-rose-50/70 rounded-xl p-2.5 sm:p-3 border border-rose-200 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-rose-900">حذف وتصفير جميع البيانات</h3>
          <p className="text-[10px] text-rose-700">
            تصفير وحذف كافة التوريدات، العملاء، الفواتير، المدفوعات، حركات الوقود ومصروفات الشاحنات بالكامل.
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('تحذير: هل أنت متأكد تماماً من رغبتك في حذف وتصفير جميع بيانات النظام نهائياً؟ لا يمكن التراجع عن هذه العملية.')) {
              clearAllData();
            }
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0 shadow-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>حذف جميع البيانات</span>
        </button>
      </div>

      {/* Clear Customers Data */}
      <div className="bg-amber-50/60 rounded-xl p-2.5 sm:p-3 border border-amber-200 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-amber-900">حذف كافة بيانات العملاء</h3>
          <p className="text-[10px] text-amber-700">
            حذف وإفراغ سجل العملاء والفواتير والمدفوعات الخاصة بهم بالكامل.
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('هل أنت متأكد من رغبتك في حذف كافة بيانات وسجلات العملاء؟')) {
              clearAllCustomers();
            }
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>حذف العملاء</span>
        </button>
      </div>

      {/* Clear Customer Orders */}
      <div className="bg-amber-50/60 rounded-xl p-2.5 sm:p-3 border border-amber-200 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-amber-900">حذف كافة طلبات التوريد</h3>
          <p className="text-[10px] text-amber-700">
            حذف وإفراغ جميع طلبات التوريد الجديدة والإلكترونية بالكامل.
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('هل أنت متأكد من رغبتك في حذف كافة طلبات التوريد؟')) {
              clearAllCustomerOrders();
            }
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>حذف طلبات التوريد</span>
        </button>
      </div>

      {/* Clear Deliveries Data */}
      <div className="bg-amber-50/60 rounded-xl p-2.5 sm:p-3 border border-amber-200 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-amber-900">حذف سجلات وبطاقات التوريد اليومية</h3>
          <p className="text-[10px] text-amber-700">
            حذف وإفراغ كافة بطاقات وسجلات التوريد المنفذة من النظام.
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('هل أنت متأكد من رغبتك في حذف كافة سجلات وبطاقات التوريد؟')) {
              clearAllDeliveries();
            }
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>حذف التوريدات</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsView;

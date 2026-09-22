import React, { useState, useMemo } from 'react';
import { useWaterData } from '../../context/WaterDataContext';
import { FilterPeriod, DesalinationBalanceTransaction, FuelTransaction, VehicleExpense, Delivery } from '../../types';
import BackButton from '../BackButton';
import {
  ArrowRight,
  Droplets,
  Fuel,
  Wrench,
  TrendingUp,
  ListFilter,
  Plus,
  Calendar,
  DollarSign,
  Gauge,
  User,
  Truck,
  Trash2,
  Receipt,
  FileSpreadsheet,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { A4DocumentPreviewModal } from '../common/A4DocumentPreviewModal';
import { A4PageSheet } from '../common/A4PageSheet';

interface VehicleDetailsViewProps {
  vehicleId: string;
  onBack: () => void;
  onOpenRecharge: (vehicleId: string) => void;
  onOpenAddFuel: (vehicleId: string) => void;
  onOpenAddExpense: (vehicleId: string) => void;
}

type DetailsSubTab = 'desalination' | 'fuel' | 'expenses' | 'financials' | 'unified_log';

export const VehicleDetailsView: React.FC<VehicleDetailsViewProps> = ({
  vehicleId,
  onBack,
  onOpenRecharge,
  onOpenAddFuel,
  onOpenAddExpense,
}) => {
  const {
    vehicles,
    drivers,
    deliveries,
    desalinationTransactions,
    fuelTransactions,
    vehicleExpenses,
    operationsFilter,
    setOperationsFilter,
    getVehicleFinancialSummary,
    deleteDesalinationTransaction,
    deleteFuelTransaction,
    deleteVehicleExpense,
  } = useWaterData();

  const [activeSubTab, setActiveSubTab] = useState<DetailsSubTab>('desalination');
  const [unifiedFilterType, setUnifiedFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPrintLogOpen, setIsPrintLogOpen] = useState<boolean>(false);

  const vehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0];
  const driver = drivers.find((d) => d.id === vehicle?.assigned_driver_id || d.vehicle_id === vehicle?.id);

  const summary = useMemo(() => {
    return vehicle ? getVehicleFinancialSummary(vehicle.id, operationsFilter) : null;
  }, [vehicle?.id, operationsFilter, getVehicleFinancialSummary]);

  // Specific lists for this vehicle
  const vehicleDesalTransactions = useMemo(() => {
    if (!vehicle) return [];
    return desalinationTransactions
      .filter((t) => t.vehicle_id === vehicle.id)
      .sort((a, b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`));
  }, [desalinationTransactions, vehicle?.id]);

  const vehicleFuelTransactions = useMemo(() => {
    if (!vehicle) return [];
    return fuelTransactions
      .filter((f) => f.vehicle_id === vehicle.id)
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  }, [fuelTransactions, vehicle?.id]);

  const vehicleExpenseTransactions = useMemo(() => {
    if (!vehicle) return [];
    return vehicleExpenses
      .filter((e) => e.vehicle_id === vehicle.id)
      .sort((a, b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`));
  }, [vehicleExpenses, vehicle?.id]);

  const vehicleDeliveries = useMemo(() => {
    if (!vehicle) return [];
    return deliveries
      .filter((d) => d.driver_id === vehicle.assigned_driver_id || (driver && d.driver_id === driver.id))
      .sort((a, b) => `${b.supply_date} ${b.supply_time}`.localeCompare(`${a.supply_date} ${a.supply_time}`));
  }, [deliveries, vehicle?.assigned_driver_id, driver]);

  // Unified operations log (all chronological events)
  const unifiedMovements = useMemo(() => {
    const list: Array<{
      id: string;
      date: string;
      time: string;
      rawType: 'desal_recharge' | 'desal_consumption' | 'fuel' | 'expense' | 'delivery';
      typeLabel: string;
      title: string;
      details: string;
      amount: number;
      isIncome: boolean;
      paymentMethod?: string;
    }> = [];

    // Desal transactions
    vehicleDesalTransactions.forEach((t) => {
      list.push({
        id: t.id,
        date: t.date,
        time: t.time || '12:00',
        rawType: t.type === 'recharge' ? 'desal_recharge' : 'desal_consumption',
        typeLabel: t.type === 'recharge' ? 'شحن تحلية' : 'استهلاك تحلية',
        title: t.station_name,
        details: t.notes || (t.reference_number ? `سند: ${t.reference_number}` : 'حركة رصيد تحلية'),
        amount: t.amount,
        isIncome: false,
        paymentMethod: t.payment_method,
      });
    });

    // Fuel transactions
    vehicleFuelTransactions.forEach((f) => {
      list.push({
        id: f.id,
        date: f.date,
        time: f.time,
        rawType: 'fuel',
        typeLabel: 'ديزل',
        title: f.gas_station,
        details: `${f.liters.toLocaleString('en-US')} لتر بسعر ${f.price_per_liter.toLocaleString('en-US')} ر.س | عداد: ${f.odometer_reading ? f.odometer_reading.toLocaleString('en-US') : '-'} كم`,
        amount: f.total_amount,
        isIncome: false,
        paymentMethod: f.payment_method,
      });
    });

    // Expenses
    vehicleExpenseTransactions.forEach((e) => {
      list.push({
        id: e.id,
        date: e.date,
        time: e.time || '12:00',
        rawType: 'expense',
        typeLabel: `مصروف - ${e.category}`,
        title: e.description,
        details: `${e.vendor_name} ${e.notes ? `(${e.notes})` : ''}`,
        amount: e.amount,
        isIncome: false,
        paymentMethod: e.payment_method,
      });
    });

    // Deliveries
    vehicleDeliveries.forEach((d) => {
      list.push({
        id: d.id,
        date: d.supply_date,
        time: d.supply_time,
        rawType: 'delivery',
        typeLabel: 'إيراد توريد',
        title: `توريد ${d.supply_type} (${d.tank_capacity})`,
        details: `${d.customer_name} - ${d.location}`,
        amount: d.price,
        isIncome: true,
        paymentMethod: d.payment_method,
      });
    });

    return list.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  }, [vehicleDesalTransactions, vehicleFuelTransactions, vehicleExpenseTransactions, vehicleDeliveries]);

  const filteredUnifiedMovements = useMemo(() => {
    return unifiedMovements.filter((m) => {
      if (unifiedFilterType !== 'all' && m.rawType !== unifiedFilterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          m.title.toLowerCase().includes(q) ||
          m.details.toLowerCase().includes(q) ||
          m.typeLabel.toLowerCase().includes(q) ||
          (m.paymentMethod && m.paymentMethod.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [unifiedMovements, unifiedFilterType, searchQuery]);

  // Chunking for A4 page presentation
  const movementsPerPage = 12;
  const movementPages = useMemo(() => {
    if (filteredUnifiedMovements.length === 0) return [[]];
    const pages = [];
    for (let i = 0; i < filteredUnifiedMovements.length; i += movementsPerPage) {
      pages.push(filteredUnifiedMovements.slice(i, i + movementsPerPage));
    }
    return pages;
  }, [filteredUnifiedMovements]);

  // Quick Period Switcher
  const handlePeriodChange = (p: FilterPeriod) => {
    setOperationsFilter((prev) => ({ ...prev, period: p }));
  };

  return (
    <div className="space-y-2 pb-8 animate-in fade-in duration-200 text-right">
      {/* Top Bar with Back Button & Vehicle Title */}
      <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BackButton label="الرجوع" onClick={onBack} variant="light" size="xs" />
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-[12px] sm:text-[12.5px] font-extrabold text-[#03457a] leading-tight flex items-center gap-1.5">
                <span>{vehicle.name}</span>
                <span className="text-[8.5px] font-bold font-mono text-[#03457a] bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200/60">
                  {vehicle.plate_number}
                </span>
              </h2>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="flex items-center gap-2 text-[8.5px] text-slate-500 mt-0.5">
              <span className="flex items-center gap-0.5">
                <User className="w-2.5 h-2.5 text-slate-400" />
                <span>السائق: <strong className="text-slate-700">{driver?.driver_name || 'غير محدد'}</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Truck className="w-2.5 h-2.5 text-slate-400" />
                <span>السعة: <strong className="text-slate-700">{vehicle.tank_capacity}</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Gauge className="w-2.5 h-2.5 text-slate-400" />
                <span>العداد: <strong className="text-slate-700 tabular-nums font-mono" dir="ltr">{vehicle.current_odometer.toLocaleString('en-US')}</strong> كم</span>
              </span>
            </div>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg text-[9px] font-bold">
          {(
            [
              { id: 'today', label: 'اليوم' },
              { id: 'yesterday', label: 'أمس' },
              { id: 'this_week', label: 'الأسبوع' },
              { id: 'this_month', label: 'الشهر' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => handlePeriodChange(item.id)}
              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                operationsFilter.period === item.id
                  ? 'bg-white text-[#03457a] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Subtabs (5 tabs) */}
      <div className="bg-white rounded-xl p-0.5 border border-slate-200 shadow-2xs flex overflow-x-auto gap-0.5 text-[9.5px] font-bold scrollbar-none">
        <button
          onClick={() => setActiveSubTab('desalination')}
          className={`flex-1 h-6 sm:h-7 px-2 rounded-lg flex items-center justify-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'desalination'
              ? 'bg-[#03457a] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Droplets className="w-3 h-3 text-cyan-300" />
          <span>رصيد التحلية</span>
        </button>

        <button
          onClick={() => setActiveSubTab('fuel')}
          className={`flex-1 h-6 sm:h-7 px-2 rounded-lg flex items-center justify-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'fuel'
              ? 'bg-amber-700 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Fuel className="w-3 h-3 text-amber-300" />
          <span>الديزل</span>
        </button>

        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`flex-1 h-6 sm:h-7 px-2 rounded-lg flex items-center justify-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'expenses'
              ? 'bg-rose-700 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Wrench className="w-3 h-3 text-rose-300" />
          <span>المصروفات الأخرى</span>
        </button>

        <button
          onClick={() => setActiveSubTab('financials')}
          className={`flex-1 h-6 sm:h-7 px-2 rounded-lg flex items-center justify-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'financials'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-3 h-3 text-emerald-300" />
          <span>صافي الدخل والتكلفة</span>
        </button>

        <button
          onClick={() => setActiveSubTab('unified_log')}
          className={`flex-1 h-6 sm:h-7 px-2 rounded-lg flex items-center justify-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'unified_log'
              ? 'bg-slate-800 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ListFilter className="w-3 h-3 text-slate-300" />
          <span>السجل الموحد</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. TAB: رصيد التحلية (Desalination Balance) */}
      {/* ======================================================== */}
      {activeSubTab === 'desalination' && (
        <div className="space-y-2">
          {/* Desalination Metrics Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[8px] text-slate-500 font-semibold block">الرصيد السابق للفترة</span>
              <div className="text-[10px] sm:text-[10.5px] font-black text-slate-800 mt-0.5 tabular-nums font-mono" dir="ltr">
                {summary.previousDesalinationBalance.toLocaleString('en-US')} <span className="text-[8px] font-normal">ر.س</span>
              </div>
            </div>

            <div className="bg-white p-1.5 rounded-lg border border-cyan-200 bg-cyan-50/40 shadow-2xs">
              <span className="text-[8px] text-cyan-800 font-semibold block">+ شحنات الفترة</span>
              <div className="text-[10px] sm:text-[10.5px] font-black text-cyan-900 mt-0.5 tabular-nums font-mono" dir="ltr">
                {summary.rechargedDesalinationAmount.toLocaleString('en-US')} <span className="text-[8px] font-normal">ر.س</span>
              </div>
            </div>

            <div className="bg-white p-1.5 rounded-lg border border-rose-200 bg-rose-50/40 shadow-2xs">
              <span className="text-[8px] text-rose-800 font-semibold block">- استهلاك التحلية الفعلي</span>
              <div className="text-[10px] sm:text-[10.5px] font-black text-rose-900 mt-0.5 tabular-nums font-mono" dir="ltr">
                {summary.consumedDesalinationAmount.toLocaleString('en-US')} <span className="text-[8px] font-normal">ر.س</span>
              </div>
            </div>

            <div className="bg-[#03457a] text-white p-1.5 rounded-lg shadow-2xs">
              <span className="text-[8px] text-cyan-100 font-medium block">الرصيد المتبقي الحالي</span>
              <div className="text-[10px] sm:text-[10.5px] font-black mt-0.5 tabular-nums font-mono" dir="ltr">
                {summary.remainingDesalinationBalance.toLocaleString('en-US')} <span className="text-[8px] font-normal">ر.س</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button & Table Header */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <h3 className="text-[10.5px] font-bold text-slate-800 flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-600" />
              <span>سجل حركات شحن واستهلاك التحلية ({vehicleDesalTransactions.length})</span>
            </h3>
            <button
              onClick={() => onOpenRecharge(vehicle.id)}
              className="h-6 px-2 bg-[#03457a] hover:bg-[#023561] text-white font-bold rounded-md text-[9.5px] shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>شحن رصيد تحلية</span>
            </button>
          </div>

          {/* Table / List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            {vehicleDesalTransactions.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-[9.5px]">
                لا توجد حركات شحن تحلية مسجلة لهذه الشاحنة
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-[9px]">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[8.5px] font-bold">
                    <tr>
                      <th className="py-1 px-2">التاريخ والوقت</th>
                      <th className="py-1 px-2">نوع الحركة</th>
                      <th className="py-1 px-2">المحطة / الأشياب</th>
                      <th className="py-1 px-2">المبلغ</th>
                      <th className="py-1 px-2">طريقة الدفع</th>
                      <th className="py-1 px-2">السند / الملاحظات</th>
                      <th className="py-1 px-2 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicleDesalTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-1 px-2 text-slate-600 whitespace-nowrap font-medium font-mono">
                          {tx.date} <span className="text-[8px] text-slate-400">{tx.time}</span>
                        </td>
                        <td className="py-1 px-2">
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold ${
                              tx.type === 'recharge'
                                ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {tx.type === 'recharge' ? '+ شحن رصيد' : '- استهلاك رصيد'}
                          </span>
                        </td>
                        <td className="py-1 px-2 font-semibold text-slate-800">{tx.station_name}</td>
                        <td className="py-1 px-2 font-bold text-slate-900 whitespace-nowrap font-mono">
                          <span className="tabular-nums" dir="ltr">{tx.amount.toLocaleString('en-US')}</span> ر.س
                        </td>
                        <td className="py-1 px-2 text-slate-600">
                          <span className="bg-slate-100 px-1 py-0.2 rounded text-[8px] font-medium">
                            {tx.payment_method}
                          </span>
                        </td>
                        <td className="py-1 px-2 text-slate-500 text-[8.5px] max-w-xs truncate">
                          {tx.reference_number && <span className="font-bold text-slate-700 ml-1">#{tx.reference_number}</span>}
                          {tx.notes || '-'}
                        </td>
                        <td className="py-1 px-2 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm('هل تريد حذف هذه الحركة من السجل؟')) {
                                deleteDesalinationTransaction(tx.id);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition"
                            title="حذف"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. TAB: الديزل (Fuel Management) */}
      {/* ======================================================== */}
      {activeSubTab === 'fuel' && (
        <div className="space-y-2">
          {/* Fuel Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[8px] text-slate-500 font-semibold block">إجمالي اللترات بالفترة</span>
              <div className="text-[10px] sm:text-[10.5px] font-black text-slate-800 mt-0.5 tabular-nums font-mono" dir="ltr">
                {summary.totalFuelLiters.toLocaleString('en-US')} <span className="text-[8px] font-normal">لتر</span>
              </div>
            </div>

            <div className="bg-white p-1.5 rounded-lg border border-amber-200 bg-amber-50/40 shadow-2xs">
              <span className="text-[8px] text-amber-800 font-semibold block">إجمالي تكلفة الديزل</span>
              <div className="text-[10px] sm:text-[10.5px] font-black text-amber-900 mt-0.5 tabular-nums font-mono" dir="ltr">
                {summary.totalFuelCost.toLocaleString('en-US')} <span className="text-[8px] font-normal">ر.س</span>
              </div>
            </div>

            <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[8px] text-slate-500 font-semibold block">عدد مرات التعبئة</span>
              <div className="text-[10px] sm:text-[10.5px] font-black text-slate-800 mt-0.5 tabular-nums font-mono" dir="ltr">
                {summary.fuelCount} <span className="text-[8px] font-normal">مرات</span>
              </div>
            </div>

            <div className="bg-amber-700 text-white p-1.5 rounded-lg shadow-2xs">
              <span className="text-[8px] text-amber-100 font-medium block">آخر قراءة للعداد</span>
              <div className="text-[10px] sm:text-[10.5px] font-black mt-0.5 tabular-nums font-mono" dir="ltr">
                {vehicle.current_odometer.toLocaleString('en-US')} <span className="text-[8px] font-normal">كم</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button & Table Header */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <h3 className="text-[10.5px] font-bold text-slate-800 flex items-center gap-1">
              <Fuel className="w-3 h-3 text-amber-600" />
              <span>سجل تعبئات الديزل ({vehicleFuelTransactions.length})</span>
            </h3>
            <button
              onClick={() => onOpenAddFuel(vehicle.id)}
              className="h-6 px-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-md text-[9.5px] shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>إضافة تعبئة ديزل</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            {vehicleFuelTransactions.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-[9.5px]">
                لا توجد تعبئات ديزل مسجلة لهذه الشاحنة
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-[9px]">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[8.5px] font-bold">
                    <tr>
                      <th className="py-1 px-2">التاريخ والوقت</th>
                      <th className="py-1 px-2">المحطة</th>
                      <th className="py-1 px-2">الكمية</th>
                      <th className="py-1 px-2">سعر اللتر</th>
                      <th className="py-1 px-2">الإجمالي</th>
                      <th className="py-1 px-2">العداد</th>
                      <th className="py-1 px-2">الدفع</th>
                      <th className="py-1 px-2 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicleFuelTransactions.map((fuel) => (
                      <tr key={fuel.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-1 px-2 text-slate-600 whitespace-nowrap font-medium font-mono">
                          {fuel.date} <span className="text-[8px] text-slate-400">{fuel.time}</span>
                        </td>
                        <td className="py-1 px-2 font-semibold text-slate-800">{fuel.gas_station}</td>
                        <td className="py-1 px-2 font-bold text-amber-900 font-mono">
                          <span className="tabular-nums" dir="ltr">{fuel.liters.toLocaleString('en-US')}</span> لتر
                        </td>
                        <td className="py-1 px-2 text-slate-600 font-mono">
                          <span className="tabular-nums" dir="ltr">{fuel.price_per_liter.toLocaleString('en-US')}</span> ر.س
                        </td>
                        <td className="py-1 px-2 font-black text-slate-900 whitespace-nowrap font-mono">
                          <span className="tabular-nums" dir="ltr">{fuel.total_amount.toLocaleString('en-US')}</span> ر.س
                        </td>
                        <td className="py-1 px-2 text-slate-700 font-bold font-mono">
                          {fuel.odometer_reading ? (
                            <>
                              <span className="tabular-nums" dir="ltr">{fuel.odometer_reading.toLocaleString('en-US')}</span> كم
                            </>
                          ) : '-'}
                        </td>
                        <td className="py-1 px-2 text-slate-600">
                          <span className="bg-slate-100 px-1 py-0.2 rounded text-[8px] font-medium">
                            {fuel.payment_method}
                          </span>
                        </td>
                        <td className="py-1 px-2 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm('هل تريد حذف قيد الديزل هذا؟')) {
                                deleteFuelTransaction(fuel.id);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition"
                            title="حذف"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TAB: المصروفات الأخرى (Other Expenses) */}
      {/* ======================================================== */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-2">
          {/* Expenses Total Header Card */}
          <div className="bg-white p-2 rounded-lg border border-rose-200 bg-rose-50/20 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[8.5px] text-rose-800 font-semibold block">إجمالي المصروفات الأخرى بالفترة</span>
              <div className="text-[11px] font-black text-rose-900 mt-0.5 tabular-nums font-mono" dir="ltr">
                {summary.totalOtherExpenses.toLocaleString('en-US')} <span className="text-[8px] font-normal">ر.س</span>
              </div>
            </div>
            <button
              onClick={() => onOpenAddExpense(vehicle.id)}
              className="h-6 px-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-md text-[9.5px] shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>إضافة مصروف</span>
            </button>
          </div>

          {/* List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            {vehicleExpenseTransactions.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-[9.5px]">
                لا توجد مصروفات أخرى مسجلة لهذه الشاحنة
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-[9px]">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[8.5px] font-bold">
                    <tr>
                      <th className="py-1 px-2">التاريخ</th>
                      <th className="py-1 px-2">التصنيف</th>
                      <th className="py-1 px-2">البيان / الوصف</th>
                      <th className="py-1 px-2">الورشة / المحل</th>
                      <th className="py-1 px-2">المبلغ</th>
                      <th className="py-1 px-2">طريقة الدفع</th>
                      <th className="py-1 px-2 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicleExpenseTransactions.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-1 px-2 text-slate-600 whitespace-nowrap font-medium font-mono">
                          {exp.date}
                        </td>
                        <td className="py-1 px-2">
                          <span className="inline-block px-1.5 py-0.2 rounded text-[8px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-1 px-2 font-semibold text-slate-800 max-w-xs">
                          {exp.description}
                          {exp.notes && <div className="text-[8px] text-slate-400 font-normal">{exp.notes}</div>}
                        </td>
                        <td className="py-1 px-2 text-slate-700 font-medium">{exp.vendor_name}</td>
                        <td className="py-1 px-2 font-bold text-rose-700 whitespace-nowrap font-mono">
                          <span className="tabular-nums" dir="ltr">{exp.amount.toLocaleString('en-US')}</span> ر.س
                        </td>
                        <td className="py-1 px-2 text-slate-600">
                          <span className="bg-slate-100 px-1 py-0.2 rounded text-[8px] font-medium">
                            {exp.payment_method}
                          </span>
                        </td>
                        <td className="py-1 px-2 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm('هل تريد حذف هذا المصروف؟')) {
                                deleteVehicleExpense(exp.id);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition"
                            title="حذف"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TAB: صافي الدخل والتكلفة التشغيلية (Financials & Net Income) */}
      {/* ======================================================== */}
      {activeSubTab === 'financials' && (
        <div className="space-y-2">
          {/* Master Accounting Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-2.5 space-y-2">
            <div className="border-b border-slate-100 pb-1.5 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-[#03457a] text-[11px]">
                  التقرير المالي للسيارة ({operationsFilter.period === 'today' ? 'اليوم' : operationsFilter.period === 'yesterday' ? 'أمس' : operationsFilter.period === 'this_week' ? 'هذا الأسبوع' : 'هذا الشهر'})
                </h3>
                <p className="text-[8.5px] text-slate-500">
                  حسابات تفصيلية: الإيرادات، التكاليف التشغيلية المباشرة، وصافي الدخل
                </p>
              </div>
              <div className={`px-2 py-0.5 rounded-md text-[8.5px] font-bold border ${
                summary.netVehicleIncome >= 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {summary.netVehicleIncome >= 0 ? 'صافي ربح محقق' : 'عجز تشغيلي'}
              </div>
            </div>

            {/* Accounting Breakdown List */}
            <div className="space-y-1.5 text-[9px]">
              {/* 1. Revenue */}
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <span className="font-bold text-emerald-950 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-600" />
                  <span>إجمالي إيرادات التوريدات ({summary.totalDeliveriesCount} ردود)</span>
                </span>
                <span className="font-black text-emerald-700 text-[10.5px] font-mono">
                  +<span className="tabular-nums" dir="ltr">{summary.totalRevenue.toLocaleString('en-US')}</span> ر.س
                </span>
              </div>

              {/* 2. Operational Expenses Breakdown */}
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-700 text-[9.5px] flex items-center justify-between border-b border-slate-200 pb-0.5">
                  <span>المصروفات التشغيلية الفعلية</span>
                  <span className="text-rose-600 font-black font-mono">
                    -<span className="tabular-nums" dir="ltr">{summary.totalOperatingExpenses.toLocaleString('en-US')}</span> ر.س
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[8px]">استهلاك التحلية</span>
                    <strong className="text-slate-800 block mt-0.5 tabular-nums font-mono text-[9.5px]" dir="ltr">
                      {summary.consumedDesalinationAmount.toLocaleString('en-US')} <span className="text-[8px] font-normal">ر.س</span>
                    </strong>
                    <span className="text-[8px] text-cyan-700">مياه محلاة محملة</span>
                  </div>

                  <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[8px]">ديزل الشاحنة</span>
                    <strong className="text-slate-800 block mt-0.5 tabular-nums font-mono text-[9.5px]" dir="ltr">
                      {summary.totalFuelCost.toLocaleString('en-US')} <span className="text-[8px] font-normal">ر.س</span>
                    </strong>
                    <span className="text-[8px] text-amber-700 font-mono">
                      <span className="tabular-nums font-bold" dir="ltr">{summary.totalFuelLiters.toLocaleString('en-US')}</span> لتر
                    </span>
                  </div>

                  <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[8px]">مصروفات أخرى</span>
                    <strong className="text-slate-800 block mt-0.5 tabular-nums font-mono text-[9.5px]" dir="ltr">
                      {summary.totalOtherExpenses.toLocaleString('en-US')} <span className="text-[8px] font-normal">ر.س</span>
                    </strong>
                    <span className="text-[8px] text-rose-700">صيانة وزيوت</span>
                  </div>
                </div>

                <div className="text-[8px] text-slate-400 bg-white/70 p-1 rounded border border-slate-100 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                  <span>ملاحظة محاسبية: لا يتم احتساب رصيد التحلية غير المستهلك كمصروف، بل الاستهلاك الفعلي فقط.</span>
                </div>
              </div>

              {/* 3. Grand Net Vehicle Income */}
              <div className={`p-2 rounded-lg border flex items-center justify-between ${
                summary.netVehicleIncome >= 0
                  ? 'bg-[#03457a] text-white border-[#03457a] shadow-2xs'
                  : 'bg-rose-700 text-white border-rose-700 shadow-2xs'
              }`}>
                <div>
                  <span className="text-[9.5px] font-bold text-white/90 block">صافي دخل الشاحنة النهائي للفترة</span>
                  <span className="text-[8px] text-white/80">المعادلة: إيرادات التوريدات - إجمالي المصروفات التشغيلية</span>
                </div>
                <div className="text-[12px] font-black tabular-nums font-mono" dir="ltr">
                  {summary.netVehicleIncome.toLocaleString('en-US')} <span className="text-[8px] font-medium">ر.س</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deliveries made by this truck in period */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-bold text-[10.5px] text-slate-800">
                التوريدات المنفذة بواسطة هذه الشاحنة ({vehicleDeliveries.length})
              </h4>
              <span className="text-[8.5px] text-slate-500 font-mono">
                إجمالي الإيراد: <strong className="tabular-nums" dir="ltr">{summary.totalRevenue.toLocaleString('en-US')}</strong> <strong>ر.س</strong>
              </span>
            </div>

            {vehicleDeliveries.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-[9.5px]">
                لا توجد توريدات مسجلة لهذه الشاحنة
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-[9px]">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[8.5px] font-bold">
                    <tr>
                      <th className="py-1 px-2">رقم التوريد</th>
                      <th className="py-1 px-2">التاريخ</th>
                      <th className="py-1 px-2">العميل</th>
                      <th className="py-1 px-2">النوع والسعة</th>
                      <th className="py-1 px-2">السعر</th>
                      <th className="py-1 px-2">طريقة الدفع</th>
                      <th className="py-1 px-2">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicleDeliveries.map((del) => (
                      <tr key={del.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-1 px-2 font-bold text-slate-700 font-mono">#{del.sequence_num}</td>
                        <td className="py-1 px-2 text-slate-600 font-mono">{del.supply_date}</td>
                        <td className="py-1 px-2 font-semibold text-slate-800">{del.customer_name}</td>
                        <td className="py-1 px-2 text-slate-700">
                          {del.supply_type} ({del.tank_capacity})
                        </td>
                        <td className="py-1 px-2 font-bold text-emerald-700 font-mono">
                          <span className="tabular-nums" dir="ltr">{del.price.toLocaleString('en-US')}</span> ر.س
                        </td>
                        <td className="py-1 px-2 text-slate-600">{del.payment_method}</td>
                        <td className="py-1 px-2">
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                            del.payment_status === 'مدفوع'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {del.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. TAB: سجل العمليات الموحد (Unified Operations Log) */}
      {/* ======================================================== */}
      {activeSubTab === 'unified_log' && (
        <div className="space-y-2">
          {/* Controls: Search, Filter Type, Print (50% smaller) */}
          <div className="bg-white p-1 sm:p-1.5 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-1 text-xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[140px]">
              <Search className="w-2.5 h-2.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-6 pr-6 pl-2 bg-slate-50 border border-slate-200 rounded-md text-[9.5px] focus:bg-white focus:outline-none site-filter-input"
                placeholder="بحث في الحركات..."
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1">
              <select
                value={unifiedFilterType}
                onChange={(e) => setUnifiedFilterType(e.target.value)}
                className="h-6 px-1.5 bg-slate-50 border border-slate-200 rounded-md text-[9.5px] font-bold text-slate-700 focus:outline-none site-filter-select"
              >
                <option value="all">كل الحركات</option>
                <option value="delivery">إيرادات التوريدات</option>
                <option value="desal_recharge">شحن تحلية</option>
                <option value="desal_consumption">استهلاك تحلية</option>
                <option value="fuel">ديزل</option>
                <option value="expense">مصروفات</option>
              </select>

              <button
                onClick={() => setIsPrintLogOpen(true)}
                className="h-6 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-md text-[9.5px] flex items-center gap-1 cursor-pointer site-filter-btn"
                title="معاينة وطباعة السجل"
              >
                <Printer className="w-2.5 h-2.5" />
                <span className="hidden sm:inline">معاينة وطباعة</span>
              </button>
            </div>
          </div>

          {/* Unified Timeline / Cards */}
          <div className="space-y-1.5">
            {filteredUnifiedMovements.length === 0 ? (
              <div className="bg-white py-8 rounded-xl border border-slate-200 text-center text-slate-400 text-[9.5px]">
                لا توجد حركات مطابقة لخيارات البحث
              </div>
            ) : (
              filteredUnifiedMovements.map((mov) => (
                <div
                  key={`${mov.rawType}-${mov.id}`}
                  className="bg-white rounded-lg p-1.5 border border-slate-200 shadow-2xs hover:border-slate-300 transition flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    {/* Icon Badge */}
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                        mov.rawType === 'delivery'
                          ? 'bg-emerald-100 text-emerald-700'
                          : mov.rawType === 'fuel'
                          ? 'bg-amber-100 text-amber-700'
                          : mov.rawType === 'desal_recharge'
                          ? 'bg-cyan-100 text-cyan-700'
                          : mov.rawType === 'desal_consumption'
                          ? 'bg-cyan-50 text-cyan-800'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {mov.rawType === 'delivery' && <DollarSign className="w-3 h-3" />}
                      {mov.rawType === 'fuel' && <Fuel className="w-3 h-3" />}
                      {(mov.rawType === 'desal_recharge' || mov.rawType === 'desal_consumption') && (
                        <Droplets className="w-3 h-3" />
                      )}
                      {mov.rawType === 'expense' && <Wrench className="w-3 h-3" />}
                    </div>

                    {/* Details */}
                    <div>
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[8px] font-bold px-1 py-0.2 rounded ${
                            mov.rawType === 'delivery'
                              ? 'bg-emerald-50 text-emerald-800'
                              : mov.rawType === 'fuel'
                              ? 'bg-amber-50 text-amber-800'
                              : mov.rawType === 'desal_recharge'
                              ? 'bg-cyan-50 text-cyan-800'
                              : 'bg-rose-50 text-rose-800'
                          }`}
                        >
                          {mov.typeLabel}
                        </span>
                        <strong className="text-slate-800 text-[9.5px]">{mov.title}</strong>
                      </div>
                      <p className="text-[8.5px] text-slate-500 mt-0.5">{mov.details}</p>
                    </div>
                  </div>

                  {/* Amount and Date/Method */}
                  <div className="text-left shrink-0 font-mono">
                    <div
                      className={`font-black text-[10px] ${
                        mov.isIncome ? 'text-emerald-700' : 'text-slate-800'
                      }`}
                    >
                      {mov.isIncome ? '+' : '-'}<span className="tabular-nums" dir="ltr">{mov.amount.toLocaleString('en-US')}</span> ر.س
                    </div>
                    <div className="text-[8px] text-slate-400 mt-0.5">
                      {mov.date} • {mov.paymentMethod || 'عام'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          IN-APP VEHICLE MOVEMENTS LOG PREVIEW MODAL
          ======================================================== */}
      {isPrintLogOpen && (
        <A4DocumentPreviewModal
          title={`معاينة سجل حركات المركبة - ${vehicle.name}`}
          subtitle={`لوحة: ${vehicle.plate_number || '-'} • السائق: ${driver?.driver_name || 'غير محدد'}`}
          badge="ورقة A4 عمودية (210×297 مم)"
          pagesCount={movementPages.length}
          onClose={() => setIsPrintLogOpen(false)}
          onConfirmPrint={() => window.print()}
        >
          {movementPages.map((pageItems, pageIdx) => (
            <A4PageSheet
              key={pageIdx}
              id={`printable-vehicle-log-p${pageIdx + 1}`}
              pageNumber={pageIdx + 1}
              totalPages={movementPages.length}
            >
              <div className="space-y-4 text-slate-800 font-sans flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Header */}
                  {pageIdx === 0 ? (
                    <div className="flex items-start justify-between border-b-2 border-[#03457a] pb-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h1 className="text-base sm:text-lg font-extrabold text-[#03457a] font-['Tajawal',sans-serif]">
                            نبع لتوريد المياه
                          </h1>
                          <span className="text-[9px] font-bold text-[#03457a] bg-sky-100/70 border border-sky-300/60 px-1 py-0.2 rounded">
                            NABAA
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          سجل العمليات والتشغيل الميداني للمركبة
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          المملكة العربية السعودية - الطائف
                        </p>
                      </div>

                      <div className="text-left space-y-1">
                        <div className="px-2.5 py-1 bg-sky-50 text-[#03457a] border border-sky-200 rounded-md font-bold text-[10px] font-mono">
                          كشف حركات معتمد
                        </div>
                        <p className="text-[9.5px] text-slate-500 font-mono">
                          تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#03457a]">
                          تابع كشف حركات المركبة: {vehicle.name} ({vehicle.plate_number})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        صفحة {pageIdx + 1} من {movementPages.length}
                      </span>
                    </div>
                  )}

                  {/* Vehicle Meta Box (Only on page 1) */}
                  {pageIdx === 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">المركبة</span>
                        <strong className="text-slate-900 font-bold">{vehicle.name}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">رقم اللوحة</span>
                        <strong className="text-slate-800 font-mono">{vehicle.plate_number || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">السائق المسؤول</span>
                        <strong className="text-slate-800">{driver ? driver.driver_name : 'غير محدد'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">عدد الحركات</span>
                        <strong className="text-sky-700 font-bold">{filteredUnifiedMovements.length} حركة</strong>
                      </div>
                    </div>
                  )}

                  {/* Movements Table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-right">
                      <thead className="bg-[#03457a] text-white font-bold text-[10.5px]">
                        <tr>
                          <th className="py-2 px-2.5">#</th>
                          <th className="py-2 px-2.5">التاريخ والوقت</th>
                          <th className="py-2 px-2.5">نوع الحركة</th>
                          <th className="py-2 px-2.5">التفاصيل والبيان</th>
                          <th className="py-2 px-2.5 text-left">المبلغ / القيمة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pageItems.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-400">
                              لا توجد حركات مسجلة
                            </td>
                          </tr>
                        ) : (
                          pageItems.map((mov, idx) => {
                            const globalIdx = pageIdx * movementsPerPage + idx + 1;
                            return (
                              <tr key={`${mov.rawType}-${mov.id}`} className="hover:bg-slate-50/50">
                                <td className="py-2 px-2.5 font-mono text-slate-400">{globalIdx}</td>
                                <td className="py-2 px-2.5 font-mono text-slate-600 text-[11px]">{mov.date}</td>
                                <td className="py-2 px-2.5 font-bold text-slate-800">{mov.title}</td>
                                <td className="py-2 px-2.5 text-slate-600 text-[11px]">
                                  {mov.details}
                                </td>
                                <td className="py-2 px-2.5 text-left font-bold font-mono">
                                  {mov.amount > 0 ? (
                                    <span className={mov.isIncome ? 'text-emerald-600' : 'text-rose-600'}>
                                      {mov.isIncome ? '+' : '-'} {mov.amount.toLocaleString()} ر.س
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Signatures (Only on final page) */}
                {pageIdx === movementPages.length - 1 && (
                  <div className="pt-6 border-t border-slate-200 flex justify-between text-center text-[10px] text-slate-500 mt-auto">
                    <div>
                      <p className="font-bold text-slate-700">توقيع السائق</p>
                      <div className="mt-5 border-b border-dashed border-slate-400 w-28 mx-auto"></div>
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">إدارة التشغيل والمتابعة</p>
                      <div className="mt-5 border-b border-dashed border-slate-400 w-28 mx-auto"></div>
                    </div>
                  </div>
                )}
              </div>
            </A4PageSheet>
          ))}
        </A4DocumentPreviewModal>
      )}
    </div>
  );
};

export default VehicleDetailsView;

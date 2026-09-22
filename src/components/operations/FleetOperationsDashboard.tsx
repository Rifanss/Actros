import React from 'react';
import { useWaterData } from '../../context/WaterDataContext';
import { FilterPeriod, VehicleFinancialSummary } from '../../types';
import {
  Truck,
  Droplets,
  Fuel,
  Wrench,
  DollarSign,
  Plus,
  AlertCircle,
  ChevronLeft,
  Calendar,
  Gauge,
  User,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface FleetOperationsDashboardProps {
  onSelectVehicle: (vehicleId: string) => void;
  onOpenRecharge: (vehicleId?: string) => void;
  onOpenAddFuel: (vehicleId?: string) => void;
  onOpenAddExpense: (vehicleId?: string) => void;
  onOpenAddVehicle: () => void;
}

export const FleetOperationsDashboard: React.FC<FleetOperationsDashboardProps> = ({
  onSelectVehicle,
  onOpenRecharge,
  onOpenAddFuel,
  onOpenAddExpense,
  onOpenAddVehicle,
}) => {
  const {
    vehicles,
    drivers,
    operationsFilter,
    setOperationsFilter,
    fleetFinancialSummaries,
  } = useWaterData();

  // Handle period switch
  const handlePeriodChange = (period: FilterPeriod) => {
    setOperationsFilter((prev) => ({ ...prev, period }));
  };

  // Fleet Totals calculation
  const fleetTotals = React.useMemo(() => {
    let totalRevenue = 0;
    let totalDesalRemaining = 0;
    let totalDesalConsumed = 0;
    let totalDesalRecharged = 0;
    let totalFuelCost = 0;
    let totalFuelLiters = 0;
    let totalOtherExpenses = 0;
    let totalOperatingExpenses = 0;
    let netFleetIncome = 0;

    fleetFinancialSummaries.forEach((s) => {
      totalRevenue += s.totalRevenue;
      totalDesalRemaining += s.remainingDesalinationBalance;
      totalDesalConsumed += s.consumedDesalinationAmount;
      totalDesalRecharged += s.rechargedDesalinationAmount;
      totalFuelCost += s.totalFuelCost;
      totalFuelLiters += s.totalFuelLiters;
      totalOtherExpenses += s.totalOtherExpenses;
      totalOperatingExpenses += s.totalOperatingExpenses;
      netFleetIncome += s.netVehicleIncome;
    });

    return {
      totalRevenue,
      totalDesalRemaining,
      totalDesalConsumed,
      totalDesalRecharged,
      totalFuelCost,
      totalFuelLiters,
      totalOtherExpenses,
      totalOperatingExpenses,
      netFleetIncome,
    };
  }, [fleetFinancialSummaries]);

  return (
    <div className="space-y-2 pb-8 animate-in fade-in duration-200 text-right">
      {/* 1. Period Filter Bar */}
      <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] sm:text-[10.5px] text-slate-600 font-medium">
          متابعة العمليات والمصروفات وشاحنات الأسطول
        </span>

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

      {/* 2. Quick Actions Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        <button
          onClick={() => onOpenRecharge()}
          className="h-7 sm:h-8 px-2 rounded-lg bg-[#03457a] hover:bg-[#023561] text-white shadow-2xs transition active:scale-95 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Droplets className="w-3.5 h-3.5 shrink-0 text-sky-200" />
            <div className="text-right truncate">
              <div className="text-[9.5px] font-bold leading-tight">شحن تحلية</div>
            </div>
          </div>
          <Plus className="w-3 h-3 opacity-80 shrink-0" />
        </button>

        <button
          onClick={() => onOpenAddFuel()}
          className="h-7 sm:h-8 px-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white shadow-2xs transition active:scale-95 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Fuel className="w-3.5 h-3.5 shrink-0 text-amber-200" />
            <div className="text-right truncate">
              <div className="text-[9.5px] font-bold leading-tight">تعبئة ديزل</div>
            </div>
          </div>
          <Plus className="w-3 h-3 opacity-80 shrink-0" />
        </button>

        <button
          onClick={() => onOpenAddExpense()}
          className="h-7 sm:h-8 px-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white shadow-2xs transition active:scale-95 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Wrench className="w-3.5 h-3.5 shrink-0 text-rose-200" />
            <div className="text-right truncate">
              <div className="text-[9.5px] font-bold leading-tight">إضافة مصروف</div>
            </div>
          </div>
          <Plus className="w-3 h-3 opacity-80 shrink-0" />
        </button>

        <button
          onClick={onOpenAddVehicle}
          className="h-7 sm:h-8 px-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white shadow-2xs transition active:scale-95 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Truck className="w-3.5 h-3.5 shrink-0 text-indigo-200" />
            <div className="text-right truncate">
              <div className="text-[9.5px] font-bold leading-tight">إضافة شاحنة</div>
            </div>
          </div>
          <Plus className="w-3 h-3 opacity-80 shrink-0" />
        </button>
      </div>

      {/* 3. Fleet Summary Cards (General Overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
        {/* Total Revenue */}
        <div className="bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[8.5px] font-semibold text-slate-500">إيراد التوريدات</span>
            <div className="w-4 h-4 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-2.5 h-2.5" />
            </div>
          </div>
          <div className="text-[10px] sm:text-[10.5px] font-black text-slate-900 mt-0.5 tabular-nums font-mono" dir="ltr">
            {fleetTotals.totalRevenue.toLocaleString('en-US')} <span className="text-[8px] font-normal text-slate-500">ر.س</span>
          </div>
          <span className="text-[8px] text-emerald-700 font-medium block">كل توريدات الأسطول</span>
        </div>

        {/* Desalination Total Balance */}
        <div className="bg-white p-1.5 rounded-lg border border-cyan-200 bg-cyan-50/25 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[8.5px] font-semibold text-cyan-900">رصيد التحلية المتبقي</span>
            <div className="w-4 h-4 rounded bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Droplets className="w-2.5 h-2.5" />
            </div>
          </div>
          <div className="text-[10px] sm:text-[10.5px] font-black text-cyan-900 mt-0.5 tabular-nums font-mono" dir="ltr">
            {fleetTotals.totalDesalRemaining.toLocaleString('en-US')} <span className="text-[8px] font-normal text-cyan-700">ر.س</span>
          </div>
          <span className="text-[8px] text-cyan-800 font-medium block">
            مستهلك: <span className="tabular-nums font-bold font-mono" dir="ltr">{fleetTotals.totalDesalConsumed.toLocaleString('en-US')}</span> ر.س
          </span>
        </div>

        {/* Total Operational Expenses */}
        <div className="bg-white p-1.5 rounded-lg border border-rose-200 bg-rose-50/25 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[8.5px] font-semibold text-rose-900">المصروفات التشغيلية</span>
            <div className="w-4 h-4 rounded bg-rose-100 text-rose-700 flex items-center justify-center">
              <Wrench className="w-2.5 h-2.5" />
            </div>
          </div>
          <div className="text-[10px] sm:text-[10.5px] font-black text-rose-900 mt-0.5 tabular-nums font-mono" dir="ltr">
            {fleetTotals.totalOperatingExpenses.toLocaleString('en-US')} <span className="text-[8px] font-normal text-rose-700">ر.س</span>
          </div>
          <span className="text-[8px] text-slate-500 block">
            ديزل (<span className="tabular-nums font-bold font-mono" dir="ltr">{fleetTotals.totalFuelCost.toLocaleString('en-US')}</span>) + صيانة
          </span>
        </div>
      </div>

      {/* 4. Vehicles Section Header */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-[12px] sm:text-[12.5px] font-extrabold text-[#03457a] flex items-center gap-1.5">
          <span>شاحنات الأسطول والحسابات المستقلة</span>
          <span className="bg-sky-100 text-[#03457a] px-1.5 py-0.2 rounded-full text-[8.5px] font-bold">
            {vehicles.length} سيارات
          </span>
        </h3>
        <span className="text-[8.5px] text-slate-400">اضغط على أي سيارة لعرض التفاصيل الكاملة</span>
      </div>

      {/* 5. Vehicles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {fleetFinancialSummaries.map((summary) => {
          const veh = summary.vehicle;
          const driver = drivers.find((d) => d.id === veh.assigned_driver_id || d.vehicle_id === veh.id);
          const isLowDesal = summary.remainingDesalinationBalance < 400;

          return (
            <div
              key={veh.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="p-2 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-start justify-between gap-1.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 text-[10.5px]">{veh.name}</h4>
                      <span className="text-[8.5px] font-bold font-mono px-1.5 py-0.2 rounded bg-sky-50 text-[#03457a] border border-sky-200/60">
                        {veh.plate_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[8.5px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <User className="w-2.5 h-2.5 text-slate-400" />
                        <span>{driver?.driver_name || 'سائق غير معين'}</span>
                      </span>
                      <span>•</span>
                      <span>سعة {veh.tank_capacity}</span>
                    </div>
                  </div>

                  {/* Balance Alert Badge */}
                  {isLowDesal ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>تحلية منخفض</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>جاهزة</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body - Balances and Financials */}
              <div className="p-2 space-y-1.5 text-xs">
                {/* 2-column metrics */}
                <div className="grid grid-cols-2 gap-1.5">
                  {/* Desalination Balance */}
                  <div className={`p-1.5 rounded-lg border ${
                    isLowDesal ? 'bg-amber-50/60 border-amber-200' : 'bg-cyan-50/50 border-cyan-100'
                  }`}>
                    <span className="text-[8px] text-slate-600 block flex items-center gap-1">
                      <Droplets className="w-2.5 h-2.5 text-cyan-600" />
                      <span>رصيد التحلية</span>
                    </span>
                    <div className="font-black text-[9.5px] text-slate-900 mt-0.5 tabular-nums font-mono" dir="ltr">
                      {summary.remainingDesalinationBalance.toLocaleString('en-US')} <span className="text-[8px] font-normal">ر.س</span>
                    </div>
                    <span className="text-[8px] text-slate-500 block">
                      مستهلك: <span className="tabular-nums font-bold font-mono" dir="ltr">{summary.consumedDesalinationAmount.toLocaleString('en-US')}</span>
                    </span>
                  </div>

                  {/* Fuel & Odometer */}
                  <div className="p-1.5 rounded-lg bg-amber-50/50 border border-amber-100">
                    <span className="text-[8px] text-slate-600 block flex items-center gap-1">
                      <Fuel className="w-2.5 h-2.5 text-amber-600" />
                      <span>ديزل الفترة</span>
                    </span>
                    <div className="font-black text-[9.5px] text-slate-900 mt-0.5 tabular-nums font-mono" dir="ltr">
                      {summary.totalFuelCost.toLocaleString('en-US')} <span className="text-[8px] font-normal">ر.س</span>
                    </div>
                    <span className="text-[8px] text-amber-900 font-medium block">
                      <span className="tabular-nums font-bold font-mono" dir="ltr">{summary.totalFuelLiters.toLocaleString('en-US')}</span> لتر (<span className="tabular-nums font-bold font-mono" dir="ltr">{summary.fuelCount}</span> مرات)
                    </span>
                  </div>
                </div>

                {/* Financial Summary Strip */}
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-0.5 text-[9px]">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>إيراد التوريدات:</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      +<span className="tabular-nums" dir="ltr">{summary.totalRevenue.toLocaleString('en-US')}</span> ر.س
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>التكاليف التشغيلية:</span>
                    <span className="font-bold text-rose-600 font-mono">
                      -<span className="tabular-nums" dir="ltr">{summary.totalOperatingExpenses.toLocaleString('en-US')}</span> ر.س
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-0.5 flex items-center justify-between font-black">
                    <span className="text-slate-800">صافي الدخل:</span>
                    <span className={`font-mono ${summary.netVehicleIncome >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      <span className="tabular-nums" dir="ltr">{summary.netVehicleIncome.toLocaleString('en-US')}</span> ر.س
                    </span>
                  </div>
                </div>

                {/* Quick Action Mini Buttons for this truck */}
                <div className="grid grid-cols-3 gap-1 pt-0.5">
                  <button
                    onClick={() => onOpenRecharge(veh.id)}
                    className="py-0.5 px-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold rounded text-[8.5px] border border-cyan-200 transition text-center cursor-pointer"
                  >
                    + شحن تحلية
                  </button>
                  <button
                    onClick={() => onOpenAddFuel(veh.id)}
                    className="py-0.5 px-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded text-[8.5px] border border-amber-200 transition text-center cursor-pointer"
                  >
                    + تعبئة ديزل
                  </button>
                  <button
                    onClick={() => onOpenAddExpense(veh.id)}
                    className="py-0.5 px-1 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded text-[8.5px] border border-rose-200 transition text-center cursor-pointer"
                  >
                    + مصروف
                  </button>
                </div>
              </div>

              {/* Card Footer: View Full Details Button */}
              <div className="p-1.5 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => onSelectVehicle(veh.id)}
                  className="w-full h-6 px-2.5 bg-[#03457a] hover:bg-[#023561] active:scale-98 text-white rounded-md font-bold text-[9.5px] flex items-center justify-center gap-1 shadow-2xs transition cursor-pointer"
                >
                  <span>عرض التفاصيل الكاملة والسجلات</span>
                  <ChevronLeft className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FleetOperationsDashboard;

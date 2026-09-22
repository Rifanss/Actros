import React, { useState, useMemo } from 'react';
import { useWaterData } from '../context/WaterDataContext';
import { Customer } from '../types';
import { formatCustomerIdentifier } from '../utils/customerUtils';
import RecordPaymentModal from './accounts/RecordPaymentModal';
import GoogleMapPickerModal from './GoogleMapPickerModal';
import { useScrollToTop } from '../utils/scrollUtils';
import { A4DocumentPreviewModal } from './common/A4DocumentPreviewModal';
import { A4PageSheet } from './common/A4PageSheet';
import {
  Users,
  User,
  UserPlus,
  Search,
  Phone,
  MapPin,
  FileText,
  Plus,
  CreditCard,
  Edit3,
  Trash2,
  Printer,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  Building2,
  Truck,
  X,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Receipt,
  FileCheck2,
  ChevronLeft,
} from 'lucide-react';

interface CustomersViewProps {
  onSelectCustomer: (customer: Customer) => void;
  onNewSupplyForCustomer: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  onSelectCustomer,
  onNewSupplyForCustomer,
}) => {
  const {
    customers,
    deliveries,
    drivers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    clearAllCustomers,
    allCustomersAccountSummaries,
    getCustomerAccountSummary,
    generateNewCustomerIdentifier,
    canGoBack,
  } = useWaterData();

  // Guarantee customers view starts at top (0, 0)
  useScrollToTop();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'due_desc' | 'trips_desc' | 'name_asc' | 'recent'>('due_desc');

  // Modals state
  const [profileCustomer, setProfileCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [paymentCustomerId, setPaymentCustomerId] = useState<string | null>(null);
  const [isPrintSummaryOpen, setIsPrintSummaryOpen] = useState(false);

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formIdentifier, setFormIdentifier] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formPrice18, setFormPrice18] = useState('');
  const [formPrice30, setFormPrice30] = useState('');
  const [formAssignedDriver, setFormAssignedDriver] = useState('');
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Pre-calculate summary stats per customer
  const customerStatsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        totalDeliveries: number;
        totalAmount: number;
        totalPaid: number;
        remainingAmount: number;
        status: 'مسدد' | 'مستحق' | 'متأخر';
      }
    >();

    allCustomersAccountSummaries.forEach((summary) => {
      const custDeliveries = deliveries.filter(
        (d) => d.customer_id === summary.customer.id || d.mobile === summary.customer.mobile
      );
      map.set(summary.customer.id, {
        totalDeliveries: custDeliveries.length,
        totalAmount: summary.totalDeliveriesValue,
        totalPaid: summary.totalPaid,
        remainingAmount: summary.remainingAmount,
        status: summary.status,
      });
    });

    return map;
  }, [allCustomersAccountSummaries, deliveries]);

  // Overall KPIs
  const overallKPIs = useMemo(() => {
    let totalCustomers = customers.length;
    let customersWithDue = 0;
    let totalOutstanding = 0;
    let totalDeliveries = 0;

    customers.forEach((c) => {
      const stats = customerStatsMap.get(c.id);
      if (stats) {
        if (stats.remainingAmount > 0) {
          customersWithDue += 1;
          totalOutstanding += stats.remainingAmount;
        }
        totalDeliveries += stats.totalDeliveries;
      }
    });

    return {
      totalCustomers,
      customersWithDue,
      totalOutstanding,
      totalDeliveries,
    };
  }, [customers, customerStatsMap]);

  // Filtered & Sorted Customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const stats = customerStatsMap.get(c.id);
        const hasDue = (stats?.remainingAmount || 0) > 0;

        if (statusFilter === 'due' && !hasDue) return false;
        if (statusFilter === 'paid' && hasDue) return false;

        if (!searchQuery.trim()) return true;
        const q = searchQuery.trim().toLowerCase();
        return (
          c.customer_name.toLowerCase().includes(q) ||
          c.customer_identifier.toLowerCase().includes(q) ||
          c.mobile.includes(q) ||
          c.location.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const statsA = customerStatsMap.get(a.id) || {
          remainingAmount: 0,
          totalDeliveries: 0,
        };
        const statsB = customerStatsMap.get(b.id) || {
          remainingAmount: 0,
          totalDeliveries: 0,
        };

        if (sortBy === 'due_desc') {
          return statsB.remainingAmount - statsA.remainingAmount;
        }
        if (sortBy === 'trips_desc') {
          return statsB.totalDeliveries - statsA.totalDeliveries;
        }
        if (sortBy === 'name_asc') {
          return a.customer_name.localeCompare(b.customer_name, 'ar');
        }
        if (sortBy === 'recent') {
          return (b.created_at || '').localeCompare(a.created_at || '');
        }
        return 0;
      });
  }, [customers, customerStatsMap, searchQuery, statusFilter, sortBy]);

  // Chunking for A4 page presentation in print modal
  const customersPerPage = 14;
  const customerPages = useMemo(() => {
    if (customers.length === 0) return [[]];
    const pages = [];
    for (let i = 0; i < customers.length; i += customersPerPage) {
      pages.push(customers.slice(i, i + customersPerPage));
    }
    return pages;
  }, [customers]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    // Generate suggested unique code starting with NB-
    const suggestedCode = generateNewCustomerIdentifier();
    setFormName('');
    setFormIdentifier(suggestedCode);
    setFormMobile('');
    setFormLocation('');
    setFormPrice18('');
    setFormPrice30('');
    setFormAssignedDriver('');
    setFormNotes('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormName(c.customer_name);
    setFormIdentifier(c.customer_identifier || '');
    setFormMobile(c.mobile || '');
    setFormLocation(c.location || '');
    setFormPrice18(c.agreed_price_18 ? String(c.agreed_price_18) : '');
    setFormPrice30(c.agreed_price_30 ? String(c.agreed_price_30) : '');
    setFormAssignedDriver(c.assigned_driver || '');
    setFormNotes(c.notes || '');
    setFormError('');
  };

  // Save Customer (Add or Edit)
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('يرجى إدخال اسم العميل');
      return;
    }

    const price18Num = formPrice18.trim() ? Number(formPrice18.trim()) : undefined;
    const price30Num = formPrice30.trim() ? Number(formPrice30.trim()) : undefined;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        customer_name: formName.trim(),
        customer_identifier: formatCustomerIdentifier(
          formIdentifier.trim() || editingCustomer.customer_identifier,
          customers
        ),
        mobile: formMobile.trim(),
        location: formLocation.trim(),
        agreed_price_18: price18Num,
        agreed_price_30: price30Num,
        assigned_driver: formAssignedDriver.trim() || undefined,
        notes: formNotes.trim(),
      });
      setEditingCustomer(null);
    } else {
      addCustomer({
        customer_name: formName.trim(),
        customer_identifier: formatCustomerIdentifier(
          formIdentifier.trim() || generateNewCustomerIdentifier(),
          customers
        ),
        mobile: formMobile.trim(),
        location: formLocation.trim(),
        agreed_price_18: price18Num,
        agreed_price_30: price30Num,
        assigned_driver: formAssignedDriver.trim() || undefined,
        notes: formNotes.trim(),
      });
      setIsAddModalOpen(false);
    }
  };

  // Delete Customer Handler
  const handleDeleteCustomer = (c: Customer) => {
    const stats = customerStatsMap.get(c.id);
    const hasDue = (stats?.remainingAmount || 0) > 0;
    const msg = hasDue
      ? `تنبيه: العميل "${c.customer_name}" لديه رصيد متبقي قدره (SAR ${stats?.remainingAmount.toLocaleString()}). هل أنت متأكد من حذف العميل وكافة سجلاته؟`
      : `هل أنت متأكد من حذف العميل "${c.customer_name}"؟`;

    if (window.confirm(msg)) {
      deleteCustomer(c.id);
    }
  };

  return (
    <div className="space-y-3 pb-16 max-w-4xl mx-auto px-2 sm:px-3 text-right">
      {/* ========================================================
          HEADER & TOP ACTIONS
          ======================================================== */}
      <div className="bg-white rounded-xl p-2 sm:p-2.5 shadow-2xs border border-slate-200/80">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="text-[10px] sm:text-[10.5px] font-medium">
              إجمالي العملاء المسجلين: <strong className="text-[#03457a] font-bold font-mono">{customers.length}</strong> عميل
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {customers.length > 0 && (
              <button
                id="customers-clear-all-btn"
                onClick={() => {
                  if (window.confirm('هل أنت متأكد من رغبتك في حذف كافة بيانات وسجلات العملاء؟')) {
                    clearAllCustomers();
                  }
                }}
                className="flex items-center gap-1 px-2 h-7 rounded-md border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold transition cursor-pointer"
                title="حذف كافة بيانات العملاء"
              >
                <Trash2 className="w-3 h-3 text-rose-600" />
                <span>حذف الكل</span>
              </button>
            )}

            <button
              id="customers-print-summary-btn"
              onClick={() => setIsPrintSummaryOpen(true)}
              className="flex items-center gap-1 px-2 h-7 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold transition cursor-pointer"
            >
              <Printer className="w-3 h-3 text-slate-600" />
              <span>طباعة الكشف</span>
            </button>

            <button
              id="customers-add-new-btn"
              onClick={handleOpenAddModal}
              className="flex items-center gap-1 px-2.5 h-7 rounded-md bg-[#03457a] hover:bg-[#023561] active:scale-95 text-white text-[10px] font-bold transition shadow-2xs cursor-pointer"
            >
              <UserPlus className="w-3 h-3" />
              <span>إضافة عميل جديد</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            KPI METRIC TILES
            ======================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
          {/* Total Customers */}
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/70 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[8.5px] font-bold">إجمالي العملاء</span>
              <Building2 className="w-3 h-3 text-slate-500" />
            </div>
            <div className="text-xs sm:text-[13px] font-black text-slate-900 mt-0.5 font-['Tajawal',sans-serif]">
              {overallKPIs.totalCustomers}
            </div>
          </div>

          {/* Customers with due balance */}
          <div className="bg-amber-50/70 rounded-lg p-2 border border-amber-200/70 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-[8.5px] font-bold">عملاء مدينون</span>
              <AlertCircle className="w-3 h-3 text-amber-600" />
            </div>
            <div className="text-xs sm:text-[13px] font-black text-amber-950 mt-0.5 font-['Tajawal',sans-serif]">
              {overallKPIs.customersWithDue}
            </div>
          </div>

          {/* Total outstanding receivables */}
          <div className="bg-rose-50/70 rounded-lg p-2 border border-rose-200/70 flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-700">
              <span className="text-[8.5px] font-bold">إجمالي المديونيات</span>
              <Clock className="w-3 h-3 text-rose-600" />
            </div>
            <div className="text-xs sm:text-[13px] font-black text-rose-950 mt-0.5 font-['Tajawal',sans-serif]">
              SAR {overallKPIs.totalOutstanding.toLocaleString()}
            </div>
          </div>

          {/* Total deliveries */}
          <div className="bg-emerald-50/70 rounded-lg p-2 border border-emerald-200/70 flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-[8.5px] font-bold">إجمالي التوريدات</span>
              <TrendingUp className="w-3 h-3 text-emerald-600" />
            </div>
            <div className="text-xs sm:text-[13px] font-black text-emerald-950 mt-0.5 font-['Tajawal',sans-serif]">
              {overallKPIs.totalDeliveries} رد
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SEARCH & FILTER CONTROLS (Ultra-compact, 50% reduced size)
          ======================================================== */}
      <div className="bg-white rounded-lg p-1 sm:p-1.5 shadow-2xs border border-slate-200/80">
        <div className="flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
          {/* Search Input (50% smaller) */}
          <div className="relative w-full sm:w-44 shrink-0">
            <Search className="w-2.5 h-2.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="customers-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 text-[9.5px] font-medium h-6 pr-5 pl-4 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 transition site-filter-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 text-[9px] rounded-full"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            {/* Status Filter Chips (مصغرة بنسبة 50٪) */}
            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-md border border-slate-200 text-[8.5px] sm:text-[9px] shrink-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-1.5 py-0.5 h-[22px] rounded font-bold transition cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                الكل ({customers.length})
              </button>
              <button
                onClick={() => setStatusFilter('due')}
                className={`px-1.5 py-0.5 h-[22px] rounded font-bold transition cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'due'
                    ? 'bg-rose-50 text-rose-800 shadow-2xs border border-rose-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                مدينون ({overallKPIs.customersWithDue})
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-1.5 py-0.5 h-[22px] rounded font-bold transition cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'paid'
                    ? 'bg-emerald-50 text-emerald-800 shadow-2xs border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                مسددون ({customers.length - overallKPIs.customersWithDue})
              </button>
            </div>

            {/* Sort Selector (مصغر بنسبة 50٪) */}
            <div className="relative min-w-[85px] sm:min-w-[95px] shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-[9px] sm:text-[9.5px] font-bold h-6 pr-3.5 pl-1 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 transition appearance-none cursor-pointer site-filter-select"
              >
                <option value="due_desc">الأعلى مديونية</option>
                <option value="trips_desc">الأكثر توريدات</option>
                <option value="name_asc">الاسم (أ - ي)</option>
                <option value="recent">الأحدث إضافة</option>
              </select>
              <ArrowUpDown className="w-2 h-2 text-slate-500 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          CUSTOMERS DIRECTORY (CARDS LIST)
          ======================================================== */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">لم يتم العثور على أي عملاء</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {searchQuery
                ? 'جرب البحث بكلمات مختلفة أو تفريغ حقل البحث'
                : 'ابدأ بإضافة أول عميل إلى النظام الآن'}
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>إضافة عميل جديد</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredCustomers.map((c) => {
            return (
              <div
                key={c.id}
                onClick={() => onSelectCustomer(c)}
                className="bg-white rounded-lg p-2.5 border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-[#03457a]/40 transition flex flex-col justify-between cursor-pointer group"
                title="اضغط لفتح ملف العميل وعرض كافة البيانات والتوريدات"
              >
                {/* Upper Area: Customer Name only (Outer Card) */}
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-sky-50 text-[#03457a] font-black flex items-center justify-center text-[10px] shrink-0 border border-sky-100 group-hover:bg-[#03457a] group-hover:text-white transition-colors">
                        {c.customer_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-[11px] truncate group-hover:text-[#03457a] transition-colors">
                          {c.customer_name}
                        </h3>
                      </div>
                    </div>

                    <span className="text-[9px] text-slate-400 group-hover:text-[#03457a] font-medium shrink-0 flex items-center gap-0.5 transition-colors">
                      <span>ملف العميل</span>
                      <ChevronLeft className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>

                {/* Bottom Area: Two Action Buttons (ملف العميل وتوريد جديد) */}
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                  {/* ملف العميل */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCustomer(c);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 h-6 px-1.5 bg-sky-50 hover:bg-sky-100 active:bg-sky-200 text-sky-800 text-[9.5px] font-bold rounded-md border border-sky-200 transition cursor-pointer"
                    title="فتح ملف العميل وعرض كافة البيانات والتوريدات"
                  >
                    <User className="w-3 h-3 text-sky-700" />
                    <span>ملف العميل</span>
                  </button>

                  {/* توريد جديد */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNewSupplyForCustomer(c);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 h-6 px-1.5 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 text-[9.5px] font-bold rounded-md border border-emerald-200 transition cursor-pointer"
                    title="تسجيل توريد جديد لهذا العميل"
                  >
                    <Plus className="w-3 h-3 text-emerald-700" />
                    <span>توريد جديد</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          MODAL: CUSTOMER PROFILE / ملف العميل الكامل
          ======================================================== */}
      {profileCustomer && (() => {
        const stats = customerStatsMap.get(profileCustomer.id) || {
          totalDeliveries: 0,
          totalAmount: 0,
          totalPaid: 0,
          remainingAmount: 0,
          status: 'مسدد',
        };
        const isDue = stats.remainingAmount > 0;

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col animate-fade-in">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-sky-700 to-sky-800 text-white p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-base border border-white/20">
                    {profileCustomer.customer_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{profileCustomer.customer_name}</h3>
                    {profileCustomer.customer_identifier && (
                      <div className="mt-0.5">
                        <span className="text-[11px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-sky-100 inline-block">
                          رقم العميل: {profileCustomer.customer_identifier}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-sky-100 mt-1">ملف وبيانات العميل الكاملة</p>
                  </div>
                </div>
                <button
                  onClick={() => setProfileCustomer(null)}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 overflow-y-auto space-y-4">
                {/* Financial Status Banner */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDue ? 'bg-rose-50/90 border-rose-200 text-rose-900' : 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center gap-2.5">
                    {isDue ? (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    <div>
                      <span className="text-xs font-bold block">
                        {isDue ? 'حساب مدين (يوجد رصيد مستحق)' : 'حساب سليم ومسدد بالكامل'}
                      </span>
                      <span className="text-sm font-black font-['Tajawal',sans-serif]">
                        {isDue ? `المبلغ المستحق: SAR ${stats.remainingAmount.toLocaleString()}` : 'لا توجد أي مبالغ متأخرة'}
                      </span>
                    </div>
                  </div>
                  {isDue && (
                    <button
                      type="button"
                      onClick={() => {
                        const custId = profileCustomer.id;
                        setProfileCustomer(null);
                        setPaymentCustomerId(custId);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer flex items-center gap-1"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>سند قبض</span>
                    </button>
                  )}
                </div>

                {/* Contact and Location details */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5 text-xs">
                  {/* Phone */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>رقم الجوال:</span>
                    </span>
                    {profileCustomer.mobile ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800" dir="ltr">{profileCustomer.mobile}</span>
                        <a
                          href={`tel:${profileCustomer.mobile}`}
                          className="p-1 rounded bg-white hover:bg-sky-50 text-sky-700 border border-slate-200 transition"
                          title="اتصال هاتفي"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/${profileCustomer.mobile.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 transition"
                          title="مراسلة عبر واتساب"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">غير مسجل</span>
                    )}
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>الموقع / العنوان:</span>
                    </span>
                    <span className="text-slate-800 font-medium text-left">
                      {profileCustomer.location || 'غير محدد'}
                    </span>
                  </div>

                  {/* Agreed Supply Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span>سعر التوريد المتفق عليه:</span>
                    </span>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="bg-sky-50 text-sky-800 px-2 py-0.5 rounded border border-sky-200">
                        18 طن: {profileCustomer.agreed_price_18 ? `${profileCustomer.agreed_price_18} ر.س` : 'غير محدد'}
                      </span>
                      <span className="bg-sky-50 text-sky-800 px-2 py-0.5 rounded border border-sky-200">
                        30 طن: {profileCustomer.agreed_price_30 ? `${profileCustomer.agreed_price_30} ر.س` : 'غير محدد'}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Driver */}
                  {profileCustomer.assigned_driver && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>السائق المكلف:</span>
                      </span>
                      <span className="text-slate-800 font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                        {profileCustomer.assigned_driver}
                      </span>
                    </div>
                  )}

                  {/* Notes */}
                  {profileCustomer.notes && (
                    <div className="pt-2 border-t border-slate-200/70">
                      <span className="text-slate-500 font-bold block mb-1">ملاحظات العميل:</span>
                      <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed text-xs">
                        {profileCustomer.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Financial Metrics Breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-2">إحصائيات التعاملات المالية والتوريد:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-medium">عدد التوريدات</span>
                      <span className="text-sm font-black text-slate-800 font-['Tajawal',sans-serif]">
                        {stats.totalDeliveries} رد
                      </span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-medium">إجمالي المبالغ</span>
                      <span className="text-sm font-black text-slate-800 font-['Tajawal',sans-serif]">
                        SAR {stats.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 block font-medium">إجمالي المسدد</span>
                      <span className="text-sm font-black text-emerald-900 font-['Tajawal',sans-serif]">
                        SAR {stats.totalPaid.toLocaleString()}
                      </span>
                    </div>
                    <div className={`rounded-xl p-2.5 border ${isDue ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`text-[10px] block font-medium ${isDue ? 'text-rose-700' : 'text-slate-500'}`}>
                        المتبقي المستحق
                      </span>
                      <span className={`text-sm font-black font-['Tajawal',sans-serif] ${isDue ? 'text-rose-900' : 'text-slate-700'}`}>
                        SAR {stats.remainingAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap shrink-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* ملف العميل */}
                  <button
                    type="button"
                    onClick={() => {
                      const c = profileCustomer;
                      setProfileCustomer(null);
                      onSelectCustomer(c);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition shadow-2xs cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>ملف العميل</span>
                  </button>

                  {/* توريد جديد */}
                  <button
                    type="button"
                    onClick={() => {
                      const c = profileCustomer;
                      setProfileCustomer(null);
                      onNewSupplyForCustomer(c);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>توريد جديد</span>
                  </button>

                  {/* تعديل */}
                  <button
                    type="button"
                    onClick={() => {
                      const c = profileCustomer;
                      setProfileCustomer(null);
                      handleOpenEditModal(c);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>تعديل</span>
                  </button>

                  {/* حذف */}
                  <button
                    type="button"
                    onClick={() => {
                      const c = profileCustomer;
                      setProfileCustomer(null);
                      handleDeleteCustomer(c);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-lg border border-rose-200 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setProfileCustomer(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================
          MODAL: ADD OR EDIT CUSTOMER
          ======================================================== */}
      {(isAddModalOpen || editingCustomer) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-xl overflow-hidden border border-slate-200 animate-fade-in">
            <div className="bg-gradient-to-r from-[#023561] to-[#03457a] text-white px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                  <UserPlus className="w-3 h-3" />
                </div>
                <h3 className="font-extrabold text-xs">
                  {editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCustomer(null);
                }}
                className="w-5 h-5 flex items-center justify-center text-white/80 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-3 space-y-2 text-right">
              {formError && (
                <div className="bg-rose-50 text-rose-800 p-1.5 rounded-lg text-[9px] font-bold border border-rose-200 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Customer Name */}
              <div>
                <label className="block text-[9px] font-bold text-slate-700 mb-0.5">
                  اسم العميل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white text-slate-800 text-[10px] font-bold px-2 h-7 rounded-lg border border-slate-200 focus:outline-hidden focus:border-[#03457a]"
                />
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-[9px] font-bold text-slate-700 mb-0.5">
                  رقم الجوال
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={formMobile}
                  onChange={(e) => setFormMobile(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white text-slate-800 text-[10px] font-mono font-bold text-right px-2 h-7 rounded-lg border border-slate-200 focus:outline-hidden focus:border-[#03457a]"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-[9px] font-bold text-slate-700 mb-0.5">
                  الموقع أو العنوان
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white text-slate-800 text-[10px] px-2 h-7 rounded-lg border border-slate-200 focus:outline-hidden focus:border-[#03457a]"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMapPickerOpen(true)}
                    className="h-7 w-7 bg-[#03457a] hover:bg-[#023561] text-white rounded-lg transition shrink-0 cursor-pointer flex items-center justify-center shadow-2xs"
                    title="تحديد الموقع عبر خرائط Google"
                    aria-label="خرائط Google"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Agreed Supply Price */}
              <div>
                <label className="block text-[9px] font-bold text-slate-700 mb-0.5">
                  سعر التوريد المتفق عليه
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-[8.5px] font-medium text-slate-600 mb-0.5">
                      18 طن :
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={formPrice18}
                        onChange={(e) => setFormPrice18(e.target.value)}
                        placeholder="0"
                        className="w-full bg-slate-50 focus:bg-white text-slate-800 text-[10px] font-bold px-2 h-7 pl-6 rounded-lg border border-slate-200 focus:outline-hidden focus:border-[#03457a]"
                      />
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8.5px] text-slate-400 font-bold">
                        ر.س
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8.5px] font-medium text-slate-600 mb-0.5">
                      30 طن :
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={formPrice30}
                        onChange={(e) => setFormPrice30(e.target.value)}
                        placeholder="0"
                        className="w-full bg-slate-50 focus:bg-white text-slate-800 text-[10px] font-bold px-2 h-7 pl-6 rounded-lg border border-slate-200 focus:outline-hidden focus:border-[#03457a]"
                      />
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8.5px] text-slate-400 font-bold">
                        ر.س
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Driver */}
              <div>
                <label className="block text-[9px] font-bold text-slate-700 mb-0.5">
                  السائق المكلف :
                </label>
                <div className="relative">
                  <select
                    value={formAssignedDriver}
                    onChange={(e) => setFormAssignedDriver(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white text-slate-800 text-[10px] px-2 h-7 rounded-lg border border-slate-200 focus:outline-hidden focus:border-[#03457a] appearance-none cursor-pointer"
                  >
                    <option value="">-- اختياري: اختر سائقاً --</option>
                    {drivers.map((drv) => (
                      <option key={drv.id} value={drv.driver_name}>
                        {drv.driver_name} {drv.vehicle_plate ? `(${drv.vehicle_plate})` : ''}
                      </option>
                    ))}
                  </select>
                  <Truck className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[9px] font-bold text-slate-700 mb-0.5">
                  ملاحظات إضافية
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white text-slate-800 text-[10px] px-2 h-7 rounded-lg border border-slate-200 focus:outline-hidden focus:border-[#03457a]"
                />
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCustomer(null);
                  }}
                  className="px-2.5 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-bold transition cursor-pointer flex items-center justify-center"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-3 h-7 rounded-lg bg-[#03457a] hover:bg-[#023561] active:scale-95 text-white text-[10px] font-bold transition shadow-2xs cursor-pointer flex items-center justify-center"
                >
                  {editingCustomer ? 'حفظ التعديلات' : 'إضافة العميل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: RECORD PAYMENT QUICKLY
          ======================================================== */}
      {paymentCustomerId && (
        <RecordPaymentModal
          initialCustomerId={paymentCustomerId}
          onClose={() => setPaymentCustomerId(null)}
          onSuccess={() => setPaymentCustomerId(null)}
        />
      )}

      {/* ========================================================
          MODAL: PRINT CUSTOMERS SUMMARY
          ======================================================== */}
      {isPrintSummaryOpen && (
        <A4DocumentPreviewModal
          title="معاينة كشف قائمة العملاء والمديونيات"
          subtitle={`مؤسسة نبع لتوريد المياه • ${new Date().toLocaleDateString('ar-SA')}`}
          badge="ورقة A4 عمودية (210×297 مم)"
          pagesCount={customerPages.length}
          onClose={() => setIsPrintSummaryOpen(false)}
          onConfirmPrint={() => window.print()}
        >
          {customerPages.map((pageCustomers, pageIdx) => (
            <A4PageSheet
              key={pageIdx}
              id={`printable-customers-list-p${pageIdx + 1}`}
              pageNumber={pageIdx + 1}
              totalPages={customerPages.length}
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
                          كشف وأرصدة العملاء والمديونيات
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          المملكة العربية السعودية - الطائف
                        </p>
                      </div>

                      <div className="text-left space-y-1">
                        <div className="px-2.5 py-1 bg-sky-50 text-[#03457a] border border-sky-200 rounded-md font-bold text-[10px] font-mono">
                          كشف رسمي معتمد
                        </div>
                        <p className="text-[9.5px] text-slate-500 font-mono">
                          تاريخ الكشف: {new Date().toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#03457a]">
                          تابع كشف العملاء والمديونيات
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        صفحة {pageIdx + 1} من {customerPages.length}
                      </span>
                    </div>
                  )}

                  {/* Summary KPI boxes on page 1 */}
                  {pageIdx === 0 && (
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">إجمالي العملاء</span>
                        <strong className="text-slate-900 font-bold">{overallKPIs.totalCustomers} عميل</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">العملاء المدينون</span>
                        <strong className="text-amber-700 font-bold">{overallKPIs.customersWithDue} عميل</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">إجمالي المتبقي</span>
                        <strong className="text-rose-700 font-bold font-mono">SAR {overallKPIs.totalOutstanding.toLocaleString()}</strong>
                      </div>
                    </div>
                  )}

                  {/* Table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-right text-[10.5px]">
                      <thead className="bg-[#03457a] text-white font-bold">
                        <tr>
                          <th className="py-2 px-2.5">#</th>
                          <th className="py-2 px-2.5">اسم العميل</th>
                          <th className="py-2 px-2.5">الكود</th>
                          <th className="py-2 px-2.5">الجوال</th>
                          <th className="py-2 px-2.5">الموقع</th>
                          <th className="py-2 px-2.5 text-center">الردود</th>
                          <th className="py-2 px-2.5 text-left">المتبقي (SAR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pageCustomers.map((c, idx) => {
                          const globalIdx = pageIdx * customersPerPage + idx + 1;
                          const stats = customerStatsMap.get(c.id);
                          const rem = stats?.remainingAmount || 0;
                          return (
                            <tr key={c.id} className="hover:bg-slate-50/50">
                              <td className="py-2 px-2.5 text-slate-400 font-mono">{globalIdx}</td>
                              <td className="py-2 px-2.5 font-bold text-slate-800">{c.customer_name}</td>
                              <td className="py-2 px-2.5 font-mono text-slate-600">{c.customer_identifier || '-'}</td>
                              <td className="py-2 px-2.5 font-mono text-slate-600" dir="ltr">{c.mobile || '-'}</td>
                              <td className="py-2 px-2.5 text-slate-600 truncate max-w-[120px]">{c.location || '-'}</td>
                              <td className="py-2 px-2.5 text-center font-bold font-mono">{stats?.totalDeliveries || 0}</td>
                              <td className={`py-2 px-2.5 text-left font-bold font-mono ${rem > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {rem > 0 ? rem.toLocaleString() : 'مسدد'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Signatures on final page */}
                {pageIdx === customerPages.length - 1 && (
                  <div className="pt-6 border-t border-slate-200 flex justify-between text-center text-[10px] text-slate-500 mt-auto">
                    <div>
                      <p className="font-bold text-slate-700">المحاسب المسؤول</p>
                      <div className="mt-5 border-b border-dashed border-slate-400 w-28 mx-auto"></div>
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">إدارة علاقات العملاء</p>
                      <div className="mt-5 border-b border-dashed border-slate-400 w-28 mx-auto"></div>
                    </div>
                  </div>
                )}
              </div>
            </A4PageSheet>
          ))}
        </A4DocumentPreviewModal>
      )}

      {/* Google Maps Location Picker Modal */}
      <GoogleMapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        initialLocation={formLocation}
        onSelectLocation={(data) => {
          setFormLocation(data.formattedLocation);
        }}
      />
    </div>
  );
};

export default CustomersView;

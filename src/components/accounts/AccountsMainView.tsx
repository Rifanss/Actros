import React, { useState, useMemo, useRef } from 'react';
import { useWaterData } from '../../context/WaterDataContext';
import {
  AccountsPeriodFilter,
  CustomerAccountSummary,
  Invoice,
  Payment,
  AccountStatementMovement,
  Customer,
  Delivery,
} from '../../types';
import {
  Receipt,
  FileText,
  DollarSign,
  CreditCard,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Printer,
  Share2,
  MessageSquareShare,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Download,
  Eye,
  Trash2,
  FilePlus,
  Phone,
  MapPin,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import IssueInvoiceModal from './IssueInvoiceModal';
import BackButton from '../BackButton';
import RecordPaymentModal from './RecordPaymentModal';
import OfficialInvoicePrintModal from './OfficialInvoicePrintModal';
import PaymentReceiptPrintModal from './PaymentReceiptPrintModal';
import PaymentReminderModal from '../PaymentReminderModal';
import { PrintStatementModal, ReportType } from '../customer-profile/PrintStatementModal';
import { PDFStatementViewerModal } from '../customer-profile/PDFStatementViewerModal';
import { useScrollToTop } from '../../utils/scrollUtils';

export const AccountsMainView: React.FC = () => {
  const {
    customers,
    invoices,
    payments,
    deliveries,
    accountsFilter,
    setAccountsFilter,
    selectedAccountsCustomerId,
    setSelectedAccountsCustomerId,
    allCustomersAccountSummaries,
    getCustomerAccountSummary,
    getCustomerStatement,
    getAccountsFinancialMetrics,
    getUninvoicedDeliveries,
    deleteInvoice,
    deletePayment,
  } = useWaterData();

  // Active sub-tab inside selected customer
  const [customerSubTab, setCustomerSubTab] = useState<
    'statement' | 'invoices' | 'payments' | 'uninvoiced'
  >('statement');

  // Guarantee that switching customers or sub-tabs inside accounts starts at top (0, 0)
  useScrollToTop([selectedAccountsCustomerId, customerSubTab]);

  // Customer search & filter state
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState<
    'all' | 'due' | 'overdue' | 'paid'
  >('all');

  // Modals state
  const [isIssueInvoiceOpen, setIsIssueInvoiceOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [selectedPaymentForPrint, setSelectedPaymentForPrint] = useState<Payment | null>(null);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [activePaymentInvoiceId, setActivePaymentInvoiceId] = useState<string | undefined>(undefined);
  const [isPrintStatementConfigOpen, setIsPrintStatementConfigOpen] = useState(false);
  const [statementViewerConfig, setStatementViewerConfig] = useState<{
    startDate: string;
    endDate: string;
    reportType: ReportType;
    filteredDeliveries: Delivery[];
  } | null>(null);
  const [isStatementViewerOpen, setIsStatementViewerOpen] = useState(false);

  // Statement print reference
  const statementPrintRef = useRef<HTMLDivElement>(null);

  // Financial metrics for current period
  const metrics = useMemo(() => {
    return getAccountsFinancialMetrics(accountsFilter);
  }, [accountsFilter, getAccountsFinancialMetrics]);

  // Selected customer data
  const selectedCustomerSummary = useMemo(() => {
    if (!selectedAccountsCustomerId) return null;
    return getCustomerAccountSummary(selectedAccountsCustomerId);
  }, [selectedAccountsCustomerId, getCustomerAccountSummary]);

  const customerStatement = useMemo(() => {
    if (!selectedAccountsCustomerId) return [];
    return getCustomerStatement(selectedAccountsCustomerId);
  }, [selectedAccountsCustomerId, getCustomerStatement]);

  const customerInvoices = useMemo(() => {
    if (!selectedAccountsCustomerId) return [];
    return invoices.filter((i) => i.customer_id === selectedAccountsCustomerId);
  }, [selectedAccountsCustomerId, invoices]);

  const customerPayments = useMemo(() => {
    if (!selectedAccountsCustomerId) return [];
    return payments.filter((p) => p.customer_id === selectedAccountsCustomerId);
  }, [selectedAccountsCustomerId, payments]);

  const customerUninvoicedDeliveries = useMemo(() => {
    if (!selectedAccountsCustomerId) return [];
    return getUninvoicedDeliveries(selectedAccountsCustomerId);
  }, [selectedAccountsCustomerId, getUninvoicedDeliveries]);

  // Filtered customer list for directory
  const filteredCustomers = useMemo(() => {
    return allCustomersAccountSummaries.filter((summary) => {
      const { customer, status, remainingAmount } = summary;

      // Status Filter
      if (customerStatusFilter === 'due' && remainingAmount <= 0) return false;
      if (customerStatusFilter === 'overdue' && status !== 'متأخر') return false;
      if (customerStatusFilter === 'paid' && status !== 'مسدد') return false;

      // Search Filter
      if (!customerSearchQuery.trim()) return true;
      const q = customerSearchQuery.trim().toLowerCase();
      const matchName = customer.customer_name.toLowerCase().includes(q);
      const matchMobile = customer.mobile.includes(q);
      const matchId = (customer.customer_identifier || '').toLowerCase().includes(q);

      return matchName || matchMobile || matchId;
    });
  }, [allCustomersAccountSummaries, customerSearchQuery, customerStatusFilter]);

  // Print Statement Handler - Opens statement options modal (3 types)
  const handlePrintStatement = () => {
    if (selectedCustomerSummary) {
      setIsPrintStatementConfigOpen(true);
    } else {
      window.print();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-5">
      {/* 1. SECTION TOP ACTIONS */}
      <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
        <p className="text-[10.5px] text-slate-600 font-medium hidden sm:block">
          إدارة الفواتير، المدفوعات، الأرصدة والمستحقات المالية للعملاء
        </p>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            id="accounts-issue-invoice-btn"
            onClick={() => {
              setIsIssueInvoiceOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#03457a] hover:bg-[#023561] active:scale-95 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>إصدار فاتورة</span>
          </button>

          <button
            id="accounts-record-payment-btn"
            onClick={() => {
              setActivePaymentInvoiceId(undefined);
              setIsRecordPaymentOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>تسجيل دفعة</span>
          </button>
        </div>
      </div>

      {/* 2. PERIOD FILTER BAR */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-sky-700" />
            <span>الفترة الزمنية للملخص:</span>
          </div>

          {/* Quick Period Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'today', label: 'اليوم' },
              { key: 'this_week', label: 'هذا الأسبوع' },
              { key: 'this_month', label: 'هذا الشهر' },
              { key: 'this_year', label: 'هذه السنة' },
              { key: 'custom', label: 'فترة مخصصة' },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() =>
                  setAccountsFilter((prev) => ({
                    ...prev,
                    period: p.key as AccountsPeriodFilter,
                  }))
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  accountsFilter.period === p.key
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Inputs when 'custom' is selected */}
        {accountsFilter.period === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">من تاريخ:</label>
              <input
                type="date"
                value={accountsFilter.customStartDate || ''}
                onChange={(e) =>
                  setAccountsFilter((prev) => ({
                    ...prev,
                    customStartDate: e.target.value,
                  }))
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">إلى تاريخ:</label>
              <input
                type="date"
                value={accountsFilter.customEndDate || ''}
                onChange={(e) =>
                  setAccountsFilter((prev) => ({
                    ...prev,
                    customEndDate: e.target.value,
                  }))
                }
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. 4 FINANCIAL SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {/* Card 1: Total Invoiced */}
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs text-slate-500 font-bold">إجمالي الفواتير</span>
            <div className="p-1 bg-blue-50 text-blue-700 rounded-md">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-[15px] sm:text-base font-black text-slate-900 font-mono leading-tight">
            {metrics.totalInvoiced.toLocaleString()} <span className="text-[11px] font-normal">ر.س</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">الفواتير المصدرة بالفترة</p>
        </div>

        {/* Card 2: Total Collected */}
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs text-slate-500 font-bold">إجمالي المحصل</span>
            <div className="p-1 bg-emerald-50 text-emerald-700 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-[15px] sm:text-base font-black text-emerald-700 font-mono leading-tight">
            {metrics.totalCollected.toLocaleString()} <span className="text-[11px] font-normal">ر.س</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">المدفوعات والمتحصلات</p>
        </div>

        {/* Card 3: Total Remaining */}
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs text-slate-500 font-bold">إجمالي المتبقي</span>
            <div className="p-1 bg-rose-50 text-rose-700 rounded-md">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-[15px] sm:text-base font-black text-rose-700 font-mono leading-tight">
            {metrics.totalRemaining.toLocaleString()} <span className="text-[11px] font-normal">ر.س</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">إجمالي المديونيات الحالية</p>
        </div>

        {/* Card 4: Due Customers Count */}
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs text-slate-500 font-bold">عملاء عليهم مستحقات</span>
            <div className="p-1 bg-amber-50 text-amber-700 rounded-md">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-[15px] sm:text-base font-black text-amber-900 font-mono leading-tight">
            {metrics.customersWithDueCount}{' '}
            <span className="text-[11px] font-normal text-slate-500">عميل</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">من أصل {customers.length} عملاء</p>
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA: CUSTOMER LOOKUP & ACCOUNT CARD / DIRECTORY */}
      {selectedAccountsCustomerId && selectedCustomerSummary ? (
        /* =========================================================================
           VIEW A: SPECIFIC CUSTOMER SELECTED - DETAILED ACCOUNT CARD & STATEMENTS
           ========================================================================= */
        <div className="space-y-4 animate-fade-in">
          {/* Back to All Customers Bar */}
          <div className="flex items-center justify-between gap-2">
            <BackButton
              label="الرجوع لجميع العملاء"
              onClick={() => setSelectedAccountsCustomerId(null)}
              variant="white"
              size="xs"
            />

            {/* Quick Customer Switcher Dropdown (50% smaller) */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500 hidden sm:inline">تبديل العميل:</span>
              <select
                value={selectedAccountsCustomerId}
                onChange={(e) => setSelectedAccountsCustomerId(e.target.value)}
                className="bg-white border border-slate-200 rounded-md px-2 py-0 text-[10px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 h-6 site-filter-select"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customer_name} ({c.customer_identifier})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer Account Overview Card (بطاقة حساب العميل) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            {/* Customer Info Header with Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 font-['Tajawal',sans-serif]">
                    {selectedCustomerSummary.customer.customer_name}
                  </h2>
                  {/* Status Badge: مسدد / مستحق / متأخر */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      selectedCustomerSummary.status === 'مسدد'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : selectedCustomerSummary.status === 'متأخر'
                        ? 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {selectedCustomerSummary.status === 'مسدد' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : selectedCustomerSummary.status === 'متأخر' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>حساب {selectedCustomerSummary.status}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="font-mono">
                    المعرف: {selectedCustomerSummary.customer.customer_identifier}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {selectedCustomerSummary.customer.mobile}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {selectedCustomerSummary.customer.location}
                  </span>
                </div>
              </div>

              {/* Action Buttons for this Customer */}
              <div className="flex items-center flex-wrap gap-2">
                <button
                  onClick={() => setIsIssueInvoiceOpen(true)}
                  className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>إصدار فاتورة</span>
                </button>

                <button
                  onClick={() => {
                    setActivePaymentInvoiceId(undefined);
                    setIsRecordPaymentOpen(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>تسجيل دفعة</span>
                </button>

                <button
                  onClick={handlePrintStatement}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="طباعة كشف الحساب"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة</span>
                </button>

                {selectedCustomerSummary.remainingAmount > 0 && (
                  <button
                    onClick={() => setIsReminderOpen(true)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="إرسال رسالة تذكير بالسداد عبر واتساب"
                  >
                    <MessageSquareShare className="w-3.5 h-3.5" />
                    <span>تذكير بالسداد</span>
                  </button>
                )}
              </div>
            </div>

            {/* Financial Indicators Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10.5px] text-slate-500 block">إجمالي قيمة الفواتير</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {selectedCustomerSummary.totalInvoiced.toLocaleString()} ر.س
                </span>
                <span className="text-[9.5px] text-slate-400 block mt-0.5">
                  ({selectedCustomerSummary.invoicesCount} فواتير)
                </span>
              </div>

              <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                <span className="text-[10.5px] text-emerald-800 block">إجمالي المدفوع</span>
                <span className="font-bold text-emerald-900 font-mono text-sm">
                  {selectedCustomerSummary.totalPaid.toLocaleString()} ر.س
                </span>
                <span className="text-[9.5px] text-emerald-700 block mt-0.5">سندات ودفعات</span>
              </div>

              <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                <span className="text-[10.5px] text-amber-800 block">إجمالي الآجل</span>
                <span className="font-bold text-amber-900 font-mono text-sm">
                  {selectedCustomerSummary.totalDeferred.toLocaleString()} ر.س
                </span>
                <span className="text-[9.5px] text-amber-700 block mt-0.5">توريدات آجلة سابقة</span>
              </div>

              <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-200">
                <span className="text-[10.5px] text-rose-800 block font-bold">المتبقي المطلوب</span>
                <span className="font-black text-rose-900 font-mono text-sm">
                  {selectedCustomerSummary.remainingAmount.toLocaleString()} ر.س
                </span>
                <span className="text-[9.5px] text-rose-700 block mt-0.5">الرصيد المستحق</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10.5px] text-slate-500 block">آخر دفعة مسددة</span>
                {selectedCustomerSummary.lastPaymentAmount !== undefined ? (
                  <>
                    <span className="font-bold text-emerald-700 font-mono text-sm">
                      {selectedCustomerSummary.lastPaymentAmount.toLocaleString()} ر.س
                    </span>
                    <span className="text-[9.5px] text-slate-500 block mt-0.5">
                      {selectedCustomerSummary.lastPaymentDate}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 text-xs mt-1 block">لا توجد دفعات</span>
                )}
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10.5px] text-slate-500 block">تاريخ الاستحقاق</span>
                {selectedCustomerSummary.oldestDueDate ? (
                  <>
                    <span
                      className={`font-bold font-mono text-xs ${
                        selectedCustomerSummary.status === 'متأخر'
                          ? 'text-rose-700'
                          : 'text-slate-800'
                      }`}
                    >
                      {selectedCustomerSummary.oldestDueDate}
                    </span>
                    <span className="text-[9.5px] text-slate-500 block mt-0.5">
                      {selectedCustomerSummary.unpaidInvoicesCount} فواتير غير مسددة
                    </span>
                  </>
                ) : (
                  <span className="text-emerald-700 font-bold text-xs mt-1 block">
                    لا توجد مستحقات
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Tabs for Customer: Statement / Invoices / Payments / Uninvoiced */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setCustomerSubTab('statement')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                customerSubTab === 'statement'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>كشف الحساب التفصيلي ({customerStatement.length})</span>
            </button>

            <button
              onClick={() => setCustomerSubTab('invoices')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                customerSubTab === 'invoices'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>الفواتير الصادرة ({customerInvoices.length})</span>
            </button>

            <button
              onClick={() => setCustomerSubTab('payments')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                customerSubTab === 'payments'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>سندات القبض والدفعات ({customerPayments.length})</span>
            </button>

            <button
              onClick={() => setCustomerSubTab('uninvoiced')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                customerSubTab === 'uninvoiced'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>توريدات غير مفوترة ({customerUninvoicedDeliveries.length})</span>
            </button>
          </div>

          {/* Sub-Tab 1: Detailed Account Statement (كشف الحساب التفصيلي) */}
          {customerSubTab === 'statement' && (
            <div ref={statementPrintRef} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    حركات كشف الحساب (فواتير، مدفوعات وتوريدات)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    مرتبة زمنياً بتتبع الرصيد التراكمي خطوة بخطوة
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">
                    الرصيد المتبقي النهائي:
                  </span>
                  <span
                    className={`font-black font-mono text-sm px-2.5 py-0.5 rounded-lg border ${
                      selectedCustomerSummary.remainingAmount > 0
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {selectedCustomerSummary.remainingAmount.toLocaleString()} ر.س
                  </span>
                </div>
              </div>

              {customerStatement.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">لا توجد حركات مالية مسجلة لهذا العميل حتى الآن</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">التاريخ</th>
                          <th className="py-2.5 px-3">النوع / المرجع</th>
                          <th className="py-2.5 px-3">البيان والتفاصيل</th>
                          <th className="py-2.5 px-3 text-rose-800">قيمة الفاتورة (مدين)</th>
                          <th className="py-2.5 px-3 text-emerald-800">المدفوع (دائن)</th>
                          <th className="py-2.5 px-3 text-sky-950">المتبقي (الرصيد)</th>
                          <th className="py-2.5 px-3">تاريخ الاستحقاق</th>
                          <th className="py-2.5 px-3 text-center">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customerStatement.map((move) => (
                          <tr
                            key={move.id}
                            className={`hover:bg-slate-50 transition-colors ${
                              move.type === 'payment' ? 'bg-emerald-50/20' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                              {move.date}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold mr-1 ${
                                  move.type === 'payment'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-sky-100 text-sky-800'
                                }`}
                              >
                                {move.typeLabel}
                              </span>
                              <span>{move.referenceNumber}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{move.description}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-rose-700">
                              {move.debit > 0 ? `${move.debit.toLocaleString()} ر.س` : '-'}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                              {move.credit > 0 ? `${move.credit.toLocaleString()} ر.س` : '-'}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-black text-slate-900">
                              {move.balance.toLocaleString()} ر.س
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500">
                              {move.dueDate || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                  move.status === 'مسدد'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : move.status === 'متأخر'
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                {move.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards (No horizontal scroll clutter!) */}
                  <div className="md:hidden space-y-2.5">
                    {customerStatement.map((move) => (
                      <div
                        key={move.id}
                        className={`p-3 rounded-xl border text-xs space-y-2 ${
                          move.type === 'payment'
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded ${
                                move.type === 'payment'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-sky-100 text-sky-800'
                              }`}
                            >
                              {move.typeLabel}
                            </span>
                            <span className="font-mono text-slate-900">{move.referenceNumber}</span>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              move.status === 'مسدد'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : move.status === 'متأخر'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {move.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600">{move.description}</p>

                        <div className="grid grid-cols-3 gap-2 bg-white/80 p-2 rounded-lg border border-slate-100 font-mono">
                          <div>
                            <span className="text-[9.5px] text-slate-400 block">مدين</span>
                            <span className="font-bold text-rose-700">
                              {move.debit > 0 ? `${move.debit}` : '-'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9.5px] text-slate-400 block">دائن</span>
                            <span className="font-bold text-emerald-700">
                              {move.credit > 0 ? `${move.credit}` : '-'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9.5px] text-slate-400 block">الرصيد</span>
                            <span className="font-black text-slate-900">{move.balance}</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                          <span>التاريخ: {move.date}</span>
                          {move.dueDate && <span>الاستحقاق: {move.dueDate}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Sub-Tab 2: Invoices List (الفواتير الصادرة) */}
          {customerSubTab === 'invoices' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  فواتير العميل الصادرة ({customerInvoices.length})
                </h3>
                <button
                  onClick={() => setIsIssueInvoiceOpen(true)}
                  className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>فاتورة جديدة</span>
                </button>
              </div>

              {customerInvoices.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">لم يتم إصدار فواتير لهذا العميل بعد</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customerInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-sky-300 transition-all bg-white shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black font-mono text-sm text-sky-950">
                            {inv.invoice_number}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              inv.status === 'مسدد'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : inv.status === 'متأخر'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <span className="text-[10.5px] text-slate-400 font-mono">
                          إصدار: {inv.issue_date}
                        </span>
                      </div>

                      {/* Items Preview */}
                      <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 space-y-1">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>عدد البنود: {inv.items.length}</span>
                          <span>استحقاق: {inv.due_date}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500">
                          {inv.items
                            .map((it) => `${it.supply_type} (${it.tank_capacity})`)
                            .join('، ')}
                        </p>
                      </div>

                      {/* Financial breakdown */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block">الإجمالي</span>
                          <span className="font-bold text-slate-800">
                            {inv.total_amount.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-600 block">المدفوع</span>
                          <span className="font-bold text-emerald-700">
                            {inv.paid_amount.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-rose-600 block">المتبقي</span>
                          <span className="font-black text-rose-700">
                            {inv.remaining_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedInvoiceForPrint(inv)}
                            className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة وطباعة</span>
                          </button>

                          {inv.remaining_amount > 0 && (
                            <button
                              onClick={() => {
                                setActivePaymentInvoiceId(inv.id);
                                setIsRecordPaymentOpen(true);
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>سداد</span>
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من رغبتك في حذف الفاتورة ${inv.invoice_number}؟`)) {
                              deleteInvoice(inv.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          title="حذف الفاتورة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 3: Payments List (سندات القبض والدفعات) */}
          {customerSubTab === 'payments' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  سندات القبض والدفعات المسجلة ({customerPayments.length})
                </h3>
                <button
                  onClick={() => {
                    setActivePaymentInvoiceId(undefined);
                    setIsRecordPaymentOpen(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>سند قبض جديد</span>
                </button>
              </div>

              {customerPayments.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">لا توجد سندات قبض مسجلة لهذا العميل حتى الآن</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customerPayments.map((pay) => (
                    <div
                      key={pay.id}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all bg-white shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black font-mono text-sm text-emerald-900">
                            {pay.payment_number}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                            {pay.payment_method}
                          </span>
                        </div>
                        <span className="text-[10.5px] text-slate-400 font-mono">
                          {pay.payment_date}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between py-1 border-b border-slate-100">
                        <span className="text-xs text-slate-500">المبلغ المقبوض:</span>
                        <span className="text-base font-black text-emerald-700 font-mono">
                          {pay.amount.toLocaleString()} ر.س
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        {pay.invoice_number && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">سداد للفاتورة:</span>
                            <span className="font-mono font-bold text-sky-800">
                              {pay.invoice_number}
                            </span>
                          </div>
                        )}
                        {pay.reference_number && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">رقم المرجع / الحوالة:</span>
                            <span className="font-mono text-slate-700">{pay.reference_number}</span>
                          </div>
                        )}
                        {pay.notes && (
                          <p className="text-[11px] text-slate-500 italic mt-1">{pay.notes}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <button
                          onClick={() => setSelectedPaymentForPrint(pay)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>معاينة السند الرسمي</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`هل تريد بالتأكيد حذف سند القبض ${pay.payment_number}؟`)) {
                              deletePayment(pay.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          title="حذف السند"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 4: Uninvoiced Deliveries (توريدات غير مفوترة) */}
          {customerSubTab === 'uninvoiced' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    عمليات توريد غير مدرجة في فواتير ({customerUninvoicedDeliveries.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    يمكنك تجميع هذه العمليات وإصدار فاتورة جديدة لها مباشرة
                  </p>
                </div>
                {customerUninvoicedDeliveries.length > 0 && (
                  <button
                    onClick={() => setIsIssueInvoiceOpen(true)}
                    className="px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                    <span>إصدار فاتورة بهذه التوريدات</span>
                  </button>
                )}
              </div>

              {customerUninvoicedDeliveries.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" />
                  <p className="text-xs font-bold text-slate-600">
                    رائع! جميع عمليات التوريد لهذا العميل مفوترة بالكامل
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    لا توجد أي عمليات توريد معلقة تنتظر إصدار فاتورة
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {customerUninvoicedDeliveries.map((del) => (
                    <div
                      key={del.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">#{del.sequence_num}</span>
                          <span>-</span>
                          <span className="font-bold text-slate-900">{del.supply_type}</span>
                          <span className="text-slate-500">({del.tank_capacity})</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              del.payment_method === 'آجل'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {del.payment_method}
                          </span>
                        </div>
                        <div className="text-[10.5px] text-slate-400 flex items-center gap-2">
                          <span>{del.supply_date}</span>
                          <span>•</span>
                          <span>السائق: {del.driver_name}</span>
                        </div>
                      </div>

                      <div className="text-left font-black font-mono text-sm text-sky-950">
                        {del.price.toLocaleString()} ر.س
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* =========================================================================
           VIEW B: NO SPECIFIC CUSTOMER SELECTED - CUSTOMER DIRECTORY & ACCOUNTS LIST
           ========================================================================= */
        <div className="space-y-4">
          {/* Search & Status Filters Bar (50% smaller) */}
          <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-7 pl-6 py-1 h-7 text-[10px] text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 site-filter-input"
                />
                {customerSearchQuery && (
                  <button
                    onClick={() => setCustomerSearchQuery('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 text-[9px]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0">
                {[
                  { key: 'all', label: 'الكل' },
                  { key: 'due', label: 'عليهم مستحقات' },
                  { key: 'overdue', label: 'متأخرين' },
                  { key: 'paid', label: 'مسددين' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() =>
                      setCustomerStatusFilter(tab.key as 'all' | 'due' | 'overdue' | 'paid')
                    }
                    className={`px-2 py-1 h-6 rounded-md text-[9.5px] font-bold transition whitespace-nowrap cursor-pointer site-filter-chip ${
                      customerStatusFilter === tab.key
                        ? 'bg-slate-800 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customers Account Cards Grid */}
          {customers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2 shadow-xs">
              <Users className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">لا يوجد عملاء مسجلون حالياً</p>
              <p className="text-xs text-slate-400">
                تم تفريغ كافة بيانات العملاء بنجاح. سيظهر العملاء وحساباتهم هنا فور تسجيلهم في النظام.
              </p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2 shadow-xs">
              <Users className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">لا توجد نتائج مطابقة لبحثك</p>
              <p className="text-xs text-slate-400">
                جرب تغيير مصطلح البحث أو تصفية حالة السداد بالأعلى
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredCustomers.map((summary) => {
                const { customer, status, remainingAmount, totalInvoiced, totalPaid, oldestDueDate } =
                  summary;

                return (
                  <div
                    key={customer.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-sky-300 p-4 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between space-y-3"
                  >
                    {/* Top Row: Name + Status Badge */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 leading-tight">
                            {customer.customer_name}
                          </h3>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                            <span>#{customer.customer_identifier}</span>
                            <span>•</span>
                            <span>{customer.mobile}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                            status === 'مسدد'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : status === 'متأخر'
                              ? 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    </div>

                    {/* Financial Metrics Strip */}
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center font-mono">
                      <div>
                        <span className="text-[9.5px] text-slate-400 block font-sans">الفواتير</span>
                        <span className="font-bold text-slate-800 text-xs">
                          {totalInvoiced.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-emerald-600 block font-sans">المدفوع</span>
                        <span className="font-bold text-emerald-700 text-xs">
                          {totalPaid.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9.5px] text-rose-600 block font-sans">المتبقي</span>
                        <span className="font-black text-rose-700 text-xs">
                          {remainingAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Due Date Indicator if outstanding */}
                    {remainingAmount > 0 && oldestDueDate && (
                      <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 font-mono">
                        <span>تاريخ الاستحقاق:</span>
                        <span
                          className={`font-bold ${
                            status === 'متأخر' ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {oldestDueDate}
                        </span>
                      </div>
                    )}

                    {/* Bottom Actions Row */}
                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedAccountsCustomerId(customer.id)}
                        className="flex-1 py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-xs font-bold transition text-center flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>كشف الحساب</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAccountsCustomerId(customer.id);
                          setIsIssueInvoiceOpen(true);
                        }}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                        title="إصدار فاتورة"
                      >
                        <FilePlus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAccountsCustomerId(customer.id);
                          setActivePaymentInvoiceId(undefined);
                          setIsRecordPaymentOpen(true);
                        }}
                        className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition"
                        title="تسجيل دفعة"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODALS
          ========================================================================= */}
      {/* 1. Issue Invoice Modal */}
      {isIssueInvoiceOpen && (
        <IssueInvoiceModal
          initialCustomerId={selectedAccountsCustomerId || undefined}
          onClose={() => setIsIssueInvoiceOpen(false)}
        />
      )}

      {/* 2. Record Payment Modal */}
      {isRecordPaymentOpen && (
        <RecordPaymentModal
          initialCustomerId={selectedAccountsCustomerId || undefined}
          initialInvoiceId={activePaymentInvoiceId}
          onClose={() => {
            setIsRecordPaymentOpen(false);
            setActivePaymentInvoiceId(undefined);
          }}
        />
      )}

      {/* 3. Official Tax Invoice Print/Preview Modal */}
      {selectedInvoiceForPrint && (
        <OfficialInvoicePrintModal
          invoice={selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}

      {/* 4. Official Receipt Voucher Print/Preview Modal */}
      {selectedPaymentForPrint && (
        <PaymentReceiptPrintModal
          payment={selectedPaymentForPrint}
          onClose={() => setSelectedPaymentForPrint(null)}
        />
      )}

      {/* 5. WhatsApp Payment Reminder Modal */}
      {isReminderOpen && selectedCustomerSummary && (
        <PaymentReminderModal
          customer={selectedCustomerSummary.customer}
          pendingAmount={selectedCustomerSummary.remainingAmount}
          onClose={() => setIsReminderOpen(false)}
        />
      )}

      {/* 5.5. Print Statement Options Modal (3 types: Comprehensive, Due, Paid) */}
      {isPrintStatementConfigOpen && selectedCustomerSummary && (
        <PrintStatementModal
          isOpen={isPrintStatementConfigOpen}
          customer={selectedCustomerSummary.customer}
          deliveries={deliveries.filter((d) => d.customer_id === selectedCustomerSummary.customer.id)}
          onClose={() => setIsPrintStatementConfigOpen(false)}
          onProceed={(config) => {
            setIsPrintStatementConfigOpen(false);
            setStatementViewerConfig(config);
            setIsStatementViewerOpen(true);
          }}
        />
      )}

      {/* 6. Account Statement In-App Preview Modal */}
      {isStatementViewerOpen && selectedCustomerSummary && (
        <PDFStatementViewerModal
          isOpen={isStatementViewerOpen}
          customer={selectedCustomerSummary.customer}
          deliveries={
            statementViewerConfig
              ? statementViewerConfig.filteredDeliveries
              : deliveries.filter((d) => d.customer_id === selectedCustomerSummary.customer.id)
          }
          startDate={statementViewerConfig?.startDate || ''}
          endDate={statementViewerConfig?.endDate || ''}
          reportType={statementViewerConfig?.reportType || 'all'}
          onClose={() => {
            setIsStatementViewerOpen(false);
            setStatementViewerConfig(null);
          }}
        />
      )}
    </div>
  );
};

export default AccountsMainView;

import React, { useState, useEffect } from 'react';
import { WaterDataProvider, useWaterData } from './context/WaterDataContext';
import { scrollToTop, useScrollToTop } from './utils/scrollUtils';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import DashboardView from './components/DashboardView';
import { PublicHomeView } from './components/home/PublicHomeView';
import SupplyCardForm from './components/SupplyCardForm';
import CustomerRecordView from './components/CustomerRecordView';
import CustomersView from './components/CustomersView';
import DeliveriesLogView from './components/DeliveriesLogView';
import OperationsMainView from './components/operations/OperationsMainView';
import AccountsMainView from './components/accounts/AccountsMainView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import { DriverLoginView } from './components/driver/DriverLoginView';
import { DriverPortalView } from './components/driver/DriverPortalView';
import InvoiceModal from './components/InvoiceModal';
import PaymentReminderModal from './components/PaymentReminderModal';
import DriverDetailsModal from './components/DriverDetailsModal';
import CustomerSearchModal from './components/CustomerSearchModal';
import BackButton from './components/BackButton';
import { Customer, Delivery, Driver } from './types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainApp: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    goBack,
    notification,
    setSelectedCustomerForRecord,
    filteredDeliveries,
    deliveries,
  } = useWaterData();

  // Modal states
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedDriverForModal, setSelectedDriverForModal] = useState<Driver | null>(null);
  const [invoiceModalData, setInvoiceModalData] = useState<{
    customer: Customer;
    deliveries: Delivery[];
  } | null>(null);
  const [paymentReminderData, setPaymentReminderData] = useState<{
    customer: Customer;
    pendingAmount: number;
  } | null>(null);

  const handleOpenCustomerRecord = (customer: Customer) => {
    setSelectedCustomerForRecord(customer);
    setActiveTab('customer_record');
    scrollToTop(true);
  };

  const handleOpenCustomerRecordById = (customerId: string) => {
    const cust = deliveries.find((d) => d.customer_id === customerId);
    if (cust) {
      setSelectedCustomerForRecord({
        id: cust.customer_id,
        customer_name: cust.customer_name,
        customer_identifier: cust.customer_identifier || 'NB-1001',
        mobile: cust.mobile,
        location: cust.location,
        created_at: cust.supply_date,
      });
      setActiveTab('customer_record');
      scrollToTop(true);
    }
  };

  // Ensure every tab and page navigation immediately starts at the top (0, 0)
  useScrollToTop([activeTab]);

  const isDriverTab = activeTab === 'driver_login' || activeTab === 'driver_portal';

  return (
    <div className="min-h-screen bg-[#f0f6fa] text-slate-800 font-['Cairo',sans-serif] flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Header (Shown on management/admin tabs outside the public home, customer profile, and driver portal) */}
      {activeTab !== 'home' && activeTab !== 'customer_record' && !isDriverTab && (
        <Header onOpenSearch={() => setSearchModalOpen(true)} />
      )}

      {/* Top Page / Section Back Navigation Bar (Visible in pages outside home, customer profile, and driver portal) */}
      {activeTab !== 'home' && activeTab !== 'customer_record' && !isDriverTab && (
        <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 py-1.5 sticky top-0 z-30 shadow-2xs">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <BackButton label="الرجوع" variant="white" size="xs" />
              <div className="h-4 w-px bg-slate-200 shrink-0"></div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 truncate">
                {activeTab === 'dashboard' && 'لوحة التحكم والعمليات'}
                {activeTab === 'add' && 'تسجيل كرت التوريد'}
                {activeTab === 'customers' && 'إدارة العملاء'}
                {activeTab === 'customer_record' && 'ملف العميل'}
                {activeTab === 'deliveries' && 'سجل التوريدات الشامل'}
                {activeTab === 'accounts' && 'الحسابات والفواتير'}
                {activeTab === 'operations' && 'التشغيل والمصروفات - إدارة العمليات والأسطول'}
                {activeTab === 'reports' && 'التقارير المالية والإحصائيات'}
                {activeTab === 'settings' && 'إعدادات النظام والأسعار'}
              </span>
            </div>

            <button
              onClick={() => {
                setActiveTab('home');
                scrollToTop(true);
              }}
              className="text-[10px] sm:text-[11px] font-bold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-2.5 py-0.5 rounded-md border border-sky-200/80 transition cursor-pointer shrink-0"
            >
              الرئيسية
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 ${activeTab === 'home' || activeTab === 'customer_record' || isDriverTab ? 'p-0' : 'pt-4 pb-8'}`}>
        {activeTab === 'home' && (
          <PublicHomeView
            onOpenAdminDashboard={() => {
              setActiveTab('dashboard');
              scrollToTop(true);
            }}
            onOpenCustomersView={() => {
              setActiveTab('customers');
              scrollToTop(true);
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView onSelectDriver={(drv) => setSelectedDriverForModal(drv)} />
        )}

        {activeTab === 'add' && <SupplyCardForm />}

        {activeTab === 'customers' && (
          <CustomersView
            onSelectCustomer={(cust) => {
              setSelectedCustomerForRecord(cust);
              setActiveTab('customer_record');
              scrollToTop(true);
            }}
            onNewSupplyForCustomer={(cust) => {
              setSelectedCustomerForRecord(cust);
              setActiveTab('add');
              scrollToTop(true);
            }}
          />
        )}

        {activeTab === 'customer_record' && (
          <CustomerRecordView
            onClose={() => {
              goBack();
            }}
            onOpenInvoice={(customer, custDeliveries) =>
              setInvoiceModalData({ customer, deliveries: custDeliveries })
            }
            onOpenPaymentReminder={(customer, pendingAmount) =>
              setPaymentReminderData({ customer, pendingAmount })
            }
          />
        )}

        {activeTab === 'deliveries' && <DeliveriesLogView />}

        {activeTab === 'accounts' && <AccountsMainView />}

        {activeTab === 'operations' && <OperationsMainView />}

        {activeTab === 'reports' && <ReportsView />}

        {activeTab === 'settings' && <SettingsView />}

        {activeTab === 'driver_login' && <DriverLoginView />}

        {activeTab === 'driver_portal' && <DriverPortalView />}
      </main>

      {/* Floating System Toast Notification */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-bounce max-w-sm w-[90%] pointer-events-none">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
              notification.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-300'
                : notification.type === 'info'
                ? 'bg-sky-50 text-sky-900 border-sky-300'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : notification.type === 'info' ? (
              <Info className="w-5 h-5 text-sky-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span className="flex-1">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation for admin/management tabs (Hidden when on customer profile, home, or driver portal) */}
      {activeTab !== 'home' && activeTab !== 'customer_record' && !isDriverTab && <BottomNavigation />}

      {/* ========================================================
          MODALS
          ======================================================== */}
      {/* 1. Quick Customer Search Modal */}
      {searchModalOpen && (
        <CustomerSearchModal
          onClose={() => setSearchModalOpen(false)}
          onSelectCustomer={handleOpenCustomerRecord}
        />
      )}

      {/* 2. Driver Performance Details Modal */}
      {selectedDriverForModal && (
        <DriverDetailsModal
          driver={selectedDriverForModal}
          deliveries={filteredDeliveries}
          onClose={() => setSelectedDriverForModal(null)}
          onOpenCustomerRecord={handleOpenCustomerRecordById}
        />
      )}

      {/* 3. Official Tax Invoice Modal */}
      {invoiceModalData && (
        <InvoiceModal
          customer={invoiceModalData.customer}
          deliveries={invoiceModalData.deliveries}
          onClose={() => setInvoiceModalData(null)}
        />
      )}

      {/* 4. WhatsApp Payment Reminder Modal */}
      {paymentReminderData && (
        <PaymentReminderModal
          customer={paymentReminderData.customer}
          pendingAmount={paymentReminderData.pendingAmount}
          onClose={() => setPaymentReminderData(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <WaterDataProvider>
      <MainApp />
    </WaterDataProvider>
  );
}

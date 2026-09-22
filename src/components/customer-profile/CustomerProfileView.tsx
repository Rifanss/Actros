import React, { useState, useMemo } from 'react';
import { useWaterData } from '../../context/WaterDataContext';
import { Customer, Delivery, DeliveryFormData } from '../../types';
import { CustomerHeader } from './CustomerHeader';
import { CustomerInfoCard } from './CustomerInfoCard';
import { SupplyInfoCard } from './SupplyInfoCard';
import { StatsSection } from './StatsSection';
import { SummarySection } from './SummarySection';
import { ActionButtonsRow } from './ActionButtonsRow';
import { DeliveriesTableSection } from './DeliveriesTableSection';

// Modals
import { EditCustomerModal } from './EditCustomerModal';
import { EditSupplyModal } from './EditSupplyModal';
import { NewDeliveryModal } from './NewDeliveryModal';
import { StatsWarningModal } from './StatsWarningModal';
import { StatsBreakdownModal } from './StatsBreakdownModal';
import { EditDueDeliveriesModal } from './EditDueDeliveriesModal';
import { EditPaidDeliveriesModal } from './EditPaidDeliveriesModal';
import { WhatsAppModal } from './WhatsAppModal';
import { PrintStatementModal, ReportType } from './PrintStatementModal';
import { PDFStatementViewerModal } from './PDFStatementViewerModal';

import { Users, UserPlus } from 'lucide-react';

interface CustomerProfileViewProps {
  onClose?: () => void;
}

export const CustomerProfileView: React.FC<CustomerProfileViewProps> = ({ onClose }) => {
  const {
    customers,
    deliveries,
    drivers,
    selectedCustomerForRecord,
    setSelectedCustomerForRecord,
    updateCustomer,
    addDelivery,
    updateDelivery,
    setActiveTab,
    goBack,
    showNotification,
  } = useWaterData();

  // If no customer is selected and no customers exist in the system
  if (!selectedCustomerForRecord && customers.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-2 sm:px-3 py-12 text-center text-right">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm max-w-md mx-auto text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#03457a] mx-auto flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">لا يوجد عملاء مسجلون حالياً</h3>
          <p className="text-xs text-slate-500">تم حذف وتصفير سجل العملاء والتوريدات. يمكنك البدء بإضافة عميل جديد.</p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              onClick={() => setActiveTab('customers')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#03457a] hover:bg-[#023561] text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة عميل جديد</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active customer: prefer selectedCustomerForRecord, then first customer
  const activeCustomer: Customer = useMemo(() => {
    if (selectedCustomerForRecord) return selectedCustomerForRecord;
    return customers[0];
  }, [selectedCustomerForRecord, customers]);

  // Deliveries associated with this active customer
  const customerDeliveries = useMemo(() => {
    return deliveries.filter(
      (d) =>
        d.customer_id === activeCustomer.id ||
        d.customer_name === activeCustomer.customer_name ||
        (activeCustomer.customer_identifier &&
          d.customer_identifier === activeCustomer.customer_identifier)
    );
  }, [deliveries, activeCustomer]);

  // Date bounds for summary
  const sortedDates = useMemo(() => {
    return customerDeliveries
      .map((d) => d.supply_date)
      .filter(Boolean)
      .sort();
  }, [customerDeliveries]);

  const [summaryStartDate, setSummaryStartDate] = useState(() => {
    return sortedDates[0] || '2026-09-01';
  });
  const [summaryEndDate, setSummaryEndDate] = useState(() => {
    return sortedDates[sortedDates.length - 1] || new Date().toISOString().split('T')[0];
  });

  // State for modals & edit mode
  const [statsEditMode, setStatsEditMode] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [isEditSupplyOpen, setIsEditSupplyOpen] = useState(false);
  const [isNewDeliveryOpen, setIsNewDeliveryOpen] = useState(false);
  const [isEditDueOpen, setIsEditDueOpen] = useState(false);
  const [isEditPaidOpen, setIsEditPaidOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Breakdown modal state
  const [breakdownModal, setBreakdownModal] = useState<{
    isOpen: boolean;
    type: 'total' | 'paid' | 'due' | null;
  }>({
    isOpen: false,
    type: null,
  });

  // PDF Viewer Modal State
  const [pdfViewerConfig, setPdfViewerConfig] = useState<{
    isOpen: boolean;
    startDate: string;
    endDate: string;
    reportType: ReportType;
    customTitle?: string;
    filteredDeliveries: Delivery[];
  }>({
    isOpen: false,
    startDate: summaryStartDate,
    endDate: summaryEndDate,
    reportType: 'all',
    filteredDeliveries: customerDeliveries,
  });

  // Handlers
  const handleEditCustomerSave = (updates: Partial<Customer>) => {
    updateCustomer(activeCustomer.id, updates);
  };

  const handleEditSupplySave = (updates: Partial<Customer>) => {
    updateCustomer(activeCustomer.id, updates);
  };

  const handleNewDeliverySubmit = (formData: DeliveryFormData) => {
    addDelivery(formData);
  };

  const handleSettleDueDeliveries = (deliveryIds: string[]) => {
    deliveryIds.forEach((id) => {
      updateDelivery(id, {
        payment_status: 'مدفوع',
        payment_method: 'كاش',
      });
    });
    showNotification(`تم سداد ${deliveryIds.length} رد بنجاح وتحديث الحسابات`);
  };

  const handleRevertToDue = (deliveryId: string) => {
    updateDelivery(deliveryId, {
      payment_status: 'مستحق',
      payment_method: 'آجل',
    });
    showNotification('تمت إعادة الرد إلى المستحقات');
  };

  const handleCall = () => {
    const cleanPhone = activeCustomer.mobile.replace(/\s+/g, '');
    window.location.href = `tel:${cleanPhone}`;
  };

  const handleDownloadPdfFromBreakdown = (
    filtered: Delivery[],
    customTitle: string,
    reportType?: ReportType
  ) => {
    setBreakdownModal({ isOpen: false, type: null });
    setPdfViewerConfig({
      isOpen: true,
      startDate: summaryStartDate,
      endDate: summaryEndDate,
      reportType: reportType || 'all',
      customTitle,
      filteredDeliveries: filtered,
    });
  };

  const handleProceedPrint = (config: {
    startDate: string;
    endDate: string;
    reportType: ReportType;
    filteredDeliveries: Delivery[];
  }) => {
    setIsPrintModalOpen(false);
    setPdfViewerConfig({
      isOpen: true,
      startDate: config.startDate,
      endDate: config.endDate,
      reportType: config.reportType,
      filteredDeliveries: config.filteredDeliveries,
    });
  };

  const handleCloseHeader = () => {
    if (onClose) {
      onClose();
    } else {
      goBack();
    }
  };

  // Due metrics for WhatsApp
  const dueDeliveries = customerDeliveries.filter(
    (d) => d.payment_status === 'مستحق' || d.payment_method === 'آجل'
  );
  const dueAmount = dueDeliveries.reduce(
    (sum, d) =>
      sum +
      (d.remaining_amount !== undefined
        ? Number(d.remaining_amount)
        : Number(d.price) || 0),
    0
  );

  return (
    <div
      id="customer-profile-screen"
      className="operations-scope min-h-screen bg-[#f1f5f9] text-slate-900 pb-12 font-['Cairo',sans-serif]"
      dir="rtl"
    >
      {/* Mobile container - matches exactly the mobile form factor in reference */}
      <div className="w-full max-w-[480px] mx-auto p-2 sm:p-3 space-y-2.5">
        {/* Section 1: Header */}
        <CustomerHeader
          customerName={activeCustomer.customer_name}
          onClose={handleCloseHeader}
        />

        {/* Section 2: Customer Data Card */}
        <CustomerInfoCard
          customer={activeCustomer}
          onEdit={() => setIsEditCustomerOpen(true)}
        />

        {/* Section 3: Supply Data Card */}
        <SupplyInfoCard
          customer={activeCustomer}
          drivers={drivers}
          onEdit={() => setIsEditSupplyOpen(true)}
          onSave={handleEditSupplySave}
        />

        {/* Section 4, 5, 6, 7, 8: Statistics Section */}
        <StatsSection
          deliveries={customerDeliveries}
          editMode={statsEditMode}
          onOpenWarningModal={() => setIsWarningModalOpen(true)}
          onExitEditMode={() => setStatsEditMode(false)}
          onOpenDetailsModal={(type) => setBreakdownModal({ isOpen: true, type })}
          onOpenEditDueModal={() => setIsEditDueOpen(true)}
          onOpenEditPaidModal={() => setIsEditPaidOpen(true)}
        />

        {/* Section 9, 10: Summary Section */}
        <SummarySection
          customer={activeCustomer}
          deliveries={customerDeliveries}
          startDate={summaryStartDate}
          endDate={summaryEndDate}
          onStartDateChange={setSummaryStartDate}
          onEndDateChange={setSummaryEndDate}
        />

        {/* Section 11: 4 Action Buttons Row */}
        <ActionButtonsRow
          onCall={handleCall}
          onWhatsApp={() => setIsWhatsAppOpen(true)}
          onPrint={() => setIsPrintModalOpen(true)}
          onNewSupply={() => setIsNewDeliveryOpen(true)}
        />

        {/* Section 12: Deliveries Log Table */}
        <DeliveriesTableSection
          deliveries={customerDeliveries}
          onSelectDelivery={(del) => {
            // opens breakdown of this delivery
            setBreakdownModal({ isOpen: true, type: 'total' });
          }}
        />
      </div>

      {/* MODALS */}
      {/* 1. Edit Customer Modal */}
      <EditCustomerModal
        isOpen={isEditCustomerOpen}
        customer={activeCustomer}
        onClose={() => setIsEditCustomerOpen(false)}
        onSave={handleEditCustomerSave}
      />

      {/* 2. Edit Supply Modal */}
      <EditSupplyModal
        isOpen={isEditSupplyOpen}
        customer={activeCustomer}
        drivers={drivers}
        onClose={() => setIsEditSupplyOpen(false)}
        onSave={handleEditSupplySave}
      />

      {/* 3. New Supply / Delivery Modal */}
      <NewDeliveryModal
        isOpen={isNewDeliveryOpen}
        customer={activeCustomer}
        drivers={drivers}
        onClose={() => setIsNewDeliveryOpen(false)}
        onSubmit={handleNewDeliverySubmit}
      />

      {/* 4. Warning Modal for Statistics Edit */}
      <StatsWarningModal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
        onConfirm={() => setStatsEditMode(true)}
      />

      {/* 5. Statistics Breakdown Modal with Download PDF */}
      <StatsBreakdownModal
        isOpen={breakdownModal.isOpen}
        type={breakdownModal.type}
        customerName={activeCustomer.customer_name}
        deliveries={customerDeliveries}
        onClose={() => setBreakdownModal({ isOpen: false, type: null })}
        onDownloadPdf={handleDownloadPdfFromBreakdown}
      />

      {/* 6. Edit Due Deliveries Modal */}
      <EditDueDeliveriesModal
        isOpen={isEditDueOpen}
        deliveries={customerDeliveries}
        onClose={() => setIsEditDueOpen(false)}
        onSettleDeliveries={handleSettleDueDeliveries}
      />

      {/* 7. Edit Paid Deliveries Modal */}
      <EditPaidDeliveriesModal
        isOpen={isEditPaidOpen}
        deliveries={customerDeliveries}
        onClose={() => setIsEditPaidOpen(false)}
        onRevertToDue={handleRevertToDue}
      />

      {/* 8. WhatsApp Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        customer={activeCustomer}
        dueAmount={dueAmount}
        dueCount={dueDeliveries.length}
        startDate={summaryStartDate}
        endDate={summaryEndDate}
        onClose={() => setIsWhatsAppOpen(false)}
      />

      {/* 9. Print Statement Modal */}
      <PrintStatementModal
        isOpen={isPrintModalOpen}
        customer={activeCustomer}
        deliveries={customerDeliveries}
        onClose={() => setIsPrintModalOpen(false)}
        onProceed={handleProceedPrint}
      />

      {/* 10. PDF Statement Viewer & Print Modal */}
      <PDFStatementViewerModal
        isOpen={pdfViewerConfig.isOpen}
        customer={activeCustomer}
        deliveries={pdfViewerConfig.filteredDeliveries}
        startDate={pdfViewerConfig.startDate}
        endDate={pdfViewerConfig.endDate}
        reportType={pdfViewerConfig.reportType}
        customTitle={pdfViewerConfig.customTitle}
        onClose={() =>
          setPdfViewerConfig((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
};

export default CustomerProfileView;

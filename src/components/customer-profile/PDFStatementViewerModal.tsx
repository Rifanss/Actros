import React, { useRef, useState, useMemo } from 'react';
import { Customer, Delivery } from '../../types';
import { ReportType } from './PrintStatementModal';
import { A4DocumentPreviewModal } from '../common/A4DocumentPreviewModal';
import { StatementDocumentSheet } from './StatementDocumentSheet';
import { LayoutGrid, List } from 'lucide-react';

interface PDFStatementViewerModalProps {
  isOpen: boolean;
  customer: Customer;
  deliveries: Delivery[];
  startDate: string;
  endDate: string;
  reportType: ReportType;
  customTitle?: string;
  onClose: () => void;
}

export const PDFStatementViewerModal: React.FC<PDFStatementViewerModalProps> = ({
  isOpen,
  customer,
  deliveries,
  startDate,
  endDate,
  reportType,
  customTitle,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [groupMode, setGroupMode] = useState<'unified' | 'grouped'>('unified');

  // Filter deliveries according to reportType
  const activeDeliveries = useMemo(() => {
    if (reportType === 'due') {
      return deliveries.filter(
        (d) => d.payment_status === 'مستحق' || d.payment_method === 'آجل' || Number(d.remaining_amount) > 0
      );
    }
    if (reportType === 'paid') {
      return deliveries.filter(
        (d) => d.payment_status === 'مدفوع' || d.payment_method === 'كاش'
      );
    }
    return deliveries;
  }, [deliveries, reportType]);

  if (!isOpen) return null;

  const totalRuns = activeDeliveries.length;
  const totalAmount = activeDeliveries.reduce((sum, d) => sum + (Number(d.price) || 0), 0);

  const paidDeliveries = activeDeliveries.filter(
    (d) => d.payment_status === 'مدفوع' || d.payment_method === 'كاش'
  );
  const paidAmount = paidDeliveries.reduce(
    (sum, d) => sum + (d.paid_amount !== undefined ? Number(d.paid_amount) : Number(d.price) || 0),
    0
  );

  const dueDeliveries = activeDeliveries.filter(
    (d) => d.payment_status === 'مستحق' || d.payment_method === 'آجل' || Number(d.remaining_amount) > 0
  );
  const dueAmount = dueDeliveries.reduce(
    (sum, d) => sum + (d.remaining_amount !== undefined ? Number(d.remaining_amount) : Number(d.price) || 0),
    0
  );

  const documentTitle =
    customTitle ||
    (reportType === 'due'
      ? 'كشف حساب التوريدات المستحقه'
      : reportType === 'paid'
      ? 'كشف حساب التوريدات المدفوعة'
      : 'كشف حساب جميع التوريدات');

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    let cleanMobile = customer.mobile.replace(/\D/g, '');
    if (cleanMobile.startsWith('05')) {
      cleanMobile = '966' + cleanMobile.slice(1);
    } else if (cleanMobile.startsWith('5')) {
      cleanMobile = '966' + cleanMobile;
    }

    let text = '';
    if (reportType === 'due') {
      text = `*${documentTitle}*
👤 العميل: ${customer.customer_name}
📍 الموقع: ${customer.location}
📅 الفترة: من ${startDate || 'البداية'} إلى ${endDate || 'اليوم'}
━━━━━━━━━━━━━━━━━━━━
⏳ عدد التوريدات المستحقة: ${totalRuns} توريد
💰 إجمالي المبلغ المستحق المطلوب سداده: ${dueAmount || totalAmount} ريال
━━━━━━━━━━━━━━━━━━━━
نبع لتوريد المياه
شكراً لتعاملكم معنا`;
    } else if (reportType === 'paid') {
      text = `*${documentTitle}*
👤 العميل: ${customer.customer_name}
📍 الموقع: ${customer.location}
📅 الفترة: من ${startDate || 'البداية'} إلى ${endDate || 'اليوم'}
━━━━━━━━━━━━━━━━━━━━
✅ عدد التوريدات المسددة: ${totalRuns} توريد
💰 إجمالي المبلغ المدفوع: ${paidAmount || totalAmount} ريال
━━━━━━━━━━━━━━━━━━━━
نبع لتوريد المياه - شكراً لتعاملكم معنا`;
    } else {
      text = `*${documentTitle}*
👤 العميل: ${customer.customer_name}
📍 الموقع: ${customer.location}
📅 الفترة: من ${startDate || 'البداية'} إلى ${endDate || 'اليوم'}
━━━━━━━━━━━━━━━━━━━━
🚚 إجمالي التوريدات: ${totalRuns} توريد
💰 إجمالي المبلغ: ${totalAmount} ريال
✅ المسدد: ${paidAmount} ريال
⏳ المستحق المتبقي: ${dueAmount} ريال
━━━━━━━━━━━━━━━━━━━━
نبع لتوريد المياه`;
    }

    const url = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Deliveries pagination: 10 items per page for clean A4 fit without vertical overflow
  const ITEMS_PER_PAGE = 10;
  const pagesCount = Math.max(1, Math.ceil(activeDeliveries.length / ITEMS_PER_PAGE));
  const pages: Delivery[][] = [];
  for (let i = 0; i < pagesCount; i++) {
    pages.push(activeDeliveries.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE));
  }

  return (
    <A4DocumentPreviewModal
      title={documentTitle}
      pagesCount={pagesCount}
      onClose={onClose}
      onConfirmPrint={handlePrint}
      onShareWhatsApp={handleShareWhatsApp}
      shareWhatsAppLabel="واتساب"
    >
      {/* Optional Mode Switcher for Statement 1 (كشف حساب جميع التوريدات) */}
      {reportType === 'all' && (
        <div className="w-full max-w-[210mm] mx-auto mb-2 flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 print:hidden px-1 sm:px-2 text-xs text-slate-300">
          <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 border border-slate-700 p-0.5 sm:p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setGroupMode('unified')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-bold transition cursor-pointer ${
                groupMode === 'unified'
                  ? 'bg-[#0284c7] text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>جدول موحد</span>
            </button>
            <button
              type="button"
              onClick={() => setGroupMode('grouped')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-bold transition cursor-pointer ${
                groupMode === 'grouped'
                  ? 'bg-[#0284c7] text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>جداول مقسمة</span>
            </button>
          </div>
          <span className="text-[9.5px] sm:text-[10px] text-slate-400">
            مطابق للنماذج الرسمية المعتمدة
          </span>
        </div>
      )}

      {/* Pages Container */}
      <div ref={printRef} className="space-y-6 w-full flex flex-col items-center">
        {pages.map((pageDeliveries, pageIdx) => (
          <StatementDocumentSheet
            key={pageIdx}
            customer={customer}
            deliveries={pageDeliveries}
            reportType={reportType}
            customTitle={documentTitle}
            startDate={startDate}
            endDate={endDate}
            pageNumber={pageIdx + 1}
            totalPages={pagesCount}
            groupMode={groupMode}
          />
        ))}
      </div>
    </A4DocumentPreviewModal>
  );
};

export default PDFStatementViewerModal;

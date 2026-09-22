import React, { useState } from 'react';
import {
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Share2,
  FileText,
  CheckCircle2,
  ImageDown,
  Loader2,
  Download,
  Eye,
  Check,
} from 'lucide-react';
import {
  captureSheetToImage,
  downloadDataUrl,
  sanitizeFileName,
  ExportedPageImage,
} from '../../utils/documentImageExport';

export interface A4DocumentPreviewModalProps {
  title: string;
  subtitle?: string;
  badge?: string;
  pagesCount?: number;
  onClose: () => void;
  onConfirmPrint?: () => void;
  onShareWhatsApp?: () => void;
  shareWhatsAppLabel?: string;
  children: React.ReactNode;
}

export const A4DocumentPreviewModal: React.FC<A4DocumentPreviewModalProps> = ({
  title,
  subtitle,
  badge = 'ورقة A4 عمودية (210×297 مم)',
  pagesCount = 1,
  onClose,
  onConfirmPrint,
  onShareWhatsApp,
  shareWhatsAppLabel = 'مشاركة واتساب',
  children,
}) => {
  // Zoom state: 1.0 = 100%
  const [zoom, setZoom] = useState<number>(1.0);

  // Saving images state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savingProgress, setSavingProgress] = useState<{ current: number; total: number } | null>(null);
  const [savedImagesModal, setSavedImagesModal] = useState<ExportedPageImage[] | null>(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<ExportedPageImage | null>(null);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(1.75, Number((prev + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.65, Number((prev - 0.15).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoom(1.0);
  };

  const handlePrint = () => {
    if (onConfirmPrint) {
      onConfirmPrint();
    } else {
      window.print();
    }
  };

  /**
   * Universal "حفظ الصورة" Handler
   * Automatically detects and converts all pages of any report or statement into high-definition PNG images.
   * Fully compatible with mobile (iOS Safari Photos / Web Share) and desktop downloads.
   */
  const handleSaveImages = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSavingProgress(null);

    try {
      const container = document.getElementById('a4-document-sheets-wrapper');
      if (!container) {
        throw new Error('تعذر العثور على محتوى التقرير للتحويل');
      }

      // Temporarily reset zoom to 1.0 to prevent scale distortions in exported canvas
      const previousZoom = zoom;
      if (previousZoom !== 1.0) {
        setZoom(1.0);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Query all page sheets inside the container
      let sheets = Array.from(
        container.querySelectorAll<HTMLElement>(
          '[data-a4-sheet="true"], .statement-document-sheet, .a4-document-sheet'
        )
      );

      // Fallback: If no dedicated class, select child divs excluding control/preview bars
      if (sheets.length === 0) {
        const directChildren = Array.from(container.children) as HTMLElement[];
        sheets = directChildren.filter(
          (child) =>
            !child.classList.contains('print:hidden') &&
            child.id !== 'a4-preview-actions-bar' &&
            !child.classList.contains('no-export')
        );
      }

      // If still empty, fall back to the container itself
      if (sheets.length === 0) {
        sheets = [container];
      }

      const totalSheets = sheets.length;
      const baseName = sanitizeFileName(title || 'كشف_حساب');
      const results: ExportedPageImage[] = [];

      // Sequentially capture each page sheet to ensure exact order and no memory spike
      for (let i = 0; i < totalSheets; i++) {
        const pageNum = i + 1;
        setSavingProgress({ current: pageNum, total: totalSheets });

        const fileName =
          totalSheets > 1
            ? `${baseName}_صفحة_${pageNum}.png`
            : `${baseName}.png`;

        const captured = await captureSheetToImage(sheets[i], fileName, pageNum);
        results.push(captured);
      }

      // Restore zoom to what the user had
      if (previousZoom !== 1.0) {
        setZoom(previousZoom);
      }

      // Trigger Web Share API if supported with files (Native iOS Safari "Save Image" to Photos)
      let sharedViaNative = false;
      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        typeof navigator.share === 'function'
      ) {
        try {
          const filesToShare = results.map(
            (img) => new File([img.blob], img.fileName, { type: 'image/png' })
          );

          if (navigator.canShare({ files: filesToShare })) {
            await navigator.share({
              files: filesToShare,
              title: title || 'كشف حساب',
              text: `${title || 'كشف حساب'} (${results.length} صفحة)`,
            });
            sharedViaNative = true;
          }
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
            sharedViaNative = true; // User intentionally closed or completed the iOS share sheet
          }
        }
      }

      // If not completed via native share (e.g. desktop browsers, Android, or unsupported), download directly
      if (!sharedViaNative) {
        for (let i = 0; i < results.length; i++) {
          downloadDataUrl(results[i].dataUrl, results[i].fileName);
          if (results.length > 1) {
            await new Promise((r) => setTimeout(r, 220));
          }
        }
      }

      // Display the results modal so user can view the generated images, re-download, or long-press on iOS
      setSavedImagesModal(results);
    } catch (err) {
      console.error('Failed to export document to images:', err);
    } finally {
      setIsSaving(false);
      setSavingProgress(null);
    }
  };

  return (
    <div
      id="a4-document-preview-overlay"
      className="fixed inset-0 h-[100dvh] z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col overflow-hidden select-none print:p-0 print:bg-white print:fixed print:inset-0 print:overflow-visible"
    >
      {/* ========================================================
          TOP CONTROL BAR (Hidden in Print)
          ======================================================== */}
      <header className="bg-[#03457a] text-white px-2.5 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between shrink-0 shadow-md print:hidden border-b border-sky-900/50">
        {/* Left / Right (RTL): Title */}
        <div className="flex items-center gap-2 min-w-0 flex-1 ml-2">
          <h1 className="font-extrabold text-xs sm:text-sm font-['Tajawal',sans-serif] truncate">
            {title}
          </h1>
        </div>

        {/* Center & Actions: Zoom Controls + Save Image + WhatsApp + Close */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Zoom Control Group */}
          <div className="flex items-center bg-white/15 border border-white/20 rounded-lg p-0.5 text-white">
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-5 h-5 sm:w-7 sm:h-7 rounded flex items-center justify-center hover:bg-white/20 active:scale-95 transition cursor-pointer"
              title="تصغير المعاينة"
              aria-label="تصغير المعاينة"
            >
              <ZoomOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleResetZoom}
              className="px-1 sm:px-2 h-5 sm:h-7 text-[9.5px] sm:text-[11px] font-mono font-bold hover:bg-white/20 rounded transition flex items-center gap-0.5 sm:gap-1 cursor-pointer"
              title="إعادة تعيين إلى 100%"
            >
              <span>{Math.round(zoom * 100)}%</span>
              {zoom !== 1.0 && <RotateCcw className="w-2.5 h-2.5 text-sky-200" />}
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              className="w-5 h-5 sm:w-7 sm:h-7 rounded flex items-center justify-center hover:bg-white/20 active:scale-95 transition cursor-pointer"
              title="تكبير المعاينة"
              aria-label="تكبير المعاينة"
            >
              <ZoomIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          {/* Quick Top Save Image Button */}
          <button
            type="button"
            onClick={handleSaveImages}
            disabled={isSaving}
            className="h-6 sm:h-8 flex items-center gap-1 px-2 sm:px-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-[10px] sm:text-[10.5px] font-bold transition cursor-pointer shadow-xs disabled:opacity-60 whitespace-nowrap"
            title="حفظ الكشف كصورة في الجوال"
          >
            {isSaving ? (
              <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
            ) : (
              <ImageDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            )}
            <span>
              {isSaving && savingProgress
                ? `جاري الحفظ (${savingProgress.current}/${savingProgress.total})`
                : 'حفظ الصورة'}
            </span>
          </button>

          {/* Optional Share WhatsApp Button */}
          {onShareWhatsApp && (
            <button
              type="button"
              onClick={onShareWhatsApp}
              className="h-6 sm:h-8 flex items-center gap-1 px-2 sm:px-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[10px] sm:text-[10.5px] font-bold transition cursor-pointer shadow-2xs"
              title={shareWhatsAppLabel}
            >
              <Share2 className="w-3 h-3" />
              <span className="hidden md:inline">{shareWhatsAppLabel}</span>
            </button>
          )}

          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            title="إغلاق المعاينة"
            aria-label="إغلاق المعاينة"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================
          DOCUMENT WORKBENCH / VIEWER CANVAS
          ======================================================== */}
      <main
        id="a4-document-viewport"
        className="flex-1 overflow-x-hidden overflow-y-auto bg-[#182234] p-1.5 sm:p-6 md:p-8 flex flex-col items-center print:bg-white print:p-0 print:overflow-visible text-right w-full"
      >
        {/* Scaled Sheets Wrapper */}
        <div
          id="a4-document-sheets-wrapper"
          className="w-full max-w-[210mm] transition-transform duration-150 ease-out origin-top flex flex-col items-center space-y-4 sm:space-y-6 md:space-y-8 print:transform-none print:w-full print:space-y-0"
          style={{
            transform: zoom !== 1.0 ? `scale(${zoom})` : undefined,
            marginBottom: zoom > 1.0 ? `${(zoom - 1) * 350}px` : undefined,
          }}
        >
          {children}

          {/* ========================================================
              BOTTOM CONFIRMATION ACTION BAR: «تأكيد الطباعة» + «حفظ الصورة»
              Appears directly underneath the last A4 sheet
              ======================================================== */}
          <div
            id="a4-preview-actions-bar"
            className="w-full bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-slate-300 p-3 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3.5 print:hidden select-none"
          >
            <div className="text-right w-full sm:w-auto">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs sm:text-sm font-black text-slate-900 font-['Tajawal',sans-serif]">
                  تمت معاينة المستند بنجاح ({pagesCount} {pagesCount > 1 ? 'صفحات A4' : 'صفحة A4'})
                </span>
              </div>
              <p className="text-[9.5px] sm:text-[10.5px] text-slate-500 mt-0.5">
                اضغط على «تأكيد الطباعة» لفتح خيارات الطابعة أو الحفظ كـ PDF، أو «حفظ الصورة» لحفظ الصفحات كصور.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-3 sm:px-4 h-8 sm:h-10 rounded-lg sm:rounded-xl border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] sm:text-xs font-bold transition cursor-pointer"
              >
                إغلاق المعاينة
              </button>

              {/* زر حفظ الصورة الجديد */}
              <button
                type="button"
                id="btn-save-image"
                onClick={handleSaveImages}
                disabled={isSaving}
                className="flex-1 sm:flex-none px-3 sm:px-4 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-[11px] sm:text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                title="حفظ التقرير كصورة عالية الدقة"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                    <span>
                      {savingProgress
                        ? `جاري الحفظ (${savingProgress.current}/${savingProgress.total})`
                        : 'جاري الحفظ...'}
                    </span>
                  </>
                ) : (
                  <>
                    <ImageDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>حفظ الصورة</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="btn-confirm-print"
                onClick={handlePrint}
                className="flex-1 sm:flex-none px-4 sm:px-6 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#03457a] via-[#023561] to-[#012544] hover:brightness-110 text-white text-[11px] sm:text-sm font-black shadow-md hover:shadow-lg active:scale-98 transition flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>تأكيد الطباعة</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================
          SAVED IMAGES SUCCESS MODAL / VIEWER
          Displays all exported page images with instant download/share
          ======================================================== */}
      {savedImagesModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-emerald-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black font-['Tajawal',sans-serif]">
                    تم إنشاء {savedImagesModal.length > 1 ? `${savedImagesModal.length} صور للكشف بنجاح` : 'صورة الكشف بنجاح'}
                  </h3>
                  <p className="text-[10px] text-emerald-100 font-medium">
                    بدقة عالية ومطابقة للمستند الأصلي
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSavedImagesModal(null)}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content: Pages Thumbnails & Actions */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1 text-right">
              {/* iOS / Mobile Tip */}
              <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-[10px] sm:text-[11px] text-sky-900 leading-relaxed">
                💡 <span className="font-bold">لمستخدمي الآيفون والجوال:</span> تم بدء حفظ الصور، ويمكنك أيضاً الضغط مطولاً على أي صورة بالأسفل واختيار <span className="font-bold">«حفظ في الصور»</span> لحفظها فوراً في ألبوم الصور.
              </div>

              {/* Grid of Pages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedImagesModal.map((pageImg) => (
                  <div
                    key={pageImg.pageNumber}
                    className="border border-slate-200 rounded-xl p-2 bg-slate-50/80 flex flex-col justify-between space-y-2 hover:border-emerald-300 transition"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 px-1">
                      <span>صفحة {pageImg.pageNumber} من {savedImagesModal.length}</span>
                      <span className="text-[9px] text-emerald-700 font-mono">PNG عالية الدقة</span>
                    </div>

                    {/* Image Preview Thumbnail */}
                    <div
                      onClick={() => setSelectedPreviewImage(pageImg)}
                      className="relative rounded-lg overflow-hidden border border-slate-300 bg-white cursor-pointer group shadow-2xs aspect-[210/297] flex items-center justify-center"
                    >
                      <img
                        src={pageImg.dataUrl}
                        alt={`صفحة ${pageImg.pageNumber}`}
                        className="w-full h-full object-contain pointer-events-auto"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <Eye className="w-4 h-4" />
                        <span>عرض وتكبير</span>
                      </div>
                    </div>

                    {/* Download single button */}
                    <button
                      type="button"
                      onClick={() => downloadDataUrl(pageImg.dataUrl, pageImg.fileName)}
                      className="w-full py-1.5 bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-400 text-slate-800 hover:text-emerald-800 text-[10.5px] font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تنزيل الصفحة {pageImg.pageNumber}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSavedImagesModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                إغلاق
              </button>

              <button
                type="button"
                onClick={() => {
                  savedImagesModal.forEach((img, idx) => {
                    setTimeout(() => downloadDataUrl(img.dataUrl, img.fileName), idx * 250);
                  });
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل جميع الصور ({savedImagesModal.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Single Image Zoom Viewer */}
      {selectedPreviewImage && (
        <div
          onClick={() => setSelectedPreviewImage(null)}
          className="fixed inset-0 z-70 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full max-h-[95vh] flex flex-col items-center bg-transparent"
          >
            <button
              type="button"
              onClick={() => setSelectedPreviewImage(null)}
              className="absolute -top-10 left-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={selectedPreviewImage.dataUrl}
              alt="صورة الكشف المعاينة"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/20 bg-white"
            />

            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadDataUrl(selectedPreviewImage.dataUrl, selectedPreviewImage.fileName)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>حفظ هذه الصورة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default A4DocumentPreviewModal;

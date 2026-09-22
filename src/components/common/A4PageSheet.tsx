import React from 'react';

interface A4PageSheetProps {
  pageNumber?: number;
  totalPages?: number;
  sheetLabel?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * A4PageSheet
 * Renders an exact physical A4 portrait sheet (210mm x 297mm ratio 1:√2).
 * On mobile, it scales to fit the viewport width cleanly while maintaining high DPI and ratio.
 * In print, it maps to a standard unstyled physical A4 printed page with page breaks.
 */
export const A4PageSheet: React.FC<A4PageSheetProps> = ({
  pageNumber,
  totalPages,
  sheetLabel,
  children,
  className = '',
  id,
}) => {
  return (
    <div className="relative mx-auto w-full flex flex-col items-center print:m-0 print:p-0 print:w-full">
      {/* Visual Page Info Indicator in Preview Mode */}
      {(pageNumber !== undefined || sheetLabel) && (
        <div className="w-full max-w-[210mm] flex items-center justify-between px-2 mb-1.5 text-[10px] text-slate-400 font-medium print:hidden select-none">
          <div>
            {sheetLabel && (
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-sky-500/80"></span>
                <span className="font-['Tajawal',sans-serif]">{sheetLabel}</span>
              </div>
            )}
          </div>
          {pageNumber !== undefined && totalPages !== undefined && (
            <span className="font-mono bg-slate-700/80 text-slate-200 px-2 py-0.5 rounded-md text-[9.5px]">
              صفحة {pageNumber} من {totalPages}
            </span>
          )}
        </div>
      )}

      {/* The Physical A4 Paper Sheet */}
      <div
        id={id}
        data-a4-sheet="true"
        className={`a4-document-sheet w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 
          shadow-[0_12px_40px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.12)] 
          border border-slate-300/80 rounded-sm sm:rounded-md
          p-4 sm:p-8 md:p-10
          flex flex-col justify-between
          transition-all duration-150 ease-out
          print:min-h-0 print:max-w-none print:w-full print:p-8 print:shadow-none print:border-none print:rounded-none print:break-after-page
          ${className}`}
        style={{
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default A4PageSheet;

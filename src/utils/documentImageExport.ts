import { toPng } from 'html-to-image';
import { EMBEDDED_ARABIC_FONTS_CSS } from './arabicFontsEmbed';

export interface ExportedPageImage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
  fileName: string;
}

/**
 * Clean filename utility
 */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[/\\?%*:|"<>#]/g, '-')
    .replace(/\s+/g, '_')
    .trim() || 'document';
}

/**
 * Helper to download an image file in browser
 */
export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Convert dataURL to Blob directly without second render pass
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  try {
    const parts = dataUrl.split(';base64,');
    const contentType = parts[0].split(':')[1] || 'image/png';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  } catch {
    return new Blob([], { type: 'image/png' });
  }
}

/**
 * Capture an individual visible document sheet element to a high-resolution PNG screenshot
 * Exactly matching the visual preview on screen (WYSIWYG)
 */
export async function captureSheetToImage(
  sheetElement: HTMLElement,
  fileName: string,
  pageNumber: number
): Promise<ExportedPageImage> {
  // Ensure fonts are completely loaded in the browser before capturing
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font readiness errors
    }
  }

  // Ensure any images/logos inside the sheet are completely loaded
  const imgElements = Array.from(sheetElement.querySelectorAll('img'));
  if (imgElements.length > 0) {
    await Promise.all(
      imgElements.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(true);
        });
      })
    );
  }

  // Brief settling delay to ensure full DOM layout paint and subpixel stabilization
  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 80)));

  // Target high DPI rendering (2.5x gives ~2000px ultra-crisp resolution for A4 without memory overflow)
  const pixelRatio = 2.5;
  const elementWidth = sheetElement.offsetWidth || sheetElement.clientWidth || 794;
  const elementHeight = sheetElement.offsetHeight || sheetElement.clientHeight || 1123;

  const options = {
    quality: 1.0,
    pixelRatio,
    width: elementWidth,
    height: elementHeight,
    canvasWidth: Math.round(elementWidth * pixelRatio),
    canvasHeight: Math.round(elementHeight * pixelRatio),
    backgroundColor: '#ffffff',
    cacheBust: true,
    fontEmbedCSS: EMBEDDED_ARABIC_FONTS_CSS, // Standalone base64 fonts for Cairo & Tajawal
    style: {
      boxShadow: 'none', // Strip outer fuzzy box-shadow to guarantee clean, unclipped edges
      transform: 'none',
      margin: '0',
    },
    filter: (node: Node) => {
      if (node instanceof HTMLElement) {
        // Only exclude elements explicitly flagged to avoid in exports
        if (
          node.classList.contains('no-export') ||
          node.getAttribute('data-export-ignore') === 'true'
        ) {
          return false;
        }
      }
      return true;
    },
  };

  // Convert to high-resolution PNG data URL
  const dataUrl = await toPng(sheetElement, options);

  // Generate Blob directly from the high-res data URL for instant sharing & downloading
  const blob = dataUrlToBlob(dataUrl);

  return {
    pageNumber,
    dataUrl,
    blob,
    fileName,
  };
}

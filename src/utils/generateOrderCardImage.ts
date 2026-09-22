/**
 * Utility to generate a high-resolution, professional PNG order card for Nabaa Water Supply.
 * Used for Web Share API (WhatsApp image sharing) and fallback downloads.
 */

export interface OrderCardData {
  orderId: string;
  orderDateTime: string;
  customerName: string;
  mobile: string;
  supplyType: string;
  tankCapacity: string;
  location: string;
  googleMapsUrl?: string;
}

export interface GeneratedOrderCard {
  dataUrl: string;
  blob: Blob;
  file: File;
  orderId: string;
}

// Helper to safely load the Nabaa logo image with timeout
function loadLogoImage(): Promise<HTMLImageElement | null> {
  // Logo disabled per user instructions
  return Promise.resolve(null);
}

export async function generateOrderCardImage(
  data: OrderCardData
): Promise<GeneratedOrderCard> {
  // Wait for fonts to be ready if possible
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Font readiness error is non-blocking
    }
  }

  // High-resolution canvas dimensions
  const width = 800;
  const height = 1140;

  const displayLocation = (data.location || '')
    .trim()
    .replace(/\s*\(موقعي الفعلي\)\s*/g, '')
    .trim();

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // 1. Background: Deep Royal Navy Gradient with subtle water glow
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#021832');
  bgGrad.addColorStop(0.3, '#042c54');
  bgGrad.addColorStop(0.7, '#032345');
  bgGrad.addColorStop(1, '#011022');

  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Decorative subtle water waves / glow in background
  ctx.save();
  ctx.fillStyle = 'rgba(56, 189, 248, 0.04)';
  ctx.beginPath();
  ctx.arc(width + 80, -40, 360, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(14, 165, 233, 0.05)';
  ctx.beginPath();
  ctx.arc(-80, height * 0.45, 300, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(56, 189, 248, 0.035)';
  ctx.beginPath();
  ctx.arc(width * 0.8, height + 60, 340, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Outer & Inner Frame Borders
  ctx.save();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 16, 16, width - 32, height - 32, 28);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, 24, 24, width - 48, height - 48, 22);
  ctx.stroke();
  ctx.restore();

  // Set RTL Arabic defaults
  ctx.direction = 'rtl';

  // 3. Header Section (Title & Brand)
  const headerY = 36;
  const headerHeight = 175;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.055)';
  drawRoundedRect(ctx, 36, headerY, width - 72, headerHeight, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Draw Logo or Vector Emblem
  const logo = await loadLogoImage();
  const logoSize = 68;
  const logoX = width - 48 - logoSize;
  const logoY = headerY + 22;

  ctx.save();
  if (logo) {
    // Rounded image container
    drawRoundedRect(ctx, logoX, logoY, logoSize, logoSize, 14);
    ctx.clip();
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, logoX, logoY, logoSize, logoSize, 14);
    ctx.stroke();
    ctx.restore();
  } else {
    // Vector Droplet Emblem
    ctx.fillStyle = 'rgba(14, 165, 233, 0.2)';
    drawRoundedRect(ctx, logoX, logoY, logoSize, logoSize, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = 'bold 28px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('نبع', logoX + logoSize / 2, logoY + logoSize / 2);
    ctx.restore();
  }

  // Header Title & Text
  const titleX = width - 48 - logoSize - 16;
  ctx.save();
  // Small top badge
  ctx.fillStyle = 'rgba(14, 165, 233, 0.25)';
  drawRoundedRect(ctx, titleX - 160, headerY + 18, 160, 24, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = 'bold 11px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('بطاقة طلب توريد معتمدة', titleX - 80, headerY + 30);

  // Main Title: طلب توريد مياه جديد – نبع (NABAA)
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 24px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('طلب توريد مياه جديد – نبع (NABAA)', titleX, headerY + 68);

  // Subtitle
  ctx.font = '13.5px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('توريد وتوزيع مياه التحلية والآبار الفورية بأعلى معايير الجودة والسرعة', titleX, headerY + 102);

  // Slogan Pill
  ctx.font = 'bold 11.5px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('✓ التوصيل الفوري المباشر • صهاريج مجهزة ومطابقة للاشتراطات', titleX, headerY + 132);
  ctx.restore();

  // 4. Order ID & Date / Time Row
  const metaY = 226;
  const halfMetaWidth = (width - 72 - 14) / 2;

  // Right pill: رقم الطلب
  ctx.save();
  ctx.fillStyle = 'rgba(4, 46, 88, 0.85)';
  drawRoundedRect(ctx, 36 + halfMetaWidth + 14, metaY, halfMetaWidth, 46, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 12.5px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('رقم الطلب:', 36 + halfMetaWidth + 14 + halfMetaWidth - 14, metaY + 23);

  ctx.font = 'bold 16px "Segoe UI", Tahoma, Arial, monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(data.orderId, 36 + halfMetaWidth + 14 + halfMetaWidth - 95, metaY + 23);
  ctx.restore();

  // Left pill: تاريخ ووقت الطلب
  ctx.save();
  ctx.fillStyle = 'rgba(4, 46, 88, 0.85)';
  drawRoundedRect(ctx, 36, metaY, halfMetaWidth, 46, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 12px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('تاريخ الطلب:', 36 + halfMetaWidth - 14, metaY + 23);

  ctx.font = 'bold 13px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(data.orderDateTime, 36 + halfMetaWidth - 95, metaY + 23);
  ctx.restore();

  // 5. Customer & Order Details Cards
  let currentY = 286;

  // Row 1: اسم العميل
  drawDetailRow(ctx, {
    x: 36,
    y: currentY,
    width: width - 72,
    height: 76,
    label: 'اسم العميل',
    value: data.customerName,
    highlight: true,
    tag: 'العميل',
  });
  currentY += 90;

  // Row 2: رقم الجوال
  drawDetailRow(ctx, {
    x: 36,
    y: currentY,
    width: width - 72,
    height: 76,
    label: 'رقم الجوال',
    value: data.mobile,
    valueColor: '#38bdf8',
    isMono: true,
    tag: 'الاتصال',
  });
  currentY += 90;

  // Row 3: نوع التوريد + سعة الصهريج (Two columns)
  const colWidth = (width - 72 - 14) / 2;

  // نوع التوريد (Right)
  drawDetailRow(ctx, {
    x: 36 + colWidth + 14,
    y: currentY,
    width: colWidth,
    height: 86,
    label: 'نوع التوريد',
    value: data.supplyType,
    tag: 'المياه',
  });

  // سعة الصهريج (Left)
  drawDetailRow(ctx, {
    x: 36,
    y: currentY,
    width: colWidth,
    height: 86,
    label: 'سعة الصهريج',
    value: data.tankCapacity,
    tag: 'الحمولة',
    valueColor: '#7dd3fc',
  });
  currentY += 100;

  // Row 4: الموقع (Supports wrapping)
  drawDetailRow(ctx, {
    x: 36,
    y: currentY,
    width: width - 72,
    height: 94,
    label: 'الموقع',
    value: displayLocation,
    tag: 'التوصيل',
    multiline: true,
  });
  currentY += 108;

  // Row 5: رابط موقع Google Maps
  const hasMaps = Boolean(data.googleMapsUrl);
  ctx.save();
  ctx.fillStyle = hasMaps ? 'rgba(6, 78, 59, 0.4)' : 'rgba(255, 255, 255, 0.05)';
  drawRoundedRect(ctx, 36, currentY, width - 72, 98, 16);
  ctx.fill();
  ctx.strokeStyle = hasMaps ? 'rgba(52, 211, 153, 0.5)' : 'rgba(56, 189, 248, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Label & Badge Row
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 12.5px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = hasMaps ? '#6ee7b7' : '#94a3b8';
  ctx.fillText('رابط موقع Google Maps:', width - 56, currentY + 14);

  // Status Badge
  ctx.textAlign = 'left';
  ctx.font = 'bold 11.5px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = hasMaps ? '#34d399' : '#94a3b8';
  ctx.fillText(hasMaps ? '✓ إحداثيات الخريطة مثبتة بدقة' : 'موقع نصي محدد', 56, currentY + 14);

  // URL text or truncated link
  ctx.textAlign = 'right';
  ctx.font = '12px "Segoe UI", Tahoma, Arial, monospace';
  ctx.fillStyle = '#ffffff';
  const displayUrl =
    data.googleMapsUrl ||
    'https://maps.google.com/?q=' + encodeURIComponent(data.location);
  const truncatedUrl =
    displayUrl.length > 70 ? displayUrl.substring(0, 67) + '...' : displayUrl;
  ctx.fillText(truncatedUrl, width - 56, currentY + 44);

  // Note for Driver
  ctx.font = '11.5px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = hasMaps ? '#a7f3d0' : '#cbd5e1';
  ctx.fillText('مخصص للتوجيه السريع لسائق الصهريج إلى خزان العميل مباشرة', width - 56, currentY + 68);
  ctx.restore();

  // 6. Professional Footer Section
  const footerY = height - 130;

  ctx.save();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(36, footerY);
  ctx.lineTo(width - 36, footerY);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = 'bold 16px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('شركة نبع لتوريد وتوزيع المياه | NABAA Water Supply', width / 2, footerY + 34);

  ctx.font = 'bold 13.5px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('هاتف وخدمة العملاء: 0567071399', width / 2, footerY + 60);

  ctx.font = '11.5px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('طلب مؤكد ومسجل إلكترونياً – صهاريج مجهزة ومطابقة للاشتراطات الصحية', width / 2, footerY + 84);
  ctx.restore();

  // Convert canvas to Blob & File
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }
        const dataUrl = canvas.toDataURL('image/png', 0.95);
        const file = new File([blob], `طلب-توريد-نبع-${data.orderId}.png`, {
          type: 'image/png',
          lastModified: Date.now(),
        });

        resolve({
          dataUrl,
          blob,
          file,
          orderId: data.orderId,
        });
      },
      'image/png',
      0.95
    );
  });
}

function drawDetailRow(
  ctx: CanvasRenderingContext2D,
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    value: string;
    tag?: string;
    valueColor?: string;
    highlight?: boolean;
    isMono?: boolean;
    multiline?: boolean;
  }
) {
  const {
    x,
    y,
    width,
    height,
    label,
    value,
    tag,
    valueColor = '#ffffff',
    highlight = false,
    isMono = false,
    multiline = false,
  } = options;

  ctx.save();
  // Card background
  ctx.fillStyle = highlight
    ? 'rgba(14, 165, 233, 0.12)'
    : 'rgba(255, 255, 255, 0.055)';
  drawRoundedRect(ctx, x, y, width, height, 14);
  ctx.fill();

  // Border
  ctx.strokeStyle = highlight
    ? 'rgba(56, 189, 248, 0.45)'
    : 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Tag pill if available
  if (tag) {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    drawRoundedRect(ctx, x + 14, y + 10, 52, 22, 6);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 10.5px "Segoe UI", Tahoma, Arial, sans-serif';
    ctx.fillStyle = '#7dd3fc';
    ctx.fillText(tag, x + 40, y + 21);
  }

  // Label text
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 12.5px "Segoe UI", Tahoma, Arial, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(label, x + width - 16, y + 12);

  // Value text
  ctx.textAlign = 'right';
  const fontSize = height > 80 ? (isMono ? '17px' : '18px') : (isMono ? '18px' : '19px');
  ctx.font = `bold ${fontSize} ${
    isMono ? 'monospace, "Segoe UI"' : '"Segoe UI", Tahoma, Arial, sans-serif'
  }`;
  ctx.fillStyle = valueColor;

  const maxWidth = width - (tag ? 84 : 40);

  if (!multiline) {
    ctx.textBaseline = 'bottom';
    let displayValue = value;
    if (ctx.measureText(displayValue).width > maxWidth) {
      while (
        displayValue.length > 0 &&
        ctx.measureText(displayValue + '...').width > maxWidth
      ) {
        displayValue = displayValue.slice(0, -1);
      }
      displayValue += '...';
    }
    ctx.fillText(displayValue, x + width - 16, y + height - 12);
  } else {
    // Multi-line rendering for location
    ctx.textBaseline = 'top';
    const words = value.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    if (lines.length <= 1) {
      ctx.fillText(lines[0] || value, x + width - 16, y + 42);
    } else {
      ctx.font = 'bold 15px "Segoe UI", Tahoma, Arial, sans-serif';
      ctx.fillText(lines[0], x + width - 16, y + 38);
      const secondLine = lines.slice(1).join(' ');
      let finalSecondLine = secondLine;
      if (ctx.measureText(finalSecondLine).width > maxWidth) {
        while (finalSecondLine.length > 0 && ctx.measureText(finalSecondLine + '...').width > maxWidth) {
          finalSecondLine = finalSecondLine.slice(0, -1);
        }
        finalSecondLine += '...';
      }
      ctx.fillText(finalSecondLine, x + width - 16, y + 62);
    }
  }

  ctx.restore();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

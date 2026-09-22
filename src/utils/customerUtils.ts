import { Customer, Delivery } from '../types';

/**
 * دالة توليد رقم معرف فريد للعميل يبدأ بـ NB-
 * مثال: NB-1001, NB-1002, NB-1003...
 * تضمن عدم التكرار عبر فحص كافة أرقام العملاء وسجلات التوريد الحالية.
 */
export function generateCustomerIdentifier(
  existingCustomers: Array<{ customer_identifier?: string; id?: string }> = [],
  existingDeliveries: Array<{ customer_identifier?: string }> = []
): string {
  const existingSet = new Set<string>();
  let maxNumber = 1000;

  const recordIdentifier = (rawId?: string) => {
    if (!rawId) return;
    const trimmed = rawId.trim();
    if (!trimmed) return;
    existingSet.add(trimmed.toUpperCase());

    // فحص إذا كان المعرف يبدأ بـ NB- ومتبوعاً بأرقام
    const match = trimmed.match(/^NB-(\d+)$/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  };

  existingCustomers.forEach((c) => recordIdentifier(c.customer_identifier));
  existingDeliveries.forEach((d) => recordIdentifier(d.customer_identifier));

  let candidateNumber = maxNumber + 1;
  let candidate = `NB-${candidateNumber}`;

  // ضمان عدم وجود أي تعارض نهائياً
  while (existingSet.has(candidate.toUpperCase())) {
    candidateNumber++;
    candidate = `NB-${candidateNumber}`;
  }

  return candidate;
}

/**
 * معالجة وتنسيق معرف العميل للتأكد من أنه يبدأ بـ NB-
 */
export function formatCustomerIdentifier(
  input: string,
  existingCustomers: Array<{ customer_identifier?: string }> = []
): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return generateCustomerIdentifier(existingCustomers);
  }

  // إذا كان المستخدم أدخل بالفعل بادئة NB-
  if (/^NB-\d+$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // إذا أدخل المستخدم أرقاماً فقط، نحولها تلقائياً إلى NB-
  if (/^\d+$/.test(trimmed)) {
    return `NB-${trimmed}`;
  }

  // إذا بدأ بـ NB بدون شرطة
  if (/^NB\d+$/i.test(trimmed)) {
    return `NB-${trimmed.slice(2)}`;
  }

  return trimmed;
}

/**
 * ترقية وتوحيد معرفات العملاء الحالية لضمان بدء الجميع بـ NB- فريد
 */
export function normalizeCustomerList(
  customers: Customer[],
  deliveries: Delivery[] = []
): Customer[] {
  const seenIdentifiers = new Set<string>();
  let currentMax = 1000;

  // أولاً: تجميع المعرفات النظامية الموجودة بالفعل والتي تبدأ بـ NB-
  customers.forEach((c) => {
    const raw = (c.customer_identifier || '').trim();
    const match = raw.match(/^NB-(\d+)$/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > currentMax) {
        currentMax = num;
      }
      seenIdentifiers.add(raw.toUpperCase());
    }
  });

  deliveries.forEach((d) => {
    const raw = (d.customer_identifier || '').trim();
    const match = raw.match(/^NB-(\d+)$/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > currentMax) {
        currentMax = num;
      }
      seenIdentifiers.add(raw.toUpperCase());
    }
  });

  // ثانياً: تحديث أي عميل لا يملك معرفاً أو لديه معرف قديم
  return customers.map((c) => {
    const raw = (c.customer_identifier || '').trim();
    if (/^NB-\d+$/i.test(raw)) {
      return c;
    }

    // توليد معرف جديد فريد يبدأ بـ NB-
    currentMax++;
    let newId = `NB-${currentMax}`;
    while (seenIdentifiers.has(newId.toUpperCase())) {
      currentMax++;
      newId = `NB-${currentMax}`;
    }
    seenIdentifiers.add(newId.toUpperCase());

    return {
      ...c,
      customer_identifier: newId,
    };
  });
}

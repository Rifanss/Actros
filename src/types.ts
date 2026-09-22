export type SupplyType = 'تحلية' | 'آبار';
export type TankCapacity = '12 طن' | '18 طن' | '30 طن' | '11 طن';
export type PaymentMethod = 'كاش' | 'آجل';

export interface Customer {
  id: string;
  customer_name: string;
  customer_identifier: string;
  mobile: string;
  location: string;
  agreed_price_18?: number | string;
  agreed_price_30?: number | string;
  assigned_driver?: string;
  default_supply_type?: string;
  default_tank_capacity?: string;
  agreed_supply_price?: number;
  notes?: string;
  created_at: string;
}

export interface Driver {
  id: string;
  driver_name: string;
  username: string;
  mobile: string;
  phone?: string;
  vehicle: string;
  vehicle_id?: string;
  status: 'active' | 'inactive';
  last_active?: string;
}

export type DeliveryOrderStatus = 'جديد' | 'مسند للسائق' | 'في الطريق' | 'تم التوريد' | 'ملغي';

export interface Attachment {
  name: string;
  type: 'image' | 'document';
  url: string; // Base64 or Object URL
  size?: number;
}

export interface Delivery {
  id: string;
  sequence_num: number;
  order_number?: string; // e.g. "NB-1045"
  customer_id: string;
  customer_name: string;
  customer_identifier: string;
  mobile: string;
  location: string;
  google_maps_url?: string;
  supply_type: SupplyType;
  tank_capacity: TankCapacity;
  price: number;
  payment_method: PaymentMethod;
  supply_date: string; // YYYY-MM-DD
  supply_time: string; // HH:MM
  driver_id: string;
  driver_name: string;
  order_status?: DeliveryOrderStatus;
  delivery_proof_image?: string;
  delivery_documented_at?: string;
  delivered_date?: string;
  delivered_time?: string;
  attachment?: Attachment | null;
  payment_status: 'مدفوع' | 'آجل' | 'جزئي' | 'مستحق';
  paid_amount: number;
  remaining_amount: number;
  created_at: string;
  created_by: string;
  notes?: string;
}

export type DeliveryFormData = Omit<
  Delivery,
  'id' | 'sequence_num' | 'payment_status' | 'paid_amount' | 'remaining_amount' | 'created_at' | 'created_by'
>;

export type FilterPeriod = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

export interface FilterState {
  period: FilterPeriod;
  customStartDate?: string;
  customEndDate?: string;
  supplyType: 'all' | SupplyType;
  driverId: 'all' | string;
}

export interface PriceConfig {
  'تحلية_12'?: number;
  'تحلية_18': number;
  'تحلية_30': number;
  'آبار_12'?: number;
  'آبار_18': number;
  'آبار_30': number;
  'تحلية_11'?: number;
  'آبار_11'?: number;
  desalinationCostPerTrip?: number;
}

export type ActiveTab =
  | 'home'
  | 'deliveries'
  | 'customers'
  | 'add'
  | 'operations'
  | 'accounts'
  | 'reports'
  | 'settings'
  | 'customer_record'
  | 'dashboard'
  | 'driver_portal'
  | 'driver_login';

export interface Vehicle {
  id: string;
  name: string;
  plate_number: string;
  assigned_driver_id: string;
  status: 'active' | 'maintenance' | 'inactive';
  tank_capacity: TankCapacity;
  model_year?: string;
  initial_desalination_balance: number;
  current_odometer: number;
  notes?: string;
  created_at: string;
}

export type DesalinationTxType = 'recharge' | 'consumption';

export interface DesalinationBalanceTransaction {
  id: string;
  vehicle_id: string;
  vehicle_name?: string;
  type: DesalinationTxType;
  date: string;
  time?: string;
  amount: number;
  station_name: string;
  payment_method: 'كاش' | 'شبكة' | 'تحويل بنكي' | 'آجل';
  reference_number?: string;
  notes?: string;
  attachment?: Attachment | null;
  related_delivery_id?: string;
  created_at: string;
}

export interface FuelTransaction {
  id: string;
  vehicle_id: string;
  driver_id: string;
  driver_name?: string;
  date: string;
  time: string;
  liters: number;
  price_per_liter: number;
  total_amount: number;
  gas_station: string;
  payment_method: 'كاش' | 'شبكة' | 'بطاقة وقود' | 'آجل';
  odometer_reading: number;
  notes?: string;
  attachment?: Attachment | null;
  created_at: string;
}

export type ExpenseCategory =
  | 'صيانة'
  | 'زيوت'
  | 'إطارات'
  | 'قطع غيار'
  | 'غسيل'
  | 'رسوم'
  | 'مخالفات'
  | 'مصروف سائق'
  | 'أخرى';

export interface VehicleExpense {
  id: string;
  vehicle_id: string;
  driver_id?: string;
  driver_name?: string;
  category: ExpenseCategory;
  date: string;
  time?: string;
  amount: number;
  description: string;
  vendor_name: string;
  payment_method: 'كاش' | 'شبكة' | 'تحويل بنكي' | 'آجل';
  notes?: string;
  attachment?: Attachment | null;
  created_at: string;
}

export interface VehicleFinancialSummary {
  vehicle: Vehicle;
  driver?: Driver;
  totalDeliveriesCount: number;
  totalRevenue: number;
  // Desalination separation
  previousDesalinationBalance: number;
  rechargedDesalinationAmount: number;
  consumedDesalinationAmount: number;
  remainingDesalinationBalance: number;
  // Fuel
  totalFuelCost: number;
  totalFuelLiters: number;
  fuelCount: number;
  lastFuelTime?: string;
  // Other expenses
  totalOtherExpenses: number;
  // Total operating expenses = Desalination Consumption + Fuel + Other Expenses
  totalOperatingExpenses: number;
  // Net vehicle income = Revenue - Operating Expenses
  netVehicleIncome: number;
}

// ==========================================
// Accounts & Invoices Types (الحسابات والفواتير)
// ==========================================

export type InvoiceStatus = 'مسدد' | 'مسدد جزئيًا' | 'مستحق' | 'متأخر';

export interface InvoiceItem {
  id: string;
  delivery_id: string;
  delivery_date: string;
  supply_type: SupplyType;
  tank_capacity: TankCapacity;
  quantity: number; // عدد الردود
  unit_price: number;
  total_amount: number;
}

export interface Invoice {
  id: string;
  invoice_number: string; // e.g. "INV-2026-001"
  customer_id: string;
  customer_name: string;
  customer_identifier: string;
  mobile: string;
  issue_date: string; // YYYY-MM-DD
  due_date: string; // YYYY-MM-DD
  items: InvoiceItem[];
  subtotal: number;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: InvoiceStatus;
  notes?: string;
  created_at: string;
}

export type PaymentMethodType = 'كاش' | 'تحويل' | 'أخرى';

export interface Payment {
  id: string;
  payment_number: string; // e.g. "PAY-2026-001"
  customer_id: string;
  customer_name: string;
  invoice_id?: string;
  invoice_number?: string;
  amount: number;
  payment_method: PaymentMethodType;
  payment_date: string; // YYYY-MM-DD
  reference_number?: string;
  notes?: string;
  receipt_attachment?: Attachment | null;
  created_at: string;
}

export type AccountsPeriodFilter = 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';

export interface AccountsFilterState {
  period: AccountsPeriodFilter;
  customStartDate?: string;
  customEndDate?: string;
}

export interface CustomerAccountSummary {
  customer: Customer;
  deliveriesCount: number;
  totalDeliveriesValue: number;
  totalInvoiced: number;
  totalPaid: number;
  totalDeferred: number;
  remainingAmount: number;
  lastPaymentAmount?: number;
  lastPaymentDate?: string;
  oldestDueDate?: string;
  status: 'مسدد' | 'مستحق' | 'متأخر';
  invoicesCount: number;
  unpaidInvoicesCount: number;
}

export interface AccountStatementMovement {
  id: string;
  date: string;
  type: 'invoice' | 'payment' | 'cash_delivery';
  typeLabel: string;
  referenceNumber: string;
  description: string;
  debit: number; // مدين (قيمة الفاتورة / المستحق)
  credit: number; // دائن (المدفوع)
  balance: number; // الرصيد التراكمي
  dueDate?: string;
  status?: string;
}

// ==========================================
// Customer Online Orders (طلبات التوريد الإلكترونية)
// ==========================================

export type CustomerOrderStatus = 'بانتظار الموافقة' | 'مقبول' | 'ملغي';

export interface CustomerOrder {
  id: string;
  order_number: string;
  customer_name: string;
  mobile: string;
  supply_type: string;
  tank_capacity: string;
  location: string;
  google_maps_url?: string;
  status: CustomerOrderStatus;
  created_at: string;
  created_date: string;
  created_time: string;
  accepted_at?: string;
  cancelled_at?: string;
  notes?: string;
}


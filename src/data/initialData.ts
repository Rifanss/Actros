import {
  Customer,
  Driver,
  Delivery,
  PriceConfig,
  Vehicle,
  DesalinationBalanceTransaction,
  FuelTransaction,
  VehicleExpense,
  Invoice,
  Payment,
} from '../types';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRelativeDateString(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const initialPriceConfig: PriceConfig = {
  'تحلية_12': 200,
  'تحلية_18': 250,
  'تحلية_30': 300,
  'آبار_12': 180,
  'آبار_18': 250,
  'آبار_30': 300,
  'تحلية_11': 200,
  'آبار_11': 180,
};

export const initialDrivers: Driver[] = [
  {
    id: 'drv-3',
    driver_name: 'كريم',
    username: 'كريم',
    mobile: '0563334411',
    phone: '0563334411',
    vehicle: 'وايت سكس تحلية (18 طن) - أ هـ س 7831',
    vehicle_id: 'veh-3',
    status: 'active',
    last_active: '2026-09-17 08:35',
  },
  {
    id: 'drv-1',
    driver_name: 'غلام',
    username: 'غلام',
    mobile: '0561112233',
    phone: '0561112233',
    vehicle: 'تريلا تحلية (30 طن) - ب ص ط 1223',
    vehicle_id: 'veh-1',
    status: 'active',
    last_active: '2026-09-17 08:15',
  },
  {
    id: 'drv-2',
    driver_name: 'أحمد',
    username: 'أحمد',
    mobile: '0562223344',
    phone: '0562223344',
    vehicle: 'وايت سكس تحلية (18 طن) - ب ر أ 8403',
    vehicle_id: 'veh-2',
    status: 'active',
    last_active: '2026-09-17 07:50',
  },
  {
    id: 'drv-4',
    driver_name: 'مختار تريلا',
    username: 'مختار تريلا',
    mobile: '0564445566',
    phone: '0564445566',
    vehicle: 'تريلا آبار (30 طن) - أ ي ق 1385',
    vehicle_id: 'veh-4',
    status: 'active',
    last_active: '2026-09-16 16:45',
  },
  {
    id: 'drv-5',
    driver_name: 'مختار عايدي',
    username: 'مختار عايدي',
    mobile: '0565556677',
    phone: '0565556677',
    vehicle: 'وايت عايدي آبار (12 طن) - أ ح ن 165',
    vehicle_id: 'veh-5',
    status: 'active',
    last_active: '2026-09-16 17:20',
  },
];

export const initialVehicles: Vehicle[] = [
  {
    id: 'veh-1',
    name: 'تريلا تحلية (30 طن)',
    plate_number: 'ب ص ط 1223',
    assigned_driver_id: 'drv-1',
    status: 'active',
    tank_capacity: '30 طن',
    model_year: '2023',
    initial_desalination_balance: 0,
    current_odometer: 0,
    notes: 'تريلا (30 طن) مياة تحلية - السائق: غلام',
    created_at: '2025-01-01',
  },
  {
    id: 'veh-2',
    name: 'وايت سكس تحلية (18 طن) - ب ر أ',
    plate_number: 'ب ر أ 8403',
    assigned_driver_id: 'drv-2',
    status: 'active',
    tank_capacity: '18 طن',
    model_year: '2023',
    initial_desalination_balance: 0,
    current_odometer: 0,
    notes: 'وايت سكس (18 طن) مياة تحلية - السائق: أحمد',
    created_at: '2025-01-01',
  },
  {
    id: 'veh-3',
    name: 'وايت سكس تحلية (18 طن) - أ هـ س',
    plate_number: 'أ هـ س 7831',
    assigned_driver_id: 'drv-3',
    status: 'active',
    tank_capacity: '18 طن',
    model_year: '2023',
    initial_desalination_balance: 0,
    current_odometer: 0,
    notes: 'وايت سكس (18 طن) مياة تحلية - السائق: كريم',
    created_at: '2025-01-01',
  },
  {
    id: 'veh-4',
    name: 'تريلا آبار (30 طن)',
    plate_number: 'أ ي ق 1385',
    assigned_driver_id: 'drv-4',
    status: 'active',
    tank_capacity: '30 طن',
    model_year: '2022',
    initial_desalination_balance: 0,
    current_odometer: 0,
    notes: 'تريلا (30 طن) مياة آبار - السائق: مختار تريلا',
    created_at: '2025-01-01',
  },
  {
    id: 'veh-5',
    name: 'وايت عايدي آبار (12 طن)',
    plate_number: 'أ ح ن 165',
    assigned_driver_id: 'drv-5',
    status: 'active',
    tank_capacity: '12 طن',
    model_year: '2021',
    initial_desalination_balance: 0,
    current_odometer: 0,
    notes: 'وايت عايدي (12 طن) مياة آبار - السائق: مختار عايدي',
    created_at: '2025-01-01',
  },
];

export const initialCustomers: Customer[] = [];

export const DRIVER_PASSWORDS: Record<string, string> = {
  'كريم': '123456',
  'غلام': '123456',
  'أحمد': '123456',
  'مختار تريلا': '123456',
  'مختار عايدي': '123456',
};

export function createInitialDeliveries(): Delivery[] {
  return [];
}

export function createInitialDesalinationTransactions(): DesalinationBalanceTransaction[] {
  return [];
}

export function createInitialFuelTransactions(): FuelTransaction[] {
  return [];
}

export function createInitialVehicleExpenses(): VehicleExpense[] {
  return [];
}

export function createInitialInvoices(): Invoice[] {
  return [];
}

export function createInitialPayments(): Payment[] {
  return [];
}

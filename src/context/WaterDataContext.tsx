import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { scrollToTop } from '../utils/scrollUtils';
import {
  generateCustomerIdentifier,
  formatCustomerIdentifier,
  normalizeCustomerList,
} from '../utils/customerUtils';
import {
  Customer,
  Driver,
  Delivery,
  PriceConfig,
  FilterState,
  ActiveTab,
  SupplyType,
  TankCapacity,
  PaymentMethod,
  Vehicle,
  DesalinationBalanceTransaction,
  FuelTransaction,
  VehicleExpense,
  VehicleFinancialSummary,
  FilterPeriod,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  Payment,
  PaymentMethodType,
  CustomerAccountSummary,
  AccountStatementMovement,
  AccountsPeriodFilter,
  AccountsFilterState,
  CustomerOrder,
  CustomerOrderStatus,
  DeliveryOrderStatus,
} from '../types';
import {
  initialCustomers,
  initialDrivers,
  initialPriceConfig,
  createInitialDeliveries,
  getTodayDateString,
  initialVehicles,
  createInitialDesalinationTransactions,
  createInitialFuelTransactions,
  createInitialVehicleExpenses,
  getRelativeDateString,
  createInitialInvoices,
  createInitialPayments,
  DRIVER_PASSWORDS,
} from '../data/initialData';

const STORAGE_KEYS = {
  DELIVERIES: 'naqaa_water_deliveries_v7',
  CUSTOMERS: 'naqaa_water_customers_v7',
  DRIVERS: 'naqaa_water_drivers_v5',
  PRICES: 'naqaa_water_prices_v5',
  VEHICLES: 'naqaa_water_vehicles_v5',
  DESAL_TX: 'naqaa_water_desal_tx_v5',
  FUEL_TX: 'naqaa_water_fuel_tx_v5',
  EXPENSES: 'naqaa_water_expenses_v5',
  INVOICES: 'naqaa_water_invoices_v7',
  PAYMENTS: 'naqaa_water_payments_v7',
  CUSTOMER_ORDERS: 'naqaa_water_customer_orders_v7',
  AUTHENTICATED_DRIVER: 'naqaa_water_auth_driver_v6',
};

// Initialize storage versioning - purge prior deliveries and customer data
try {
  ['v1', 'v2', 'v3', 'v4', 'v5', 'v6'].forEach((ver) => {
    localStorage.removeItem(`naqaa_water_deliveries_${ver}`);
    localStorage.removeItem(`naqaa_water_customers_${ver}`);
    localStorage.removeItem(`naqaa_water_invoices_${ver}`);
    localStorage.removeItem(`naqaa_water_payments_${ver}`);
    localStorage.removeItem(`naqaa_water_customer_orders_${ver}`);
  });
} catch (_) {}

export function getDateRangeForAccountsPeriod(
  period: AccountsPeriodFilter,
  customStart?: string,
  customEnd?: string
): { startDate: string; endDate: string } {
  const today = getTodayDateString();
  if (period === 'today') {
    return { startDate: today, endDate: today };
  }
  if (period === 'this_week') {
    const weekAgo = getRelativeDateString(-7);
    return { startDate: weekAgo, endDate: today };
  }
  if (period === 'this_month') {
    const now = new Date();
    const mStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    return { startDate: mStr, endDate: today };
  }
  if (period === 'this_year') {
    const now = new Date();
    const yStr = `${now.getFullYear()}-01-01`;
    return { startDate: yStr, endDate: today };
  }
  return {
    startDate: customStart || '1970-01-01',
    endDate: customEnd || today,
  };
}

export interface OperationsFilter {
  period: FilterPeriod;
  customStartDate?: string;
  customEndDate?: string;
  vehicleId: 'all' | string;
  driverId: 'all' | string;
}

export function getDateRangeForPeriod(
  period: FilterPeriod,
  customStart?: string,
  customEnd?: string
): { startDate: string; endDate: string } {
  const today = getTodayDateString();
  if (period === 'today') {
    return { startDate: today, endDate: today };
  }
  if (period === 'yesterday') {
    const yesterday = getRelativeDateString(-1);
    return { startDate: yesterday, endDate: yesterday };
  }
  if (period === 'this_week') {
    const weekAgo = getRelativeDateString(-7);
    return { startDate: weekAgo, endDate: today };
  }
  if (period === 'this_month') {
    const now = new Date();
    const mStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    return { startDate: mStr, endDate: today };
  }
  return {
    startDate: customStart || '1970-01-01',
    endDate: customEnd || today,
  };
}

interface DriverPerformance {
  driver: Driver;
  totalDeliveries: number;
  deferredCount: number;
  cashCount: number;
  totalAmount: number;
}

interface DashboardMetrics {
  totalDeliveriesCount: number;
  desalinationCount: number;
  wellCount: number;
  // Breakdown
  desalination11tCount: number;
  desalination11tSum: number;
  desalination18tCount: number;
  desalination18tSum: number;
  desalination30tCount: number;
  desalination30tSum: number;
  well11tCount: number;
  well11tSum: number;
  well18tCount: number;
  well18tSum: number;
  well30tCount: number;
  well30tSum: number;
  // Drivers
  driversPerformance: DriverPerformance[];
  // Payments
  totalCash: number;
  totalDeferred: number;
  totalCollected: number;
  totalRemaining: number;
  totalDailyIncome: number;
  // Table
  latestDeliveries: Delivery[];
}

interface WaterDataContextType {
  deliveries: Delivery[];
  customers: Customer[];
  drivers: Driver[];
  vehicles: Vehicle[];
  desalinationTransactions: DesalinationBalanceTransaction[];
  fuelTransactions: FuelTransaction[];
  vehicleExpenses: VehicleExpense[];
  priceConfig: PriceConfig;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  goBack: () => void;
  canGoBack: boolean;
  selectedCustomerForRecord: Customer | null;
  setSelectedCustomerForRecord: (customer: Customer | null) => void;
  openCustomerRecordById: (customerId: string) => void;
  dashboardMetrics: DashboardMetrics;
  filteredDeliveries: Delivery[];

  // Operations and Vehicle Expense Management
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  operationsFilter: OperationsFilter;
  setOperationsFilter: React.Dispatch<React.SetStateAction<OperationsFilter>>;
  getVehicleFinancialSummary: (vehicleId: string, filter?: OperationsFilter) => VehicleFinancialSummary;
  fleetFinancialSummaries: VehicleFinancialSummary[];

  // Actions - Deliveries
  addDelivery: (delivery: {
    customer_name: string;
    customer_identifier: string;
    mobile: string;
    location: string;
    supply_type: SupplyType;
    tank_capacity: TankCapacity;
    price: number;
    payment_method: PaymentMethod;
    supply_date: string;
    supply_time?: string;
    driver_id: string;
    driver_name: string;
    attachment?: any;
    notes?: string;
  }) => { success: boolean; message: string; delivery?: Delivery };

  updateDelivery: (id: string, updates: Partial<Delivery>) => void;
  deleteDelivery: (id: string) => void;
  clearAllDeliveries: () => void;
  
  // Actions - Customers
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  clearAllCustomers: () => void;
  clearAllData: () => void;
  findCustomerByPhoneOrIdentifier: (query: string) => Customer | undefined;
  generateNewCustomerIdentifier: () => string;
  
  // Actions - Drivers & Vehicles
  addDriver: (driver: Omit<Driver, 'id'>) => Driver;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;

  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'created_at'>) => Vehicle;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  // Actions - Desalination Balance
  addDesalinationTransaction: (tx: Omit<DesalinationBalanceTransaction, 'id' | 'created_at'>) => DesalinationBalanceTransaction;
  updateDesalinationTransaction: (id: string, updates: Partial<DesalinationBalanceTransaction>) => void;
  deleteDesalinationTransaction: (id: string) => void;

  // Actions - Fuel
  addFuelTransaction: (tx: Omit<FuelTransaction, 'id' | 'created_at'>) => FuelTransaction;
  updateFuelTransaction: (id: string, updates: Partial<FuelTransaction>) => void;
  deleteFuelTransaction: (id: string) => void;

  // Actions - Expenses
  addVehicleExpense: (expense: Omit<VehicleExpense, 'id' | 'created_at'>) => VehicleExpense;
  updateVehicleExpense: (id: string, updates: Partial<VehicleExpense>) => void;
  deleteVehicleExpense: (id: string) => void;

  updatePriceConfig: (newPrices: PriceConfig) => void;
  resetToDefaultData: () => void;

  // Accounts & Invoices (الحسابات والفواتير)
  invoices: Invoice[];
  payments: Payment[];
  accountsFilter: AccountsFilterState;
  setAccountsFilter: React.Dispatch<React.SetStateAction<AccountsFilterState>>;
  selectedAccountsCustomerId: string | null;
  setSelectedAccountsCustomerId: (id: string | null) => void;
  addInvoice: (data: {
    customer_id: string;
    due_date: string;
    issue_date?: string;
    delivery_ids: string[];
    notes?: string;
  }) => { success: boolean; message: string; invoice?: Invoice };
  deleteInvoice: (id: string) => void;
  addPayment: (data: {
    customer_id: string;
    invoice_id?: string;
    amount: number;
    payment_method: PaymentMethodType;
    payment_date?: string;
    reference_number?: string;
    notes?: string;
    receipt_attachment?: any;
  }) => { success: boolean; message: string; payment?: Payment };
  deletePayment: (id: string) => void;
  getUninvoicedDeliveries: (customerId?: string) => Delivery[];
  getCustomerAccountSummary: (customerId: string) => CustomerAccountSummary;
  allCustomersAccountSummaries: CustomerAccountSummary[];
  getCustomerStatement: (customerId: string) => AccountStatementMovement[];
  getAccountsFinancialMetrics: (filter?: AccountsFilterState) => {
    totalInvoiced: number;
    totalCollected: number;
    totalRemaining: number;
    customersWithDueCount: number;
  };

  // Online Customer Orders (طلبات التوريد الإلكترونية)
  customerOrders: CustomerOrder[];
  pendingOrdersCount: number;
  addCustomerOrder: (data: {
    customer_name: string;
    mobile: string;
    supply_type: string;
    tank_capacity: string;
    location: string;
    google_maps_url?: string;
  }) => CustomerOrder;
  updateCustomerOrderStatus: (orderId: string, status: CustomerOrderStatus) => void;
  deleteCustomerOrder: (orderId: string) => void;
  clearAllCustomerOrders: () => void;
  
  // Driver Authentication & Operations
  authenticatedDriver: Driver | null;
  loginDriver: (username: string, password: string) => { success: boolean; message: string; driver?: Driver };
  logoutDriver: () => void;
  documentDelivery: (data: { deliveryId: string; proofImage: string; notes?: string }) => { success: boolean; message: string };
  updateDeliveryOrderStatus: (deliveryId: string, status: DeliveryOrderStatus) => void;
  getDriverDeliveries: (driverId: string) => Delivery[];
  getDriverStats: (driverId: string) => {
    todayOrdersCount: number;
    todayCompletedCount: number;
    activeOrdersCount: number;
    totalOrdersCount: number;
  };

  // UI helpers
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const WaterDataContext = createContext<WaterDataContextType | undefined>(undefined);

export const WaterDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Online Customer Orders state
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER_ORDERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved customer orders', e);
      }
    }
    return [];
  });
  const [deliveries, setDeliveries] = useState<Delivery[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DELIVERIES);
    if (saved) {
      try {
        const parsed: Delivery[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((d) => {
            let driver_name = d.driver_name?.replace('المصري', '').trim() || d.driver_name;
            let tank_capacity = d.tank_capacity;
            if (d.driver_id === 'drv-4' || driver_name === 'ص') {
              driver_name = 'مختار تريلا';
            } else if (d.driver_id === 'drv-5' || driver_name === 'س') {
              driver_name = 'مختار عايدي';
              if (tank_capacity === '11 طن') tank_capacity = '12 طن';
            }
            return {
              ...d,
              driver_name,
              tank_capacity,
            };
          });
        }
      } catch (e) {
        console.error('Failed to parse saved deliveries', e);
      }
    }
    return createInitialDeliveries();
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return normalizeCustomerList(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved customers', e);
      }
    }
    return normalizeCustomerList(initialCustomers);
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    if (saved) {
      try {
        const parsed: Driver[] = JSON.parse(saved);
        return parsed.map((drv) => {
          let driver_name = drv.driver_name?.replace('المصري', '').trim() || drv.driver_name;
          let vehicle = drv.vehicle;
          if (drv.id === 'drv-4' || driver_name === 'ص') {
            driver_name = 'مختار تريلا';
          } else if (drv.id === 'drv-5' || driver_name === 'س') {
            driver_name = 'مختار عايدي';
            vehicle = 'وايت عايدي آبار (12 طن) - أ ح ن 165';
          }
          return {
            ...drv,
            mobile: '',
            phone: '',
            driver_name,
            vehicle,
          };
        });
      } catch (e) {
        console.error('Failed to parse saved drivers', e);
      }
    }
    return initialDrivers;
  });

  const [priceConfig, setPriceConfig] = useState<PriceConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRICES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved priceConfig', e);
      }
    }
    return initialPriceConfig;
  });

  const [filterState, setFilterState] = useState<FilterState>({
    period: 'today',
    supplyType: 'all',
    driverId: 'all',
  });

  const [activeTab, setActiveTabState] = useState<ActiveTab>('home');
  const [tabHistory, setTabHistory] = useState<ActiveTab[]>([]);
  const [selectedCustomerForRecord, setSelectedCustomerForRecord] = useState<Customer | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Driver Authentication State
  const [authenticatedDriver, setAuthenticatedDriver] = useState<Driver | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTHENTICATED_DRIVER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved authenticated driver', e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (authenticatedDriver) {
      localStorage.setItem(STORAGE_KEYS.AUTHENTICATED_DRIVER, JSON.stringify(authenticatedDriver));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTHENTICATED_DRIVER);
    }
  }, [authenticatedDriver]);

  // Operations and Vehicle Expense Management State
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    if (saved) {
      try {
        const parsed: Vehicle[] = JSON.parse(saved);
        return parsed.map((v) => {
          let name = v.name;
          let tank_capacity = v.tank_capacity;
          let notes = v.notes?.replace('المصري', '').trim() || v.notes;
          if (v.id === 'veh-4' || notes?.includes('السائق: ص')) {
            notes = 'تريلا (30 طن) مياة آبار - السائق: مختار تريلا';
          } else if (v.id === 'veh-5' || notes?.includes('السائق: س') || tank_capacity === '11 طن') {
            name = 'وايت عايدي آبار (12 طن)';
            tank_capacity = '12 طن';
            notes = 'وايت عايدي (12 طن) مياة آبار - السائق: مختار عايدي';
          }
          return {
            ...v,
            name,
            tank_capacity,
            notes,
          };
        });
      } catch (e) {
        console.error('Failed to parse saved vehicles', e);
      }
    }
    return initialVehicles;
  });

  const [desalinationTransactions, setDesalinationTransactions] = useState<DesalinationBalanceTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DESAL_TX);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved desalinationTransactions', e);
      }
    }
    return createInitialDesalinationTransactions();
  });

  const [fuelTransactions, setFuelTransactions] = useState<FuelTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FUEL_TX);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved fuelTransactions', e);
      }
    }
    return createInitialFuelTransactions();
  });

  const [vehicleExpenses, setVehicleExpenses] = useState<VehicleExpense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved vehicleExpenses', e);
      }
    }
    return createInitialVehicleExpenses();
  });

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const [operationsFilter, setOperationsFilter] = useState<OperationsFilter>({
    period: 'today',
    vehicleId: 'all',
    driverId: 'all',
  });

  // Accounts and Invoices State (الحسابات والفواتير)
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved invoices', e);
      }
    }
    return createInitialInvoices();
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved payments', e);
      }
    }
    return createInitialPayments();
  });

  const [accountsFilter, setAccountsFilter] = useState<AccountsFilterState>({
    period: 'this_month',
  });

  const [selectedAccountsCustomerId, setSelectedAccountsCustomerId] = useState<string | null>(null);

  const setActiveTab = useCallback((newTab: ActiveTab) => {
    setActiveTabState((currentTab) => {
      if (newTab !== currentTab) {
        setTabHistory((prev) => {
          // If we are leaving customer_record to go back to another tab (e.g. customers or dashboard):
          if (currentTab === 'customer_record') {
            const filtered = prev.filter((t) => t !== 'customer_record');
            // If the last entry in history is already the new tab, remove it from history stack
            if (filtered.length > 0 && filtered[filtered.length - 1] === newTab) {
              return filtered.slice(0, -1);
            }
            return filtered;
          }
          // Avoid stacking consecutive identical tabs
          if (prev.length > 0 && prev[prev.length - 1] === currentTab) {
            return prev;
          }
          return [...prev, currentTab];
        });
      }
      return newTab;
    });
    // Immediately scroll to top on any tab switch (even if same tab is clicked)
    scrollToTop(true);
  }, []);

  const goBack = useCallback(() => {
    // 1. If in operations and a vehicle is selected, clear vehicle details first
    if (selectedVehicleId) {
      setSelectedVehicleId(null);
      scrollToTop(true);
      return;
    }
    // 2. If in accounts and a customer is selected, clear customer statement first
    if (selectedAccountsCustomerId) {
      setSelectedAccountsCustomerId(null);
      scrollToTop(true);
      return;
    }
    // 3. Pop history or go to home
    setTabHistory((prev) => {
      // Exclude 'customer_record' from back navigation history so that returning from customers
      // never loops back into customer profile
      let cleaned = prev.filter((t) => t !== 'customer_record');

      // Also clean up any occurrences equal to the current active tab
      while (cleaned.length > 0 && cleaned[cleaned.length - 1] === activeTab) {
        cleaned = cleaned.slice(0, -1);
      }

      if (cleaned.length > 0) {
        const lastTab = cleaned[cleaned.length - 1];
        setActiveTabState(lastTab);
        return cleaned.slice(0, -1);
      } else {
        // If no history remains, default to home
        setActiveTabState('home');
        return [];
      }
    });
    scrollToTop(true);
  }, [selectedVehicleId, selectedAccountsCustomerId, activeTab]);

  const canGoBack = activeTab !== 'home' || tabHistory.length > 0 || !!selectedVehicleId || !!selectedAccountsCustomerId;

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(priceConfig));
  }, [priceConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DESAL_TX, JSON.stringify(desalinationTransactions));
  }, [desalinationTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FUEL_TX, JSON.stringify(fuelTransactions));
  }, [fuelTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(vehicleExpenses));
  }, [vehicleExpenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // Helper to open customer record by ID
  const openCustomerRecordById = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    if (cust) {
      setSelectedCustomerForRecord(cust);
      setActiveTab('customer_record');
    }
  };

  // Dynamic filter application
  const filteredDeliveries = useMemo(() => {
    const today = getTodayDateString();
    
    // Determine target dates
    let targetStartDate = today;
    let targetEndDate = today;

    if (filterState.period === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      targetStartDate = yStr;
      targetEndDate = yStr;
    } else if (filterState.period === 'this_week') {
      const now = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      targetStartDate = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`;
      targetEndDate = today;
    } else if (filterState.period === 'this_month') {
      const now = new Date();
      targetStartDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      targetEndDate = today;
    } else if (filterState.period === 'custom') {
      targetStartDate = filterState.customStartDate || '1970-01-01';
      targetEndDate = filterState.customEndDate || today;
    }

    return deliveries.filter((item) => {
      // Date filter
      if (filterState.period === 'today') {
        if (item.supply_date !== today) return false;
      } else if (filterState.period === 'yesterday') {
        if (item.supply_date !== targetStartDate) return false;
      } else {
        if (item.supply_date < targetStartDate || item.supply_date > targetEndDate) return false;
      }

      // Supply type filter
      if (filterState.supplyType !== 'all' && item.supply_type !== filterState.supplyType) {
        return false;
      }

      // Driver filter
      if (filterState.driverId !== 'all' && item.driver_id !== filterState.driverId) {
        return false;
      }

      return true;
    });
  }, [deliveries, filterState]);

  // Compute all metrics dynamically according to Section 13
  const dashboardMetrics: DashboardMetrics = useMemo(() => {
    let desalinationCount = 0;
    let wellCount = 0;

    let desalination11tCount = 0;
    let desalination11tSum = 0;
    let desalination18tCount = 0;
    let desalination18tSum = 0;
    let desalination30tCount = 0;
    let desalination30tSum = 0;

    let well11tCount = 0;
    let well11tSum = 0;
    let well18tCount = 0;
    let well18tSum = 0;
    let well30tCount = 0;
    let well30tSum = 0;

    let totalCash = 0;
    let totalDeferred = 0;
    let totalCollected = 0;
    let totalRemaining = 0;
    let totalDailyIncome = 0;

    filteredDeliveries.forEach((d) => {
      totalDailyIncome += d.price;

      if (d.payment_method === 'كاش') {
        totalCash += d.price;
        totalCollected += d.price;
      } else {
        totalDeferred += d.price;
        totalRemaining += d.price;
      }

      if (d.supply_type === 'تحلية') {
        desalinationCount += 1;
        if (d.tank_capacity === '18 طن') {
          desalination18tCount += 1;
          desalination18tSum += d.price;
        } else if (d.tank_capacity === '30 طن') {
          desalination30tCount += 1;
          desalination30tSum += d.price;
        } else {
          desalination11tCount += 1;
          desalination11tSum += d.price;
        }
      } else {
        wellCount += 1;
        if (d.tank_capacity === '12 طن' || d.tank_capacity === '11 طن') {
          well11tCount += 1;
          well11tSum += d.price;
        } else if (d.tank_capacity === '18 طن') {
          well18tCount += 1;
          well18tSum += d.price;
        } else {
          well30tCount += 1;
          well30tSum += d.price;
        }
      }
    });

    // Drivers performance - ordered strictly Karim, Ahmad, Ghulam as in Image 1
    // or according to drivers list
    const driversPerformance: DriverPerformance[] = drivers.map((driver) => {
      const driverDeliveries = filteredDeliveries.filter((d) => d.driver_id === driver.id);
      let deferredCount = 0;
      let cashCount = 0;
      let totalAmount = 0;

      driverDeliveries.forEach((d) => {
        totalAmount += d.price;
        if (d.payment_method === 'كاش') {
          cashCount += 1;
        } else {
          deferredCount += 1;
        }
      });

      return {
        driver,
        totalDeliveries: driverDeliveries.length,
        deferredCount,
        cashCount,
        totalAmount,
      };
    });

    // Latest deliveries (up to 5)
    const latestDeliveries = [...filteredDeliveries]
      .sort((a, b) => (b.supply_time || '').localeCompare(a.supply_time || '') || b.sequence_num - a.sequence_num)
      .slice(0, 5);

    return {
      totalDeliveriesCount: filteredDeliveries.length,
      desalinationCount,
      wellCount,
      desalination11tCount,
      desalination11tSum,
      desalination18tCount,
      desalination18tSum,
      desalination30tCount,
      desalination30tSum,
      well11tCount,
      well11tSum,
      well18tCount,
      well18tSum,
      well30tCount,
      well30tSum,
      driversPerformance,
      totalCash,
      totalDeferred,
      totalCollected,
      totalRemaining,
      totalDailyIncome,
      latestDeliveries,
    };
  }, [filteredDeliveries, drivers]);

  // Customer search / lookup by phone or identifier
  const findCustomerByPhoneOrIdentifier = (query: string): Customer | undefined => {
    const trimmed = query.trim();
    if (!trimmed) return undefined;
    return customers.find(
      (c) =>
        c.mobile.replace(/\s+/g, '') === trimmed.replace(/\s+/g, '') ||
        c.customer_identifier.toLowerCase() === trimmed.toLowerCase() ||
        c.customer_name.toLowerCase().includes(trimmed.toLowerCase())
    );
  };

  // Add delivery with customer auto-linking or creation
  const addDelivery = (data: {
    customer_name: string;
    customer_identifier: string;
    mobile: string;
    location: string;
    supply_type: SupplyType;
    tank_capacity: TankCapacity;
    price: number;
    payment_method: PaymentMethod;
    supply_date: string;
    supply_time?: string;
    driver_id: string;
    driver_name: string;
    attachment?: any;
    notes?: string;
  }) => {
    // Required fields check
    if (!data.customer_name.trim()) {
      return { success: false, message: 'يرجى إدخال اسم العميل' };
    }
    if (!data.mobile.trim()) {
      return { success: false, message: 'يرجى إدخال رقم جوال العميل' };
    }
    if (!data.price || data.price <= 0) {
      return { success: false, message: 'يرجى إدخال سعر التوريد الصحيح' };
    }

    // Find or create customer
    let customer = findCustomerByPhoneOrIdentifier(data.mobile) || findCustomerByPhoneOrIdentifier(data.customer_identifier);
    let customerId = customer ? customer.id : '';
    let customerIdent = customer ? customer.customer_identifier : '';

    if (!customer) {
      // Create new customer record with unique identifier starting with NB-
      customerIdent = formatCustomerIdentifier(data.customer_identifier, customers);
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        customer_name: data.customer_name.trim(),
        customer_identifier: customerIdent,
        mobile: data.mobile.trim(),
        location: data.location.trim(),
        created_at: data.supply_date || getTodayDateString(),
        notes: data.notes,
      };
      setCustomers((prev) => [newCust, ...prev]);
      customerId = newCust.id;
    } else {
      // Update location or name if updated
      const updatedIdent = data.customer_identifier.trim()
        ? formatCustomerIdentifier(data.customer_identifier, customers)
        : customer.customer_identifier;
      customerIdent = updatedIdent;
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? {
                ...c,
                location: data.location.trim() || c.location,
                customer_name: data.customer_name.trim() || c.customer_name,
                customer_identifier: updatedIdent,
              }
            : c
        )
      );
    }

    const now = new Date();
    const timeStr = data.supply_time || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const nextSeq = deliveries.length > 0 ? Math.max(...deliveries.map((d) => d.sequence_num || 0)) + 1 : 1;
    const orderNumber = `NB-${1040 + nextSeq}`;
    const orderStatus: DeliveryOrderStatus = data.driver_id ? 'مسند للسائق' : 'جديد';

    const paymentStatus = data.payment_method === 'كاش' ? 'مدفوع' : 'آجل';
    const newDelivery: Delivery = {
      id: `del-${Date.now()}`,
      sequence_num: nextSeq,
      order_number: orderNumber,
      customer_id: customerId,
      customer_name: data.customer_name.trim(),
      customer_identifier: customerIdent,
      mobile: data.mobile.trim(),
      location: data.location.trim(),
      google_maps_url: `https://maps.google.com/?q=${encodeURIComponent(data.location.trim() || 'الطائف')}`,
      supply_type: data.supply_type,
      tank_capacity: data.tank_capacity,
      price: Number(data.price),
      payment_method: data.payment_method,
      supply_date: data.supply_date || getTodayDateString(),
      supply_time: timeStr,
      driver_id: data.driver_id,
      driver_name: data.driver_name,
      order_status: orderStatus,
      attachment: data.attachment || null,
      payment_status: paymentStatus,
      paid_amount: paymentStatus === 'مدفوع' ? Number(data.price) : 0,
      remaining_amount: paymentStatus === 'مدفوع' ? 0 : Number(data.price),
      created_at: new Date().toISOString(),
      created_by: 'مدير النظام',
      notes: data.notes,
    };

    setDeliveries((prev) => [newDelivery, ...prev]);
    showNotification(`تم تسجيل التوريد برقم ${orderNumber} وإسناده للسائق`);
    return { success: true, message: 'تم الحفظ بنجاح', delivery: newDelivery };
  };

  // Driver login method with credentials verification
  const loginDriver = (username: string, password: string) => {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // Match driver by username or driver_name
    const matchedDriver = drivers.find(
      (d) =>
        d.username?.trim().toLowerCase() === cleanUsername.toLowerCase() ||
        d.driver_name?.trim().toLowerCase() === cleanUsername.toLowerCase()
    );

    const validPassword =
      DRIVER_PASSWORDS[cleanUsername] ||
      DRIVER_PASSWORDS[matchedDriver?.driver_name || ''] ||
      '123456';

    if (!matchedDriver || cleanPassword !== validPassword) {
      return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }

    const nowStr = `${getTodayDateString()} ${new Date().toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`;

    const updatedDriver: Driver = {
      ...matchedDriver,
      last_active: nowStr,
    };

    setAuthenticatedDriver(updatedDriver);
    setDrivers((prev) => prev.map((d) => (d.id === updatedDriver.id ? updatedDriver : d)));
    showNotification(`مرحبًا بك يا ${updatedDriver.driver_name}`, 'success');
    return { success: true, message: 'تم تسجيل الدخول بنجاح', driver: updatedDriver };
  };

  const logoutDriver = () => {
    setAuthenticatedDriver(null);
    localStorage.removeItem(STORAGE_KEYS.AUTHENTICATED_DRIVER);
    showNotification('تم تسجيل خروج السائق بنجاح', 'info');
  };

  // Document delivery with Proof Of Delivery (Camera photo)
  const documentDelivery = (data: { deliveryId: string; proofImage: string; notes?: string }) => {
    const targetDel = deliveries.find((d) => d.id === data.deliveryId);
    if (!targetDel) {
      return { success: false, message: 'الطلب غير موجود في سجلات النظام' };
    }

    // Role / security check: If driver is logged in, ensure this delivery is assigned to them
    if (authenticatedDriver) {
      const isAssigned =
        targetDel.driver_id === authenticatedDriver.id ||
        targetDel.driver_name.trim() === authenticatedDriver.driver_name.trim();

      if (!isAssigned) {
        return { success: false, message: 'غير مصرح لك بتوثيق هذا التوريد - غير مسند لحسابك' };
      }
    }

    // Enforce lock rule: delivery cannot be documented again once closed
    if (targetDel.order_status === 'تم التوريد' && authenticatedDriver) {
      return { success: false, message: 'لا يمكن اعتماد نفس الطلب مرة أخرى بعد إغلاقه' };
    }

    const today = getTodayDateString();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const timestampStr = `${today} ${timeStr}`;

    const updatedDelivery: Delivery = {
      ...targetDel,
      order_status: 'تم التوريد',
      delivery_proof_image: data.proofImage,
      delivery_documented_at: timestampStr,
      delivered_date: today,
      delivered_time: timeStr,
      notes: data.notes ? (targetDel.notes ? `${targetDel.notes} | ${data.notes}` : data.notes) : targetDel.notes,
    };

    setDeliveries((prev) => prev.map((d) => (d.id === data.deliveryId ? updatedDelivery : d)));

    // Update driver's last_active
    const driverToUpdateId = authenticatedDriver ? authenticatedDriver.id : targetDel.driver_id;
    if (driverToUpdateId) {
      setDrivers((prev) =>
        prev.map((drv) => (drv.id === driverToUpdateId ? { ...drv, last_active: timestampStr } : drv))
      );
    }

    showNotification('تم توثيق التوريد بنجاح ✓', 'success');
    return { success: true, message: 'تم توثيق التوريد بنجاح' };
  };

  // Update order status (جديد / مسند للسائق / في الطريق / تم التوريد / ملغي)
  const updateDeliveryOrderStatus = (deliveryId: string, status: DeliveryOrderStatus) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === deliveryId ? { ...d, order_status: status } : d))
    );
    showNotification(`تم تحديث حالة الطلب إلى "${status}"`, 'info');
  };

  // Get deliveries strictly for a specific driver
  const getDriverDeliveries = useCallback(
    (driverId: string) => {
      const driver = drivers.find((d) => d.id === driverId);
      const driverName = driver?.driver_name.trim();

      return deliveries.filter(
        (d) => d.driver_id === driverId || (driverName && d.driver_name.trim() === driverName)
      );
    },
    [deliveries, drivers]
  );

  // Driver metrics
  const getDriverStats = useCallback(
    (driverId: string) => {
      const today = getTodayDateString();
      const driverDeliveries = getDriverDeliveries(driverId);

      const todayDeliveries = driverDeliveries.filter((d) => d.supply_date === today);
      const todayCompleted = todayDeliveries.filter((d) => d.order_status === 'تم التوريد');
      const activeOrders = driverDeliveries.filter(
        (d) =>
          d.order_status === 'مسند للسائق' ||
          d.order_status === 'في الطريق' ||
          (!d.order_status && d.supply_date === today)
      );

      return {
        todayOrdersCount: todayDeliveries.length,
        todayCompletedCount: todayCompleted.length,
        activeOrdersCount: activeOrders.length,
        totalOrdersCount: driverDeliveries.length,
      };
    },
    [getDriverDeliveries]
  );

  const updateDelivery = (id: string, updates: Partial<Delivery>) => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const updated = { ...d, ...updates };
          const price = updates.price !== undefined ? Number(updates.price) : d.price;
          if (updates.payment_status !== undefined) {
            updated.payment_status = updates.payment_status;
            if (updates.payment_status === 'مدفوع') {
              updated.payment_method = 'كاش';
              updated.paid_amount = price;
              updated.remaining_amount = 0;
            } else {
              updated.payment_method = 'آجل';
              updated.paid_amount = 0;
              updated.remaining_amount = price;
            }
          } else if (updates.payment_method !== undefined || updates.price !== undefined) {
            const method = updates.payment_method || d.payment_method;
            updated.payment_status = method === 'كاش' ? 'مدفوع' : 'آجل';
            updated.paid_amount = method === 'كاش' ? price : 0;
            updated.remaining_amount = method === 'آجل' ? price : 0;
          }
          return updated;
        }
        return d;
      })
    );
    showNotification('تم تحديث بيانات التوريد بنجاح');
  };

  const deleteDelivery = (id: string) => {
    setDeliveries((prev) => prev.filter((d) => d.id !== id));
    showNotification('تم حذف التوريد من السجل');
  };

  const clearAllDeliveries = () => {
    setDeliveries([]);
    localStorage.removeItem(STORAGE_KEYS.DELIVERIES);
    showNotification('تم حذف وتصفير جميع سجلات وبطاقات التوريد بنجاح', 'info');
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'created_at'>): Customer => {
    const assignedIdentifier = formatCustomerIdentifier(
      customerData.customer_identifier || '',
      customers
    );
    const newCust: Customer = {
      ...customerData,
      customer_identifier: assignedIdentifier,
      id: `cust-${Date.now()}`,
      created_at: getTodayDateString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    showNotification('تمت إضافة العميل بنجاح');
    return newCust;
  };

  const generateNewCustomerIdentifier = useCallback(() => {
    return generateCustomerIdentifier(customers, deliveries);
  }, [customers, deliveries]);

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updatedIdentifier = updates.customer_identifier !== undefined
          ? (updates.customer_identifier.trim() ? formatCustomerIdentifier(updates.customer_identifier, customers) : c.customer_identifier)
          : c.customer_identifier;
        const updatedCustomer = {
          ...c,
          ...updates,
          customer_identifier: updatedIdentifier,
        };
        setSelectedCustomerForRecord((sel) => (sel && sel.id === id ? updatedCustomer : sel));
        return updatedCustomer;
      })
    );
    // Also synchronize delivery records for this customer
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.customer_id === id) {
          return {
            ...d,
            customer_name: updates.customer_name !== undefined ? updates.customer_name : d.customer_name,
            mobile: updates.mobile !== undefined ? updates.mobile : d.mobile,
            location: updates.location !== undefined ? updates.location : d.location,
            customer_identifier: updates.customer_identifier !== undefined ? updates.customer_identifier : d.customer_identifier,
          };
        }
        return d;
      })
    );
    showNotification('تم تحديث بيانات العميل بنجاح');
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setInvoices((prev) => prev.filter((i) => i.customer_id !== id));
    setPayments((prev) => prev.filter((p) => p.customer_id !== id));
    if (selectedCustomerForRecord?.id === id) {
      setSelectedCustomerForRecord(null);
    }
    showNotification('تم حذف العميل وكافة بياناته بنجاح');
  };

  const clearAllCustomers = () => {
    setCustomers([]);
    setInvoices([]);
    setPayments([]);
    setSelectedCustomerForRecord(null);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    showNotification('تم حذف جميع بيانات وسجلات العملاء بنجاح', 'info');
  };

  const clearAllData = () => {
    setDeliveries([]);
    setCustomerOrders([]);
    setCustomers([]);
    setInvoices([]);
    setPayments([]);
    setDesalinationTransactions([]);
    setFuelTransactions([]);
    setVehicleExpenses([]);
    setSelectedCustomerForRecord(null);
    setSelectedVehicleId(null);
    setVehicles((prev) =>
      prev.map((v) => ({
        ...v,
        initial_desalination_balance: 0,
      }))
    );

    localStorage.removeItem(STORAGE_KEYS.DELIVERIES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.DESAL_TX);
    localStorage.removeItem(STORAGE_KEYS.FUEL_TX);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.VEHICLES);
    showNotification('تم حذف وتصفير جميع البيانات بنجاح', 'info');
  };

  const addDriver = (driverData: Omit<Driver, 'id'>): Driver => {
    const newDrv: Driver = {
      ...driverData,
      id: `drv-${Date.now()}`,
    };
    setDrivers((prev) => [...prev, newDrv]);
    showNotification('تمت إضافة السائق الجديد بنجاح');
    return newDrv;
  };

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    showNotification('تم تحديث بيانات السائق');
  };

  const deleteDriver = (id: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    showNotification('تم حذف السائق');
  };

  const updatePriceConfig = (newPrices: PriceConfig) => {
    setPriceConfig(newPrices);
    showNotification('تم تحديث أسعار التوريدات المعتمدة');
  };

  // Vehicles Management
  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'created_at'>): Vehicle => {
    const newVeh: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
      created_at: getTodayDateString(),
    };
    setVehicles((prev) => [...prev, newVeh]);
    showNotification('تمت إضافة الشاحنة بنجاح');
    return newVeh;
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    showNotification('تم تحديث بيانات الشاحنة');
  };

  const deleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    showNotification('تم حذف الشاحنة');
  };

  // Desalination Transactions
  const addDesalinationTransaction = (
    txData: Omit<DesalinationBalanceTransaction, 'id' | 'created_at'>
  ): DesalinationBalanceTransaction => {
    const veh = vehicles.find((v) => v.id === txData.vehicle_id);
    const newTx: DesalinationBalanceTransaction = {
      ...txData,
      id: `desal-${Date.now()}`,
      vehicle_name: veh?.name || txData.vehicle_name,
      created_at: `${txData.date}T${txData.time || '12:00'}:00`,
    };
    setDesalinationTransactions((prev) => [newTx, ...prev]);
    showNotification(txData.type === 'recharge' ? 'تم تسجيل شحن رصيد التحلية بنجاح' : 'تم تسجيل استهلاك رصيد التحلية');
    return newTx;
  };

  const updateDesalinationTransaction = (id: string, updates: Partial<DesalinationBalanceTransaction>) => {
    setDesalinationTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    showNotification('تم تحديث حركة رصيد التحلية');
  };

  const deleteDesalinationTransaction = (id: string) => {
    setDesalinationTransactions((prev) => prev.filter((t) => t.id !== id));
    showNotification('تم حذف حركة الرصيد');
  };

  // Fuel Transactions
  const addFuelTransaction = (txData: Omit<FuelTransaction, 'id' | 'created_at'>): FuelTransaction => {
    const driver = drivers.find((d) => d.id === txData.driver_id);
    const newFuel: FuelTransaction = {
      ...txData,
      id: `fuel-${Date.now()}`,
      driver_name: driver?.driver_name || txData.driver_name,
      created_at: `${txData.date}T${txData.time || '12:00'}:00`,
    };
    setFuelTransactions((prev) => [newFuel, ...prev]);
    // Optionally update vehicle odometer if newer
    if (txData.odometer_reading) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === txData.vehicle_id && txData.odometer_reading > v.current_odometer
            ? { ...v, current_odometer: txData.odometer_reading }
            : v
        )
      );
    }
    showNotification('تم تسجيل تعبئة الديزل بنجاح');
    return newFuel;
  };

  const updateFuelTransaction = (id: string, updates: Partial<FuelTransaction>) => {
    setFuelTransactions((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    showNotification('تم تحديث قيد الديزل');
  };

  const deleteFuelTransaction = (id: string) => {
    setFuelTransactions((prev) => prev.filter((f) => f.id !== id));
    showNotification('تم حذف قيد الديزل');
  };

  // Vehicle Expenses
  const addVehicleExpense = (expData: Omit<VehicleExpense, 'id' | 'created_at'>): VehicleExpense => {
    const driver = drivers.find((d) => d.id === expData.driver_id);
    const newExp: VehicleExpense = {
      ...expData,
      id: `exp-${Date.now()}`,
      driver_name: driver?.driver_name || expData.driver_name,
      created_at: `${expData.date}T${expData.time || '12:00'}:00`,
    };
    setVehicleExpenses((prev) => [newExp, ...prev]);
    showNotification('تم تسجيل المصروف بنجاح');
    return newExp;
  };

  const updateVehicleExpense = (id: string, updates: Partial<VehicleExpense>) => {
    setVehicleExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    showNotification('تم تحديث المصروف');
  };

  const deleteVehicleExpense = (id: string) => {
    setVehicleExpenses((prev) => prev.filter((e) => e.id !== id));
    showNotification('تم حذف المصروف');
  };

  // Mathematical & Accounting Engine for Vehicles
  const getVehicleFinancialSummary = (
    vehicleId: string,
    customFilter?: OperationsFilter
  ): VehicleFinancialSummary => {
    const vehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0];
    if (!vehicle) {
      return {
        vehicle: {
          id: vehicleId || 'none',
          name: 'غير محدد',
          plate_number: '-',
          assigned_driver_id: '',
          status: 'inactive',
          tank_capacity: '18 طن',
          model_year: '2024',
          initial_desalination_balance: 0,
          current_odometer: 0,
          notes: '',
          created_at: '',
        },
        driver: undefined,
        totalDeliveriesCount: 0,
        totalRevenue: 0,
        previousDesalinationBalance: 0,
        rechargedDesalinationAmount: 0,
        consumedDesalinationAmount: 0,
        remainingDesalinationBalance: 0,
        totalFuelCost: 0,
        totalFuelLiters: 0,
        fuelCount: 0,
        lastFuelTime: undefined,
        totalOtherExpenses: 0,
        totalOperatingExpenses: 0,
        netVehicleIncome: 0,
      };
    }
    const driver = drivers.find((d) => d.id === vehicle.assigned_driver_id || d.vehicle_id === vehicle.id);

    const filter = customFilter || operationsFilter;
    const { startDate, endDate } = getDateRangeForPeriod(
      filter.period,
      filter.customStartDate,
      filter.customEndDate
    );

    // Deliveries in period for this vehicle/driver
    const vehicleDeliveries = deliveries.filter((d) => {
      const matchVehicle = d.driver_id === vehicle.assigned_driver_id || (driver && d.driver_id === driver.id);
      if (!matchVehicle) return false;
      if (filter.period === 'today' || filter.period === 'yesterday') {
        return d.supply_date === startDate;
      }
      return d.supply_date >= startDate && d.supply_date <= endDate;
    });

    const totalDeliveriesCount = vehicleDeliveries.length;
    const totalRevenue = vehicleDeliveries.reduce((sum, d) => sum + d.price, 0);

    // Previous balance calculation:
    // Initial balance + recharges strictly before startDate - consumptions strictly before startDate
    const pastDesalDeliveries = deliveries.filter((d) => {
      const matchVehicle = d.driver_id === vehicle.assigned_driver_id || (driver && d.driver_id === driver.id);
      if (!matchVehicle) return false;
      if (d.supply_type !== 'تحلية') return false;
      return d.supply_date < startDate;
    });
    const pastDesalDeliveryCost = pastDesalDeliveries.reduce(
      (sum, d) => sum + (d.tank_capacity === '30 طن' ? 80 : 50),
      0
    );

    const pastDesalRecharges = desalinationTransactions
      .filter((t) => t.vehicle_id === vehicle.id && t.type === 'recharge' && t.date < startDate)
      .reduce((sum, t) => sum + t.amount, 0);

    const pastDesalManualConsumptions = desalinationTransactions
      .filter((t) => t.vehicle_id === vehicle.id && t.type === 'consumption' && t.date < startDate)
      .reduce((sum, t) => sum + t.amount, 0);

    const previousDesalinationBalance = Math.max(
      0,
      vehicle.initial_desalination_balance + pastDesalRecharges - (pastDesalDeliveryCost + pastDesalManualConsumptions)
    );

    // Desalination recharges in period
    const rechargedDesalinationAmount = desalinationTransactions
      .filter((t) => {
        if (t.vehicle_id !== vehicle.id || t.type !== 'recharge') return false;
        if (filter.period === 'today' || filter.period === 'yesterday') return t.date === startDate;
        return t.date >= startDate && t.date <= endDate;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Desalination actual consumption in period
    const inPeriodDesalDeliveries = vehicleDeliveries.filter((d) => d.supply_type === 'تحلية');
    const inPeriodDesalDeliveryCost = inPeriodDesalDeliveries.reduce(
      (sum, d) => sum + (d.tank_capacity === '30 طن' ? 80 : 50),
      0
    );

    const inPeriodManualConsumptions = desalinationTransactions
      .filter((t) => {
        if (t.vehicle_id !== vehicle.id || t.type !== 'consumption') return false;
        if (filter.period === 'today' || filter.period === 'yesterday') return t.date === startDate;
        return t.date >= startDate && t.date <= endDate;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const consumedDesalinationAmount = inPeriodDesalDeliveryCost + inPeriodManualConsumptions;

    // Remaining balance formula: Previous + Recharges - Consumption
    const remainingDesalinationBalance = Math.max(
      0,
      previousDesalinationBalance + rechargedDesalinationAmount - consumedDesalinationAmount
    );

    // Fuel in period
    const vehicleFuel = fuelTransactions.filter((f) => {
      if (f.vehicle_id !== vehicle.id) return false;
      if (filter.period === 'today' || filter.period === 'yesterday') return f.date === startDate;
      return f.date >= startDate && f.date <= endDate;
    });

    const totalFuelCost = vehicleFuel.reduce((sum, f) => sum + f.total_amount, 0);
    const totalFuelLiters = vehicleFuel.reduce((sum, f) => sum + f.liters, 0);
    const fuelCount = vehicleFuel.length;
    const sortedFuel = [...vehicleFuel].sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
    const lastFuelTime = sortedFuel.length > 0 ? `${sortedFuel[0].date} ${sortedFuel[0].time}` : undefined;

    // Other Expenses in period
    const vehicleExp = vehicleExpenses.filter((e) => {
      if (e.vehicle_id !== vehicle.id) return false;
      if (filter.period === 'today' || filter.period === 'yesterday') return e.date === startDate;
      return e.date >= startDate && e.date <= endDate;
    });
    const totalOtherExpenses = vehicleExp.reduce((sum, e) => sum + e.amount, 0);

    // Crucial Accounting Rule:
    // Operational Expenses = Desalination Consumption + Fuel + Other Expenses
    // (Recharges are NOT counted as an expense; only the consumed portion is!)
    const totalOperatingExpenses = consumedDesalinationAmount + totalFuelCost + totalOtherExpenses;
    // Net Income = Delivery Revenue - Operational Expenses
    const netVehicleIncome = totalRevenue - totalOperatingExpenses;

    return {
      vehicle,
      driver,
      totalDeliveriesCount,
      totalRevenue,
      previousDesalinationBalance,
      rechargedDesalinationAmount,
      consumedDesalinationAmount,
      remainingDesalinationBalance,
      totalFuelCost,
      totalFuelLiters,
      fuelCount,
      lastFuelTime,
      totalOtherExpenses,
      totalOperatingExpenses,
      netVehicleIncome,
    };
  };

  const fleetFinancialSummaries = useMemo(() => {
    return vehicles
      .filter((v) => {
        if (operationsFilter.vehicleId !== 'all' && v.id !== operationsFilter.vehicleId) return false;
        if (operationsFilter.driverId !== 'all' && v.assigned_driver_id !== operationsFilter.driverId) return false;
        return true;
      })
      .map((v) => getVehicleFinancialSummary(v.id, operationsFilter));
  }, [vehicles, drivers, deliveries, desalinationTransactions, fuelTransactions, vehicleExpenses, operationsFilter]);

  // ==========================================
  // Accounts & Invoices Logic (الحسابات والفواتير)
  // ==========================================

  // Set of all delivery IDs that are already included in an invoice
  const invoicedDeliveryIds = useMemo(() => {
    const set = new Set<string>();
    invoices.forEach((inv) => {
      inv.items.forEach((it) => {
        if (it.delivery_id) set.add(it.delivery_id);
      });
    });
    return set;
  }, [invoices]);

  const getUninvoicedDeliveries = (customerId?: string): Delivery[] => {
    return deliveries.filter((d) => {
      if (invoicedDeliveryIds.has(d.id)) return false;
      if (customerId && d.customer_id !== customerId) return false;
      return true;
    });
  };

  const addInvoice = (data: {
    customer_id: string;
    due_date: string;
    issue_date?: string;
    delivery_ids: string[];
    notes?: string;
  }) => {
    const customer = customers.find((c) => c.id === data.customer_id);
    if (!customer) {
      return { success: false, message: 'العميل المحدد غير موجود' };
    }
    if (!data.delivery_ids || data.delivery_ids.length === 0) {
      return { success: false, message: 'يرجى اختيار توريد واحد على الأقل لإصدار الفاتورة' };
    }

    // CRITICAL: Ensure none of the deliveries are already in another invoice
    for (const delId of data.delivery_ids) {
      if (invoicedDeliveryIds.has(delId)) {
        return {
          success: false,
          message: 'أحد التوريدات المختارة مدرج بالفعل في فاتورة سابقة ولا يمكن تكراره!',
        };
      }
    }

    const selectedDeliveries = deliveries.filter((d) => data.delivery_ids.includes(d.id));
    if (selectedDeliveries.length === 0) {
      return { success: false, message: 'لم يتم العثور على التوريدات المختارة' };
    }

    // Build invoice items
    const items: InvoiceItem[] = selectedDeliveries.map((del) => ({
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      delivery_id: del.id,
      delivery_date: del.supply_date,
      supply_type: del.supply_type,
      tank_capacity: del.tank_capacity,
      quantity: 1,
      unit_price: del.price,
      total_amount: del.price,
    }));

    const totalAmount = items.reduce((sum, it) => sum + it.total_amount, 0);

    // Initial paid amount based on cash deliveries
    const initialPaid = selectedDeliveries.reduce(
      (sum, d) => (d.payment_method === 'كاش' ? sum + d.price : sum),
      0
    );
    const initialRemaining = Math.max(0, totalAmount - initialPaid);
    const initialStatus: InvoiceStatus =
      initialRemaining <= 0 ? 'مسدد' : initialPaid > 0 ? 'مسدد جزئيًا' : 'مستحق';

    const nextInvoiceNum = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoice_number: nextInvoiceNum,
      customer_id: customer.id,
      customer_name: customer.customer_name,
      customer_identifier: customer.customer_identifier,
      mobile: customer.mobile,
      issue_date: data.issue_date || getTodayDateString(),
      due_date: data.due_date || getRelativeDateString(7),
      items,
      subtotal: totalAmount,
      total_amount: totalAmount,
      paid_amount: initialPaid,
      remaining_amount: initialRemaining,
      status: initialStatus,
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    showNotification(`تم إصدار الفاتورة ${nextInvoiceNum} بنجاح`);
    return { success: true, message: 'تم إصدار الفاتورة بنجاح', invoice: newInvoice };
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    setPayments((prev) =>
      prev.map((p) => (p.invoice_id === id ? { ...p, invoice_id: undefined, invoice_number: undefined } : p))
    );
    showNotification('تم حذف الفاتورة بنجاح', 'info');
  };

  const addPayment = (data: {
    customer_id: string;
    invoice_id?: string;
    amount: number;
    payment_method: PaymentMethodType;
    payment_date?: string;
    reference_number?: string;
    notes?: string;
    receipt_attachment?: any;
  }) => {
    const customer = customers.find((c) => c.id === data.customer_id);
    if (!customer) {
      return { success: false, message: 'العميل غير موجود' };
    }
    if (!data.amount || data.amount <= 0) {
      return { success: false, message: 'يرجى إدخال مبلغ دفع صحيح أكبر من صفر' };
    }

    const targetInvoice = data.invoice_id ? invoices.find((i) => i.id === data.invoice_id) : undefined;
    const paymentNumber = `PAY-2026-${String(payments.length + 1).padStart(3, '0')}`;
    const paymentDate = data.payment_date || getTodayDateString();
    const today = getTodayDateString();

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      payment_number: paymentNumber,
      customer_id: customer.id,
      customer_name: customer.customer_name,
      invoice_id: targetInvoice?.id,
      invoice_number: targetInvoice?.invoice_number,
      amount: data.amount,
      payment_method: data.payment_method,
      payment_date: paymentDate,
      reference_number: data.reference_number,
      notes: data.notes,
      receipt_attachment: data.receipt_attachment,
      created_at: new Date().toISOString(),
    };

    // Update invoice(s)
    if (targetInvoice) {
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id !== targetInvoice.id) return inv;
          const newPaid = inv.paid_amount + data.amount;
          const newRemaining = Math.max(0, inv.total_amount - newPaid);
          let newStatus: InvoiceStatus = 'مستحق';
          if (newRemaining <= 0) {
            newStatus = 'مسدد';
          } else if (newPaid > 0) {
            newStatus = 'مسدد جزئيًا';
          } else if (inv.due_date < today) {
            newStatus = 'متأخر';
          }
          return {
            ...inv,
            paid_amount: newPaid,
            remaining_amount: newRemaining,
            status: newStatus,
          };
        })
      );
    } else {
      // Apply against oldest unpaid invoices of this customer
      let remainingPaymentToApply = data.amount;
      setInvoices((prev) => {
        const customerInvoices = prev
          .filter((i) => i.customer_id === customer.id && i.remaining_amount > 0)
          .sort((a, b) => a.due_date.localeCompare(b.due_date));

        return prev.map((inv) => {
          if (!customerInvoices.some((ci) => ci.id === inv.id) || remainingPaymentToApply <= 0) {
            return inv;
          }
          const applyAmount = Math.min(inv.remaining_amount, remainingPaymentToApply);
          remainingPaymentToApply -= applyAmount;
          const newPaid = inv.paid_amount + applyAmount;
          const newRemaining = Math.max(0, inv.total_amount - newPaid);
          const newStatus: InvoiceStatus = newRemaining <= 0 ? 'مسدد' : 'مسدد جزئيًا';
          return {
            ...inv,
            paid_amount: newPaid,
            remaining_amount: newRemaining,
            status: newStatus,
          };
        });
      });
    }

    setPayments((prev) => [newPayment, ...prev]);
    showNotification(`تم تسجيل الدفعة ${paymentNumber} بمبلغ ${data.amount} ر.س بنجاح`);
    return { success: true, message: 'تم تسجيل الدفعة بنجاح', payment: newPayment };
  };

  const deletePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
    showNotification('تم حذف الدفعة بنجاح', 'info');
  };

  const getCustomerAccountSummary = (customerId: string): CustomerAccountSummary => {
    const customer = customers.find((c) => c.id === customerId) || {
      id: customerId,
      customer_name: 'عميل غير محدد',
      customer_identifier: '-',
      mobile: '-',
      location: '-',
      created_at: '',
    };

    const custDeliveries = deliveries.filter(
      (d) => d.customer_id === customer.id || d.mobile === customer.mobile
    );
    const totalDeliveriesValue = custDeliveries.reduce((sum, d) => sum + d.price, 0);

    const custInvoices = invoices.filter((i) => i.customer_id === customer.id);
    const totalInvoiced = custInvoices.reduce((sum, i) => sum + i.total_amount, 0);

    const custPayments = payments.filter((p) => p.customer_id === customer.id);
    const totalPaymentsMade = custPayments.reduce((sum, p) => sum + p.amount, 0);

    // Uninvoiced deliveries
    const uninvoiced = custDeliveries.filter((d) => !invoicedDeliveryIds.has(d.id));
    const uninvoicedCashPaid = uninvoiced
      .filter((d) => d.payment_method === 'كاش')
      .reduce((sum, d) => sum + d.price, 0);
    const uninvoicedDeferredRemaining = uninvoiced
      .filter((d) => d.payment_method === 'آجل')
      .reduce((sum, d) => sum + d.price, 0);

    // Total paid = recorded payments + cash paid on uninvoiced deliveries
    const totalPaid = totalPaymentsMade + uninvoicedCashPaid;

    // Total deferred deliveries (all deferred supplies in customer history)
    const totalDeferred = custDeliveries
      .filter((d) => d.payment_method === 'آجل')
      .reduce((sum, d) => sum + d.price, 0);

    // Remaining balance = remaining on invoices + remaining on uninvoiced deferred supplies
    const invoicesRemaining = custInvoices.reduce((sum, i) => sum + i.remaining_amount, 0);
    const remainingAmount = invoicesRemaining + uninvoicedDeferredRemaining;

    // Last payment
    const sortedPayments = [...custPayments].sort((a, b) => b.payment_date.localeCompare(a.payment_date));
    const lastPaymentAmount = sortedPayments.length > 0 ? sortedPayments[0].amount : undefined;
    const lastPaymentDate = sortedPayments.length > 0 ? sortedPayments[0].payment_date : undefined;

    // Oldest due date of unpaid invoices
    const today = getTodayDateString();
    const unpaidInvoices = custInvoices.filter((i) => i.remaining_amount > 0);
    const sortedUnpaidInvoices = [...unpaidInvoices].sort((a, b) => a.due_date.localeCompare(b.due_date));
    const oldestDueDate = sortedUnpaidInvoices.length > 0 ? sortedUnpaidInvoices[0].due_date : undefined;

    // Status: مسدد (Green), مستحق (Orange), متأخر (Red)
    let status: 'مسدد' | 'مستحق' | 'متأخر' = 'مسدد';
    if (remainingAmount <= 0) {
      status = 'مسدد';
    } else {
      const hasOverdue = unpaidInvoices.some((i) => i.due_date < today);
      status = hasOverdue ? 'متأخر' : 'مستحق';
    }

    return {
      customer,
      deliveriesCount: custDeliveries.length,
      totalDeliveriesValue,
      totalInvoiced,
      totalPaid,
      totalDeferred,
      remainingAmount,
      lastPaymentAmount,
      lastPaymentDate,
      oldestDueDate,
      status,
      invoicesCount: custInvoices.length,
      unpaidInvoicesCount: unpaidInvoices.length,
    };
  };

  const allCustomersAccountSummaries = useMemo(() => {
    return customers.map((c) => getCustomerAccountSummary(c.id));
  }, [customers, deliveries, invoices, payments, invoicedDeliveryIds]);

  const getCustomerStatement = (customerId: string): AccountStatementMovement[] => {
    const custInvoices = invoices.filter((i) => i.customer_id === customerId);
    const custPayments = payments.filter((p) => p.customer_id === customerId);
    const custDeliveries = deliveries.filter((d) => d.customer_id === customerId || d.customer_name === customerId);

    const movements: AccountStatementMovement[] = [];

    // Add Invoices
    custInvoices.forEach((inv) => {
      movements.push({
        id: `stmt-inv-${inv.id}`,
        date: inv.issue_date,
        type: 'invoice',
        typeLabel: 'فاتورة توريد',
        referenceNumber: inv.invoice_number,
        description: `فاتورة رقم ${inv.invoice_number} (${inv.items.length} بنود توريد)`,
        debit: inv.total_amount,
        credit: 0,
        balance: 0, // will compute running balance below
        dueDate: inv.due_date,
        status: inv.status,
      });
    });

    // Add Payments
    custPayments.forEach((pay) => {
      movements.push({
        id: `stmt-pay-${pay.id}`,
        date: pay.payment_date,
        type: 'payment',
        typeLabel: 'دفعة مسددة',
        referenceNumber: pay.payment_number,
        description: pay.invoice_number
          ? `سداد للفاتورة ${pay.invoice_number} (${pay.payment_method})`
          : `سداد حساب (${pay.payment_method})`,
        debit: 0,
        credit: pay.amount,
        balance: 0,
        dueDate: undefined,
        status: 'مسدد',
      });
    });

    // Add uninvoiced deferred deliveries
    const uninvoicedDeliveries = custDeliveries.filter((d) => !invoicedDeliveryIds.has(d.id));
    uninvoicedDeliveries.forEach((del) => {
      if (del.payment_method === 'آجل') {
        movements.push({
          id: `stmt-del-${del.id}`,
          date: del.supply_date,
          type: 'invoice',
          typeLabel: 'توريد آجل غير مفوتر',
          referenceNumber: `DEL-${del.sequence_num}`,
          description: `توريد ${del.supply_type} ${del.tank_capacity} - ${del.driver_name}`,
          debit: del.price,
          credit: 0,
          balance: 0,
          dueDate: del.supply_date,
          status: 'مستحق',
        });
      }
    });

    // Sort chronologically ascending
    movements.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate running balance
    let currentBalance = 0;
    movements.forEach((m) => {
      currentBalance += m.debit - m.credit;
      m.balance = currentBalance;
    });

    // Return in reverse chronological order (newest first) for UI presentation
    return movements.reverse();
  };

  const getAccountsFinancialMetrics = (filter: AccountsFilterState = accountsFilter) => {
    const { startDate, endDate } = getDateRangeForAccountsPeriod(
      filter.period,
      filter.customStartDate,
      filter.customEndDate
    );

    // Invoices issued in period
    const inPeriodInvoices = invoices.filter((i) => {
      if (filter.period === 'today') return i.issue_date === startDate;
      return i.issue_date >= startDate && i.issue_date <= endDate;
    });
    const totalInvoiced = inPeriodInvoices.reduce((sum, i) => sum + i.total_amount, 0);

    // Payments in period
    const inPeriodPayments = payments.filter((p) => {
      if (filter.period === 'today') return p.payment_date === startDate;
      return p.payment_date >= startDate && p.payment_date <= endDate;
    });
    const totalCollected = inPeriodPayments.reduce((sum, p) => sum + p.amount, 0);

    // Total outstanding balance across all customers
    const totalRemaining = allCustomersAccountSummaries.reduce((sum, c) => sum + c.remainingAmount, 0);
    const customersWithDueCount = allCustomersAccountSummaries.filter((c) => c.remainingAmount > 0).length;

    return {
      totalInvoiced,
      totalCollected,
      totalRemaining,
      customersWithDueCount,
    };
  };

  // ==========================================
  // Online Customer Orders Actions
  // ==========================================

  const addCustomerOrder = useCallback((data: {
    customer_name: string;
    mobile: string;
    supply_type: string;
    tank_capacity: string;
    location: string;
    google_maps_url?: string;
  }): CustomerOrder => {
    const now = new Date();
    
    // Generate order number in format: N-YY-MM-DD-XXX (e.g. N-26-09-15-001)
    let yy = '';
    let mm = '';
    let dd = '';
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Riyadh',
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(now);
      yy = parts.find((p) => p.type === 'year')?.value || '';
      mm = parts.find((p) => p.type === 'month')?.value || '';
      dd = parts.find((p) => p.type === 'day')?.value || '';
    } catch (_) {}

    if (!yy) yy = String(now.getFullYear()).slice(-2);
    if (!mm) mm = String(now.getMonth() + 1).padStart(2, '0');
    if (!dd) dd = String(now.getDate()).padStart(2, '0');

    yy = yy.padStart(2, '0').slice(-2);
    mm = mm.padStart(2, '0');
    dd = dd.padStart(2, '0');

    const prefix = `N-${yy}-${mm}-${dd}-`;

    let maxSeq = 0;
    try {
      customerOrders.forEach((o) => {
        if (o.order_number && o.order_number.startsWith(prefix)) {
          const seqPart = o.order_number.slice(prefix.length);
          const parsed = parseInt(seqPart, 10);
          if (!isNaN(parsed) && parsed > maxSeq) {
            maxSeq = parsed;
          }
        }
      });
    } catch (_) {}

    const orderNumber = `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;

    let formattedTime = '';
    try {
      formattedTime = new Intl.DateTimeFormat('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(now);
    } catch {
      formattedTime = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    }

    const newOrder: CustomerOrder = {
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      order_number: orderNumber,
      customer_name: data.customer_name.trim(),
      mobile: data.mobile.trim(),
      supply_type: data.supply_type.trim(),
      tank_capacity: data.tank_capacity.trim(),
      location: data.location.trim(),
      google_maps_url: data.google_maps_url,
      status: 'بانتظار الموافقة',
      created_at: now.toISOString(),
      created_date: getTodayDateString(),
      created_time: formattedTime,
    };

    setCustomerOrders((prev) => {
      // Guard against accidental duplicates with the exact same details within 5 seconds
      const isDuplicate = prev.some(
        (o) =>
          o.customer_name === newOrder.customer_name &&
          o.mobile === newOrder.mobile &&
          Math.abs(new Date(o.created_at).getTime() - now.getTime()) < 4000
      );
      if (isDuplicate) {
        return prev;
      }

      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOMER_ORDERS, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist customer order', e);
      }
      return updated;
    });

    showNotification(`تم تسجيل طلب توريد جديد برقم #${orderNumber} بنجاح!`, 'success');
    return newOrder;
  }, [customerOrders, showNotification]);

  const updateCustomerOrderStatus = useCallback((orderId: string, status: CustomerOrderStatus) => {
    const now = new Date();
    let currentFormattedDateTime = '';
    try {
      const datePart = new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }).format(now);
      const timePart = new Intl.DateTimeFormat('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(now);
      currentFormattedDateTime = `${datePart} ${timePart}`;
    } catch {
      currentFormattedDateTime = now.toLocaleString('ar-SA');
    }

    setCustomerOrders((prev) => {
      let targetOrder: CustomerOrder | undefined;
      const updated = prev.map((order) => {
        if (order.id !== orderId) return order;
        targetOrder = order;

        if (status === 'مقبول') {
          return {
            ...order,
            status,
            accepted_at: currentFormattedDateTime,
            cancelled_at: undefined,
          };
        } else if (status === 'ملغي') {
          return {
            ...order,
            status,
            cancelled_at: currentFormattedDateTime,
            accepted_at: undefined,
          };
        }
        return {
          ...order,
          status,
        };
      });

      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOMER_ORDERS, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update customer order in localStorage', e);
      }

      if (targetOrder) {
        const orderLabel = targetOrder.order_number.startsWith('N-')
          ? targetOrder.order_number
          : `#${targetOrder.order_number}`;
        showNotification(
          status === 'مقبول'
            ? `تم قبول طلب التوريد رقم ${orderLabel}`
            : `تم إلغاء طلب التوريد رقم ${orderLabel}`,
          status === 'مقبول' ? 'success' : 'info'
        );
      }

      return updated;
    });
  }, [showNotification]);

  const deleteCustomerOrder = useCallback((orderId: string) => {
    setCustomerOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOMER_ORDERS, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to remove customer order', e);
      }
      return updated;
    });
    showNotification('تم حذف الطلب', 'info');
  }, [showNotification]);

  const clearAllCustomerOrders = useCallback(() => {
    setCustomerOrders([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.CUSTOMER_ORDERS);
    } catch (e) {
      console.error('Failed to clear customer orders', e);
    }
    showNotification('تم حذف وتصفير جميع طلبات التوريد بنجاح', 'info');
  }, [showNotification]);

  const pendingOrdersCount = useMemo(() => {
    return customerOrders.filter((o) => o.status === 'بانتظار الموافقة').length;
  }, [customerOrders]);

  const resetToDefaultData = () => {
    clearAllData();
  };

  return (
    <WaterDataContext.Provider
      value={{
        deliveries,
        customers,
        drivers,
        vehicles,
        desalinationTransactions,
        fuelTransactions,
        vehicleExpenses,
        priceConfig,
        filterState,
        setFilterState,
        activeTab,
        setActiveTab,
        goBack,
        canGoBack,
        selectedCustomerForRecord,
        setSelectedCustomerForRecord,
        openCustomerRecordById,
        dashboardMetrics,
        filteredDeliveries,
        selectedVehicleId,
        setSelectedVehicleId,
        operationsFilter,
        setOperationsFilter,
        getVehicleFinancialSummary,
        fleetFinancialSummaries,
        addDelivery,
        updateDelivery,
        deleteDelivery,
        clearAllDeliveries,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        clearAllCustomers,
        clearAllData,
        findCustomerByPhoneOrIdentifier,
        generateNewCustomerIdentifier,
        addDriver,
        updateDriver,
        deleteDriver,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addDesalinationTransaction,
        updateDesalinationTransaction,
        deleteDesalinationTransaction,
        addFuelTransaction,
        updateFuelTransaction,
        deleteFuelTransaction,
        addVehicleExpense,
        updateVehicleExpense,
        deleteVehicleExpense,
        updatePriceConfig,
        resetToDefaultData,
        invoices,
        payments,
        accountsFilter,
        setAccountsFilter,
        selectedAccountsCustomerId,
        setSelectedAccountsCustomerId,
        addInvoice,
        deleteInvoice,
        addPayment,
        deletePayment,
        getUninvoicedDeliveries,
        getCustomerAccountSummary,
        allCustomersAccountSummaries,
        getCustomerStatement,
        getAccountsFinancialMetrics,
        customerOrders,
        pendingOrdersCount,
        addCustomerOrder,
        updateCustomerOrderStatus,
        deleteCustomerOrder,
        clearAllCustomerOrders,
        authenticatedDriver,
        loginDriver,
        logoutDriver,
        documentDelivery,
        updateDeliveryOrderStatus,
        getDriverDeliveries,
        getDriverStats,
        notification,
        showNotification,
      }}
    >
      {children}
    </WaterDataContext.Provider>
  );
};

export const useWaterData = () => {
  const context = useContext(WaterDataContext);
  if (!context) {
    throw new Error('useWaterData must be used within a WaterDataProvider');
  }
  return context;
};

import React from 'react';
import CustomerProfileView from './customer-profile/CustomerProfileView';

interface CustomerRecordViewProps {
  onOpenInvoice?: (customer: any, deliveries: any[]) => void;
  onOpenPaymentReminder?: (customer: any, pendingAmount: number) => void;
  onClose?: () => void;
}

export const CustomerRecordView: React.FC<CustomerRecordViewProps> = ({ onClose }) => {
  return <CustomerProfileView onClose={onClose} />;
};

export default CustomerRecordView;

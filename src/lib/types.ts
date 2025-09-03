// Shared invoice action types to ensure consistency across the application
export type InvoiceAction = 'submit' | 'trash';

// Status types for different contexts
export type InvoiceStatus = 'pending' | 'submitted' | 'approved' | 'rejected';
export type UserAction = 'none' | 'submitted' | 'trashed';
export type SupplierAction = 'none' | 'submitted' | 'trashed';

// Base invoice interface
export interface Invoice {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  userAction?: UserAction;
  supplierAction?: SupplierAction;
  description: string;
  dueDate?: string;
}
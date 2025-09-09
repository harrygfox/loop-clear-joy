// Unified invoice types for the clearing system
export type InclusionStatus = 'included' | 'excluded';
export type ExclusionReason = 'by_system' | 'by_supplier' | 'by_customer' | null;
export type InvoiceDirection = 'sent' | 'received';
export type InvoiceStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export interface Invoice {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  description: string;
  dueDate?: string;
  issuedAt: string;
  direction: InvoiceDirection;
  matched: boolean;
  inclusion: InclusionStatus;
  exclusionReason?: ExclusionReason;
  counterpartySubmitted?: boolean;
}

export interface CycleSubmission {
  version: number;
  submittedIds: Set<string>;
  submittedAt: string;
}

export interface CycleInfo {
  start: Date;
  end: Date;
  dayIndex: number;
  daysRemaining: number;
  cutoffAt: Date;
}

// Legacy types for backward compatibility
export type InvoiceAction = 'submit' | 'reject' | 'unsubmit';
export type UserAction = 'none' | 'submitted' | 'rejected';
export type SupplierAction = 'none' | 'submitted' | 'rejected';
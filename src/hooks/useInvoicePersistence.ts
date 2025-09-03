import { useState, useEffect } from 'react';
import { Invoice, UserAction, SupplierAction } from '@/types/invoice';
import { getAllInvoices, MockInvoice } from '@/data/mockInvoices';

// Types for persisted state
interface InvoiceState {
  id: string;
  userAction: UserAction;
  supplierAction: SupplierAction;
}

interface PersistedInvoiceData {
  invoiceStates: Record<string, InvoiceState>;
  timestamp: number;
}

const STORAGE_KEY = 'localloop_invoice_states';

// Initialize default states from mock data
const initializeDefaultStates = (): Record<string, InvoiceState> => {
  const invoices = getAllInvoices();
  const states: Record<string, InvoiceState> = {};
  
  invoices.forEach(invoice => {
    states[invoice.id] = {
      id: invoice.id,
      userAction: invoice.userAction === 'rejected' ? 'trashed' : (invoice.userAction as UserAction),
      supplierAction: invoice.supplierAction === 'rejected' ? 'submitted' : (invoice.supplierAction as SupplierAction),
    };
  });
  
  return states;
};

export const useInvoicePersistence = () => {
  const [invoiceStates, setInvoiceStates] = useState<Record<string, InvoiceState>>(() => {
    // Try to load from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: PersistedInvoiceData = JSON.parse(stored);
        return parsed.invoiceStates;
      }
    } catch (error) {
      console.warn('Failed to load invoice states from localStorage:', error);
    }
    
    // Fall back to default states
    return initializeDefaultStates();
  });

  // Save to localStorage whenever states change
  useEffect(() => {
    try {
      const dataToStore: PersistedInvoiceData = {
        invoiceStates,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.warn('Failed to save invoice states to localStorage:', error);
    }
  }, [invoiceStates]);

  // Get all invoices with current persistent state applied
  const getInvoicesWithState = (): Invoice[] => {
    const baseInvoices = getAllInvoices();
    
    return baseInvoices.map(invoice => {
      const state = invoiceStates[invoice.id];
      if (state) {
        return {
          id: invoice.id,
          from: invoice.from,
          to: invoice.to,
          amount: invoice.amount,
          currency: invoice.currency,
          status: invoice.status,
          userAction: state.userAction,
          supplierAction: state.supplierAction,
          description: invoice.description,
          dueDate: invoice.dueDate,
        } as Invoice;
      }
      // Convert MockInvoice to Invoice
      return {
        id: invoice.id,
        from: invoice.from,
        to: invoice.to,
        amount: invoice.amount,
        currency: invoice.currency,
        status: invoice.status,
        userAction: invoice.userAction === 'rejected' ? 'trashed' : (invoice.userAction as UserAction),
        supplierAction: invoice.supplierAction === 'rejected' ? 'submitted' : (invoice.supplierAction as SupplierAction),
        description: invoice.description,
        dueDate: invoice.dueDate,
      } as Invoice;
    });
  };

  // Update a specific invoice's state
  const updateInvoiceState = (
    invoiceId: string, 
    updates: Partial<Pick<InvoiceState, 'userAction' | 'supplierAction'>>
  ) => {
    setInvoiceStates(prev => ({
      ...prev,
      [invoiceId]: {
        ...prev[invoiceId],
        ...updates,
      }
    }));
  };

  // Submit an invoice for clearing
  const submitInvoice = (invoiceId: string) => {
    updateInvoiceState(invoiceId, { userAction: 'submitted' });
  };

  // Reject an invoice
  const rejectInvoice = (invoiceId: string) => {
    updateInvoiceState(invoiceId, { userAction: 'trashed' });
  };

  // Unsubmit an invoice (return to pending)
  const unsubmitInvoice = (invoiceId: string) => {
    updateInvoiceState(invoiceId, { userAction: 'none' });
  };

  // Get invoices that are ready for clearing (both parties submitted)
  const getClearingInvoices = (): Invoice[] => {
    return getInvoicesWithState().filter(invoice => 
      invoice.userAction === 'submitted' && 
      invoice.supplierAction === 'submitted'
    );
  };

  // Reset all states to default (for testing)
  const resetAllStates = () => {
    setInvoiceStates(initializeDefaultStates());
  };

  // Clear localStorage (called on hard reload)
  const clearPersistedState = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear persisted state:', error);
    }
  };

  return {
    getInvoicesWithState,
    updateInvoiceState,
    submitInvoice,
    rejectInvoice,
    unsubmitInvoice,
    getClearingInvoices,
    resetAllStates,
    clearPersistedState,
  };
};
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Invoice, UserAction, SupplierAction } from '@/types/invoice';
import { getAllInvoices, MockInvoice } from '@/data/mockInvoices';

interface InvoiceState {
  id: string;
  userAction: UserAction;
  supplierAction: SupplierAction;
}

interface InvoiceStore {
  // Selectors
  getAllInvoices: () => Invoice[];
  getReceivedInvoices: () => Invoice[];
  getSentInvoices: () => Invoice[];
  getClearingInvoices: () => Invoice[];
  getInvoiceById: (id: string) => Invoice | undefined;
  
  // Actions
  submitInvoice: (id: string) => void;
  rejectInvoice: (id: string) => void;
  unsubmitInvoice: (id: string) => void;
}

const InvoiceStoreContext = createContext<InvoiceStore | undefined>(undefined);

// Initialize invoice states from mock data
const initializeInvoiceStates = (): Record<string, InvoiceState> => {
  const invoices = getAllInvoices();
  const states: Record<string, InvoiceState> = {};
  
  invoices.forEach(invoice => {
    states[invoice.id] = {
      id: invoice.id,
      userAction: invoice.userAction === 'rejected' ? 'none' : (invoice.userAction as UserAction),
      supplierAction: invoice.supplierAction === 'rejected' ? 'submitted' : (invoice.supplierAction as SupplierAction),
    };
  });
  
  return states;
};

export const InvoiceStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [invoiceStates, setInvoiceStates] = useState<Record<string, InvoiceState>>(
    initializeInvoiceStates
  );

  // Helper to convert MockInvoice to Invoice with current state
  const transformInvoice = (mockInvoice: MockInvoice): Invoice => {
    const state = invoiceStates[mockInvoice.id];
    
    return {
      id: mockInvoice.id,
      from: mockInvoice.from,
      to: mockInvoice.to,
      amount: mockInvoice.amount,
      currency: mockInvoice.currency,
      status: mockInvoice.status,
      userAction: state?.userAction || (mockInvoice.userAction === 'rejected' ? 'none' : mockInvoice.userAction as UserAction),
      supplierAction: state?.supplierAction || (mockInvoice.supplierAction === 'rejected' ? 'submitted' : mockInvoice.supplierAction as SupplierAction),
      description: mockInvoice.description,
      dueDate: mockInvoice.dueDate,
    };
  };

  const store: InvoiceStore = {
    getAllInvoices: () => {
      return getAllInvoices().map(transformInvoice);
    },

    getReceivedInvoices: () => {
      return getAllInvoices()
        .filter(invoice => invoice.from !== 'Your Business')
        .map(transformInvoice);
    },

    getSentInvoices: () => {
      return getAllInvoices()
        .filter(invoice => invoice.from === 'Your Business')
        .map(transformInvoice);
    },

    getClearingInvoices: () => {
      return getAllInvoices()
        .map(transformInvoice)
        .filter(invoice => 
          invoice.userAction === 'submitted' && 
          invoice.supplierAction === 'submitted'
        );
    },

    getInvoiceById: (id: string) => {
      const mockInvoice = getAllInvoices().find(inv => inv.id === id);
      return mockInvoice ? transformInvoice(mockInvoice) : undefined;
    },

    submitInvoice: (id: string) => {
      setInvoiceStates(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          userAction: 'submitted'
        }
      }));
    },

    rejectInvoice: (id: string) => {
      setInvoiceStates(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          userAction: 'none'
        }
      }));
    },

    unsubmitInvoice: (id: string) => {
      setInvoiceStates(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          userAction: 'none'
        }
      }));
    }
  };

  return (
    <InvoiceStoreContext.Provider value={store}>
      {children}
    </InvoiceStoreContext.Provider>
  );
};

export const useInvoiceStore = (): InvoiceStore => {
  const context = useContext(InvoiceStoreContext);
  if (!context) {
    throw new Error('useInvoiceStore must be used within an InvoiceStoreProvider');
  }
  return context;
};
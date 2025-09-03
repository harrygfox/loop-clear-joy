import React, { useState } from 'react';
import CustomerGroup from '@/components/CustomerGroup';
import SubmitModal from '@/components/SubmitModal';
import UndoSnackbar from '@/components/UndoSnackbar';
import ViewSegmentedControl from '@/components/ViewSegmentedControl';
import { InvoiceAction } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

type SentInvoice = {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  status: 'pending';
  userAction: 'none' | 'submitted' | 'rejected';
  supplierAction: 'none' | 'submitted' | 'rejected';
  description: string;
  dueDate?: string;
};

interface SentPageProps {
  currentView?: string;
  onClearingBounce?: () => void;
}

const SentPage: React.FC<SentPageProps> = ({ currentView, onClearingBounce }) => {
  const [activeView, setActiveView] = useState<'need-action' | 'awaiting-customer' | 'rejected'>(
    (currentView as 'need-action' | 'awaiting-customer' | 'rejected') || 'need-action'
  );
  const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});
  const [submitModal, setSubmitModal] = useState<{ isOpen: boolean; invoice: any }>({
    isOpen: false,
    invoice: null
  });
  const [undoSnackbar, setUndoSnackbar] = useState<{ 
    isVisible: boolean; 
    message: string; 
    action: { invoiceId: string; action: string } | null 
  }>({
    isVisible: false,
    message: '',
    action: null
  });

  // Mock data for sent invoices with proper user/customer actions
  const [sentInvoices, setSentInvoices] = useState<SentInvoice[]>([
    // Client Corp (3 invoices)
    {
      id: '1',
      from: 'Your Business',
      to: 'Client Corp',
      amount: 3500.00,
      currency: 'GBP',
      status: 'pending' as const,
      userAction: 'none' as const,
      supplierAction: 'none' as const,
      dueDate: '2024-09-08',
      description: 'Web development project'
    },
    {
      id: '2',
      from: 'Your Business',
      to: 'Client Corp',
      amount: 1800.00,
      currency: 'GBP',
      status: 'pending' as const,
      userAction: 'submitted' as const,
      supplierAction: 'none' as const,
      dueDate: '2024-09-06',
      description: 'Consulting services'
    },
    {
      id: '3',
      from: 'Your Business',
      to: 'Client Corp',
      amount: 2200.00,
      currency: 'GBP',
      status: 'pending' as const,
      userAction: 'none' as const,
      supplierAction: 'submitted' as const,
      dueDate: '2024-09-05',
      description: 'Mobile app development'
    },
    // Startup Inc (2 invoices)
    {
      id: '4',
      from: 'Your Business',
      to: 'Startup Inc',
      amount: 950.00,
      currency: 'GBP',
      status: 'pending' as const,
      userAction: 'none' as const,
      supplierAction: 'none' as const,
      dueDate: '2024-09-10',
      description: 'Digital marketing setup'
    },
    {
      id: '5',
      from: 'Your Business',
      to: 'Startup Inc',
      amount: 1200.00,
      currency: 'GBP',
      status: 'pending' as const,
      userAction: 'submitted' as const,
      supplierAction: 'submitted' as const,
      dueDate: '2024-09-12',
      description: 'SEO optimization'
    },
    // Tech Co (2 invoices - one rejected)
    {
      id: '6',
      from: 'Your Business',
      to: 'Tech Co',
      amount: 800.00,
      currency: 'GBP',
      status: 'pending' as const,
      userAction: 'rejected' as const,
      supplierAction: 'none' as const,
      dueDate: '2024-09-15',
      description: 'Software maintenance (rejected)'
    },
    {
      id: '7',
      from: 'Your Business',
      to: 'Tech Co',
      amount: 1500.00,
      currency: 'GBP',
      status: 'pending' as const,
      userAction: 'none' as const,
      supplierAction: 'none' as const,
      dueDate: '2024-09-18',
      description: 'System integration'
    }
  ]);

  // Filter invoices based on active view
  const getFilteredInvoices = () => {
    switch (activeView) {
      case 'need-action':
        return sentInvoices.filter(inv => inv.userAction === 'none');
      case 'awaiting-customer':
        return sentInvoices.filter(inv => inv.userAction === 'submitted' && inv.supplierAction === 'none');
      case 'rejected':
        return sentInvoices.filter(inv => inv.userAction === 'rejected' || inv.supplierAction === 'rejected');
      default:
        return sentInvoices.filter(inv => inv.userAction === 'none');
    }
  };

  const filteredInvoices = getFilteredInvoices();

  // Group filtered invoices by customer
  const groupInvoicesByCustomer = (invoiceList: any[]) => {
    const grouped: Record<string, any[]> = {};
    invoiceList.forEach(invoice => {
      if (!grouped[invoice.to]) {
        grouped[invoice.to] = [];
      }
      grouped[invoice.to].push(invoice);
    });
    return grouped;
  };

  const groupedInvoices = groupInvoicesByCustomer(filteredInvoices);

  const handleInvoiceAction = (id: string, action: 'submit' | 'reject') => {
    const invoice = sentInvoices.find(inv => inv.id === id);
    if (!invoice) return;

    // Individual actions are now immediate - no modal
    if (action === 'submit') {
      setSentInvoices(prev => prev.map(inv => 
        inv.id === id 
          ? { ...inv, userAction: 'submitted' as const }
          : inv
      ));
      
      setUndoSnackbar({
        isVisible: true,
        message: 'Invoice submitted',
        action: { invoiceId: id, action: 'submit' }
      });
      
      // Trigger clearing bounce for sent invoices too
      if (onClearingBounce) {
        onClearingBounce();
      }
      
      toast({
        title: "Invoice submitted to Clearing",
        description: `£${invoice.amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to ${invoice.to}`,
        duration: 3000,
      });
    } else {
      // Handle trash action immediately
      setSentInvoices(prev => prev.filter(inv => inv.id !== id));
      setUndoSnackbar({
        isVisible: true,
        message: 'Invoice rejected',
        action: { invoiceId: id, action: 'reject' }
      });
    }
  };

  const handleSubmitConfirm = (createRule: boolean) => {
    if (!submitModal.invoice) return;
    
    const invoice = submitModal.invoice;
    
    if (invoice.isBulk) {
      // Handle bulk action - get all invoices from customer that need action
      const customerInvoices = sentInvoices.filter(inv => inv.to === invoice.customerName && inv.userAction === 'none');
      
      if (invoice.action === 'reject') {
        // Bulk reject
        setSentInvoices(prev => prev.filter(inv => !customerInvoices.find(ci => ci.id === inv.id)));
        setUndoSnackbar({
          isVisible: true,
          message: `${customerInvoices.length} invoices rejected${createRule ? ' with rule created' : ''}`,
          action: { invoiceId: 'bulk', action: 'reject' }
        });
      } else {
        // Bulk submit
        setSentInvoices(prev => prev.map(inv => 
          customerInvoices.find(ci => ci.id === inv.id)
            ? { ...inv, userAction: 'submitted' as const }
            : inv
        ));
        setUndoSnackbar({
          isVisible: true,
          message: `${customerInvoices.length} invoices submitted${createRule ? ' with rule created' : ''}`,
          action: { invoiceId: 'bulk', action: 'submit' }
        });
      }
    }

    setSubmitModal({ isOpen: false, invoice: null });
  };

  const handleBulkAction = (customerName: string, action: InvoiceAction) => {
    // Get all invoices from this customer that need action (userAction === 'none')
    const customerInvoices = sentInvoices.filter(inv => inv.to === customerName && inv.userAction === 'none');
    
    if (customerInvoices.length > 0) {
      setSubmitModal({ 
        isOpen: true, 
        invoice: { 
          ...customerInvoices[0], 
          isBulk: true, 
          customerName, 
          action: action === 'reject' ? 'reject' : undefined 
        } 
      });
    }
  };

  const toggleCustomer = (customerName: string) => {
    setExpandedCustomers(prev => ({
      ...prev,
      [customerName]: !prev[customerName]
    }));
  };

  const handleUndo = () => {
    if (undoSnackbar.action) {
      // Implement undo logic here
      console.log('Undo action:', undoSnackbar.action);
    }
    setUndoSnackbar({ isVisible: false, message: '', action: null });
  };

  return (
    <div className="pb-20 px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Sent Invoices
        </h1>
        <p className="text-muted-foreground mb-4">
          Track and manage invoices you've sent to customers
        </p>
        
        {/* On-page explainers */}
        <div className="space-y-2 mb-6 p-4 bg-muted/10 border border-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            The more invoices you both submit for clearing, the more chance you have of reducing outgoings.
          </p>
          <p className="text-sm text-muted-foreground">
            Swipe right to submit for clearing. Swipe left to reject.
          </p>
        </div>
      </div>

      {/* View Segmented Control */}
      <ViewSegmentedControl
        views={[
          {
            id: 'need-action',
            label: 'Need Action',
            count: sentInvoices.filter(inv => inv.userAction === 'none').length
          },
          {
            id: 'awaiting-customer',
            label: 'Awaiting Customer',
            count: sentInvoices.filter(inv => inv.userAction === 'submitted' && inv.supplierAction === 'none').length
          },
          {
            id: 'rejected',
            label: 'Rejected',
            count: sentInvoices.filter(inv => inv.userAction === 'rejected' || inv.supplierAction === 'rejected').length
          }
        ]}
        activeView={activeView}
        onViewChange={(viewId) => setActiveView(viewId as 'need-action' | 'awaiting-customer' | 'rejected')}
      />

      {/* Invoices Grouped by Customer */}
      <div className="space-y-4">
        {Object.entries(groupedInvoices).map(([customerName, customerInvoices]) => (
          <CustomerGroup
            key={customerName}
            customerName={customerName}
            invoices={customerInvoices}
            isExpanded={expandedCustomers[customerName] ?? true}
            onToggle={() => toggleCustomer(customerName)}
            onBulkAction={(action) => handleBulkAction(customerName, action)}
            onInvoiceAction={handleInvoiceAction}
          />
        ))}
      </div>

      {Object.keys(groupedInvoices).length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No invoices found
          </h3>
          <p className="text-muted-foreground">
            You're all caught up!
          </p>
        </div>
      )}

      {/* Submit Modal - Only for bulk actions */}
      <SubmitModal
        isOpen={submitModal.isOpen}
        onClose={() => setSubmitModal({ isOpen: false, invoice: null })}
        onSubmit={handleSubmitConfirm}
        invoice={submitModal.invoice}
        mode="sent"
      />

      {/* Undo Snackbar */}
      <UndoSnackbar
        isVisible={undoSnackbar.isVisible}
        message={undoSnackbar.message}
        onUndo={handleUndo}
        onDismiss={() => setUndoSnackbar({ isVisible: false, message: '', action: null })}
      />
    </div>
  );
};

export default SentPage;
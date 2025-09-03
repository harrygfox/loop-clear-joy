import React, { useState, useEffect } from 'react';
import CustomerGroup from '@/components/CustomerGroup';
import SubmitModal from '@/components/SubmitModal';
import UndoSnackbar from '@/components/UndoSnackbar';
import ViewSegmentedControl from '@/components/ViewSegmentedControl';
import { InvoiceAction } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useInvoiceStore } from '@/context/InvoiceStore';
import { Invoice } from '@/types/invoice';

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

  const { getSentInvoices, submitInvoice, rejectInvoice } = useInvoiceStore();

  // Get sent invoices from store
  const sentInvoices = getSentInvoices();

  // Filter invoices based on active view
  const getFilteredInvoices = () => {
    switch (activeView) {
      case 'need-action':
        return sentInvoices.filter(inv => inv.userAction === 'none' && inv.supplierAction !== 'submitted');
      case 'awaiting-customer':
        return sentInvoices.filter(inv => inv.userAction === 'submitted' && inv.supplierAction === 'none');
      case 'rejected':
        return sentInvoices.filter(inv => inv.userAction === 'none' && inv.supplierAction === 'submitted');
      default:
        return sentInvoices.filter(inv => inv.userAction === 'none' && inv.supplierAction !== 'submitted');
    }
  };

  // Group invoices by customer
  const groupInvoicesByCustomer = () => {
    const filteredInvoices = getFilteredInvoices();
    const grouped = filteredInvoices.reduce((acc, invoice) => {
      const customerName = invoice.to;
      if (!acc[customerName]) {
        acc[customerName] = [];
      }
      acc[customerName].push(invoice);
      return acc;
    }, {} as Record<string, Invoice[]>);
    return grouped;
  };

  const handleInvoiceAction = (id: string, action: InvoiceAction) => {
    const invoice = sentInvoices.find(inv => inv.id === id);
    if (!invoice) return;

    if (action === 'submit') {
      submitInvoice(id);
      
      // Check if counterparty already submitted
      const alreadySubmittedByCounterpart = invoice.supplierAction === 'submitted';
      
      if (alreadySubmittedByCounterpart) {
        toast({
          title: "Invoice Submitted",
          description: "Added to Clearing",
        });
        if (onClearingBounce) {
          onClearingBounce();
        }
      } else {
        toast({
          title: "Invoice Submitted",
          description: "Waiting for Customer",
        });
      }
    } else if (action === 'reject') {
      rejectInvoice(id);
      toast({
        title: "Invoice Rejected",
        description: "Invoice has been rejected.",
      });
    }

    // Show undo option
    setUndoSnackbar({
      isVisible: true,
      message: action === 'submit' ? 'Invoice submitted for clearing' : 'Invoice rejected',
      action: { invoiceId: id, action }
    });
  };

  const handleSubmitConfirm = (createRule: boolean) => {
    if (!submitModal.invoice) return;
    
    const invoice = submitModal.invoice;
    submitInvoice(invoice.id);
    
    // Check if counterparty already submitted
    const alreadySubmittedByCounterpart = invoice.supplierAction === 'submitted';
    
    if (alreadySubmittedByCounterpart) {
      toast({
        title: "Invoice Submitted",
        description: "Added to Clearing",
      });
      if (onClearingBounce) {
        onClearingBounce();
      }
    } else {
      toast({
        title: "Invoice Submitted", 
        description: "Waiting for Customer",
      });
    }

    setSubmitModal({ isOpen: false, invoice: null });
    setUndoSnackbar({
      isVisible: true,
      message: 'Invoice submitted for clearing',
      action: { invoiceId: invoice.id, action: 'submit' }
    });
  };

  const handleBulkAction = (customerName: string, action: InvoiceAction) => {
    const customerInvoices = groupInvoicesByCustomer()[customerName];
    if (customerInvoices && customerInvoices.length > 0) {
      setSubmitModal({
        isOpen: true,
        invoice: {
          ...customerInvoices[0],
          isCustomerGroup: true,
          customerName,
          invoiceCount: customerInvoices.length
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
      const { invoiceId, action } = undoSnackbar.action;
      if (action === 'submit') {
        // Unsubmit the invoice (revert to 'none')
        rejectInvoice(invoiceId); // This sets userAction to 'none' in our store
      } else if (action === 'reject') {
        // Un-reject the invoice (revert to 'none')
        rejectInvoice(invoiceId); // This sets userAction to 'none' in our store
      }
    }
    setUndoSnackbar({ isVisible: false, message: '', action: null });
  };

  useEffect(() => {
    if (currentView && ['need-action', 'awaiting-customer', 'rejected'].includes(currentView)) {
      setActiveView(currentView as 'need-action' | 'awaiting-customer' | 'rejected');
    }
  }, [currentView]);

  // Reset expanded state when active view changes to open all accordions by default
  useEffect(() => {
    setExpandedCustomers({});
  }, [activeView]);

  const groupedInvoices = groupInvoicesByCustomer();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-16 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-2">Sent</h1>
          <p className="text-muted-foreground text-sm mb-4">
            Invoices you've sent to customers
          </p>
          
          <ViewSegmentedControl
            views={[
              { id: 'need-action', label: 'Need Action', count: sentInvoices.filter(inv => inv.userAction === 'none' && inv.supplierAction !== 'submitted').length },
              { id: 'awaiting-customer', label: 'Awaiting Customer', count: sentInvoices.filter(inv => inv.userAction === 'submitted' && inv.supplierAction === 'none').length },
              { id: 'rejected', label: 'Rejected', count: sentInvoices.filter(inv => inv.userAction === 'none' && inv.supplierAction === 'submitted').length }
            ]}
            activeView={activeView}
            onViewChange={(view) => setActiveView(view as any)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-32">
        <div className="max-w-6xl mx-auto">
          {Object.keys(groupedInvoices).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No invoices found for this view.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedInvoices).map(([customerName, customerInvoices]) => (
                <CustomerGroup
                  key={customerName}
                  customerName={customerName}
                  invoices={customerInvoices}
                  isExpanded={expandedCustomers[customerName] ?? true}
                  onToggle={() => toggleCustomer(customerName)}
                  onInvoiceAction={handleInvoiceAction}
                  onBulkAction={(action) => handleBulkAction(customerName, action)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Modal */}
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
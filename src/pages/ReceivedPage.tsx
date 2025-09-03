import React, { useState, useEffect } from 'react';
import SupplierGroup from '@/components/SupplierGroup';
import SubmitModal from '@/components/SubmitModal';
import UndoSnackbar from '@/components/UndoSnackbar';
import ViewSegmentedControl from '@/components/ViewSegmentedControl';
import { InvoiceAction } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useInvoiceStore } from '@/context/InvoiceStore';
import { Invoice } from '@/types/invoice';

interface ReceivedPageProps {
  currentView?: string;
  onClearingBounce?: () => void;
}

const ReceivedPage: React.FC<ReceivedPageProps> = ({ currentView, onClearingBounce }) => {
  const [activeView, setActiveView] = useState<'need-action' | 'awaiting-supplier' | 'rejected'>(
    (currentView as 'need-action' | 'awaiting-supplier' | 'rejected') || 'need-action'
  );
  const [expandedSuppliers, setExpandedSuppliers] = useState<Record<string, boolean>>({});
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
  const [triggerHandshakeFor, setTriggerHandshakeFor] = useState<string | null>(null);
  const [pendingAnimationId, setPendingAnimationId] = useState<string | null>(null);

  const { getReceivedInvoices, submitInvoice, rejectInvoice } = useInvoiceStore();

  // Get received invoices from store
  const receivedInvoices = getReceivedInvoices();

  // Filter invoices based on active view
  const getFilteredInvoices = () => {
    switch (activeView) {
      case 'need-action':
        return receivedInvoices.filter(inv => inv.userAction === 'none' && inv.supplierAction !== 'submitted');
      case 'awaiting-supplier':
        return receivedInvoices.filter(inv => inv.userAction === 'submitted' && inv.supplierAction === 'none');
      case 'rejected':
        return receivedInvoices.filter(inv => inv.userAction === 'none' && inv.supplierAction === 'submitted');
      default:
        return receivedInvoices.filter(inv => inv.userAction === 'none' && inv.supplierAction !== 'submitted');
    }
  };

  // Group invoices by supplier
  const groupInvoicesBySupplier = () => {
    const filteredInvoices = getFilteredInvoices();
    const grouped = filteredInvoices.reduce((acc, invoice) => {
      const supplierName = invoice.from;
      if (!acc[supplierName]) {
        acc[supplierName] = [];
      }
      acc[supplierName].push(invoice);
      return acc;
    }, {} as Record<string, Invoice[]>);
    return grouped;
  };

  const handleInvoiceAction = (id: string, action: InvoiceAction) => {
    const invoice = receivedInvoices.find(inv => inv.id === id);
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
        // Trigger handshake animation
        setTriggerHandshakeFor(id);
        setPendingAnimationId(id);
      } else {
        toast({
          title: "Invoice Submitted",
          description: "Waiting for Supplier",
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
      // Trigger handshake animation
      setTriggerHandshakeFor(invoice.id);
      setPendingAnimationId(invoice.id);
    } else {
      toast({
        title: "Invoice Submitted",
        description: "Waiting for Supplier",
      });
    }

    setSubmitModal({ isOpen: false, invoice: null });
    setUndoSnackbar({
      isVisible: true,
      message: 'Invoice submitted for clearing',
      action: { invoiceId: invoice.id, action: 'submit' }
    });
  };

  const handleBulkAction = (supplierName: string, action: InvoiceAction) => {
    const supplierInvoices = groupInvoicesBySupplier()[supplierName];
    if (supplierInvoices && supplierInvoices.length > 0) {
      setSubmitModal({
        isOpen: true,
        invoice: {
          ...supplierInvoices[0],
          isSupplierGroup: true,
          supplierName,
          invoiceCount: supplierInvoices.length
        }
      });
    }
  };

  const handleAnimationComplete = (invoiceId: string) => {
    if (pendingAnimationId === invoiceId) {
      setPendingAnimationId(null);
      setTriggerHandshakeFor(null);
    }
  };

  const toggleSupplier = (supplierName: string) => {
    setExpandedSuppliers(prev => ({
      ...prev,
      [supplierName]: !prev[supplierName]
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
    if (currentView && ['need-action', 'awaiting-supplier', 'rejected'].includes(currentView)) {
      setActiveView(currentView as 'need-action' | 'awaiting-supplier' | 'rejected');
    }
  }, [currentView]);

  const groupedInvoices = groupInvoicesBySupplier();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-16 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-2">Received</h1>
          <p className="text-muted-foreground text-sm mb-4">
            Invoices received from suppliers
          </p>
          
          <ViewSegmentedControl
            views={[
              { id: 'need-action', label: 'Need Action', count: receivedInvoices.filter(inv => inv.userAction === 'none' && inv.supplierAction !== 'submitted').length },
              { id: 'awaiting-supplier', label: 'Awaiting Supplier', count: receivedInvoices.filter(inv => inv.userAction === 'submitted' && inv.supplierAction === 'none').length },
              { id: 'rejected', label: 'Rejected', count: receivedInvoices.filter(inv => inv.userAction === 'none' && inv.supplierAction === 'submitted').length }
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
              {Object.entries(groupedInvoices).map(([supplierName, supplierInvoices]) => (
                <SupplierGroup
                  key={supplierName}
                  supplierName={supplierName}
                  invoices={supplierInvoices}
                  isExpanded={expandedSuppliers[supplierName] || false}
                  onToggle={() => toggleSupplier(supplierName)}
                  onInvoiceAction={handleInvoiceAction}
                  onBulkAction={(action) => handleBulkAction(supplierName, action)}
                  triggerHandshakeFor={triggerHandshakeFor}
                  onAnimationComplete={handleAnimationComplete}
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
        mode="received"
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

export default ReceivedPage;
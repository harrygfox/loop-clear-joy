import React, { useState } from 'react';
import SupplierGroup from '@/components/SupplierGroup';
import SubmitModal from '@/components/SubmitModal';
import UndoSnackbar from '@/components/UndoSnackbar';
import ViewSegmentedControl from '@/components/ViewSegmentedControl';
import { InvoiceAction } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { getReceivedInvoices, type MockInvoice } from '@/data/mockInvoices';

type Invoice = MockInvoice;

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

  // Get received invoices from centralized data store
  const [invoices, setInvoices] = useState<Invoice[]>(getReceivedInvoices());

  // Filter invoices based on active view
  const getFilteredInvoices = () => {
    switch (activeView) {
      case 'need-action':
        return invoices.filter(inv => inv.userAction === 'none' && inv.supplierAction !== 'rejected');
      case 'awaiting-supplier':
        return invoices.filter(inv => inv.userAction === 'submitted' && inv.supplierAction === 'none');
      case 'rejected':
        return invoices.filter(inv => inv.userAction === 'rejected' || inv.supplierAction === 'rejected');
      default:
        return invoices.filter(inv => inv.userAction === 'none' && inv.supplierAction !== 'rejected');
    }
  };

  const filteredInvoices = getFilteredInvoices();

  // Group filtered invoices by supplier
  const groupInvoicesBySupplier = (invoiceList: Invoice[]) => {
    const grouped: Record<string, Invoice[]> = {};
    invoiceList.forEach(invoice => {
      if (!grouped[invoice.from]) {
        grouped[invoice.from] = [];
      }
      grouped[invoice.from].push(invoice);
    });
    return grouped;
  };

  const groupedInvoices = groupInvoicesBySupplier(filteredInvoices);

  const handleInvoiceAction = (id: string, action: InvoiceAction) => {
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) return;

    // Individual actions are now immediate - no modal
    if (action === 'submit') {
      // Check if this should trigger a handshake animation
      const shouldTriggerHandshake = invoice.supplierAction === 'submitted';
      
      if (shouldTriggerHandshake) {
        // Don't update userAction immediately, let animation complete first
        setPendingAnimationId(invoice.id);
        setTriggerHandshakeFor(invoice.id);
      } else {
        // Update the invoice status normally for non-handshake actions
        setInvoices(prev => prev.map(inv => 
          inv.id === invoice.id 
            ? { ...inv, userAction: 'submitted' as const }
            : inv
        ));
        
        setUndoSnackbar({
          isVisible: true,
          message: 'Invoice submitted',
          action: { invoiceId: invoice.id, action: 'submit' }
        });
      }
    } else {
      // Handle trash action immediately
      setInvoices(prev => prev.filter(inv => inv.id !== id));
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
      // Handle bulk action - get all invoices from supplier that need action
      const supplierInvoices = invoices.filter(inv => inv.from === invoice.supplierName && inv.userAction === 'none');
      
      if (invoice.action === 'reject') {
        // Bulk reject
        setInvoices(prev => prev.filter(inv => !supplierInvoices.find(si => si.id === inv.id)));
        setUndoSnackbar({
          isVisible: true,
          message: `${supplierInvoices.length} invoices rejected${createRule ? ' with rule created' : ''}`,
          action: { invoiceId: 'bulk', action: 'reject' }
        });
      } else {
        // Bulk submit
        setInvoices(prev => prev.map(inv => 
          supplierInvoices.find(si => si.id === inv.id)
            ? { ...inv, userAction: 'submitted' as const }
            : inv
        ));
        setUndoSnackbar({
          isVisible: true,
          message: `${supplierInvoices.length} invoices submitted${createRule ? ' with rule created' : ''}`,
          action: { invoiceId: 'bulk', action: 'submit' }
        });
      }
    }

    setSubmitModal({ isOpen: false, invoice: null });
  };

  const handleBulkAction = (supplierName: string, action: InvoiceAction) => {
    // Get all invoices from this supplier that need action (userAction === 'none')
    const supplierInvoices = invoices.filter(inv => inv.from === supplierName && inv.userAction === 'none');
    
    if (supplierInvoices.length > 0) {
      setSubmitModal({ 
        isOpen: true, 
        invoice: { 
          ...supplierInvoices[0], 
          isBulk: true, 
          supplierName, 
          action: action === 'reject' ? 'reject' : undefined 
        } 
      });
    }
  };

  const handleAnimationComplete = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id);
    
    // Update the invoice status and remove it after animation completes
    setInvoices(prev => prev.map(inv => 
      inv.id === id 
        ? { ...inv, userAction: 'submitted' as const }
        : inv
    ).filter(inv => inv.id !== id));
    
    // Clear animation states
    setPendingAnimationId(null);
    setTriggerHandshakeFor(null);
    
    // Trigger clearing tab bounce animation
    if (onClearingBounce) {
      onClearingBounce();
    }
    
    // Show toast notification
    if (invoice) {
      toast({
        title: "Invoice submitted to Clearing",
        description: `£${invoice.amount.toLocaleString()} from ${invoice.from}`,
        duration: 3000,
      });
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
          Received Invoices
        </h1>
        <p className="text-muted-foreground mb-4">
          Review and manage invoices you've received from suppliers
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
            count: invoices.filter(inv => inv.userAction === 'none').length
          },
          {
            id: 'awaiting-supplier',
            label: 'Awaiting Supplier',
            count: invoices.filter(inv => inv.userAction === 'submitted' && inv.supplierAction === 'none').length
          },
          {
            id: 'rejected',
            label: 'Rejected',
            count: invoices.filter(inv => inv.userAction === 'rejected' || inv.supplierAction === 'rejected').length
          }
        ]}
        activeView={activeView}
        onViewChange={(viewId) => setActiveView(viewId as 'need-action' | 'awaiting-supplier' | 'rejected')}
      />

      {/* Invoices Grouped by Supplier */}
      <div className="space-y-4">
        {Object.entries(groupedInvoices).map(([supplierName, supplierInvoices]) => (
          <SupplierGroup
            key={supplierName}
            supplierName={supplierName}
            invoices={supplierInvoices}
            isExpanded={expandedSuppliers[supplierName] ?? true}
            onToggle={() => toggleSupplier(supplierName)}
            onBulkAction={(action) => handleBulkAction(supplierName, action)}
            onInvoiceAction={handleInvoiceAction}
            onAnimationComplete={handleAnimationComplete}
            triggerHandshakeFor={triggerHandshakeFor}
            pendingAnimationId={pendingAnimationId}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No invoices found
          </h3>
          <p className="text-muted-foreground">
            {activeView === 'need-action' && "No invoices need your action right now."}
            {activeView === 'awaiting-supplier' && "No invoices are waiting for supplier response."}
            {activeView === 'rejected' && "No invoices have been rejected."}
          </p>
        </div>
      )}

      {/* Submit Modal - Only for bulk actions */}
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
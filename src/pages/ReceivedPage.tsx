import React, { useState, useEffect } from 'react';
import SupplierGroup from '@/components/SupplierGroup';
import SubmitModal from '@/components/SubmitModal';
import UndoSnackbar from '@/components/UndoSnackbar';
import ViewSegmentedControl from '@/components/ViewSegmentedControl';
import { InvoiceAction } from '@/lib/utils';
// Removed toast import - using UndoSnackbar for all notifications
import { useInvoiceStore } from '@/context/InvoiceStore';
import { Invoice } from '@/types/invoice';
interface ReceivedPageProps {
  currentView?: string;
  onClearingBounce?: () => void;
}
const ReceivedPage: React.FC<ReceivedPageProps> = ({
  currentView,
  onClearingBounce
}) => {
  const [activeView, setActiveView] = useState<'need-action' | 'awaiting-supplier' | 'rejected'>(currentView as 'need-action' | 'awaiting-supplier' | 'rejected' || 'need-action');
  const [expandedSuppliers, setExpandedSuppliers] = useState<Record<string, boolean>>({});
  const [submitModal, setSubmitModal] = useState<{
    isOpen: boolean;
    invoice: any;
  }>({
    isOpen: false,
    invoice: null
  });
  const [undoSnackbar, setUndoSnackbar] = useState<{
    isVisible: boolean;
    message: string;
    action: {
      invoiceId: string;
      action: string;
    } | null;
  }>({
    isVisible: false,
    message: '',
    action: null
  });
  const [triggerHandshakeFor, setTriggerHandshakeFor] = useState<string | null>(null);
  const [pendingAnimationId, setPendingAnimationId] = useState<string | null>(null);
  const {
    getReceivedInvoices,
    submitInvoice,
    rejectInvoice,
    unsubmitInvoice
  } = useInvoiceStore();

  // Get received invoices from store
  const receivedInvoices = getReceivedInvoices();

  // Filter invoices based on active view
  const getFilteredInvoices = () => {
    let baseFiltered;
    switch (activeView) {
      case 'need-action':
        // Show invoices that need user action (including counterparty-submitted ones)
        baseFiltered = receivedInvoices.filter(inv => inv.userAction === 'none');
        break;
      case 'awaiting-supplier':
        // Show invoices user submitted but supplier hasn't
        baseFiltered = receivedInvoices.filter(inv => inv.userAction === 'submitted' && inv.supplierAction === 'none');
        break;
      case 'rejected':
        // Show invoices that have been explicitly rejected by either party
        baseFiltered = receivedInvoices.filter(inv => inv.userAction === 'rejected' || inv.supplierAction === 'rejected');
        break;
      default:
        baseFiltered = receivedInvoices.filter(inv => inv.userAction === 'none');
    }

    // If there's a pending animation, include the invoice in its original position
    if (pendingAnimationId) {
      const pendingInvoice = receivedInvoices.find(inv => inv.id === pendingAnimationId);
      if (pendingInvoice && !baseFiltered.find(inv => inv.id === pendingAnimationId)) {
        // Find original position in the full list and insert at the same relative position
        const originalIndex = receivedInvoices.findIndex(inv => inv.id === pendingAnimationId);
        const filteredIndices = baseFiltered.map(inv => receivedInvoices.findIndex(item => item.id === inv.id));

        // Find the correct insertion point to maintain original order
        let insertIndex = 0;
        for (let i = 0; i < filteredIndices.length; i++) {
          if (filteredIndices[i] < originalIndex) {
            insertIndex = i + 1;
          } else {
            break;
          }
        }
        baseFiltered.splice(insertIndex, 0, pendingInvoice);
      }
    }
    return baseFiltered;
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
      // Check if counterparty already submitted BEFORE submitting
      const alreadySubmittedByCounterpart = invoice.supplierAction === 'submitted';

      // Trigger handshake animation if counterparty already submitted
      if (alreadySubmittedByCounterpart) {
        setTriggerHandshakeFor(id);
        setPendingAnimationId(id);
        if (onClearingBounce) {
          onClearingBounce();
        }
      }
      submitInvoice(id);
    } else if (action === 'reject') {
      rejectInvoice(id);
    }

    // Show undo option with appropriate message
    const message = action === 'submit' ? invoice.supplierAction === 'submitted' ? 'Added to Clearing' : 'Submitted - waiting for supplier' : 'Invoice rejected';
    setUndoSnackbar({
      isVisible: true,
      message,
      action: {
        invoiceId: id,
        action
      }
    });
  };
  const handleSubmitConfirm = (createRule: boolean) => {
    if (!submitModal.invoice) return;
    const invoice = submitModal.invoice;
    const action = invoice.action || 'submit';
    if (invoice.isBulk) {
      // Handle bulk action for all invoices in the group
      const supplierInvoices = groupInvoicesBySupplier()[invoice.supplierName];
      if (supplierInvoices) {
        let hasHandshakeAnimation = false;
        supplierInvoices.forEach(inv => {
          if (action === 'submit') {
            submitInvoice(inv.id);
            // Check if counterparty already submitted for handshake animation
            if (inv.supplierAction === 'submitted' && !hasHandshakeAnimation) {
              setTriggerHandshakeFor(inv.id);
              setPendingAnimationId(inv.id);
              hasHandshakeAnimation = true;
            }
          } else if (action === 'reject') {
            rejectInvoice(inv.id);
          }
        });
        if (action === 'submit' && onClearingBounce) {
          onClearingBounce();
        }
      }
    } else {
      // Single invoice action
      if (action === 'submit') {
        // Check if counterparty already submitted BEFORE submitting
        const alreadySubmittedByCounterpart = invoice.supplierAction === 'submitted';

        // Trigger handshake animation if counterparty already submitted
        if (alreadySubmittedByCounterpart) {
          setTriggerHandshakeFor(invoice.id);
          setPendingAnimationId(invoice.id);
          if (onClearingBounce) {
            onClearingBounce();
          }
        }
        submitInvoice(invoice.id);
      } else if (action === 'reject') {
        rejectInvoice(invoice.id);
      }
    }
    setSubmitModal({
      isOpen: false,
      invoice: null
    });

    // Show appropriate message based on action and context
    let message;
    if (action === 'submit') {
      if (invoice.isBulk) {
        const count = invoice.invoiceCount || 1;
        message = `${count} invoice${count > 1 ? 's' : ''} submitted`;
      } else {
        message = invoice.supplierAction === 'submitted' ? 'Added to Clearing' : 'Submitted - waiting for supplier';
      }
    } else {
      message = invoice.isBulk ? `${invoice.invoiceCount || 1} invoice${(invoice.invoiceCount || 1) > 1 ? 's' : ''} rejected` : 'Invoice rejected';
    }
    setUndoSnackbar({
      isVisible: true,
      message,
      action: {
        invoiceId: invoice.id,
        action
      }
    });
  };
  const handleBulkAction = (supplierName: string, action: InvoiceAction) => {
    const supplierInvoices = groupInvoicesBySupplier()[supplierName];
    if (supplierInvoices && supplierInvoices.length > 0) {
      setSubmitModal({
        isOpen: true,
        invoice: {
          ...supplierInvoices[0],
          isBulk: true,
          supplierName,
          invoiceCount: supplierInvoices.length,
          action
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
      const {
        invoiceId,
        action
      } = undoSnackbar.action;
      if (action === 'submit') {
        // Unsubmit the invoice (revert to 'none')
        unsubmitInvoice(invoiceId);
      } else if (action === 'reject') {
        // Un-reject the invoice (revert to 'none')
        unsubmitInvoice(invoiceId);
      }
    }
    setUndoSnackbar({
      isVisible: false,
      message: '',
      action: null
    });
  };
  useEffect(() => {
    if (currentView && ['need-action', 'awaiting-supplier', 'rejected'].includes(currentView)) {
      setActiveView(currentView as 'need-action' | 'awaiting-supplier' | 'rejected');
    }
  }, [currentView]);

  // Reset expanded state when active view changes to open all accordions by default
  useEffect(() => {
    setExpandedSuppliers({});
  }, [activeView]);
  const groupedInvoices = groupInvoicesBySupplier();
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-2">Received</h1>
          <p className="text-muted-foreground text-sm mb-4">
            Invoices received from suppliers
          </p>
          
          {/* Swipe Instructions */}
          <div className="flex items-center justify-center gap-6 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>→</span>
              <span>Swipe right to submit invoices for clearing</span>
            </div>
            <div className="flex items-center gap-2">
              <span>←</span>
              <span>Swipe left to reject</span>
            </div>
          </div>
          
          <ViewSegmentedControl views={[{
          id: 'need-action',
          label: 'Need Action',
          count: receivedInvoices.filter(inv => inv.userAction === 'none').length
        }, {
          id: 'awaiting-supplier',
          label: 'Awaiting Supplier',
          count: receivedInvoices.filter(inv => inv.userAction === 'submitted' && inv.supplierAction === 'none').length
        }, {
          id: 'rejected',
          label: 'Rejected',
          count: receivedInvoices.filter(inv => inv.userAction === 'rejected' || inv.supplierAction === 'rejected').length
        }]} activeView={activeView} onViewChange={view => setActiveView(view as any)} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-32 py-[30px]">
        <div className="max-w-6xl mx-auto">
          {Object.keys(groupedInvoices).length === 0 ? <div className="text-center py-12">
              <p className="text-muted-foreground">No invoices found for this view.</p>
            </div> : <div className="space-y-4 transition-all duration-500 ease-out">
              {Object.entries(groupedInvoices).map(([supplierName, supplierInvoices]) => <div key={supplierName} className="transition-all duration-500 ease-out transform">
                  <SupplierGroup key={supplierName} supplierName={supplierName} invoices={supplierInvoices as any[]} isExpanded={expandedSuppliers[supplierName] ?? true} onToggle={() => toggleSupplier(supplierName)} onInvoiceAction={handleInvoiceAction} onBulkAction={action => handleBulkAction(supplierName, action)} triggerHandshakeFor={triggerHandshakeFor} onAnimationComplete={handleAnimationComplete} />
                </div>)}
            </div>}
        </div>
      </div>

      {/* Submit Modal */}
      <SubmitModal isOpen={submitModal.isOpen} onClose={() => setSubmitModal({
      isOpen: false,
      invoice: null
    })} onSubmit={handleSubmitConfirm} invoice={submitModal.invoice} mode="received" />

      {/* Undo Snackbar */}
      <UndoSnackbar isVisible={undoSnackbar.isVisible} message={undoSnackbar.message} onUndo={handleUndo} onDismiss={() => setUndoSnackbar({
      isVisible: false,
      message: '',
      action: null
    })} />
    </div>;
};
export default ReceivedPage;
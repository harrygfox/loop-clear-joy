import React, { useState, useEffect } from 'react';
import SupplierGroup from '@/components/SupplierGroup';
import StandaloneInvoice from '@/components/StandaloneInvoice';
import SubmitModal from '@/components/SubmitModal';
import UndoSnackbar from '@/components/UndoSnackbar';
import ViewSegmentedControl from '@/components/ViewSegmentedControl';
import { InvoiceAction } from '@/types/invoice';
// Removed toast import - using UndoSnackbar for all notifications
import { useInvoiceStore } from '@/context/InvoiceStore';
import { useClearingStore } from '@/store/ClearingStore';
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
  const { getReceivedInvoices } = useInvoiceStore();
  const { include, exclude, getEligibleInvoices, getSubmittedThisCycle } = useClearingStore();

  // Get received invoices from store
  const receivedInvoices = getReceivedInvoices();

  // Filter invoices based on active view
  const getFilteredInvoices = () => {
    const submittedInvoices = getSubmittedThisCycle();
    const eligibleInvoices = getEligibleInvoices();
    let baseFiltered;
    switch (activeView) {
      case 'need-action':
        // Show invoices that need user action (not included and not submitted)
        const eligibleIds = new Set(eligibleInvoices.map(inv => inv.id));
        const submittedIds = new Set(submittedInvoices.map(inv => inv.id));
        baseFiltered = receivedInvoices.filter(inv => !eligibleIds.has(inv.id) && !submittedIds.has(inv.id));
        break;
      case 'awaiting-supplier':
        // Show invoices user submitted but supplier hasn't
        baseFiltered = submittedInvoices.filter(inv => inv.direction === 'received' && !inv.counterpartySubmitted);
        break;
      case 'rejected':
        // Show invoices that have been explicitly excluded
        baseFiltered = receivedInvoices.filter(inv => inv.inclusion === 'excluded');
        break;
      default:
        const defaultEligibleIds = new Set(eligibleInvoices.map(inv => inv.id));
        const defaultSubmittedIds = new Set(submittedInvoices.map(inv => inv.id));
        baseFiltered = receivedInvoices.filter(inv => !defaultEligibleIds.has(inv.id) && !defaultSubmittedIds.has(inv.id));
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

  // Group invoices by supplier with sorting and dynamic grouping
  const getGroupedInvoices = () => {
    const filteredInvoices = getFilteredInvoices();
    const grouped = filteredInvoices.reduce((acc, invoice) => {
      const supplierName = invoice.from;
      if (!acc[supplierName]) {
        acc[supplierName] = [];
      }
      acc[supplierName].push(invoice);
      return acc;
    }, {} as Record<string, Invoice[]>);
    
    // Sort suppliers alphabetically
    const sortedEntries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
    
    // Separate singletons and groups
    const singletons: { type: 'singleton'; invoice: Invoice }[] = [];
    const groups: { type: 'group'; supplierName: string; invoices: Invoice[]; totalValue: number }[] = [];
    
    sortedEntries.forEach(([supplierName, invoices]: [string, Invoice[]]) => {
      if (invoices.length === 1) {
        singletons.push({ type: 'singleton', invoice: invoices[0] });
      } else {
        const totalValue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
        groups.push({ type: 'group', supplierName, invoices, totalValue });
      }
    });
    
    // Merge and sort by supplier name
    const allItems = [...singletons.map(s => ({ ...s, sortKey: s.invoice.from })), ...groups.map(g => ({ ...g, sortKey: g.supplierName }))];
    allItems.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    
    return allItems;
  };
  const handleInvoiceAction = (id: string, action: InvoiceAction) => {
    const invoice = receivedInvoices.find(inv => inv.id === id);
    if (!invoice) return;
    if (action === 'submit') {
      // Check if counterparty already submitted BEFORE submitting
      const alreadySubmittedByCounterpart = invoice.counterpartySubmitted;

      // Trigger handshake animation if counterparty already submitted
      if (alreadySubmittedByCounterpart) {
        setTriggerHandshakeFor(id);
        setPendingAnimationId(id);
        if (onClearingBounce) {
          onClearingBounce();
        }
      }
      include(id);
    } else if (action === 'reject') {
      exclude(id, 'by_customer');
    } else if (action === 'unsubmit') {
      exclude(id, 'by_customer');
    }

    // Show undo option with appropriate message
    const message = action === 'submit' ? 'Added to clearing list. Undo' : 
                    action === 'reject' ? 'Rejected. Undo' : 
                    'Removed from clearing list. Undo';
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
      const groupedItems = getGroupedInvoices();
      const group = groupedItems.find(item => item.type === 'group' && item.supplierName === invoice.supplierName);
      if (group && group.type === 'group') {
        let hasHandshakeAnimation = false;
        group.invoices.forEach(inv => {
          if (action === 'submit') {
            include(inv.id);
            // Check if counterparty already submitted for handshake animation
            if (inv.counterpartySubmitted && !hasHandshakeAnimation) {
              setTriggerHandshakeFor(inv.id);
              setPendingAnimationId(inv.id);
              hasHandshakeAnimation = true;
            }
          } else if (action === 'reject') {
            exclude(inv.id, 'by_customer');
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
        const alreadySubmittedByCounterpart = invoice.counterpartySubmitted;

        // Trigger handshake animation if counterparty already submitted
        if (alreadySubmittedByCounterpart) {
          setTriggerHandshakeFor(invoice.id);
          setPendingAnimationId(invoice.id);
          if (onClearingBounce) {
            onClearingBounce();
          }
        }
        include(invoice.id);
      } else if (action === 'reject') {
        exclude(invoice.id, 'by_customer');
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
        message = `${count} invoice${count > 1 ? 's' : ''} added to clearing list. Undo`;
      } else {
        message = 'Added to clearing list. Undo';
      }
    } else {
      message = invoice.isBulk ? `${invoice.invoiceCount || 1} invoice${(invoice.invoiceCount || 1) > 1 ? 's' : ''} rejected. Undo` : 'Rejected. Undo';
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
    const groupedItems = getGroupedInvoices();
    const group = groupedItems.find(item => item.type === 'group' && item.supplierName === supplierName);
    if (group && group.type === 'group' && group.invoices.length > 0) {
      setSubmitModal({
        isOpen: true,
        invoice: {
          ...group.invoices[0],
          isBulk: true,
          supplierName,
          invoiceCount: group.invoices.length,
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
        // Remove from inclusion (revert to excluded)
        exclude(invoiceId, 'by_customer');
      } else if (action === 'reject') {
        // Un-exclude the invoice (revert to included)
        include(invoiceId);
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
  const groupedItems = getGroupedInvoices();
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
              <span>Swipe right to add to clearing list</span>
            </div>
            <div className="flex items-center gap-2">
              <span>←</span>
              <span>Swipe left to reject</span>
            </div>
          </div>
          
          <ViewSegmentedControl views={[{
          id: 'need-action',
          label: 'Need Action',
          count: (() => {
            const eligible = getEligibleInvoices();
            const submitted = getSubmittedThisCycle();
            const eligibleIds = new Set(eligible.map(inv => inv.id));
            const submittedIds = new Set(submitted.map(inv => inv.id));
            return receivedInvoices.filter(inv => !eligibleIds.has(inv.id) && !submittedIds.has(inv.id)).length;
          })()
        }, {
          id: 'awaiting-supplier',
          label: 'Awaiting Supplier',
          count: getSubmittedThisCycle().filter(inv => inv.direction === 'received' && !inv.counterpartySubmitted).length
        }, {
          id: 'rejected',
          label: 'Rejected',
          count: receivedInvoices.filter(inv => inv.inclusion === 'excluded').length
        }]} activeView={activeView} onViewChange={view => setActiveView(view as any)} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-32 py-[30px]">
        <div className="max-w-6xl mx-auto">
          {groupedItems.length === 0 ? <div className="text-center py-12">
              <p className="text-muted-foreground">No invoices found for this view.</p>
            </div> : <div className="space-y-4 transition-all duration-300 ease-out">
              {groupedItems.map((item, index) => 
                item.type === 'singleton' ? (
                  <div key={`singleton-${item.invoice.id}`} className="transition-all duration-300 ease-out transform">
                    <StandaloneInvoice
                      invoice={item.invoice}
                      mode="received"
                      onAction={handleInvoiceAction}
                      onAnimationComplete={handleAnimationComplete}
                      triggerHandshakeFor={triggerHandshakeFor}
                      pendingAnimationId={pendingAnimationId}
                    />
                  </div>
                ) : (
                  <div key={`group-${item.supplierName}`} className="transition-all duration-300 ease-out transform">
                    <SupplierGroup 
                      supplierName={item.supplierName} 
                      invoices={item.invoices as any[]} 
                      isExpanded={expandedSuppliers[item.supplierName] ?? false} 
                      onToggle={() => toggleSupplier(item.supplierName)} 
                      onInvoiceAction={handleInvoiceAction} 
                      onBulkAction={action => handleBulkAction(item.supplierName, action)} 
                      triggerHandshakeFor={triggerHandshakeFor} 
                      onAnimationComplete={handleAnimationComplete}
                      totalValue={item.totalValue}
                    />
                  </div>
                )
              )}
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

import React, { useState } from 'react';
import InvoiceSection from '@/components/InvoiceSection';
import SubmitModal from '@/components/SubmitModal';
import UndoSnackbar from '@/components/UndoSnackbar';

const ReceivedPage = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    actionRequired: true,
    waitingForCounterparty: true
  });
  const [submitModal, setSubmitModal] = useState<{ isOpen: boolean; invoice: any }>({
    isOpen: false,
    invoice: null
  });
  const [undoSnackbar, setUndoSnackbar] = useState<{ 
    isVisible: boolean; 
    message: string; 
    invoiceId: string | null;
    originalAction: string | null;
  }>({
    isVisible: false,
    message: '',
    invoiceId: null,
    originalAction: null
  });

  // Mock data with two-tick model states
  const invoices = [
    {
      id: '1',
      from: 'Acme Corp',
      to: 'Your Business',
      amount: 2500.00,
      currency: 'USD',
      status: 'pending' as const,
      dueDate: '2024-09-05',
      description: 'Professional services Q3',
      userSubmitted: false,
      supplierSubmitted: false
    },
    {
      id: '2',
      from: 'Tech Solutions Ltd',
      to: 'Your Business',
      amount: 1200.00,
      currency: 'USD',
      status: 'submitted' as const,
      dueDate: '2024-09-03',
      description: 'Software licensing',
      userSubmitted: true,
      supplierSubmitted: false
    },
    {
      id: '3',
      from: 'Design Studio',
      to: 'Your Business',
      amount: 800.00,
      currency: 'USD',
      status: 'pending' as const,
      dueDate: '2024-09-01',
      description: 'Brand identity design',
      userSubmitted: false,
      supplierSubmitted: true
    },
    {
      id: '4',
      from: 'Marketing Agency',
      to: 'Your Business',
      amount: 3200.00,
      currency: 'USD',
      status: 'pending' as const,
      dueDate: '2024-09-07',
      description: 'Digital marketing campaign',
      userSubmitted: false,
      supplierSubmitted: false
    },
    {
      id: '5',
      from: 'Acme Corp',
      to: 'Your Business',
      amount: 1500.00,
      currency: 'USD',
      status: 'pending' as const,
      dueDate: '2024-09-08',
      description: 'Additional consulting',
      userSubmitted: false,
      supplierSubmitted: false
    }
  ];

  // Group invoices by status and supplier
  const actionRequiredInvoices = invoices.filter(inv => !inv.userSubmitted);
  const waitingForCounterpartyInvoices = invoices.filter(inv => inv.userSubmitted && !inv.supplierSubmitted);

  // Group by supplier for the "club" concept
  const groupBySupplier = (invoiceList: typeof invoices) => {
    const grouped = invoiceList.reduce((acc, invoice) => {
      if (!acc[invoice.from]) {
        acc[invoice.from] = [];
      }
      acc[invoice.from].push(invoice);
      return acc;
    }, {} as Record<string, typeof invoices>);
    return grouped;
  };

  const handleInvoiceAction = (id: string, action: 'approve' | 'reject' | 'submit') => {
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) return;

    if (action === 'approve') {
      setSubmitModal({ isOpen: true, invoice });
    } else if (action === 'reject') {
      // Show undo snackbar for trash action
      setUndoSnackbar({
        isVisible: true,
        message: `Invoice from ${invoice.from} moved to trash`,
        invoiceId: id,
        originalAction: 'reject'
      });
      // Handle the reject action
      console.log(`Invoice ${id} trashed`);
    }
  };

  const handleSubmitConfirm = (createRule: boolean) => {
    const invoice = submitModal.invoice;
    if (!invoice) return;

    // Show success snackbar
    setUndoSnackbar({
      isVisible: true,
      message: `Invoice from ${invoice.from} submitted to clearing`,
      invoiceId: invoice.id,
      originalAction: 'approve'
    });

    console.log(`Submitting invoice ${invoice.id}, create rule: ${createRule}`);
    setSubmitModal({ isOpen: false, invoice: null });
  };

  const handleBulkAction = (supplier: string, action: 'approve' | 'reject') => {
    const supplierInvoices = invoices.filter(inv => inv.from === supplier);
    const actionText = action === 'approve' ? 'submitted to clearing' : 'moved to trash';
    
    setUndoSnackbar({
      isVisible: true,
      message: `${supplierInvoices.length} invoices from ${supplier} ${actionText}`,
      invoiceId: null,
      originalAction: action
    });

    console.log(`Bulk ${action} for supplier: ${supplier}`);
  };

  const handleUndo = () => {
    console.log(`Undoing action for invoice: ${undoSnackbar.invoiceId}`);
    setUndoSnackbar(prev => ({ ...prev, isVisible: false }));
  };

  const handleDismissUndo = () => {
    setUndoSnackbar(prev => ({ ...prev, isVisible: false }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="pb-20 px-4 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Received Invoices
        </h1>
        <p className="text-muted-foreground">
          {actionRequiredInvoices.length + waitingForCounterpartyInvoices.length} invoices
        </p>
      </div>

      {/* Invoice Sections */}
      <div className="space-y-4">
        <InvoiceSection
          title="Action Required"
          invoices={actionRequiredInvoices}
          mode="received"
          isExpanded={expandedSections.actionRequired}
          onToggle={() => toggleSection('actionRequired')}
          onBulkAction={(action) => handleBulkAction('actionRequired', action)}
          onInvoiceAction={handleInvoiceAction}
          showBulkActions={true}
        />

        <InvoiceSection
          title="Waiting for Counterparty"
          invoices={waitingForCounterpartyInvoices}
          mode="received"
          isExpanded={expandedSections.waitingForCounterparty}
          onToggle={() => toggleSection('waitingForCounterparty')}
          onInvoiceAction={handleInvoiceAction}
        />
      </div>

      {/* Empty State */}
      {actionRequiredInvoices.length === 0 && waitingForCounterpartyInvoices.length === 0 && (
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
        onDismiss={handleDismissUndo}
      />
    </div>
  );
};

export default ReceivedPage;

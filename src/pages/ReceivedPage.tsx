import React, { useState } from 'react';
import SupplierGroup from '@/components/SupplierGroup';
import SubmitModal from '@/components/SubmitModal';
import UndoSnackbar from '@/components/UndoSnackbar';
import { InvoiceAction } from '@/lib/utils';

// Define invoice type
type Invoice = {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  status: 'pending';
  userAction: 'none' | 'submitted' | 'trashed';
  supplierAction: 'none' | 'submitted';
  description: string;
};

const ReceivedPage = () => {
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

  // Mock data with two-tick model
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      from: 'John Steel Co',
      to: 'Your Business',
      amount: 1250.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'none',
      description: 'Steel supplies Q3'
    },
    {
      id: '2',
      from: 'John Steel Co',
      to: 'Your Business',
      amount: 600.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'submitted',
      supplierAction: 'none',
      description: 'Monthly services'
    },
    {
      id: '3',
      from: 'John Steel Co',
      to: 'Your Business',
      amount: 2000.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'submitted',
      description: 'Equipment rental'
    },
    {
      id: '4',
      from: 'Design Studio',
      to: 'Your Business',
      amount: 800.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'none',
      description: 'Brand identity design'
    },
    {
      id: '5',
      from: 'Marketing Agency',
      to: 'Your Business',
      amount: 3200.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'submitted',
      description: 'Digital campaign'
    }
  ]);

  // Group invoices by supplier and status
  const actionRequiredInvoices = invoices.filter(inv => inv.userAction === 'none');
  const waitingForSupplierInvoices = invoices.filter(inv => inv.userAction === 'submitted' && inv.supplierAction === 'none');

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

  const actionRequiredBySupplier = groupInvoicesBySupplier(actionRequiredInvoices);
  const waitingForSupplierBySupplier = groupInvoicesBySupplier(waitingForSupplierInvoices);

  const handleInvoiceAction = (id: string, action: InvoiceAction) => {
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) return;

    if (action === 'submit') {
      setSubmitModal({ isOpen: true, invoice });
    } else {
      // Handle trash action
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      setUndoSnackbar({
        isVisible: true,
        message: `Invoice trashed`,
        action: { invoiceId: id, action: 'trash' }
      });
    }
  };

  const handleSubmitConfirm = (createRule: boolean) => {
    if (submitModal.invoice) {
      setInvoices(prev => prev.map(inv => 
        inv.id === submitModal.invoice.id 
          ? { ...inv, userAction: 'submitted' }
          : inv
      ));
      
      setUndoSnackbar({
        isVisible: true,
        message: `Invoice submitted${createRule ? ' with rule created' : ''}`,
        action: { invoiceId: submitModal.invoice.id, action: 'submit' }
      });
    }
    setSubmitModal({ isOpen: false, invoice: null });
  };

  const handleBulkAction = (supplierName: string, action: InvoiceAction) => {
    if (action === 'submit') {
      // For bulk submit, show modal for first invoice to set rule preference
      const supplierInvoices = actionRequiredInvoices.filter(inv => inv.from === supplierName);
      if (supplierInvoices.length > 0) {
        setSubmitModal({ isOpen: true, invoice: { ...supplierInvoices[0], isBulk: true, supplierName } });
      }
    } else {
      // Bulk trash
      const supplierInvoices = actionRequiredInvoices.filter(inv => inv.from === supplierName);
      setInvoices(prev => prev.filter(inv => !supplierInvoices.find(si => si.id === inv.id)));
      setUndoSnackbar({
        isVisible: true,
        message: `${supplierInvoices.length} invoices trashed`,
        action: { invoiceId: 'bulk', action: 'trash' }
      });
    }
  };

  const handleAnimationComplete = (id: string) => {
    // Remove invoice from list when handshake animation completes
    setInvoices(prev => prev.filter(inv => inv.id !== id));
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
    <div className="pb-20 px-4 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Received Invoices
        </h1>
        <p className="text-muted-foreground">
          {actionRequiredInvoices.length + waitingForSupplierInvoices.length} invoices
        </p>
      </div>

      {/* Action Required Section */}
      {Object.keys(actionRequiredBySupplier).length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Action Required</h2>
          <div className="space-y-2">
            {Object.entries(actionRequiredBySupplier).map(([supplierName, supplierInvoices]) => (
              <SupplierGroup
                key={supplierName}
                supplierName={supplierName}
                invoices={supplierInvoices}
                isExpanded={expandedSuppliers[supplierName] ?? true}
                onToggle={() => toggleSupplier(supplierName)}
                onBulkAction={(action) => handleBulkAction(supplierName, action)}
                onInvoiceAction={handleInvoiceAction}
                onAnimationComplete={handleAnimationComplete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Waiting for Supplier Section */}
      {Object.keys(waitingForSupplierBySupplier).length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Waiting for Supplier</h2>
          <div className="space-y-2">
            {Object.entries(waitingForSupplierBySupplier).map(([supplierName, supplierInvoices]) => (
              <SupplierGroup
                key={supplierName}
                supplierName={supplierName}
                invoices={supplierInvoices}
                isExpanded={expandedSuppliers[supplierName] ?? true}
                onToggle={() => toggleSupplier(supplierName)}
                onBulkAction={(action) => handleBulkAction(supplierName, action)}
                onInvoiceAction={handleInvoiceAction}
                onAnimationComplete={handleAnimationComplete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {actionRequiredInvoices.length === 0 && waitingForSupplierInvoices.length === 0 && (
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
        onDismiss={() => setUndoSnackbar({ isVisible: false, message: '', action: null })}
      />
    </div>
  );
};

export default ReceivedPage;
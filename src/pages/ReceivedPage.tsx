import React, { useState } from 'react';
import SupplierGroup from '@/components/SupplierGroup';
import SubmitModal from '@/components/SubmitModal';
import UndoSnackbar from '@/components/UndoSnackbar';
import { InvoiceAction } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

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

interface ReceivedPageProps {
  onClearingBounce?: () => void;
}

const ReceivedPage: React.FC<ReceivedPageProps> = ({ onClearingBounce }) => {
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

  // Mock data with two-tick model - 20 invoices grouped by supplier
  const [invoices, setInvoices] = useState<Invoice[]>([
    // John Steel Co (5 invoices)
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
      from: 'John Steel Co',
      to: 'Your Business',
      amount: 875.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'none',
      description: 'Additional steel order'
    },
    {
      id: '5',
      from: 'John Steel Co',
      to: 'Your Business',
      amount: 1450.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'submitted',
      description: 'Custom fabrication'
    },
    // Design Studio (4 invoices)
    {
      id: '6',
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
      id: '7',
      from: 'Design Studio',
      to: 'Your Business',
      amount: 1200.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'submitted',
      description: 'Website redesign'
    },
    {
      id: '8',
      from: 'Design Studio',
      to: 'Your Business',
      amount: 450.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'submitted',
      supplierAction: 'none',
      description: 'Logo variations'
    },
    {
      id: '9',
      from: 'Design Studio',
      to: 'Your Business',
      amount: 950.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'none',
      description: 'Print materials'
    },
    // Marketing Agency (3 invoices)
    {
      id: '10',
      from: 'Marketing Agency',
      to: 'Your Business',
      amount: 3200.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'submitted',
      description: 'Digital campaign'
    },
    {
      id: '11',
      from: 'Marketing Agency',
      to: 'Your Business',
      amount: 1800.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'none',
      description: 'Social media management'
    },
    {
      id: '12',
      from: 'Marketing Agency',
      to: 'Your Business',
      amount: 2500.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'submitted',
      supplierAction: 'submitted',
      description: 'PPC advertising'
    },
    // Tech Solutions Ltd (4 invoices)
    {
      id: '13',
      from: 'Tech Solutions Ltd',
      to: 'Your Business',
      amount: 4500.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'none',
      description: 'Server maintenance'
    },
    {
      id: '14',
      from: 'Tech Solutions Ltd',
      to: 'Your Business',
      amount: 2200.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'submitted',
      description: 'Software licensing'
    },
    {
      id: '15',
      from: 'Tech Solutions Ltd',
      to: 'Your Business',
      amount: 1750.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'submitted',
      supplierAction: 'none',
      description: 'IT support'
    },
    {
      id: '16',
      from: 'Tech Solutions Ltd',
      to: 'Your Business',
      amount: 3300.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'submitted',
      description: 'Security audit'
    },
    // Office Supplies Co (2 invoices)
    {
      id: '17',
      from: 'Office Supplies Co',
      to: 'Your Business',
      amount: 320.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'none',
      description: 'Monthly supplies'
    },
    {
      id: '18',
      from: 'Office Supplies Co',
      to: 'Your Business',
      amount: 180.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'submitted',
      description: 'Stationery order'
    },
    // Cleaning Services (2 invoices)
    {
      id: '19',
      from: 'Cleaning Services',
      to: 'Your Business',
      amount: 400.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'submitted',
      supplierAction: 'none',
      description: 'Weekly cleaning'
    },
    {
      id: '20',
      from: 'Cleaning Services',
      to: 'Your Business',
      amount: 600.00,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'none',
      description: 'Deep clean service'
    }
  ]);

  // Group ALL invoices by supplier first to avoid duplicates
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

  // Group all invoices by supplier (no duplication)
  const allInvoicesBySupplier = groupInvoicesBySupplier(invoices);

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
        message: 'Invoice trashed',
        action: { invoiceId: id, action: 'trash' }
      });
    }
  };

  const handleSubmitConfirm = (createRule: boolean) => {
    if (!submitModal.invoice) return;
    
    const invoice = submitModal.invoice;
    
    if (invoice.isBulk) {
      // Handle bulk action - get all invoices from supplier that need action
      const supplierInvoices = invoices.filter(inv => inv.from === invoice.supplierName && inv.userAction === 'none');
      
      if (invoice.action === 'trash') {
        // Bulk trash
        setInvoices(prev => prev.filter(inv => !supplierInvoices.find(si => si.id === inv.id)));
        setUndoSnackbar({
          isVisible: true,
          message: `${supplierInvoices.length} invoices trashed${createRule ? ' with rule created' : ''}`,
          action: { invoiceId: 'bulk', action: 'trash' }
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
          action: action === 'trash' ? 'trash' : undefined 
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Received Invoices
        </h1>
        <p className="text-muted-foreground">
          {invoices.length} invoices
        </p>
      </div>

      {/* All Invoices Grouped by Supplier */}
      <div className="space-y-4">
        {Object.entries(allInvoicesBySupplier).map(([supplierName, supplierInvoices]) => (
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
      {invoices.length === 0 && (
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
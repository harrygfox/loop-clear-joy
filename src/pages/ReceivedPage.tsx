
import React, { useState } from 'react';
import InvoiceSection from '@/components/InvoiceSection';
import SubmitModal from '@/components/SubmitModal';

const ReceivedPage = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    actionRequired: true,
    waitingForCounterparty: true
  });
  const [submitModal, setSubmitModal] = useState<{ isOpen: boolean; invoice: any }>({
    isOpen: false,
    invoice: null
  });

  // Mock data
  const invoices = [
    {
      id: '1',
      from: 'Acme Corp',
      to: 'Your Business',
      amount: 2500.00,
      currency: 'USD',
      status: 'pending' as const,
      dueDate: '2024-09-05',
      description: 'Professional services Q3'
    },
    {
      id: '2',
      from: 'Tech Solutions Ltd',
      to: 'Your Business',
      amount: 1200.00,
      currency: 'USD',
      status: 'submitted' as const,
      dueDate: '2024-09-03',
      description: 'Software licensing'
    },
    {
      id: '3',
      from: 'Design Studio',
      to: 'Your Business',
      amount: 800.00,
      currency: 'USD',
      status: 'approved' as const,
      dueDate: '2024-09-01',
      description: 'Brand identity design'
    },
    {
      id: '4',
      from: 'Marketing Agency',
      to: 'Your Business',
      amount: 3200.00,
      currency: 'USD',
      status: 'pending' as const,
      dueDate: '2024-09-07',
      description: 'Digital marketing campaign'
    }
  ];

  // Group invoices by status
  const actionRequiredInvoices = invoices.filter(inv => inv.status === 'pending');
  const waitingForCounterpartyInvoices = invoices.filter(inv => inv.status === 'submitted');

  const handleInvoiceAction = (id: string, action: 'approve' | 'reject' | 'submit') => {
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) return;

    if (action === 'approve') {
      setSubmitModal({ isOpen: true, invoice });
    } else {
      console.log(`Invoice ${id} action: ${action}`);
    }
  };

  const handleSubmitConfirm = (createRule: boolean) => {
    console.log(`Submitting invoice ${submitModal.invoice?.id}, create rule: ${createRule}`);
    setSubmitModal({ isOpen: false, invoice: null });
  };

  const handleBulkAction = (section: string, action: 'approve' | 'reject') => {
    console.log(`Bulk ${action} for section: ${section}`);
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
    </div>
  );
};

export default ReceivedPage;

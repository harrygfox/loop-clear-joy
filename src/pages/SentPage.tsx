import React, { useState } from 'react';
import InvoiceSection from '@/components/InvoiceSection';
import SubmitModal from '@/components/SubmitModal';

const SentPage = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    actionRequired: true,
    waitingForCounterparty: true
  });
  const [submitModal, setSubmitModal] = useState<{ isOpen: boolean; invoice: any }>({
    isOpen: false,
    invoice: null
  });

  // Mock data for sent invoices
  const sentInvoices = [
    {
      id: '1',
      from: 'Your Business',
      to: 'Client Corp',
      amount: 3500.00,
      currency: 'USD',
      status: 'submitted' as const,
      dueDate: '2024-09-08',
      description: 'Web development project',
      recipientStatus: 'pending'
    },
    {
      id: '2',
      from: 'Your Business',
      to: 'Startup Inc',
      amount: 1800.00,
      currency: 'USD',
      status: 'approved' as const,
      dueDate: '2024-09-06',
      description: 'Consulting services',
      recipientStatus: 'submitted'
    },
    {
      id: '3',
      from: 'Your Business',
      to: 'Local Business',
      amount: 950.00,
      currency: 'USD',
      status: 'pending' as const,
      dueDate: '2024-09-10',
      description: 'Digital marketing setup',
      recipientStatus: 'not_submitted'
    },
    {
      id: '4',
      from: 'Your Business',
      to: 'Tech Co',
      amount: 2200.00,
      currency: 'USD',
      status: 'rejected' as const,
      dueDate: '2024-09-05',
      description: 'Mobile app development',
      recipientStatus: 'not_submitted'
    }
  ];

  const actionRequiredInvoices = sentInvoices.filter(inv => inv.status === 'pending');
  const waitingForCounterpartyInvoices = sentInvoices.filter(inv => inv.status === 'submitted');

  const handleInvoiceAction = (id: string, action: 'submit' | 'trash') => {
    const invoice = sentInvoices.find(inv => inv.id === id);
    if (!invoice) return;

    if (action === 'submit') {
      setSubmitModal({ isOpen: true, invoice });
    } else if (action === 'trash') {
      console.log(`Sent invoice ${id} trashed`);
    }
  };

  const handleSubmitConfirm = (createRule: boolean) => {
    console.log(`Submitting invoice ${submitModal.invoice?.id}, create rule: ${createRule}`);
    setSubmitModal({ isOpen: false, invoice: null });
  };

  const handleBulkAction = (section: string, action: 'submit' | 'trash') => {
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Sent Invoices
        </h1>
        <p className="text-muted-foreground">
          Track your issued invoices and clearing status
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-warning">{actionRequiredInvoices.length}</div>
          <div className="text-xs text-warning">Pending</div>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-primary">{waitingForCounterpartyInvoices.length}</div>
          <div className="text-xs text-primary">Submitted</div>
        </div>
        <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-success">{sentInvoices.filter(inv => inv.status === 'approved').length}</div>
          <div className="text-xs text-success">Approved</div>
        </div>
      </div>

      <div className="space-y-4">
        <InvoiceSection
          title="Action Required"
          invoices={actionRequiredInvoices}
          mode="sent"
          isExpanded={expandedSections.actionRequired}
          onToggle={() => toggleSection('actionRequired')}
          onBulkAction={(action) => handleBulkAction('actionRequired', action)}
          onInvoiceAction={handleInvoiceAction}
          showBulkActions={true}
        />

        <InvoiceSection
          title="Waiting for Counterparty"
          invoices={waitingForCounterpartyInvoices}
          mode="sent"
          isExpanded={expandedSections.waitingForCounterparty}
          onToggle={() => toggleSection('waitingForCounterparty')}
          onInvoiceAction={handleInvoiceAction}
        />
      </div>

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

      <SubmitModal
        isOpen={submitModal.isOpen}
        onClose={() => setSubmitModal({ isOpen: false, invoice: null })}
        onSubmit={handleSubmitConfirm}
        invoice={submitModal.invoice}
        mode="sent"
      />
    </div>
  );
};

export default SentPage;
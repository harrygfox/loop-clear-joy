
import React from 'react';
import { Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import InvoiceCard from '@/components/InvoiceCard';

const SentPage = () => {
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
      recipientStatus: 'pending' // Whether recipient has submitted
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
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Send size={16} className="text-primary" />;
      case 'approved': return <CheckCircle size={16} className="text-success" />;
      case 'rejected': return <XCircle size={16} className="text-destructive" />;
      default: return <Clock size={16} className="text-warning" />;
    }
  };

  const getRecipientStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-success';
      case 'pending': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const handleInvoiceAction = (id: string, action: 'approve' | 'reject') => {
    console.log(`Sent invoice ${id} action: ${action}`);
  };

  return (
    <div className="pb-20 px-4 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Sent Invoices
        </h1>
        <p className="text-muted-foreground">
          Track your issued invoices and clearing status
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-warning">2</div>
          <div className="text-xs text-warning">Pending</div>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-primary">1</div>
          <div className="text-xs text-primary">Submitted</div>
        </div>
        <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-success">1</div>
          <div className="text-xs text-success">Approved</div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        {sentInvoices.map((invoice, index) => (
          <div 
            key={invoice.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="card-invoice">
              {/* Standard Invoice Card Content */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(invoice.status)}
                  <div>
                    <p className="text-sm font-semibold text-foreground">To: {invoice.to}</p>
                    <p className="text-xs text-muted-foreground">From: {invoice.from}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">
                    ${invoice.amount.toLocaleString()}
                  </p>
                  <div className={`text-xs font-medium ${
                    invoice.status === 'pending' ? 'text-warning' :
                    invoice.status === 'submitted' ? 'text-primary' :
                    invoice.status === 'approved' ? 'text-success' : 'text-destructive'
                  }`}>
                    {invoice.status}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm text-foreground mb-2">{invoice.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Due: {new Date(invoice.dueDate).toLocaleDateString()}
                  </span>
                  <span className={`font-medium ${getRecipientStatusColor((invoice as any).recipientStatus)}`}>
                    Recipient: {(invoice as any).recipientStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Action Buttons for Pending Invoices */}
              {invoice.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleInvoiceAction(invoice.id, 'approve')}
                    className="flex-1 btn-success flex items-center justify-center space-x-2 py-2 text-sm"
                  >
                    <Send size={16} />
                    <span>Submit for Clearing</span>
                  </button>
                </div>
              )}

              {/* Submitted/Approved Status */}
              {invoice.status !== 'pending' && (
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    {invoice.status === 'submitted' && 'Waiting for clearing confirmation'}
                    {invoice.status === 'approved' && 'Ready for clearing on Day 22'}
                    {invoice.status === 'rejected' && 'Moved to trash'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentPage;

import React from 'react';
import { CheckCircle, Clock, XCircle, Send } from 'lucide-react';

interface InvoiceListItemProps {
  invoice: {
    id: string;
    from: string;
    to: string;
    amount: number;
    currency: string;
    status: 'pending' | 'submitted' | 'approved' | 'rejected';
    description: string;
  };
  mode: 'sent' | 'received';
  onAction?: (id: string, action: 'approve' | 'reject' | 'submit') => void;
}

const InvoiceListItem = ({ invoice, mode, onAction }: InvoiceListItemProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Send size={14} className="text-primary" />;
      case 'approved': return <CheckCircle size={14} className="text-success" />;
      case 'rejected': return <XCircle size={14} className="text-destructive" />;
      default: return <Clock size={14} className="text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-primary';
      case 'approved': return 'text-success';
      case 'rejected': return 'text-destructive';
      default: return 'text-warning';
    }
  };

  const displayName = mode === 'sent' ? invoice.to : invoice.from;
  const prefix = mode === 'sent' ? 'To: ' : 'From: ';

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-border/50 hover:bg-muted/30 transition-colors">
      <div className="flex items-center space-x-3 flex-1">
        {getStatusIcon(invoice.status)}
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {prefix}{displayName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {invoice.description}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">
            ${invoice.amount.toLocaleString()}
          </p>
          <p className={`text-xs font-medium ${getStatusColor(invoice.status)}`}>
            {invoice.status}
          </p>
        </div>
        
        {/* Action buttons for pending items */}
        {invoice.status === 'pending' && onAction && (
          <div className="flex space-x-1">
            {mode === 'received' ? (
              <>
                <button
                  onClick={() => onAction(invoice.id, 'approve')}
                  className="p-1.5 rounded bg-success/10 text-success hover:bg-success/20 transition-colors"
                >
                  <CheckCircle size={14} />
                </button>
                <button
                  onClick={() => onAction(invoice.id, 'reject')}
                  className="p-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <XCircle size={14} />
                </button>
              </>
            ) : (
              <button
                onClick={() => onAction(invoice.id, 'submit')}
                className="p-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Send size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceListItem;
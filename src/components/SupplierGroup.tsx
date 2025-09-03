import React from 'react';
import { ChevronDown, CheckCircle, Trash2 } from 'lucide-react';
import InvoiceListItem from './InvoiceListItem';
import { InvoiceAction } from '@/lib/utils';

interface SupplierGroupProps {
  supplierName: string;
  invoices: any[];
  isExpanded: boolean;
  onToggle: () => void;
  onBulkAction: (action: 'submit' | 'trash') => void;
  onInvoiceAction: (id: string, action: 'submit' | 'trash') => void;
  onAnimationComplete: (id: string) => void;
  triggerHandshakeFor?: string | null;
  pendingAnimationId?: string | null;
}

const SupplierGroup = ({ 
  supplierName, 
  invoices, 
  isExpanded, 
  onToggle,
  onBulkAction,
  onInvoiceAction,
  onAnimationComplete,
  triggerHandshakeFor,
  pendingAnimationId
}: SupplierGroupProps) => {
  if (invoices.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Supplier Header */}
      <div className="flex items-center justify-between p-4 bg-background border border-border rounded-t-lg">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggle}
            className="flex items-center space-x-2 text-foreground hover:text-muted-foreground transition-colors"
          >
            <ChevronDown 
              size={16} 
              className={`transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} 
            />
          </button>
          <div>
            <h3 className="text-base font-medium text-foreground">From: {supplierName} ({invoices.length})</h3>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onBulkAction('trash')}
            className="flex items-center space-x-1 px-3 py-1 text-sm border border-border rounded hover:bg-muted/50 transition-colors"
          >
            <span>✕</span>
            <span>Reject All</span>
          </button>
          <button
            onClick={() => onBulkAction('submit')}
            className="flex items-center space-x-1 px-3 py-1 text-sm border border-border rounded hover:bg-muted/50 transition-colors"
          >
            <CheckCircle size={14} />
            <span>Submit All</span>
          </button>
        </div>
      </div>

      {/* Invoice List */}
      {isExpanded && (
        <div className="border-l border-r border-b border-border rounded-b-lg overflow-hidden">
          {invoices.map((invoice, index) => (
            <div
              key={invoice.id}
              className={index < invoices.length - 1 ? "border-b border-border/30" : ""}
            >
              <InvoiceListItem
                invoice={invoice}
                mode="received"
                onAction={onInvoiceAction}
                onAnimationComplete={onAnimationComplete}
                shouldTriggerHandshake={triggerHandshakeFor === invoice.id}
                userTickSubmitted={pendingAnimationId === invoice.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierGroup;
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
}

const SupplierGroup = ({ 
  supplierName, 
  invoices, 
  isExpanded, 
  onToggle, 
  onBulkAction, 
  onInvoiceAction, 
  onAnimationComplete,
  triggerHandshakeFor 
}: SupplierGroupProps) => {
  if (invoices.length === 0) return null;

  return (
    <div className="mb-4">
      {/* Supplier Header */}
      <div className="flex items-center justify-between mb-2 p-3 bg-muted/30 rounded-lg">
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          <span>{supplierName} ({invoices.length} invoices)</span>
          <ChevronDown 
            size={16} 
            className={`transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} 
          />
        </button>
        
        {isExpanded && (
          <div className="flex space-x-2">
            <button
              onClick={() => onBulkAction('submit')}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-success/10 text-success rounded hover:bg-success/20 transition-colors"
            >
              <CheckCircle size={12} />
              <span>Submit All</span>
            </button>
            <button
              onClick={() => onBulkAction('trash')}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors"
            >
              <Trash2 size={12} />
              <span>Trash All</span>
            </button>
          </div>
        )}
      </div>

      {/* Invoice List */}
      {isExpanded && (
        <div className="bg-background rounded-lg border border-border/50 overflow-hidden">
          {invoices.map((invoice) => (
                  <InvoiceListItem
                    key={invoice.id}
                    invoice={invoice}
                    mode="received"
                    onAction={onInvoiceAction}
                    onAnimationComplete={onAnimationComplete}
                    shouldTriggerHandshake={triggerHandshakeFor === invoice.id}
                  />
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierGroup;
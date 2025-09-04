import React from 'react';
import { ChevronDown, CheckCircle, Trash2 } from 'lucide-react';
import InvoiceListItem from './InvoiceListItem';
import TooltipHelper from './TooltipHelper';
import { InvoiceAction } from '@/lib/utils';

interface SupplierGroupProps {
  supplierName: string;
  invoices: any[];
  isExpanded: boolean;
  onToggle: () => void;
  onBulkAction: (action: 'submit' | 'reject') => void;
  onInvoiceAction: (id: string, action: 'submit' | 'reject') => void;
  onAnimationComplete: (id: string) => void;
  triggerHandshakeFor?: string | null;
  pendingAnimationId?: string | null;
  totalValue?: number;
  currency?: string;
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
  pendingAnimationId,
  totalValue,
  currency = 'GBP'
}: SupplierGroupProps) => {
  if (invoices.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Supplier Header */}
      <div className="bg-background border border-border rounded-t-lg">
        {/* Row 1: Supplier info and toggle */}
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onToggle}
            className="flex items-center flex-1 text-left text-foreground hover:text-muted-foreground transition-colors"
            aria-expanded={isExpanded}
            aria-controls={`supplier-${supplierName.replace(/\s+/g, '-').toLowerCase()}`}
            role="button"
          >
            <div className="flex items-center space-x-3 flex-1">
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} 
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-medium text-foreground">
                    From: {supplierName}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    • {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
                  </span>
                  {totalValue !== undefined && (
                    <span className="text-sm text-muted-foreground font-mono">
                      • £{totalValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        </div>
        
        {/* Row 2: Bulk action buttons (responsive) */}
        <div className="px-4 pb-4">
          <div className="flex justify-between space-x-3">
            <button
              onClick={() => onBulkAction('reject')}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm border border-destructive/30 text-destructive rounded hover:bg-destructive/10 transition-colors"
              aria-label={`Reject all ${invoices.length} invoices`}
            >
              <span>✗</span>
              <span className="hidden sm:inline">Reject All</span>
              <span className="sm:hidden">Reject</span>
            </button>
            <button
              onClick={() => onBulkAction('submit')}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm border border-primary/30 text-primary rounded hover:bg-primary/10 transition-colors"
              aria-label={`Add all ${invoices.length} invoices to clearing list`}
            >
              <CheckCircle size={14} />
              <span className="hidden sm:inline">Add All to Clearing List</span>
              <span className="sm:hidden">Add All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      {isExpanded && (
        <div 
          className="border-l border-r border-b border-border rounded-b-lg overflow-hidden animate-accordion-down"
          id={`supplier-${supplierName.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {invoices.map((invoice, index) => (
            <div
              key={invoice.id}
              className={index < invoices.length - 1 ? "border-b border-border/30" : ""}
            >
              <TooltipHelper>
                <InvoiceListItem
                  invoice={invoice}
                  mode="received"
                  onAction={onInvoiceAction}
                  onAnimationComplete={onAnimationComplete}
                  shouldTriggerHandshake={triggerHandshakeFor === invoice.id}
                  userTickSubmitted={pendingAnimationId === invoice.id}
                />
              </TooltipHelper>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupplierGroup;
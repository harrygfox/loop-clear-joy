import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Invoice } from '@/types/invoice';
import { useNavigate } from 'react-router-dom';

interface InvoiceGroupProps {
  counterparty: string;
  invoices: Invoice[];
  count: number;
  sum: number;
  expanded: boolean;
  onToggle: () => void;
  onGroupAction: () => void;
  onItemAction: (invoiceId: string) => void;
  actionLabel: string;
  itemActionLabel: string;
  variant: 'in-round' | 'removed';
}

const InvoiceGroup: React.FC<InvoiceGroupProps> = ({
  counterparty,
  invoices,
  count,
  sum,
  expanded,
  onToggle,
  onGroupAction,
  onItemAction,
  actionLabel,
  itemActionLabel,
  variant
}) => {
  const navigate = useNavigate();

  return (
    <div className="border border-border rounded-lg bg-card">
      <div className="p-4">
        {/* Group Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={onToggle}
              className="flex items-center gap-2 text-left"
              aria-expanded={expanded}
              aria-controls={`group-${counterparty.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <span className="font-medium text-foreground">{counterparty}</span>
              <div className="transition-transform duration-200">
                {expanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={onGroupAction}
              className="text-sm px-3 py-1.5 flex items-center gap-2"
            >
              {variant === 'in-round' ? (
                <>
                  <img src="/icons/exclude-group.svg" alt="" className="h-4 w-4" />
                  Exclude all
                </>
              ) : (
                <>
                  <img src="/icons/move-group-back.svg" alt="" className="h-4 w-4" />
                  Move all back
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="font-medium text-foreground">£{sum.toLocaleString()}</div>
            <div className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
              {count} invoice{count !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        
        {/* Expanded Content */}
        {expanded && (
          <div 
            className="mt-3 pt-3 border-t border-border space-y-2 animate-accordion-down"
            id={`group-${counterparty.replace(/\s+/g, '-').toLowerCase()}`}
          >
            {invoices.map((invoice) => (
              <div 
                key={invoice.id} 
                className="flex items-center justify-between py-2 hover:bg-muted/30 rounded transition-colors duration-150"
              >
                <button
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    {invoice.direction === 'sent' ? (
                      <img src="/icons/invoice-sent.svg" alt="" className="h-4 w-4 opacity-70" />
                    ) : (
                      <img src="/icons/invoice-received.svg" alt="" className="h-4 w-4 opacity-70" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">£{invoice.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(invoice.issuedAt).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => onItemAction(invoice.id)}
                  className="p-1.5 hover:bg-muted rounded transition-colors duration-150"
                  aria-label={itemActionLabel}
                >
                  {variant === 'in-round' ? (
                    <img src="/icons/exclude.svg" alt="" className="h-4 w-4 opacity-70 hover:opacity-100 transition-opacity" />
                  ) : (
                    <img src="/icons/move-back.svg" alt="" className="h-4 w-4 opacity-70 hover:opacity-100 transition-opacity" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceGroup;
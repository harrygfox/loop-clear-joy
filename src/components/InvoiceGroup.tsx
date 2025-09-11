import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Invoice } from '@/types/invoice';

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
  return (
    <div className="border border-border rounded-lg bg-card">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onToggle}
            className="flex items-center gap-3 flex-1 text-left"
            aria-expanded={expanded}
            aria-controls={`group-${counterparty.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <div className="transition-transform duration-200">
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
            <div>
              <div className="font-medium text-foreground">{counterparty}</div>
              <div className="text-sm text-muted-foreground">
                {count} invoice{count !== 1 ? 's' : ''} · £{sum.toLocaleString()}
              </div>
            </div>
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={onGroupAction}
            className="text-sm"
          >
            {actionLabel}
          </Button>
        </div>
        
        {expanded && (
          <div 
            className="border-t border-border pt-3 space-y-3 animate-accordion-down"
            id={`group-${counterparty.replace(/\s+/g, '-').toLowerCase()}`}
          >
            {invoices.map((invoice) => (
              <div 
                key={invoice.id} 
                className="p-3 bg-muted/30 rounded-lg flex items-center justify-between transition-all duration-200 hover:bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{invoice.id}</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {invoice.direction}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    £{invoice.amount.toLocaleString()} · {new Date(invoice.issuedAt).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onItemAction(invoice.id)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {itemActionLabel}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceGroup;
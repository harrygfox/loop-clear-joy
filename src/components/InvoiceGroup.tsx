import React from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
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
        <div className="flex items-center justify-between">
          <button
            onClick={onToggle}
            className="flex items-center gap-3 flex-1 text-left"
            aria-expanded={expanded}
            aria-controls={`group-${counterparty.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <div className="transition-transform duration-200">
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{counterparty}</span>
            </div>
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-medium text-foreground">£{sum.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">{count} invoice{count !== 1 ? 's' : ''}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onGroupAction}
              className="text-sm px-3 py-1.5"
            >
              {actionLabel}
            </Button>
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
                      <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 3H15L21 9V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V4C3 3.44772 3.44772 3 4 3H9Z"/>
                        <path d="M9 3L15 9H9V3Z"/>
                        <path d="M7 13L12 8L17 13"/>
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 3H15L21 9V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V4C3 3.44772 3.44772 3 4 3H9Z"/>
                        <path d="M9 3L15 9H9V3Z"/>
                        <path d="M17 13L12 18L7 13"/>
                      </svg>
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
                  <svg className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 3H15L21 9V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V4C3 3.44772 3.44772 3 4 3H9Z"/>
                    <path d="M9 3L15 9H9V3Z"/>
                    <path d="M15 15L9 9M9 15L15 9"/>
                  </svg>
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
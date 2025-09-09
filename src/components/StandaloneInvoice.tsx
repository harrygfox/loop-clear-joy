import React from 'react';
import InvoiceListItem from './InvoiceListItem';
import TooltipHelper from './TooltipHelper';
import { InvoiceAction } from '@/types/invoice';

interface StandaloneInvoiceProps {
  invoice: any;
  mode: 'sent' | 'received';
  onAction: (id: string, action: InvoiceAction) => void;
  onAnimationComplete?: (id: string) => void;
  triggerHandshakeFor?: string | null;
  pendingAnimationId?: string | null;
}

const StandaloneInvoice = ({ 
  invoice, 
  mode, 
  onAction,
  onAnimationComplete,
  triggerHandshakeFor,
  pendingAnimationId
}: StandaloneInvoiceProps) => {
  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden">
      <TooltipHelper>
        <InvoiceListItem
          invoice={invoice}
          mode={mode}
          onAction={onAction}
          onAnimationComplete={onAnimationComplete}
          shouldTriggerHandshake={triggerHandshakeFor === invoice.id}
          userTickSubmitted={pendingAnimationId === invoice.id}
        />
      </TooltipHelper>
    </div>
  );
};

export default StandaloneInvoice;
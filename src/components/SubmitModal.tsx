import React, { useState } from 'react';
import { Send, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (createRule: boolean) => void;
  invoice: {
    id: string;
    from: string;
    to: string;
    amount: number;
    description: string;
    isBulk?: boolean;
    supplierName?: string;
    section?: string;
    action?: 'submit' | 'trash';
  } | null;
  mode: 'sent' | 'received';
}

const SubmitModal = ({ isOpen, onClose, onSubmit, invoice, mode }: SubmitModalProps) => {
  const [createRule, setCreateRule] = useState(false);

  if (!isOpen || !invoice) return null;

  const businessName = invoice.isBulk 
    ? (invoice.supplierName || (mode === 'sent' ? invoice.to : invoice.from))
    : (mode === 'sent' ? invoice.to : invoice.from);
  
  const isTrashAction = invoice.action === 'trash';
  const actionLabel = isTrashAction 
    ? 'trash' 
    : (mode === 'sent' ? 'submit' : 'approve');
  
  const bulkText = invoice.isBulk ? 'all invoices' : 'invoice';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-xl p-6 max-w-sm w-full animate-scale-in">
        <div className="text-center mb-6">
          <Send size={48} className={`mx-auto mb-3 ${isTrashAction ? 'text-destructive' : 'text-primary'}`} />
          <h3 className="text-lg font-bold text-foreground mb-2">
            {isTrashAction 
              ? `Trash ${bulkText}${invoice.isBulk ? ` from ${businessName}` : ''}`
              : `${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)} ${bulkText}${invoice.isBulk ? ` from ${businessName}` : ''}`
            }
          </h3>
          <p className="text-sm text-muted-foreground">
            {isTrashAction
              ? `Move ${bulkText} to trash${invoice.isBulk ? ` from ${businessName}` : ''}`
              : `${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)} ${bulkText} ${mode === 'sent' ? 'to' : 'from'} ${businessName}`
            }
          </p>
          {!invoice.isBulk && (
            <div className="text-lg font-semibold text-foreground mt-2">
              ${invoice.amount.toLocaleString()}
            </div>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
            <input
              type="radio"
              name="submitOption"
              checked={!createRule}
              onChange={() => setCreateRule(false)}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-foreground">
                {actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)} {invoice.isBulk ? 'these invoices' : 'this invoice'} once
              </p>
              <p className="text-xs text-muted-foreground">
                Handle {invoice.isBulk ? 'these specific invoices' : 'this specific invoice'} only
              </p>
            </div>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
            <input
              type="radio"
              name="submitOption"
              checked={createRule}
              onChange={() => setCreateRule(true)}
              className="mt-1"
            />
            <div className="flex items-start space-x-2">
              <div className="flex-1">
                <p className="font-medium text-foreground flex items-center space-x-1">
                  <span>Auto-{actionLabel} all future invoices {mode === 'sent' ? 'to' : 'from'} {businessName}</span>
                  <Zap size={14} className="text-warning" />
                </p>
                <p className="text-xs text-muted-foreground">
                  Create a {isTrashAction ? 'blocking' : 'clearing'} rule for this business
                </p>
              </div>
            </div>
          </label>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(createRule)}
            className={`flex-1 ${isTrashAction ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'btn-primary'}`}
          >
            {actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmitModal;
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, AlertTriangle, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import UndoSnackbar from '@/components/UndoSnackbar';
import { useInvoiceStore } from '@/context/InvoiceStore';
import { useClearingStore } from '@/store/ClearingStore';

type ClearingState = 'pre-consent' | 'consent-flow' | 'post-consent';
type ConsentStep = 'summary' | 'declarations' | 'success';

// Mock cycle day for demo purposes
const CURRENT_DAY = 23; // Day 22-28 allows consent

const ClearingPage = ({ onClose }: { onClose?: () => void }) => {
  const [clearingState, setClearingState] = useState<ClearingState>('pre-consent');
  const [consentStep, setConsentStep] = useState<ConsentStep>('summary');
  const [solvencyConfirmed, setSolvencyConfirmed] = useState(false);
  const [bindingConfirmed, setBindingConfirmed] = useState(false);
  const [undoSnackbar, setUndoSnackbar] = useState<{
    visible: boolean;
    message: string;
    invoice?: any;
  }>({ visible: false, message: '' });
  const [consentTimestamp, setConsentTimestamp] = useState<string>('');

  const { getAllInvoices } = useInvoiceStore();
  const { getSubmittedThisCycle, include, exclude } = useClearingStore();

  // Get clearing invoices from store
  const submittedInvoices = getSubmittedThisCycle();
  const clearingInvoices = submittedInvoices
    .map(invoice => ({
      ...invoice,
      // Convert to GBP for display
      amount: invoice.currency === 'USD' ? invoice.amount * 0.79 : invoice.amount,
      currency: 'GBP',
      direction: invoice.direction === 'sent' ? 'Sent' : 'Received',
      counterparty: invoice.direction === 'sent' ? invoice.to : invoice.from,
      userSubmitted: true,
      counterpartySubmitted: invoice.counterpartySubmitted || false
    }));

  const totalInvoiceValue = clearingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const estimatedCleared = totalInvoiceValue * 0.1; // 10% of total value

  const handleBack = () => {
    if (clearingState === 'consent-flow') {
      if (consentStep === 'declarations') {
        setConsentStep('summary');
      } else if (consentStep === 'summary') {
        setClearingState('pre-consent');
      }
    } else {
      onClose();
    }
  };

  const handleUnsubmit = (invoice: any) => {
    if (clearingState === 'post-consent') return;
    
    exclude(invoice.id, 'by_customer');
    setUndoSnackbar({
      visible: true,
      message: `Removed from clearing list. Undo`,
      invoice
    });
  };

  const handleUndoUnsubmit = () => {
    if (undoSnackbar.invoice) {
      include(undoSnackbar.invoice.id);
    }
    setUndoSnackbar({ visible: false, message: '' });
  };

  const handleConfirmInvoices = () => {
    if (CURRENT_DAY < 22) return;
    setClearingState('consent-flow');
    setConsentStep('summary');
  };

  const handleProvideConsent = () => {
    if (!solvencyConfirmed || !bindingConfirmed) return;
    
    setConsentTimestamp(new Date().toLocaleString());
    setConsentStep('success');
    
    setTimeout(() => {
      setClearingState('post-consent');
    }, 3000);
  };

  const renderStatusIcon = (userSubmitted: boolean, counterpartySubmitted: boolean, label: string) => (
    <div className="flex items-center space-x-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {userSubmitted ? (
        <Check size={12} className="text-success" />
      ) : (
        <X size={12} className="text-muted-foreground" />
      )}
    </div>
  );

  const renderInvoiceRow = (invoice: any, index: number) => (
    <div 
      key={invoice.id}
      className={`flex items-center justify-between p-3 border-b border-border last:border-b-0 animate-fade-in ${
        clearingState === 'post-consent' ? 'opacity-75' : ''
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <p className="text-sm font-medium">{invoice.counterparty}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge 
                variant={invoice.direction === 'Received' ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {invoice.direction}
              </Badge>
              <div className="flex items-center space-x-3">
                {renderStatusIcon(invoice.userSubmitted, invoice.counterpartySubmitted, 'You')}
                {renderStatusIcon(invoice.counterpartySubmitted, invoice.userSubmitted, 'Them')}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <span className="text-sm font-bold">
          £{invoice.amount.toLocaleString()}
        </span>
        {clearingState === 'pre-consent' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUnsubmit(invoice)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Minus size={14} />
          </Button>
        )}
      </div>
    </div>
  );

  const renderPreConsent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-border">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={16} />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Clearing</h1>
          <p className="text-sm text-muted-foreground">These invoices are ready to clear</p>
        </div>
      </div>

      {/* Headline Metric */}
      <div className="p-6 border-b border-border bg-muted/20">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">Estimated Potential Cleared</div>
          <div className="text-3xl font-bold text-primary">
            £{estimatedCleared.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {clearingInvoices.length} invoice{clearingInvoices.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="flex-1 overflow-y-auto">
        {clearingInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <AlertTriangle size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invoices ready to clear</h3>
            <p className="text-muted-foreground">
              Submit invoices on Sent or Received to see them here.
            </p>
          </div>
        ) : (
          <div className="bg-background">
            {clearingInvoices.map((invoice, index) => renderInvoiceRow(invoice, index))}
          </div>
        )}
      </div>

      {/* Primary Action */}
      {clearingInvoices.length > 0 && (
        <div className="p-4 border-t border-border">
            <Button
              onClick={handleConfirmInvoices}
              disabled={CURRENT_DAY < 22}
              className="w-full py-4 text-lg font-semibold"
            >
              Provide Consent
            </Button>
          {CURRENT_DAY < 22 && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Available from Day 22 of the cycle
            </p>
          )}
        </div>
      )}
    </div>
  );

  const renderConsentFlow = () => {
    if (consentStep === 'success') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="animate-scale-in">
            <Check size={64} className="text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Consent provided</h2>
            <p className="text-muted-foreground mb-4">{consentTimestamp}</p>
            <div className="text-lg font-semibold mb-6">
              Confirmed: £{estimatedCleared.toLocaleString()} ({clearingInvoices.length} invoices)
            </div>
            <p className="text-sm text-muted-foreground mb-8">
              We'll proceed with clearing.
            </p>
            <Button onClick={() => setClearingState('post-consent')} className="px-8">
              Done
            </Button>
          </div>
        </div>
      );
    }

    // Single page consent flow - summary + declarations together
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center space-x-3 p-4 border-b border-border">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-xl font-bold">Provide Consent</h1>
        </div>

        <div className="flex-1 p-6 space-y-8">
          {/* Summary Section */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              £{estimatedCleared.toLocaleString()}
            </div>
            <p className="text-muted-foreground">
              {clearingInvoices.length} invoice{clearingInvoices.length !== 1 ? 's' : ''} ready to clear
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Preview:</p>
            {clearingInvoices.slice(0, 3).map((invoice, index) => (
              <div key={invoice.id} className="flex justify-between text-sm p-2 bg-muted/20 rounded">
                <span>{invoice.counterparty}</span>
                <span>£{invoice.amount.toLocaleString()}</span>
              </div>
            ))}
            {clearingInvoices.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                +{clearingInvoices.length - 3} more
              </p>
            )}
          </div>

          {/* Declarations */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Declarations</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="solvency"
                  checked={solvencyConfirmed}
                  onCheckedChange={(checked) => setSolvencyConfirmed(checked as boolean)}
                />
                <label htmlFor="solvency" className="text-sm leading-relaxed">
                  I confirm my business is solvent and able to meet its financial obligations.
                </label>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="binding"
                  checked={bindingConfirmed}
                  onCheckedChange={(checked) => setBindingConfirmed(checked as boolean)}
                />
                <label htmlFor="binding" className="text-sm leading-relaxed">
                  I agree cleared amounts are legally binding and cannot be reversed.
                </label>
              </div>
            </div>
          </div>

          <Button
            onClick={handleProvideConsent}
            disabled={!solvencyConfirmed || !bindingConfirmed}
            className="w-full py-4 text-lg font-semibold"
          >
            Provide Consent
          </Button>
        </div>
      </div>
    );
  };

  const renderPostConsent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-border">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={16} />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Clearing</h1>
          <p className="text-sm text-muted-foreground">Consent provided</p>
        </div>
      </div>

      {/* Consent Banner */}
      <div className="p-4 bg-success/10 border-b border-success/20">
        <p className="text-sm font-medium text-success">
          Consent provided on {consentTimestamp}
        </p>
      </div>

      {/* Headline Metric */}
      <div className="p-6 border-b border-border bg-muted/20">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">Confirmed Cleared Amount</div>
          <div className="text-3xl font-bold text-primary">
            £{estimatedCleared.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {clearingInvoices.length} invoice{clearingInvoices.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Invoice List (Read-only) */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-background">
          {clearingInvoices.map((invoice, index) => renderInvoiceRow(invoice, index))}
        </div>
      </div>

      {/* Withdrawal Option - Only before Day 28 */}
      {CURRENT_DAY < 28 && (
        <div className="p-4 border-t border-border bg-muted/10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Reset to pre-consent state
              setClearingState('pre-consent');
              setConsentTimestamp('');
              setSolvencyConfirmed(false);
              setBindingConfirmed(false);
            }}
            className="w-full text-destructive border-destructive/20 hover:bg-destructive/10"
          >
            Withdraw consent
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Available until Day 28
          </p>
        </div>
      )}

      {/* Support Note */}
      {CURRENT_DAY >= 28 && (
        <div className="p-4 border-t border-border bg-muted/10">
          <p className="text-xs text-muted-foreground text-center">
            If you need to change anything, contact support
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      {clearingState === 'pre-consent' && renderPreConsent()}
      {clearingState === 'consent-flow' && renderConsentFlow()}
      {clearingState === 'post-consent' && renderPostConsent()}

      <UndoSnackbar
        isVisible={undoSnackbar.visible}
        message={undoSnackbar.message}
        onUndo={handleUndoUnsubmit}
        onDismiss={() => setUndoSnackbar({ visible: false, message: '' })}
      />
    </div>
  );
};

export default ClearingPage;

import React, { useState } from 'react';
import { CheckCircle, DollarSign, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ClearingPage = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [solvencyConfirmed, setSolvencyConfirmed] = useState(false);

  // Mock data for invoices ready to clear
  const clearingInvoices = [
    {
      id: '1',
      from: 'Tech Solutions Ltd',
      to: 'Your Business',
      amount: 1200.00,
      currency: 'USD',
      description: 'Software licensing',
      type: 'receivable'
    },
    {
      id: '2',
      from: 'Your Business',
      to: 'Client Corp',
      amount: 3500.00,
      currency: 'USD',
      description: 'Web development project',
      type: 'payable'
    },
    {
      id: '3',
      from: 'Design Studio',
      to: 'Your Business',
      amount: 800.00,
      currency: 'USD',
      description: 'Brand identity design',
      type: 'receivable'
    }
  ];

  const totalReceivable = clearingInvoices
    .filter(inv => inv.type === 'receivable')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPayable = clearingInvoices
    .filter(inv => inv.type === 'payable')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const netPosition = totalReceivable - totalPayable;

  const handleConfirmClearing = () => {
    if (!solvencyConfirmed) {
      alert('Please confirm solvency to proceed');
      return;
    }
    console.log('Clearing confirmed');
    setShowConfirmation(false);
    // Add success animation
  };

  return (
    <div className="pb-20 px-4 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Ready to Clear
        </h1>
        <p className="text-muted-foreground">
          {clearingInvoices.length} invoices ready for final clearing
        </p>
      </div>

      {/* Net Position Card */}
      <div className="card-gradient rounded-xl p-6 mb-6">
        <div className="text-center mb-4">
          <div className="text-sm text-muted-foreground mb-2">Net Position</div>
          <div className={`text-3xl font-bold ${netPosition >= 0 ? 'text-success' : 'text-destructive'}`}>
            {netPosition >= 0 ? '+' : ''}${netPosition.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {netPosition >= 0 ? 'You will receive' : 'You will pay'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-success">${totalReceivable.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Receivable</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-destructive">${totalPayable.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Payable</div>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Invoices to Clear</h3>
        <div className="space-y-3">
          {clearingInvoices.map((invoice, index) => (
            <div 
              key={invoice.id}
              className="card-invoice animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    invoice.type === 'receivable' ? 'bg-success' : 'bg-destructive'
                  }`} />
                  <div>
                    <p className="text-sm font-semibold">
                      {invoice.type === 'receivable' ? invoice.from : `To: ${invoice.to}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{invoice.description}</p>
                  </div>
                </div>
                <div className={`text-sm font-bold ${
                  invoice.type === 'receivable' ? 'text-success' : 'text-destructive'
                }`}>
                  {invoice.type === 'receivable' ? '+' : '-'}${invoice.amount.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Button */}
      <div className="space-y-3">
        <Button
          onClick={() => setShowConfirmation(true)}
          className="w-full btn-primary py-4 text-lg font-semibold animate-bounce-soft"
        >
          <CheckCircle className="mr-2" size={20} />
          Confirm Invoices ({clearingInvoices.length})
        </Button>

        {/* Two-step Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full animate-scale-in">
              <div className="text-center mb-4">
                <DollarSign size={48} className="text-primary mx-auto mb-3" />
                <h3 className="text-lg font-bold">Confirm Clearing</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  You are about to clear invoices with a net value of
                </p>
                <div className={`text-2xl font-bold mt-2 ${netPosition >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {netPosition >= 0 ? '+' : ''}${netPosition.toLocaleString()}
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={solvencyConfirmed}
                    onChange={(e) => setSolvencyConfirmed(e.target.checked)}
                    className="mt-1"
                  />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Solvency Declaration:</p>
                    <p>I confirm that my business is solvent and able to meet its financial obligations.</p>
                  </div>
                </label>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmClearing}
                  disabled={!solvencyConfirmed}
                  className="flex-1 btn-success"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warning Notice */}
      <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle size={16} className="text-warning mt-0.5" />
          <div className="text-xs text-warning">
            <p className="font-medium mb-1">Important:</p>
            <p>Clearing cannot be undone after confirmation. Please review all invoices carefully.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClearingPage;

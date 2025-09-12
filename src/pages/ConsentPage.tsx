import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useClearingStore } from '@/store/ClearingStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isConsentWindow, getCurrentCycle } from '@/lib/cycle';

const ConsentPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getIncludedInvoices, submitForClearing } = useClearingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [solvencyChecked, setSolvencyChecked] = useState(false);
  const [bindingChecked, setBindingChecked] = useState(false);
  
  const includedInvoices = getIncludedInvoices();
  const sentInvoices = includedInvoices.filter(inv => inv.direction === 'sent');
  const receivedInvoices = includedInvoices.filter(inv => inv.direction === 'received');
  const cycle = getCurrentCycle();

  // Check if we're in the consent window
  if (!isConsentWindow()) {
    navigate('/clearing');
    return null;
  }

  const handleSubmit = async () => {
    if (!solvencyChecked || !bindingChecked) {
      toast({
        title: "Please confirm both statements",
        description: "You must check both boxes to proceed with submission.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitForClearing();
      // Don't show toast - the celebration overlay handles the success message
      navigate('/history');
    } catch (error) {
      toast({
        title: "Submission failed", 
        description: "There was an error submitting your invoices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/clearing')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Submit for Clearing</h1>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-card border border-border rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Cycle #{cycle.dayIndex + 1} Summary</h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">All</div>
                <div className="font-medium">{includedInvoices.length} invoices</div>
              </div>
              <div>
                <div className="text-muted-foreground">Sent</div>
                <div className="font-medium">{sentInvoices.length} invoices</div>
              </div>
              <div>
                <div className="text-muted-foreground">Received</div>
                <div className="font-medium">{receivedInvoices.length} invoices</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-muted/50 border border-border rounded-lg">
            <h3 className="text-base font-semibold mb-4">Required Confirmations</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="solvency"
                  checked={solvencyChecked}
                  onCheckedChange={(checked) => setSolvencyChecked(checked === true)}
                />
                <label htmlFor="solvency" className="text-sm text-foreground leading-relaxed">
                  I confirm my business is solvent and able to meet its financial obligations.
                </label>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="binding"
                  checked={bindingChecked}
                  onCheckedChange={(checked) => setBindingChecked(checked === true)}
                />
                <label htmlFor="binding" className="text-sm text-foreground leading-relaxed">
                  I agree cleared amounts are legally binding and cannot be reversed.
                </label>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              Your consent applies to all invoices on your list at the deadline. You can still remove or move back invoices until the deadline.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/clearing')}
              className="flex-1"
            >
              Back to Review
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || includedInvoices.length === 0 || !solvencyChecked || !bindingChecked}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Clearing'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentPage;
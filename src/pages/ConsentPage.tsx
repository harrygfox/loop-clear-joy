import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useClearingStore } from '@/store/ClearingStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ConsentPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getIncludedInvoices, submitForClearing } = useClearingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const includedInvoices = getIncludedInvoices();
  const totalAmount = includedInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitForClearing();
      toast({
        title: "Submitted for clearing",
        description: "Your invoices have been submitted for this cycle.",
      });
      navigate('/');
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
            <h2 className="text-lg font-semibold mb-4">Review Your Submission</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Included invoices:</span>
                <span className="font-medium">{includedInvoices.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total amount:</span>
                <span className="font-medium">£{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-muted/50 border border-border rounded-lg">
            <h3 className="text-base font-semibold mb-3">Consent Declaration</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• I confirm I am solvent and able to meet my obligations</li>
              <li>• I accept the Local Loop clearing terms for this cycle</li>
              <li>• I understand that invoices can be excluded until the cycle cutoff</li>
            </ul>
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
              disabled={isSubmitting || includedInvoices.length === 0}
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
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useClearingStore } from '@/store/ClearingStore';
import { useNavigate } from 'react-router-dom';
import { isConsentWindow } from '@/lib/cycle';
import { useToast } from '@/hooks/use-toast';

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getIncludedInvoices, hasSubmission, getSubmittedState, resetPrototype } = useClearingStore();
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  
  const includedInvoices = getIncludedInvoices();
  const sentSum = includedInvoices.filter(inv => inv.direction === 'sent').reduce((sum, inv) => sum + inv.amount, 0);
  const receivedSum = includedInvoices.filter(inv => inv.direction === 'received').reduce((sum, inv) => sum + inv.amount, 0);
  
  const submittedState = getSubmittedState();
  
  const getCurrentCycleStatus = () => {
    if (submittedState.hasSubmitted) return 'Submitted (changes allowed)';
    if (isConsentWindow()) return 'Submit needed';
    return 'Ongoing';
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Submitted (changes allowed)': return 'secondary';
      case 'Submit needed': return 'destructive';
      case 'Completed': return 'default';
      default: return 'outline';
    }
  };

  // Mock past cycles data
  const pastCycles = [
    { id: 'cycle-2', period: 'Nov 2024', in: 45000, out: 32000, cleared: 28000 },
    { id: 'cycle-1', period: 'Oct 2024', in: 38000, out: 41000, cleared: 35000 },
  ];

  const currentStatus = getCurrentCycleStatus();

  const handleWithdrawSubmission = () => {
    resetPrototype();
    setShowWithdrawDialog(false);
    toast({
      title: "Submission Withdrawn",
      description: "Your clearing set submission has been withdrawn. You can now make changes and resubmit.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">History</h1>
      
      {/* Current Cycle */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Current Cycle</CardTitle>
            <Badge variant={getStatusVariant(currentStatus)}>
              {currentStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-muted-foreground">In (Sent)</div>
              <div className="text-xl font-semibold">£{sentSum.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Out (Received)</div>
              <div className="text-xl font-semibold">£{receivedSum.toLocaleString()}</div>
            </div>
          </div>
          
          {submittedState.hasSubmitted && (
            <div className="text-sm text-muted-foreground mb-3">
              {submittedState.daysLeft} days left in this cycle
            </div>
          )}
          
          {currentStatus === 'Submit needed' && (
            <Button 
              onClick={() => navigate('/consent')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Submit for clearing
            </Button>
          )}

          {submittedState.hasSubmitted && (
            <div className="mt-3 pt-3 border-t border-border">
              <AlertDialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="link" className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground">
                    Withdraw submission
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Withdraw Submission</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to withdraw your clearing set submission? You will be able to make changes to your invoices and resubmit before the deadline.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleWithdrawSubmission}>
                      Withdraw Submission
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Cycles */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Past Cycles</h2>
        
        {pastCycles.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
            No past cycles yet.
          </div>
        ) : (
          <div className="space-y-3">
            {pastCycles.map((cycle) => (
              <Card key={cycle.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-foreground">{cycle.period}</div>
                    <Badge variant="default">Completed</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">In</div>
                      <div className="font-medium">£{cycle.in.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Out</div>
                      <div className="font-medium">£{cycle.out.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Cleared</div>
                      <div className="font-medium">£{cycle.cleared.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
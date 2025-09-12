import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClearingStore } from '@/store/ClearingStore';
import CountdownCard from '@/components/CountdownCard';
import ReadyToSubmitCard from '@/components/ReadyToSubmitCard';
import CycleModal from '@/components/CycleModal';
import { logEvent } from '@/lib/analytics';
import { formatLocalCutoff } from '@/lib/cycle';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const clearingStore = useClearingStore();
  const [showCycleModal, setShowCycleModal] = useState(false);

  useEffect(() => {
    clearingStore.markVisitedHome();
    logEvent.homeAttentionSeen();
  }, []);

  const readyToSubmit = clearingStore.getReadyToSubmit();
  const newEligibleCount = clearingStore.hasNewEligibleItems() ? clearingStore.newEligibleSinceLastVisit : 0;
  const deadlineLocal = "28 Sep, 23:59";
  const hasSubmitted = clearingStore.hasSubmission();
  const windowOpen = true; // Day 25 - window is open

  const handleGoToInvoices = () => {
    navigate('/invoices');
  };

  const handleGoToConsent = () => {
    navigate('/consent');
  };

  // Hide "Needs your attention" during submit window when unsubmitted
  const showNeedsAttention = hasSubmitted || !windowOpen;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <CountdownCard 
        day={25}
        daysLeft={3}
        deadlineLocal={deadlineLocal}
        windowOpen={windowOpen}
        hasSubmitted={hasSubmitted}
        onInfoClick={() => setShowCycleModal(true)}
      />

      <ReadyToSubmitCard 
        variant={hasSubmitted ? 'submitted' : 'window-open'}
        deadlineLocal={deadlineLocal}
      />
      
      {/* Needs your attention - suppressed during submit window when unsubmitted */}
      {showNeedsAttention && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Needs your attention
              {readyToSubmit.length > 0 && <Badge variant="destructive" className="text-xs">Action required</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {readyToSubmit.length > 0 ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  You have {newEligibleCount} invoices ready for this cycle.
                </p>
                <div className="flex gap-3">
                  <Button onClick={handleGoToInvoices}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Review invoices
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">
                All invoices reviewed. Check back after your next sync or upload.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Getting started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 flex-col">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                <Check className="h-3 w-3" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground mb-1">Connect accounting</div>
                <div className="text-sm text-muted-foreground mb-2">
                  Connect with Xero / Quickbooks or upload invoices manually
                </div>
                <div className="flex flex-col items-start gap-1">
                  <Button variant="ghost" size="sm" className="text-xs cursor-default">
                    ✓ Connected with Xero
                  </Button>
                  <Button variant="outline" size="sm">
                    Upload invoices you've issued
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 flex-col">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                2
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground mb-1">Review invoices</div>
                <div className="text-sm text-muted-foreground mb-2">
                  Exclude any invoices from your list that you do not want cleared this cycle.
                </div>
                <div className="flex flex-col items-start gap-1">
                  <Button variant="outline" size="sm" className="text-xs" asChild>
                    <a href="/help/clearing" className="flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      What is Clearing?
                    </a>
                  </Button>
                  <Button variant="link" size="sm" className="text-xs underline" onClick={handleGoToInvoices}>
                    Review invoices
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 flex-col">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                3
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground mb-1">Submit for Clearing</div>
                <div className="text-sm text-muted-foreground mb-2">
                  Submit your Clearing Set for the current cycle.
                </div>
                <div className="flex flex-col items-start gap-1">
                  <Button variant="outline" size="sm" className="text-xs" asChild>
                    <a href="/help/why-last-week" className="flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Why submit in the last week?
                    </a>
                  </Button>
                  <Button variant="outline" size="md" className="text-sm w-full" onClick={handleGoToConsent}>
                    Submit for Clearing
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CycleModal 
        open={showCycleModal}
        onOpenChange={setShowCycleModal}
        day={25}
        deadlineLocal={deadlineLocal}
      />
    </div>
  );
};

export default HomePage;
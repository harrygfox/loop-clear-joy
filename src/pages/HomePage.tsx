import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check } from 'lucide-react';
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
  const deadlineLocal = formatLocalCutoff(new Date('2025-09-28T23:59:59'));

  const handleGoToInvoices = () => {
    navigate('/invoices');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <CountdownCard 
        day={25}
        daysLeft={3}
        deadlineLocal="28 Sep, 23:59"
        windowOpen={true}
        hasSubmitted={clearingStore.hasSubmission()}
        onInfoClick={() => setShowCycleModal(true)}
      />

      <ReadyToSubmitCard 
        variant={clearingStore.hasSubmission() ? 'submitted' : 'window-open'}
        deadlineLocal={deadlineLocal}
      />
      
      {/* Needs your attention */}
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
                You have {newEligibleCount} invoices ready for this round.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleGoToInvoices} className="flex-1">
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

      {/* Getting started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                <Check className="h-3 w-3" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground mb-1">Connect</div>
                <div className="text-sm text-muted-foreground mb-2">
                  Connect with Xero / Quickbooks or upload invoices manually
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">✓ Connected with Xero</span>
                  <Button variant="outline" size="sm" disabled>
                    Upload sent invoices
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                2
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground mb-1">Review</div>
                <div className="text-sm text-muted-foreground mb-2">
                  Remove any invoices from your list that you do not want in this round of clearing.
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    What is clearing?
                  </Button>
                  <Button variant="link" size="sm" className="text-xs underline">
                    Review my invoices
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                3
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground mb-1">Submit</div>
                <div className="text-sm text-muted-foreground mb-2">
                  Confirm your list once at the end of each round.
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Why can't I do this yet?
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
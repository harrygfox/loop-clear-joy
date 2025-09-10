import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClearingStore } from '@/store/ClearingStore';
import TimelineBanner from '@/components/TimelineBanner';
import ConsentBanner from '@/components/ConsentBanner';
import { logEvent } from '@/lib/analytics';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const clearingStore = useClearingStore();

  useEffect(() => {
    clearingStore.markVisitedHome();
    logEvent.homeAttentionSeen();
  }, []);

  const readyToSubmit = clearingStore.getReadyToSubmit();
  const newEligibleCount = clearingStore.hasNewEligibleItems() ? clearingStore.newEligibleSinceLastVisit : 0;

  const handleGoToClearing = () => {
    navigate('/clearing');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <TimelineBanner />
      <ConsentBanner />
      
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
                You have {newEligibleCount} invoices ready for this clearing cycle.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleGoToClearing} className="flex-1">
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
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                1
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground mb-1">Connect your accounting or upload</div>
                <div className="text-sm text-muted-foreground mb-2">
                  Connect Xero/QuickBooks or upload invoices manually.
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Connect Xero
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Upload Sent invoices
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                2
              </div>
              <div className="flex-1">
                <div className="font-medium text-muted-foreground mb-1">Review your invoices. Exclude any you do not want in this cycle</div>
                <div className="text-sm text-muted-foreground mb-2">
                  Check which invoices will be included in clearing.
                </div>
                <Button variant="outline" size="sm" disabled>
                  Review invoices
                </Button>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                3
              </div>
              <div className="flex-1">
                <div className="font-medium text-muted-foreground mb-1">Submit once at the end of the cycle</div>
                <div className="text-sm text-muted-foreground mb-2">
                  Submit your invoices for this clearing cycle.
                </div>
                <Button variant="outline" size="sm" disabled>
                  Submit for clearing
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
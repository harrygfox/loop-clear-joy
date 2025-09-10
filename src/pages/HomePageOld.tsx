import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useClearingStore } from '@/store/ClearingStore';
import TimelineBanner from '@/components/TimelineBanner';
import { logEvent } from '@/lib/analytics';

interface HomePageProps {
  onClearingBounce?: () => void;
}

const HomePage = ({ onClearingBounce }: HomePageProps) => {
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

  const handleSubmitFromHome = () => {
    logEvent.homeSubmitClicked();
    navigate('/clearing');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <TimelineBanner />
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Needs your attention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {newEligibleCount > 0 && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium">
                    {newEligibleCount} new invoices since your last visit
                  </p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary"
                    onClick={handleGoToClearing}
                  >
                    View in Clearing →
                  </Button>
                </div>
              )}
              
              {readyToSubmit.length > 0 && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium">
                    {readyToSubmit.length} invoices ready to submit
                  </p>
                  <Button 
                    className="mt-2"
                    onClick={handleSubmitFromHome}
                  >
                    Submit for clearing
                  </Button>
                </div>
              )}
              
              {newEligibleCount === 0 && readyToSubmit.length === 0 && (
                <p className="text-muted-foreground">
                  All caught up! No items need your attention right now.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <span className="text-sm">Connect your accounts</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm">
                    2
                  </div>
                  <span className="text-sm text-muted-foreground">Review your invoices</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm">
                    3
                  </div>
                  <span className="text-sm text-muted-foreground">Submit for clearing</span>
                </div>
              </div>
              
              <div className="pt-4 space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  disabled
                >
                  Connect Xero / QuickBooks
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  disabled
                >
                  Upload Sent Invoices
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="pb-20">
            <Button 
              onClick={handleGoToClearing}
              className="w-full"
              size="lg"
            >
              Go to Clearing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
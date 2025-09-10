import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { isConsentWindow, getCurrentCycle, formatLocalCutoff } from '@/lib/cycle';
import { logEvent } from '@/lib/analytics';
import { useNavigate } from 'react-router-dom';

const ConsentBanner: React.FC = () => {
  const navigate = useNavigate();
  const showBanner = isConsentWindow();
  
  useEffect(() => {
    if (showBanner) {
      logEvent.invoicesConsentBannerSeen();
    }
  }, [showBanner]);

  if (!showBanner) {
    return null;
  }

  const cycle = getCurrentCycle();
  const cutoffTime = formatLocalCutoff(cycle.cutoffAt);

  const handleSubmitClick = () => {
    logEvent.invoicesConsentCtaClicked();
    navigate('/consent');
  };

  return (
    <div className="mb-6 p-4 bg-muted/50 border border-border rounded-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-foreground">
            Ready to submit your cycle? Review your included invoices, then submit before{' '}
            <span className="font-medium">{cutoffTime}</span>.
          </p>
        </div>
        <Button 
          onClick={handleSubmitClick}
          className="bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
        >
          Submit for clearing
        </Button>
      </div>
    </div>
  );
};

export default ConsentBanner;
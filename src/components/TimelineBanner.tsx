import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Info } from 'lucide-react';
import { getCurrentCycle, formatLocalCutoff } from '@/lib/cycle';
import { logEvent } from '@/lib/analytics';

const TimelineBanner = () => {
  const [showModal, setShowModal] = useState(false);
  const cycle = getCurrentCycle();

  const handleInfoClick = () => {
    setShowModal(true);
    logEvent.timelineInfoOpened();
  };

  return (
    <>
      <div className="bg-muted/30 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Current 28-day cycle</h2>
            <p className="text-sm text-muted-foreground">
              {cycle.daysRemaining} days remaining
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleInfoClick}
            className="p-2"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cycle Information</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Current Cycle</h3>
              <p className="text-sm text-muted-foreground">
                Started: {cycle.start.toLocaleDateString('en-GB')}
              </p>
              <p className="text-sm text-muted-foreground">
                Day {cycle.dayIndex + 1} of 28
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Cutoff Time</h3>
              <p className="text-sm text-muted-foreground">
                {formatLocalCutoff(cycle.cutoffAt)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Server time (Liverpool, UK) is the source of truth; UI displays localised time.
              </p>
            </div>
          </div>
          
          <Button onClick={() => setShowModal(false)} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimelineBanner;
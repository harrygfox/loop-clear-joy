import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import ReadyToSubmitCard from './ReadyToSubmitCard';
import { logEvent } from '@/lib/analytics';
import { useClearingStore } from '@/store/ClearingStore';

interface CycleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: number;
  deadlineLocal: string;
}

const CycleModal: React.FC<CycleModalProps> = ({
  open,
  onOpenChange,
  day,
  deadlineLocal
}) => {
  const { hasSubmission } = useClearingStore();

  React.useEffect(() => {
    if (open) {
      logEvent.cycleModalOpened();
    }
  }, [open]);

  const getSubmitVariant = () => {
    if (hasSubmission()) return 'submitted';
    if (day >= 22) return 'window-open';
    return 'pre-window';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cycle Information</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg space-y-1">
            <p className="text-sm text-muted-foreground">
              Day {day} of 28
            </p>
            <p className="text-sm font-semibold text-foreground">
              Deadline: {deadlineLocal}
            </p>
            <p className="text-xs text-muted-foreground">
              We show local time; the system runs on Liverpool time.
            </p>
          </div>

          <ReadyToSubmitCard 
            variant={getSubmitVariant()}
            deadlineLocal={deadlineLocal}
          />

          <div className="space-y-2">
            <h3 className="font-medium">Helpful links</h3>
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start h-auto p-2"
                asChild
              >
                <a href="/help/clearing" className="flex items-center gap-2">
                  <ExternalLink className="h-3 w-3" />
                  What is Clearing?
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start h-auto p-2"
                asChild
              >
                <a href="/help/why-last-week" className="flex items-center gap-2">
                  <ExternalLink className="h-3 w-3" />
                  Why submit in the last week?
                </a>
              </Button>
            </div>
          </div>
        </div>
        
        <Button onClick={() => onOpenChange(false)} className="w-full">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CycleModal;
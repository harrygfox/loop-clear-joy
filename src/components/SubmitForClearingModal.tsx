import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useClearingStore } from '@/store/ClearingStore';
import { useToast } from '@/hooks/use-toast';

interface SubmitForClearingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isRepeatSubmission?: boolean;
}

const SubmitForClearingModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  isRepeatSubmission = false 
}: SubmitForClearingModalProps) => {
  const [solvencyChecked, setSolvencyChecked] = useState(false);
  const [bindingChecked, setBindingChecked] = useState(false);
  const { toast } = useToast();
  const clearingStore = useClearingStore();

  const handleSubmit = () => {
    if (!solvencyChecked || !bindingChecked) return;
    
    clearingStore.submitForClearing();
    onSubmit();
    
    const message = isRepeatSubmission 
      ? "Submission complete. Clearing list updated."
      : "Submitted. Your clearing set is locked for this cycle.";
    
    toast({
      title: "Success",
      description: message,
    });
    
    onClose();
    setSolvencyChecked(false);
    setBindingChecked(false);
  };

  const isValid = solvencyChecked && bindingChecked;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit for clearing</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            You're locking your clearing set for this cycle. You can't edit it after submitting.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="solvency"
                checked={solvencyChecked}
                onCheckedChange={(checked) => setSolvencyChecked(checked === true)}
                className="mt-1"
              />
              <label 
                htmlFor="solvency" 
                className="text-sm leading-5 cursor-pointer"
              >
                I confirm my business is solvent and able to meet its financial obligations.
              </label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="binding"
                checked={bindingChecked}
                onCheckedChange={(checked) => setBindingChecked(checked === true)}
                className="mt-1"
              />
              <label 
                htmlFor="binding" 
                className="text-sm leading-5 cursor-pointer"
              >
                I agree cleared amounts are legally binding and cannot be reversed.
              </label>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid}
              className="flex-1"
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitForClearingModal;
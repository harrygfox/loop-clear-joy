import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClearingStore } from '@/store/ClearingStore';

const PrototypeControls: React.FC = () => {
  const { simulateSubmit, resetPrototype, resetAllData, getSubmittedState, markCelebrationSeen, resetCelebration } = useClearingStore();
  const [isVisible, setIsVisible] = useState(false);
  const submittedState = getSubmittedState();

  // Check for prototype flag in URL or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const protoFlag = urlParams.get('proto') === '1';
    const storedFlag = localStorage.getItem('ll_prototype_visible') === 'true';
    
    if (protoFlag || storedFlag) {
      setIsVisible(true);
      if (protoFlag) {
        localStorage.setItem('ll_prototype_visible', 'true');
      }
    }
  }, []);

  // Handle URL state flags
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stateParam = urlParams.get('state');
    
    if (stateParam === 'submitted') {
      simulateSubmit();
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('state');
      window.history.replaceState({}, '', newUrl.toString());
    } else if (stateParam === 'pre') {
      resetPrototype();
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('state');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [simulateSubmit, resetPrototype]);

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 bg-background border-2 border-orange-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Badge variant="outline" className="text-xs">PROTOTYPE</Badge>
          State Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground">
          Current state: <strong>{submittedState.hasSubmitted ? 'Submitted' : 'Pre-submission'}</strong>
          {submittedState.hasSubmitted && (
            <div>Celebration seen: <strong>{submittedState.hasSeenCelebration ? 'Yes' : 'No'}</strong></div>
          )}
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={simulateSubmit}
            size="sm"
            className="w-full"
            disabled={submittedState.hasSubmitted}
          >
            Simulate "Submit for Clearing"
          </Button>
          
          <Button 
            onClick={resetPrototype}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={!submittedState.hasSubmitted}
          >
            Reset to pre-submission
          </Button>
          
          <Button 
            onClick={resetAllData}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            Reset Prototype (Move All to Clearing Set)
          </Button>
          
          {submittedState.hasSubmitted && (
            <>
              <Button 
                onClick={resetCelebration}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!submittedState.hasSeenCelebration}
              >
                Replay celebration
              </Button>
              
              <Button 
                onClick={markCelebrationSeen}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={submittedState.hasSeenCelebration}
              >
                Mark celebration seen
              </Button>
            </>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <div>URL flags:</div>
          <div>• ?state=submitted</div>
          <div>• ?state=pre</div>
          <div>• ?celebrate=1</div>
        </div>
        
        <Button 
          onClick={() => {
            setIsVisible(false);
            localStorage.removeItem('ll_prototype_visible');
          }}
          variant="ghost"
          size="sm"
          className="w-full text-xs"
        >
          Hide controls
        </Button>
      </CardContent>
    </Card>
  );
};

export default PrototypeControls;

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Undo } from 'lucide-react';

interface UndoSnackbarProps {
  isVisible: boolean;
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  autoHideDuration?: number;
}

const UndoSnackbar = ({ 
  isVisible, 
  message, 
  onUndo, 
  onDismiss, 
  autoHideDuration = 5000 
}: UndoSnackbarProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHideDuration, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-background border border-border rounded-lg shadow-lg p-4 flex items-center justify-between">
        <span className="text-sm text-foreground">{message}</span>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            className="h-8 px-2 text-primary hover:text-primary/80"
          >
            <Undo size={14} className="mr-1" />
            Undo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-8 w-8 p-0"
          >
            <X size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UndoSnackbar;
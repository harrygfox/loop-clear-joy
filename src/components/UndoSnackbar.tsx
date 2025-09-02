import React, { useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  autoHideDuration = 4000 
}: UndoSnackbarProps) => {
  useEffect(() => {
    if (isVisible && autoHideDuration > 0) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHideDuration, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-24 left-4 right-4 mx-auto max-w-md z-50",
      "animate-fade-in"
    )}>
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <p className="text-sm font-medium text-foreground">
            {message}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onUndo}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
          >
            <RotateCcw size={12} />
            <span>Undo</span>
          </button>
          <button
            onClick={onDismiss}
            className="p-1 rounded hover:bg-muted/50 transition-colors"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UndoSnackbar;
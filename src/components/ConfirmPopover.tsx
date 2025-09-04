import React from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmPopoverProps {
  isVisible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  position?: { x: number; y: number };
}

const ConfirmPopover = ({ 
  isVisible, 
  message, 
  onConfirm, 
  onCancel,
  position 
}: ConfirmPopoverProps) => {
  if (!isVisible) return null;

  const style = position 
    ? { 
        position: 'fixed' as const,
        left: `${position.x}px`,
        top: `${position.y - 80}px`,
        zIndex: 60
      }
    : { 
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 60
      };

  return (
    <div 
      className="bg-background border border-border rounded-lg shadow-lg p-4 animate-scale-in min-w-64"
      style={style}
    >
      <p className="text-sm text-foreground mb-3">{message}</p>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onConfirm}
          className="flex-1"
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default ConfirmPopover;
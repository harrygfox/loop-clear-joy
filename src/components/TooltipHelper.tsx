import React, { useState } from 'react';

interface TooltipHelperProps {
  children: React.ReactNode;
}

const TooltipHelper = ({ children }: TooltipHelperProps) => {
  const [tooltip, setTooltip] = useState<{ message: string; visible: boolean; position?: { x: number; y: number } }>({
    message: '',
    visible: false
  });

  const showTooltip = (message: string, position?: { x: number; y: number }) => {
    setTooltip({ message, visible: true, position });
    setTimeout(() => {
      setTooltip(prev => ({ ...prev, visible: false }));
    }, 2000);
  };

  return (
    <div className="relative">
      {React.cloneElement(children as React.ReactElement, { onTooltip: showTooltip })}
      
      {tooltip.visible && (
        <div 
          className="fixed z-[70] bg-background border border-border rounded-lg shadow-lg px-3 py-2 animate-fade-in"
          style={tooltip.position ? {
            left: `${tooltip.position.x}px`,
            top: `${tooltip.position.y - 50}px`,
            transform: 'translateX(-50%)'
          } : {
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <p className="text-sm text-foreground">{tooltip.message}</p>
        </div>
      )}
    </div>
  );
};

export default TooltipHelper;
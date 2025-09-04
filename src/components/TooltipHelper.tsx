import React, { useState } from 'react';

interface TooltipHelperProps {
  children: React.ReactNode;
}

const TooltipHelper = ({ children }: TooltipHelperProps) => {
  const [tooltip, setTooltip] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false
  });

  const showTooltip = (message: string) => {
    setTooltip({ message, visible: true });
    setTimeout(() => {
      setTooltip(prev => ({ ...prev, visible: false }));
    }, 2000);
  };

  return (
    <div className="relative">
      {React.cloneElement(children as React.ReactElement, { onTooltip: showTooltip })}
      
      {tooltip.visible && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[70] bg-background border border-border rounded-lg shadow-lg px-3 py-2 animate-fade-in">
          <p className="text-sm text-foreground">{tooltip.message}</p>
        </div>
      )}
    </div>
  );
};

export default TooltipHelper;
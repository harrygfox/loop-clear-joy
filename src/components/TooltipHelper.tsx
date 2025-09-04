import React, { useState, useEffect } from 'react';

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

  // Hide tooltip on scroll
  useEffect(() => {
    if (!tooltip.visible) return;

    const handleScroll = () => {
      setTooltip(prev => ({ ...prev, visible: false }));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tooltip.visible]);

  return (
    <div className="relative">
      {React.cloneElement(children as React.ReactElement, { onTooltip: showTooltip })}
      
      {tooltip.visible && (
        <div 
          className="fixed z-[110] bg-background border border-border rounded-lg shadow-lg px-3 py-2 animate-fade-in pointer-events-none"
          style={tooltip.position ? (() => {
            // Position directly above the tap point
            const tooltipWidth = 200; // Approximate tooltip width
            const x = Math.max(8, Math.min(window.innerWidth - tooltipWidth - 8, tooltip.position.x - tooltipWidth / 2));
            const y = Math.max(8, tooltip.position.y - 48); // Always position above, with minimum top margin
            
            return {
              left: `${x}px`,
              top: `${y}px`
            };
          })() : {
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
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { logEvent } from '@/lib/analytics';

interface NewSinceLastPillProps {
  count: number;
  onScroll: () => void;
}

const NewSinceLastPill: React.FC<NewSinceLastPillProps> = ({ count, onScroll }) => {
  if (count === 0) return null;

  const handleClick = () => {
    logEvent.invoicesNewSinceLastClicked();
    onScroll();
  };

  return (
    <Badge 
      variant="secondary" 
      className="cursor-pointer hover:bg-secondary/80 transition-colors"
      onClick={handleClick}
    >
      New since last visit: {count}
    </Badge>
  );
};

export default NewSinceLastPill;
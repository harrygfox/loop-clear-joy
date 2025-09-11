import React from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { logEvent } from '@/lib/analytics';

interface CountdownCardProps {
  day: number;
  daysLeft: number;
  deadlineLocal: string;
  windowOpen: boolean;
  hasSubmitted?: boolean;
  onInfoClick: () => void;
}

const CountdownCard: React.FC<CountdownCardProps> = ({
  day,
  daysLeft,
  deadlineLocal,
  windowOpen,
  hasSubmitted = false,
  onInfoClick
}) => {
  const handleCardClick = () => {
    logEvent.cycleBannerClicked();
    onInfoClick();
  };

  const getCardContent = () => {
    if (hasSubmitted) {
      return {
        title: `Submitted. ${daysLeft} days left to make changes.`,
        subtitle: `You can still remove or move back invoices until ${deadlineLocal}.`
      };
    }
    
    if (windowOpen) {
      return {
        title: `${daysLeft} days left to submit.`,
        subtitle: `Review your list, then submit before ${deadlineLocal}.`
      };
    }
    
    return {
      title: `${daysLeft} days left in this round.`,
      subtitle: "You can submit in the last week."
    };
  };

  const content = getCardContent();

  return (
    <Card 
      className="mb-6 cursor-pointer hover:bg-muted/30 transition-colors"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              {content.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {content.subtitle}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="p-2"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountdownCard;
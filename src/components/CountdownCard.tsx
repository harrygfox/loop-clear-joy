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
        title: `Submitted. ${daysLeft} days left to make changes`,
        subtitle: `You can still exclude or return invoices until ${deadlineLocal}`
      };
    }
    
    if (windowOpen) {
      return {
        title: `${daysLeft} days left until Clearing`,
        subtitle: `Review your Clearing Set and submit before ${deadlineLocal}`
      };
    }
    
    return {
      title: `${daysLeft} days left in this cycle`,
      subtitle: "You can submit in the last week"
    };
  };

  const content = getCardContent();

  return (
    <Card 
      className={`mb-6 cursor-pointer transition-colors ${
        !hasSubmitted && windowOpen 
          ? "bg-slate-900 text-white hover:bg-slate-800" 
          : "hover:bg-muted/30"
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className={`text-lg font-semibold ${
              !hasSubmitted && windowOpen ? "text-white" : "text-foreground"
            }`}>
              {content.title}
            </h2>
            <p className={`text-sm ${
              !hasSubmitted && windowOpen ? "text-white/80" : "text-muted-foreground"
            }`}>
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
            className={`p-2 ${
              !hasSubmitted && windowOpen ? "text-white hover:bg-white/10" : ""
            }`}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountdownCard;
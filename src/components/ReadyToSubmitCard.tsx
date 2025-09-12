import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { logEvent } from '@/lib/analytics';

interface ReadyToSubmitCardProps {
  variant: 'pre-window' | 'window-open' | 'submitted';
  deadlineLocal: string;
}

const ReadyToSubmitCard: React.FC<ReadyToSubmitCardProps> = ({
  variant,
  deadlineLocal
}) => {
  const navigate = useNavigate();

  const handleSubmitClick = () => {
    logEvent.readyCardSubmitClicked();
    navigate('/consent');
  };

  const handleReviewClick = () => {
    logEvent.readyCardReviewClicked();
    navigate('/clearing');
  };

  const getContent = () => {
    switch (variant) {
      case 'pre-window':
        return {
          title: 'Ready to submit (soon)',
          body: 'You can submit in the last week of the cycle.',
          primaryButton: null,
          secondaryButton: null
        };
      
      case 'window-open':
        return {
          title: 'Ready to submit your Clearing Set',
          body: `Submit before ${deadlineLocal}. You can review and make changes until then.`,
          primaryButton: { text: 'Submit for Clearing', onClick: handleSubmitClick },
          secondaryButton: { text: 'Review invoices', onClick: handleReviewClick }
        };
      
      case 'submitted':
        return {
          title: 'Submitted',
          body: `You can still exclude or return invoices until ${deadlineLocal}.`,
          primaryButton: null,
          secondaryButton: null,
          tertiaryLink: { text: 'Review invoices', onClick: handleReviewClick }
        };
    }
  };

  const content = getContent();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{content.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {content.body}
        </p>
        <div className="flex gap-3">
          {content.primaryButton && (
            <Button 
              onClick={content.primaryButton.onClick}
              disabled={variant === 'pre-window'}
              className="flex-1"
            >
              {content.primaryButton.text}
            </Button>
          )}
          {content.secondaryButton && (
            <Button 
              variant="outline"
              onClick={content.secondaryButton.onClick}
              className="flex-1"
            >
              {content.secondaryButton.text}
            </Button>
          )}
        </div>
        {content.tertiaryLink && (
          <Button 
            variant="link"
            onClick={content.tertiaryLink.onClick}
            className="p-0 h-auto text-sm"
          >
            {content.tertiaryLink.text}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ReadyToSubmitCard;
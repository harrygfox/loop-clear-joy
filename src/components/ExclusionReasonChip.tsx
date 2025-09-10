import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ExclusionReason } from '@/types/invoice';

interface ExclusionReasonChipProps {
  reason: ExclusionReason;
}

const ExclusionReasonChip: React.FC<ExclusionReasonChipProps> = ({ reason }) => {
  if (!reason) return null;

  const getReasonLabel = (reason: ExclusionReason) => {
    switch (reason) {
      case 'by_system': return 'Excluded by system';
      case 'by_supplier': return 'Excluded by supplier';
      case 'by_customer': return 'Excluded by customer';
      default: return null;
    }
  };

  const getTooltipText = (reason: ExclusionReason) => {
    switch (reason) {
      case 'by_system': return 'Counterparty not a Local Loop member';
      case 'by_supplier': return 'Excluded by the supplier';
      case 'by_customer': return 'Excluded by the customer';
      default: return '';
    }
  };

  const label = getReasonLabel(reason);
  if (!label) return null;

  const chip = (
    <Badge 
      variant="outline" 
      className="text-xs bg-muted text-muted-foreground border-border"
    >
      {label}
    </Badge>
  );

  if (reason === 'by_system') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {chip}
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText(reason)}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return chip;
};

export default ExclusionReasonChip;
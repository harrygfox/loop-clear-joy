import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type FilterOption = 'all' | 'sent' | 'received';

interface FilterDropdownProps {
  value: FilterOption;
  onChange: (value: FilterOption) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ value, onChange }) => {
  const getLabel = (option: FilterOption) => {
    switch (option) {
      case 'all': return 'All';
      case 'sent': return 'Sent';
      case 'received': return 'Received';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        {getLabel(value)}
        <ChevronDown className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[100px] bg-background border border-border shadow-md">
        <DropdownMenuItem 
          onClick={() => onChange('all')}
          className={value === 'all' ? 'bg-muted' : ''}
        >
          All
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onChange('sent')}
          className={value === 'sent' ? 'bg-muted' : ''}
        >
          Sent
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onChange('received')}
          className={value === 'received' ? 'bg-muted' : ''}
        >
          Received
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;
import React from 'react';
import { ChevronDown, Filter } from 'lucide-react';
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
      <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium text-foreground border rounded-md px-3 py-2 shadow-sm bg-background">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">{getLabel(value)} invoices</span>
        <ChevronDown className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
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
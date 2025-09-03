import React from 'react';

interface ViewSegmentedControlProps {
  views: Array<{
    id: string;
    label: string;
    count: number;
  }>;
  activeView: string;
  onViewChange: (viewId: string) => void;
}

const ViewSegmentedControl = ({ views, activeView, onViewChange }: ViewSegmentedControlProps) => {
  return (
    <div className="flex space-x-1 mb-6 overflow-x-auto">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeView === view.id
              ? 'bg-foreground text-background'
              : 'border border-border text-foreground hover:bg-muted/50'
          }`}
        >
          {view.label} ({view.count})
        </button>
      ))}
    </div>
  );
};

export default ViewSegmentedControl;
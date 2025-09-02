
import React from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  daysUntilClearing: number;
  totalDays: number;
  urgencyLevel: 'low' | 'medium' | 'high';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  daysUntilClearing, 
  totalDays, 
  urgencyLevel 
}) => {
  const progress = ((totalDays - daysUntilClearing) / totalDays) * 100;
  
  const getUrgencyConfig = (level: string) => {
    switch (level) {
      case 'high':
        return {
          color: 'bg-destructive',
          icon: AlertTriangle,
          text: 'Urgent - Clearing Soon!',
          bgColor: 'bg-destructive/10'
        };
      case 'medium':
        return {
          color: 'bg-warning',
          icon: Clock,
          text: 'Medium Priority',
          bgColor: 'bg-warning/10'
        };
      default:
        return {
          color: 'bg-success',
          icon: CheckCircle,
          text: 'On Track',
          bgColor: 'bg-success/10'
        };
    }
  };

  const config = getUrgencyConfig(urgencyLevel);
  const Icon = config.icon;

  return (
    <div className={cn("rounded-xl p-4 border", config.bgColor)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon size={20} className={cn("text-current")} />
          <span className="font-semibold text-sm">{config.text}</span>
        </div>
        <span className="text-sm font-bold">
          {daysUntilClearing} days left
        </span>
      </div>
      
      <div className="relative">
        <div className="w-full bg-muted/30 rounded-full h-3">
          <div 
            className={cn("h-3 rounded-full transition-all duration-500 relative overflow-hidden", config.color)}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Started</span>
          <span className="font-medium">Day {totalDays - daysUntilClearing} of {totalDays}</span>
          <span>Clearing Day</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;

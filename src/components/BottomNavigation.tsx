
import React from 'react';
import { Home, List, HelpCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  clearingBounce?: boolean;
  showClearingDot?: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  clearingBounce = false,
  showClearingDot = false
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'invoices', label: 'Invoices', icon: List },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <div id="bottom-navigation" className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto">
        {/* Navigation Tabs */}
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center p-2 transition-all duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative",
                tab.id === 'clearing' && clearingBounce && "animate-clearing-bounce"
              )}>
                <Icon size={20} />
                {/* Notification dot for invoices */}
                {tab.id === 'invoices' && showClearingDot && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
              <span className="text-xs mt-1">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-6 h-0.5 bg-primary rounded-full animate-scale-in" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;

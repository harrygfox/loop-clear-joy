
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import HomePage from './HomePage';
import ReceivedPage from './ReceivedPage';
import SentPage from './SentPage';
import ClearingPage from './ClearingPage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showMenu, setShowMenu] = useState(false);
  const [clearingBounce, setClearingBounce] = useState(false);

  const handleClearingBounce = () => {
    setClearingBounce(true);
    setTimeout(() => setClearingBounce(false), 600); // Duration of bounce animation
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onClearingBounce={handleClearingBounce} />;
      case 'sent':
        return <SentPage onClearingBounce={handleClearingBounce} />;
      case 'received':
        return <ReceivedPage onClearingBounce={handleClearingBounce} />;
      case 'clearing':
        return <ClearingPage />;
      default:
        return <HomePage onClearingBounce={handleClearingBounce} />;
    }
  };

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
    console.log('Menu clicked - would show hamburger menu');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleMenuClick}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Menu size={20} className="text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Local Loop</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 animate-fade-in">
        {renderActiveTab()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        clearingBounce={clearingBounce}
        receivedNeedActionCount={5} // This would come from real data
        sentNeedActionCount={3} // This would come from real data
      />

      {/* Hamburger Menu Overlay */}
      {showMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setShowMenu(false)}
        >
          <div className="bg-background w-64 h-full animate-slide-in-right p-6 border-r">
            <h3 className="text-lg font-semibold mb-6 text-foreground">Menu</h3>
            <div className="space-y-1">
              <button className="block w-full text-left py-3 px-2 rounded-lg text-foreground hover:bg-muted/50 transition-colors">
                Rejected
              </button>
              <button className="block w-full text-left py-3 px-2 rounded-lg text-foreground hover:bg-muted/50 transition-colors">
                Clearing Rules
              </button>
              <button className="block w-full text-left py-3 px-2 rounded-lg text-foreground hover:bg-muted/50 transition-colors">
                Settings
              </button>
              <button className="block w-full text-left py-3 px-2 rounded-lg text-foreground hover:bg-muted/50 transition-colors">
                Help & About
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;

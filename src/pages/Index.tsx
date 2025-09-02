
import React, { useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import HomePage from './HomePage';
import ReceivedPage from './ReceivedPage';
import SentPage from './SentPage';
import ClearingPage from './ClearingPage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showMenu, setShowMenu] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'sent':
        return <SentPage />;
      case 'received':
        return <ReceivedPage />;
      case 'clearing':
        return <ClearingPage />;
      default:
        return <HomePage />;
    }
  };

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
    console.log('Menu clicked - would show hamburger menu');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="animate-fade-in">
        {renderActiveTab()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onMenuClick={handleMenuClick}
      />

      {/* Hamburger Menu Overlay (simplified for v1) */}
      {showMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowMenu(false)}
        >
          <div className="bg-white w-64 h-full animate-slide-up p-6">
            <h3 className="text-lg font-semibold mb-4">Menu</h3>
            <div className="space-y-3">
              <button className="block w-full text-left py-2 text-muted-foreground hover:text-foreground">
                Trash
              </button>
              <button className="block w-full text-left py-2 text-muted-foreground hover:text-foreground">
                Clearing Rules
              </button>
              <button className="block w-full text-left py-2 text-muted-foreground hover:text-foreground">
                Settings
              </button>
              <button className="block w-full text-left py-2 text-muted-foreground hover:text-foreground">
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


import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import BottomNavigation from '@/components/BottomNavigation';
import HomePage from './HomePage';
import ReceivedPage from './ReceivedPage';
import SentPage from './SentPage';
import ClearingPage from './ClearingPage';
import { useNavigationState } from '@/hooks/useNavigationState';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showMenu, setShowMenu] = useState(false);
  const [clearingBounce, setClearingBounce] = useState(false);
  const { saveNavigationState } = useNavigationState();

  // Determine active tab from route
  const getActiveTabFromRoute = () => {
    const path = location.pathname;
    if (path === '/home') return 'home';
    if (path === '/received') return 'received';
    if (path === '/sent') return 'sent';
    if (path === '/clearing') return 'clearing';
    return 'home';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromRoute());

  // Update active tab when route changes
  useEffect(() => {
    setActiveTab(getActiveTabFromRoute());
  }, [location.pathname]);

  const handleClearingBounce = () => {
    setClearingBounce(true);
    setTimeout(() => setClearingBounce(false), 600); // Duration of bounce animation
  };

  const handleTabChange = (tab: string) => {
    const view = searchParams.get('view') || 'need-action';
    saveNavigationState(tab, view, window.scrollY);
    
    if (tab === 'home') {
      navigate('/home');
    } else if (tab === 'received') {
      navigate('/received?view=need-action');
    } else if (tab === 'sent') {
      navigate('/sent?view=need-action');
    } else if (tab === 'clearing') {
      navigate('/clearing');
    }
  };

  const renderActiveTab = () => {
    const view = searchParams.get('view') || 'need-action';
    switch (activeTab) {
      case 'home':
        return <HomePage onClearingBounce={handleClearingBounce} />;
      case 'sent':
        return <SentPage currentView={view} onClearingBounce={handleClearingBounce} />;
      case 'received':
        return <ReceivedPage currentView={view} onClearingBounce={handleClearingBounce} />;
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
        onTabChange={handleTabChange}
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
                Settings
              </button>
              <button className="block w-full text-left py-3 px-2 rounded-lg text-foreground hover:bg-muted/50 transition-colors">
                Help
              </button>
              <button className="block w-full text-left py-3 px-2 rounded-lg text-foreground hover:bg-muted/50 transition-colors">
                About
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;

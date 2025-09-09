
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import BottomNavigation from '@/components/BottomNavigation';
import HomePage from './HomePage';
import ReceivedPage from './ReceivedPage';
import SentPage from './SentPage';
import ClearingPage from './ClearingPage';
import { useNavigationState } from '@/hooks/useNavigationState';
import { useInvoiceStore } from '@/context/InvoiceStore';
import { useClearingStore } from '@/store/ClearingStore';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showMenu, setShowMenu] = useState(false);
  const [clearingBounce, setClearingBounce] = useState(false);
  const [showClearingModal, setShowClearingModal] = useState(false);
  const { saveNavigationState } = useNavigationState();
  const { getReceivedInvoices, getSentInvoices } = useInvoiceStore();
  const clearingStore = useClearingStore();

  // Determine active tab from route
  const getActiveTabFromRoute = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home'; // Support legacy /home URLs
    if (path === '/received') return 'received';
    if (path === '/sent') return 'sent';
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
    if (tab === 'clearing') {
      navigate('/clearing');
      return;
    }
    
    if (tab === 'help') {
      console.log('Help tab - would navigate to help page');
      return;
    }

    const view = searchParams.get('view') || 'need-action';
    saveNavigationState(tab, view, window.scrollY);
    
    if (tab === 'home') {
      navigate('/');
    } else if (tab === 'received') {
      navigate('/received?view=need-action');
    } else if (tab === 'sent') {
      navigate('/sent?view=need-action');
    }
  };

  const handleCloseClearingModal = () => {
    // Handle back-first behavior: if history state indicates clearing was opened, go back
    if (window.history.state?.clearingOpen) {
      window.history.back();
    }
    setShowClearingModal(false);
  };

  // Handle browser back button for clearing modal
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.clearingOpen === undefined && showClearingModal) {
        setShowClearingModal(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showClearingModal]);

  const renderActiveTab = () => {
    const view = searchParams.get('view') || 'need-action';
    switch (activeTab) {
      case 'home':
        return <HomePage onClearingBounce={handleClearingBounce} />;
      case 'sent':
        return <SentPage currentView={view} onClearingBounce={handleClearingBounce} />;
      case 'received':
        return <ReceivedPage currentView={view} onClearingBounce={handleClearingBounce} />;
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
        showClearingDot={clearingStore.hasNewEligibleItems()}
      />

      {/* Clearing Modal */}
      {showClearingModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseClearingModal} />
          <div className="absolute inset-x-0 bottom-0 top-0 bg-background animate-slide-up">
            <ClearingPage onClose={handleCloseClearingModal} />
          </div>
        </div>
      )}

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
                Clearing Rules
              </button>
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

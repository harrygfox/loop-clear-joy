import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNavigation from '@/components/BottomNavigation';
import { useClearingStore } from '@/store/ClearingStore';

interface ShellLayoutProps {
  children: React.ReactNode;
}

const ShellLayout: React.FC<ShellLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const clearingStore = useClearingStore();

  const getActiveTabFromRoute = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path.startsWith('/clearing') || path.startsWith('/consent')) return 'invoices';
    if (path === '/history') return 'history';
    if (path === '/help') return 'help';
    return 'home';
  };

  const handleTabChange = (tab: string) => {
    switch (tab) {
      case 'home':
        navigate('/');
        break;
      case 'invoices':
        navigate('/clearing');
        break;
      case 'history':
        navigate('/history');
        break;
      case 'help':
        navigate('/help');
        break;
    }
  };

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  const handleResetPrototype = () => {
    clearingStore.resetAllData();
    setShowMenu(false);
  };

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Invoices', path: '/clearing' },
    { label: 'History', path: '/history' },
    { label: 'Help', path: '/help' },
    { label: 'Settings', path: '/settings' },
    { label: 'About', path: '/about' },
    { label: 'Logout', path: '/logout' },
  ];

  const prototypeItems = [
    { label: 'Reset Prototype (Move All to Clearing Set)', action: handleResetPrototype, isDestructive: true },
  ];

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
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20 animate-fade-in">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={getActiveTabFromRoute()} 
        onTabChange={handleTabChange}
        showClearingDot={clearingStore.hasNewEligibleItems()}
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
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setShowMenu(false);
                  }}
                  className="block w-full text-left py-3 px-2 rounded-lg text-foreground hover:bg-muted/50 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            {/* Prototype Controls Section */}
            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">Prototype Controls</h4>
              <div className="space-y-1">
                {prototypeItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className={`block w-full text-left py-3 px-2 rounded-lg transition-colors ${
                      item.isDestructive 
                        ? 'text-destructive hover:bg-destructive/10' 
                        : 'text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShellLayout;
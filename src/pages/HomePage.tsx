
import React from 'react';
import { ChevronRight, Plus, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '@/components/ProgressBar';
import { useInvoiceStore } from '@/context/InvoiceStore';

interface HomePageProps {
  onClearingBounce?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onClearingBounce }) => {
  const navigate = useNavigate();
  const { getSentInvoices, getReceivedInvoices } = useInvoiceStore();

  // Get real invoice counts
  const sentInvoices = getSentInvoices();
  const receivedInvoices = getReceivedInvoices();
  
  const sentNeedAction = sentInvoices.filter(inv => inv.userAction === 'none').length;
  const receivedNeedAction = receivedInvoices.filter(inv => inv.userAction === 'none').length;
  const totalNeedAction = sentNeedAction + receivedNeedAction;

  // Mock cycle data
  const daysLeft = 5;
  const currentDay = 17;
  const totalDays = 22;
  const estimatedPotentialCleared = 12500;
  const suppliersCount = 4;
  const customersCount = 3;

  const handleReceivedClick = () => {
    if (receivedNeedAction > 0) {
      navigate('/received?view=need-action');
    }
  };

  const handleSentClick = () => {
    if (sentNeedAction > 0) {
      navigate('/sent?view=need-action');
    }
  };

  const handleInviteSuppliers = () => {
    console.log('Open supplier invite flow');
  };

  const handleInviteCustomers = () => {
    console.log('Open customer invite flow');
  };

  const handleHistory = () => {
    navigate('/history');
  };

  return (
    <div className="pb-20 px-4 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Welcome back!
        </h1>
        <p className="text-muted-foreground">
          You have {totalNeedAction} invoices needing attention
        </p>
      </div>

      {/* Cycle Priority Banner */}
      <div className="mb-6">
        <ProgressBar 
          daysUntilClearing={daysLeft}
          totalDays={totalDays}
          urgencyLevel="medium"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Day {currentDay} of {totalDays} • Clearing Day in {daysLeft}
        </p>
      </div>

      {/* Needs Your Attention */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Needs Your Attention</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Received Counter */}
          <button
            onClick={handleReceivedClick}
            disabled={receivedNeedAction === 0}
            className={`
              relative p-4 rounded-lg border text-left transition-all duration-200
              ${receivedNeedAction > 0 
                ? 'bg-background hover:bg-muted/50 border-border cursor-pointer' 
                : 'bg-muted/30 border-muted cursor-not-allowed opacity-60'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">Received</div>
                <div className="text-sm text-muted-foreground">
                  {receivedNeedAction > 0 ? `${receivedNeedAction} need action` : 'All caught up'}
                </div>
              </div>
              {receivedNeedAction > 0 && (
                <>
                  <ChevronRight size={16} className="text-muted-foreground" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-warning text-warning-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    {receivedNeedAction}
                  </div>
                </>
              )}
            </div>
          </button>

          {/* Sent Counter */}
          <button
            onClick={handleSentClick}
            disabled={sentNeedAction === 0}
            className={`
              relative p-4 rounded-lg border text-left transition-all duration-200
              ${sentNeedAction > 0 
                ? 'bg-background hover:bg-muted/50 border-border cursor-pointer' 
                : 'bg-muted/30 border-muted cursor-not-allowed opacity-60'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">Sent</div>
                <div className="text-sm text-muted-foreground">
                  {sentNeedAction > 0 ? `${sentNeedAction} need action` : 'All caught up'}
                </div>
              </div>
              {sentNeedAction > 0 && (
                <>
                  <ChevronRight size={16} className="text-muted-foreground" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-warning text-warning-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    {sentNeedAction}
                  </div>
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Cycle Health */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Cycle Health</h2>
        
        <div className="card-gradient rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-4">
            The more invoices you both submit for clearing, the more chance you have of reducing outgoings.
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estimated Potential Cleared:</span>
              <span className="font-medium text-foreground">£{estimatedPotentialCleared.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Connections:</span>
              <span className="font-medium text-foreground">{suppliersCount} suppliers • {customersCount} customers</span>
            </div>
          </div>

          {/* Growth CTAs */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleInviteSuppliers}
              className="btn-primary flex items-center justify-center space-x-2 text-sm py-3"
            >
              <Plus size={14} />
              <span>Invite More Suppliers</span>
            </button>
            <button
              onClick={handleInviteCustomers}
              className="btn-primary flex items-center justify-center space-x-2 text-sm py-3"
            >
              <Plus size={14} />
              <span>Invite Customers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Utility Tiles */}
      <div className="grid grid-cols-1 gap-3">
        <button 
          onClick={handleHistory}
          className="card-invoice text-center py-6 flex flex-col items-center"
        >
          <History size={24} className="text-primary mx-auto mb-2" />
          <span className="text-sm font-medium">History</span>
        </button>
      </div>
    </div>
  );
};

export default HomePage;

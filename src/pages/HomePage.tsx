
import React from 'react';
import { AlertCircle, Users, TrendingUp, Plus } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import InvoiceCard from '@/components/InvoiceCard';

const HomePage = () => {
  // Mock data - in real app this would come from API
  const urgentInvoices = [
    {
      id: '1',
      from: 'Acme Corp',
      to: 'Your Business',
      amount: 2500.00,
      currency: 'USD',
      status: 'pending' as const,
      dueDate: '2024-09-05',
      description: 'Professional services Q3'
    },
    {
      id: '2',
      from: 'Tech Solutions Ltd',
      to: 'Your Business',
      amount: 1200.00,
      currency: 'USD',
      status: 'submitted' as const,
      dueDate: '2024-09-03',
      description: 'Software licensing'
    }
  ];

  const cycleHealth = {
    totalParticipants: 12,
    activeConnections: 8,
    potentialSavings: 15000,
  };

  const handleInviteAction = () => {
    console.log('Invite suppliers/customers');
  };

  const handleInvoiceAction = (id: string, action: 'approve' | 'reject') => {
    console.log(`Invoice ${id} action: ${action}`);
  };

  return (
    <div className="pb-20 px-4 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-muted-foreground">
          You have {urgentInvoices.length} invoices needing attention
        </p>
      </div>

      {/* Progress Tracker */}
      <div className="mb-6">
        <ProgressBar 
          daysUntilClearing={5}
          totalDays={22}
          urgencyLevel="medium"
        />
      </div>

      {/* Urgent Invoices */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle size={20} className="text-warning" />
          <h2 className="text-lg font-semibold">Needs Your Attention</h2>
        </div>
        
        <div className="space-y-3">
          {urgentInvoices.map((invoice) => (
            <div key={invoice.id} className="animate-slide-up">
              <InvoiceCard 
                invoice={invoice}
                onSwipeAction={handleInvoiceAction}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Cycle Health */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp size={20} className="text-success" />
          <h2 className="text-lg font-semibold">Cycle Health</h2>
        </div>

        <div className="card-gradient rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {cycleHealth.activeConnections}/{cycleHealth.totalParticipants}
              </div>
              <div className="text-xs text-muted-foreground">Active Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-1">
                ${cycleHealth.potentialSavings.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Potential Savings</div>
            </div>
          </div>

          <button
            onClick={handleInviteAction}
            className="w-full btn-primary flex items-center justify-center space-x-2 animate-bounce-soft"
          >
            <Plus size={16} />
            <span>Invite More Suppliers</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="card-invoice text-center py-6">
          <Users size={24} className="text-primary mx-auto mb-2" />
          <span className="text-sm font-medium">Manage Connections</span>
        </button>
        <button className="card-invoice text-center py-6">
          <TrendingUp size={24} className="text-success mx-auto mb-2" />
          <span className="text-sm font-medium">View Analytics</span>
        </button>
      </div>
    </div>
  );
};

export default HomePage;

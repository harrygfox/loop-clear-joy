import React, { useState } from 'react';
import { Check, X, Clock, Building2 } from 'lucide-react';
import { cn, InvoiceAction } from '@/lib/utils';

interface Invoice {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  dueDate: string;
  description: string;
}

interface InvoiceCardProps {
  invoice: Invoice;
  onSwipeAction?: (id: string, action: 'submit' | 'trash') => void;
  showSwipeActions?: boolean;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ 
  invoice, 
  onSwipeAction,
  showSwipeActions = true 
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'submitted': return 'status-submitted';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!showSwipeActions) return;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !showSwipeActions) return;
    const touch = e.touches[0];
    const startX = touch.clientX;
    // This is a simplified swipe implementation
    // In a real app, you'd track the initial touch position
  };

  const handleTouchEnd = () => {
    if (!showSwipeActions) return;
    setIsDragging(false);
    setSwipeOffset(0);
  };

  const handleQuickAction = (action: 'submit' | 'trash') => {
    if (onSwipeAction) {
      onSwipeAction(invoice.id, action);
    }
  };

  return (
    <div className="relative">
      <div 
        className={cn(
          "card-invoice transition-transform duration-200",
          isDragging && "scale-105 shadow-lg"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        {/* Invoice Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Building2 size={16} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">{invoice.from}</p>
              <p className="text-xs text-muted-foreground">to {invoice.to}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">
              {formatAmount(invoice.amount, invoice.currency)}
            </p>
            <div className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border", getStatusColor(invoice.status))}>
              {invoice.status}
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="mb-3">
          <p className="text-sm text-foreground mb-1">{invoice.description}</p>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Clock size={12} />
            <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Quick Actions */}
        {showSwipeActions && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleQuickAction('submit')}
              className="flex-1 btn-success flex items-center justify-center space-x-2 py-2 text-sm animate-bounce-soft"
            >
              <Check size={16} />
              <span>Submit</span>
            </button>
            <button
              onClick={() => handleQuickAction('trash')}
              className="flex-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg flex items-center justify-center space-x-2 py-2 text-sm transition-all duration-200 hover:bg-destructive/20"
            >
              <X size={16} />
              <span>Trash</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceCard;
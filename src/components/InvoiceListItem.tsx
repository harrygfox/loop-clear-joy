import React, { useState, useRef } from 'react';
import { CheckCircle, Clock, XCircle, Send, Trash2, Handshake } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceListItemProps {
  invoice: {
    id: string;
    from: string;
    to: string;
    amount: number;
    currency: string;
    status: 'pending' | 'submitted' | 'approved' | 'rejected';
    description: string;
    userSubmitted?: boolean;
    supplierSubmitted?: boolean;
  };
  mode: 'sent' | 'received';
  onAction?: (id: string, action: 'approve' | 'reject' | 'submit') => void;
  onUndo?: (id: string) => void;
}

const InvoiceListItem = ({ invoice, mode, onAction, onUndo }: InvoiceListItemProps) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHandshake, setShowHandshake] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);

  const displayName = mode === 'sent' ? invoice.to : invoice.from;
  
  // Two-tick model state determination
  const userHalf = mode === 'received' ? invoice.userSubmitted : invoice.status === 'submitted' || invoice.status === 'approved';
  const supplierHalf = mode === 'received' ? invoice.supplierSubmitted : invoice.status === 'approved';
  const bothSubmitted = userHalf && supplierHalf;

  // Handle touch/mouse events for swiping
  const handleStart = (clientX: number) => {
    startX.current = clientX;
    currentX.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (startX.current === 0) return;
    const diff = clientX - startX.current;
    const maxSwipe = 100;
    const clampedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diff));
    setSwipeOffset(clampedDiff);
  };

  const handleEnd = () => {
    const threshold = 60;
    if (Math.abs(swipeOffset) > threshold) {
      if (swipeOffset > 0) {
        // Swipe right - Submit
        handleSubmit();
      } else {
        // Swipe left - Trash
        handleTrash();
      }
    }
    setSwipeOffset(0);
    startX.current = 0;
  };

  const handleSubmit = () => {
    if (onAction) {
      setIsAnimating(true);
      onAction(invoice.id, 'approve');
      
      // Check if both parties will be submitted after this action
      if (mode === 'received' && invoice.supplierSubmitted) {
        setShowHandshake(true);
        setTimeout(() => {
          // Move to clearing animation
        }, 800);
      }
    }
  };

  const handleTrash = () => {
    if (onAction) {
      setIsAnimating(true);
      onAction(invoice.id, 'reject');
    }
  };

  const handleTapSubmit = () => {
    if (onAction) {
      onAction(invoice.id, 'approve');
    }
  };

  // Get status text with friendly copy
  const getStatusText = () => {
    if (bothSubmitted) return 'Moving to Clearing';
    if (userHalf && !supplierHalf) return `Waiting for ${displayName}`;
    if (!userHalf && supplierHalf) return 'Waiting for You';
    return 'Action Required';
  };

  const getSwipeTrailColor = () => {
    if (swipeOffset > 20) return 'bg-success/20';
    if (swipeOffset < -20) return 'bg-destructive/20';
    return '';
  };

  return (
    <div 
      ref={itemRef}
      className={cn(
        "relative overflow-hidden border-b border-border/50 transition-all duration-300",
        isAnimating && "animate-fade-out",
        bothSubmitted && "animate-scale-in"
      )}
      style={{ transform: `translateX(${swipeOffset}px)` }}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX)}
      onMouseUp={handleEnd}
    >
      {/* Swipe Trail Background */}
      {swipeOffset !== 0 && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-200",
          getSwipeTrailColor()
        )}>
          {swipeOffset > 0 ? (
            <CheckCircle size={24} className="text-success" />
          ) : (
            <Trash2 size={24} className="text-destructive" />
          )}
        </div>
      )}

      {/* Handshake Animation Overlay */}
      {showHandshake && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 animate-scale-in">
          <Handshake size={32} className="text-primary animate-pulse" />
        </div>
      )}

      {/* Main Content - Two-Tick Model */}
      <div className="flex h-16 bg-background">
        {/* Left Half - User Decision */}
        <div 
          className={cn(
            "flex-1 flex items-center px-4 border-r border-border/30 transition-all duration-300 cursor-pointer",
            userHalf ? "bg-success/10" : "hover:bg-muted/30"
          )}
          onClick={!userHalf ? handleTapSubmit : undefined}
        >
          <div className="flex items-center space-x-3 flex-1">
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
              userHalf ? "border-success bg-success text-white" : "border-muted-foreground"
            )}>
              {userHalf && <CheckCircle size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                From {displayName}
              </p>
              <p className="text-xs text-muted-foreground">
                {userHalf ? 'Submitted to Clearing' : 'Tap to submit'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Half - Supplier Decision */}
        <div className={cn(
          "flex-1 flex items-center px-4 transition-all duration-300",
          supplierHalf ? "bg-primary/10" : ""
        )}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                supplierHalf ? "border-primary bg-primary text-white" : "border-muted-foreground"
              )}>
                {supplierHalf && <CheckCircle size={14} />}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {supplierHalf ? 'Submitted by supplier' : 'Pending supplier'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                ${invoice.amount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {getStatusText()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visible Action Buttons for Accessibility */}
      {!userHalf && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
          <button
            onClick={handleSubmit}
            className="p-1.5 rounded bg-success/10 text-success hover:bg-success/20 transition-colors"
            aria-label="Submit invoice"
          >
            <CheckCircle size={14} />
          </button>
          <button
            onClick={handleTrash}
            className="p-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            aria-label="Trash invoice"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default InvoiceListItem;
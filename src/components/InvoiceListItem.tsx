import React, { useState, useRef } from 'react';
import { CheckCircle, Circle, Handshake, HelpCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InvoiceAction } from '@/lib/utils';

interface InvoiceListItemProps {
  invoice: {
    id: string;
    from: string;
    to: string;
    amount: number;
    currency: string;
    status: 'pending';
    userAction?: 'none' | 'submitted' | 'rejected';
    supplierAction?: 'none' | 'submitted' | 'rejected';
    description: string;
  };
  mode: 'sent' | 'received';
  onAction?: (id: string, action: 'submit' | 'reject') => void;
  onAnimationComplete?: (id: string) => void;
  shouldTriggerHandshake?: boolean;
  userTickSubmitted?: boolean;
}

const InvoiceListItem = ({ invoice, mode, onAction, onAnimationComplete, shouldTriggerHandshake, userTickSubmitted: propUserTickSubmitted }: InvoiceListItemProps) => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHandshake, setShowHandshake] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'none' | 'tick-bounce' | 'tick-merge' | 'handshake' | 'exit'>('none');
  const [userTickSubmitted, setUserTickSubmitted] = useState(false);
  const startX = useRef(0);
  const itemRef = useRef<HTMLDivElement>(null);

  const displayName = mode === 'sent' ? invoice.to : invoice.from;
  const userAction = invoice.userAction || 'none';
  const supplierAction = invoice.supplierAction || 'none';

  // Trigger handshake animation when prop changes to true
  React.useEffect(() => {
    if (shouldTriggerHandshake && supplierAction === 'submitted') {
      triggerHandshakeAnimation();
    }
  }, [shouldTriggerHandshake, supplierAction]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    setDragX(Math.max(-100, Math.min(100, diff)));
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (Math.abs(dragX) > 50) {
      if (dragX > 0) {
        // Swipe right - submit
        handleAction('submit');
      } else {
        // Swipe left - reject
        handleAction('reject');
      }
    }
    
    setDragX(0);
  };

  const handleAction = (action: 'submit' | 'reject') => {
    if (onAction) {
      onAction(invoice.id, action);
    }
  };

  const triggerHandshakeAnimation = () => {
    setIsAnimating(true);
    setUserTickSubmitted(true);
    
    // Phase 1: User tick bounce (Frame 3)
    setAnimationPhase('tick-bounce');
    
    setTimeout(() => {
      // Phase 2: Ticks merge toward center (Frame 4)
      setAnimationPhase('tick-merge');
      
      setTimeout(() => {
        // Phase 3: Handshake emerges (Frame 5)
        setAnimationPhase('handshake');
        setShowHandshake(true);
        
        setTimeout(() => {
          // Phase 4: Row exits (Frame 6)
          setAnimationPhase('exit');
          
          setTimeout(() => {
            if (onAnimationComplete) {
              onAnimationComplete(invoice.id);
            }
          }, 1000); // Exit animation duration
        }, 600); // Handshake display time
      }, 400); // Tick merge duration
    }, 300); // Tick bounce duration
  };

  const getUserIcon = () => {
    const isSubmitted = userAction === 'submitted' || userTickSubmitted || propUserTickSubmitted;
    const animationClass = animationPhase === 'tick-bounce' && (userTickSubmitted || propUserTickSubmitted) ? 'animate-tick-bounce' : '';
    const mergeClass = animationPhase === 'tick-merge' ? 'animate-tick-merge' : '';
    
    if (userAction === 'rejected') {
      return <XCircle size={20} className="text-destructive" />;
    }
    if (isSubmitted) {
      return <CheckCircle size={20} className={`text-foreground ${animationClass} ${mergeClass}`} />;
    }
    return <HelpCircle size={20} className="text-muted-foreground" />;
  };

  const getSupplierIcon = () => {
    const mergeClass = animationPhase === 'tick-merge' ? 'animate-tick-merge-right' : '';
    
    if (supplierAction === 'rejected') {
      return <XCircle size={20} className="text-destructive" />;
    }
    if (supplierAction === 'submitted') {
      return <CheckCircle size={20} className={`text-foreground ${mergeClass}`} />;
    }
    return <HelpCircle size={20} className="text-muted-foreground" />;
  };

  const getSwipeTrail = () => {
    if (dragX > 10) {
      return 'bg-muted/30';
    } else if (dragX < -10) {
      return 'bg-muted/30';
    }
    return '';
  };

  // Handshake animation states (Frames 4-6)
  if (isAnimating && animationPhase === 'handshake') {
    return (
      <div className="relative overflow-hidden bg-muted/10 border border-muted/30">
        <div className="flex items-center justify-center py-6 px-4">
          <Handshake size={28} className="text-foreground animate-handshake-emerge" />
        </div>
      </div>
    );
  }

  if (isAnimating && animationPhase === 'exit') {
    return (
      <div className="relative overflow-hidden bg-muted/10 border border-muted/30 animate-row-lift-exit">
        <div className="flex items-center justify-center py-6 px-4">
          <Handshake size={28} className="text-foreground" />
        </div>
      </div>
    );
  }

  // Check if supplier has submitted to show green gradient background
  const hasSupplierSubmitted = supplierAction === 'submitted';
  const backgroundClass = hasSupplierSubmitted ? 'bg-gradient-to-r from-background to-muted/20' : 'bg-background';

  return (
    <div 
      ref={itemRef}
      className={`relative overflow-hidden transition-all duration-200 ${getSwipeTrail()} ${backgroundClass}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${dragX}px)`,
      }}
    >
      <div 
        className="flex items-center py-4 px-6 hover:bg-muted/20 transition-colors cursor-pointer"
        onClick={() => navigate(`/invoice/${invoice.id}`)}
      >
        {/* Left - User Status */}
        <div className="w-12 flex flex-col items-center space-y-1">
          {getUserIcon()}
          <span className="text-xs text-muted-foreground">You</span>
        </div>

        {/* Center - Amount */}
        <div className="flex-1 text-center">
          <p className="text-lg font-medium text-foreground">
            £{invoice.amount.toLocaleString()}
          </p>
        </div>

        {/* Right - Supplier Status */}
        <div className="w-12 flex flex-col items-center space-y-1">
          {getSupplierIcon()}
          <span className="text-xs text-muted-foreground">Them</span>
        </div>
      </div>

      {/* Swipe indicators */}
      {dragX > 10 && (
        <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-foreground">
          <CheckCircle size={24} />
        </div>
      )}
      {dragX < -10 && (
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-foreground text-xl">
          ✗
        </div>
      )}
    </div>
  );
};

export default InvoiceListItem;
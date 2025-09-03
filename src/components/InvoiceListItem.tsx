import React, { useState, useRef } from 'react';
import { CheckCircle, Circle, Handshake } from 'lucide-react';
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
    userAction?: 'none' | 'submitted' | 'trashed';
    supplierAction?: 'none' | 'submitted';
    description: string;
  };
  mode: 'sent' | 'received';
  onAction?: (id: string, action: 'submit' | 'trash') => void;
  onAnimationComplete?: (id: string) => void;
}

const InvoiceListItem = ({ invoice, mode, onAction, onAnimationComplete }: InvoiceListItemProps) => {
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
        // Swipe left - trash
        handleAction('trash');
      }
    }
    
    setDragX(0);
  };

  const handleAction = (action: 'submit' | 'trash') => {
    if (action === 'submit' && onAction) {
      onAction(invoice.id, 'submit');
      
      // Check if both parties have submitted
      if (supplierAction === 'submitted') {
        triggerHandshakeAnimation();
      }
    } else if (action === 'trash' && onAction) {
      onAction(invoice.id, 'trash');
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
    const isSubmitted = userAction === 'submitted' || userTickSubmitted;
    const animationClass = animationPhase === 'tick-bounce' && userTickSubmitted ? 'animate-tick-bounce' : '';
    const mergeClass = animationPhase === 'tick-merge' ? 'animate-tick-merge' : '';
    
    if (isSubmitted) {
      return <CheckCircle size={16} className={`text-success ${animationClass} ${mergeClass}`} />;
    }
    return <Circle size={16} className="text-muted-foreground" />;
  };

  const getSupplierIcon = () => {
    const mergeClass = animationPhase === 'tick-merge' ? 'animate-tick-merge-right' : '';
    
    if (supplierAction === 'submitted') {
      return <CheckCircle size={16} className={`text-success ${mergeClass}`} />;
    }
    return <Circle size={16} className="text-muted-foreground" />;
  };

  const getSwipeTrail = () => {
    if (dragX > 10) {
      return 'bg-success/20';
    } else if (dragX < -10) {
      return 'bg-destructive/20';
    }
    return '';
  };

  // Handshake animation states (Frames 4-6)
  if (isAnimating && animationPhase === 'handshake') {
    return (
      <div className="relative overflow-hidden bg-success/5 border border-success/20 rounded-lg">
        <div className="flex items-center justify-center py-6 px-4">
          <Handshake size={28} className="text-success animate-handshake-emerge" />
        </div>
      </div>
    );
  }

  if (isAnimating && animationPhase === 'exit') {
    return (
      <div className="relative overflow-hidden bg-success/5 border border-success/20 rounded-lg animate-row-lift-exit">
        <div className="flex items-center justify-center py-6 px-4">
          <Handshake size={28} className="text-success" />
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={itemRef}
      className={`relative overflow-hidden transition-all duration-200 ${getSwipeTrail()}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${dragX}px)`,
      }}
    >
      <div 
        className="flex items-center py-3 px-4 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
        onClick={() => navigate(`/invoice/${invoice.id}`)}
      >
        {/* Left Half - User */}
        <div className="flex-1 flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getUserIcon()}
            <span className="text-xs text-muted-foreground">You</span>
          </div>
        </div>

        {/* Center - Invoice Info */}
        <div className="flex-2 text-center">
          <p className="text-sm font-medium text-foreground">
            From {displayName}
          </p>
          <p className="text-sm font-semibold text-foreground">
            £{invoice.amount.toLocaleString()}
          </p>
        </div>

        {/* Right Half - Supplier */}
        <div className="flex-1 flex items-center justify-end space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">{displayName.split(' ')[0]}</span>
            {getSupplierIcon()}
          </div>
        </div>
      </div>

      {/* Swipe indicators */}
      {dragX > 10 && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-success">
          <CheckCircle size={20} />
        </div>
      )}
      {dragX < -10 && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-destructive">
          ✗
        </div>
      )}

      {/* Action buttons for accessibility */}
      {userAction === 'none' && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-2 pb-2 opacity-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction('submit');
            }}
            className="px-3 py-1 text-xs bg-success/10 text-success rounded hover:bg-success/20 transition-colors"
          >
            Submit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction('trash');
            }}
            className="px-3 py-1 text-xs bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors"
          >
            Trash
          </button>
        </div>
      )}
    </div>
  );
};

export default InvoiceListItem;
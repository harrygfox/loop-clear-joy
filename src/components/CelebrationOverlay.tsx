import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface CelebrationOverlayProps {
  open: boolean;
  onClose: () => void;
  variant?: 'safe' | 'estimate';
  headline?: string;
  body?: string;
  estimate?: string | null;
  nextSteps?: string[];
  primaryLabel?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  animationEnabled?: boolean;
}

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  open,
  onClose,
  variant = 'safe',
  headline = 'Clearing Set submitted',
  body = 'We\'ve recorded your submission. You can still exclude or return invoices until 28 Sep, 23:59.',
  estimate = null,
  nextSteps = [
    'We\'ll run Clearing at the deadline.',
    'You\'ll get your results sheet with the exact amounts.'
  ],
  primaryLabel = 'OK, got it',
  secondaryLabel = 'View Clearing Set',
  secondaryHref = '/invoices',
  animationEnabled = true
}) => {
  const [animationPhase, setAnimationPhase] = useState<'backdrop' | 'card' | 'checkmark' | 'glow' | 'headline' | 'buttons' | 'complete'>('backdrop');
  const checkmarkRef = useRef<SVGSVGElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shouldAnimate = animationEnabled && !prefersReducedMotion;

  useEffect(() => {
    if (!open || !shouldAnimate) {
      setAnimationPhase('complete');
      return;
    }

    const timeline = [
      { phase: 'backdrop', delay: 0 },
      { phase: 'card', delay: 120 },
      { phase: 'checkmark', delay: 300 },
      { phase: 'glow', delay: 800 },
      { phase: 'headline', delay: 1300 },
      { phase: 'buttons', delay: 1420 },
      { phase: 'complete', delay: 1540 }
    ];

    timeline.forEach(({ phase, delay }) => {
      setTimeout(() => {
        setAnimationPhase(phase as any);
      }, delay);
    });
  }, [open, shouldAnimate]);

  useEffect(() => {
    if (open && primaryButtonRef.current) {
      // Focus the primary button when overlay opens
      setTimeout(() => {
        primaryButtonRef.current?.focus();
      }, 1600);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="celebration-headline"
    >
      <div 
        className={`
          relative bg-background rounded-lg shadow-2xl max-w-md w-full mx-4
          transform transition-all duration-180 ease-out
          ${animationPhase === 'backdrop' ? 'opacity-0' : 'opacity-100'}
          ${animationPhase === 'card' ? 'scale-96' : 'scale-100'}
          ${animationPhase === 'complete' ? 'scale-100' : ''}
        `}
        style={{
          transform: animationPhase === 'card' ? 'scale(0.96)' : 'scale(1)',
          transition: shouldAnimate ? 'all 180ms ease-out' : 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect behind checkmark */}
        <div
          ref={glowRef}
          className={`
            absolute -top-4 -left-4 -right-4 -bottom-4 rounded-full
            bg-primary/15 blur-xl
            transition-opacity duration-300 ease-out
            ${animationPhase === 'glow' ? 'opacity-15' : 'opacity-0'}
            ${animationPhase === 'complete' ? 'opacity-0' : ''}
          `}
          style={{
            opacity: animationPhase === 'glow' ? 0.15 : 0,
            transition: shouldAnimate ? 'opacity 300ms ease-out' : 'none'
          }}
        />

        <div className="p-8 text-center">
          {/* Animated Checkmark */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <svg
                ref={checkmarkRef}
                className="w-16 h-16 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                  style={{
                    strokeDasharray: shouldAnimate ? '100' : '0',
                    strokeDashoffset: shouldAnimate ? (animationPhase === 'checkmark' || animationPhase === 'glow' || animationPhase === 'headline' || animationPhase === 'buttons' || animationPhase === 'complete' ? '0' : '100') : '0',
                    transition: shouldAnimate ? 'stroke-dashoffset 500ms ease-out' : 'none'
                  }}
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>

          {/* Headline */}
          <h1
            id="celebration-headline"
            ref={headlineRef}
            className={`
              text-2xl font-bold text-foreground mb-4
              transition-all duration-120 ease-out
              ${animationPhase === 'headline' || animationPhase === 'complete' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            `}
            style={{
              opacity: (animationPhase === 'headline' || animationPhase === 'complete') ? 1 : 0,
              transform: (animationPhase === 'headline' || animationPhase === 'complete') ? 'translateY(0)' : 'translateY(8px)',
              transition: shouldAnimate ? 'all 120ms ease-out' : 'none'
            }}
          >
            {headline}
          </h1>

          {/* Body text */}
          <p className="text-muted-foreground mb-6">
            {body}
          </p>

          {/* Estimate (if variant is estimate) */}
          {variant === 'estimate' && estimate && (
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {estimate}
              </p>
            </div>
          )}

          {/* Next steps */}
          <div className="mb-8 text-left">
            <h3 className="font-medium text-foreground mb-3">Next steps:</h3>
            <ul className="space-y-2">
              {nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {/* Buttons */}
          <div
            ref={buttonsRef}
            className={`
              flex flex-col gap-3
              transition-all duration-120 ease-out
              ${animationPhase === 'buttons' || animationPhase === 'complete' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            `}
            style={{
              opacity: (animationPhase === 'buttons' || animationPhase === 'complete') ? 1 : 0,
              transform: (animationPhase === 'buttons' || animationPhase === 'complete') ? 'translateY(0)' : 'translateY(8px)',
              transition: shouldAnimate ? 'all 120ms ease-out' : 'none'
            }}
          >
            <Button
              ref={primaryButtonRef}
              onClick={onClose}
              className="w-full"
              size="lg"
            >
              {primaryLabel}
            </Button>
            
            {secondaryLabel && secondaryHref && (
              <Button
                variant="link"
                onClick={() => {
                  window.location.href = secondaryHref;
                }}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                {secondaryLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CelebrationOverlay;
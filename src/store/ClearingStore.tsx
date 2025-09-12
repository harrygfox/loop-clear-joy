import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Invoice, CycleSubmission, ExclusionReason } from '@/types/invoice';
import { useInvoiceStore } from '@/context/InvoiceStore';
import { logEvent } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';

interface ClearingState {
  includedIds: Set<string>;
  excludedIds: Set<string>;
  excludedBy: Map<string, ExclusionReason>;
  counterpartySubmittedById: Map<string, boolean>;
  submission: CycleSubmission | null;
  lastVisited: {
    homeAt?: number;
    clearingAt?: number;
  };
  newEligibleSinceLastVisit: number;
  // New submitted state properties
  hasSubmitted: boolean;
  submittedAtIso: string | null;
  deadlineIso: string;
  mockDay: number;
  hasSeenCelebration: boolean;
}

interface ClearingStore {
  // Selectors
  getEligibleInvoices: (view?: 'all' | 'sent' | 'received') => Invoice[];
  getIncludedInvoices: (view?: 'all' | 'sent' | 'received') => Invoice[];
  getExcludedInvoices: (view?: 'all' | 'sent' | 'received') => Invoice[];
  getReadyToSubmit: () => Invoice[];
  getSubmittedThisCycle: () => Invoice[];
  getExclusionReason: (invoiceId: string) => ExclusionReason;
  isAwaitingCounterparty: (id: string) => boolean;
  hasNewEligibleItems: () => boolean;
  hasSubmission: () => boolean;
  newEligibleSinceLastVisit: number;
  
  // New submitted state selectors
  getSubmittedState: () => {
    hasSubmitted: boolean;
    submittedAtIso: string | null;
    deadlineIso: string;
    mockDay: number;
    daysLeft: number;
    submittedAtLocal: string;
    deadlineLocal: string;
    hasSeenCelebration: boolean;
  };
  
  // Actions
  include: (id: string) => void;
  exclude: (id: string, reason?: ExclusionReason) => void;
  includeAll: (ids: string[]) => void;
  excludeAll: (ids: string[], reason?: ExclusionReason) => void;
  returnToClearing: (id: string) => void;
  returnGroup: (ids: string[]) => void;
  submitForClearing: () => void;
  markVisitedHome: () => void;
  markVisitedClearing: () => void;
  recomputeNewEligibleSinceLastVisit: () => void;
  
  // Prototype controls
  simulateSubmit: () => void;
  resetPrototype: () => void;
  resetAllData: () => void;
  markCelebrationSeen: () => void;
  resetCelebration: () => void;
}

const ClearingStoreContext = createContext<ClearingStore | undefined>(undefined);

const STORAGE_KEY = 'clearing_store_state';

const loadState = (): Partial<ClearingState> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      includedIds: new Set(parsed.includedIds || []),
      excludedIds: new Set(parsed.excludedIds || []),
      excludedBy: new Map(parsed.excludedBy || []),
      counterpartySubmittedById: new Map(parsed.counterpartySubmittedById || []),
      submission: parsed.submission ? {
        ...parsed.submission,
        submittedIds: new Set(parsed.submission.submittedIds || [])
      } : null,
      // Load new submitted state properties with defaults
      hasSubmitted: parsed.hasSubmitted || false,
      submittedAtIso: parsed.submittedAtIso || null,
      deadlineIso: parsed.deadlineIso || '2025-09-28T23:59:59+01:00',
      mockDay: parsed.mockDay || 26,
      hasSeenCelebration: parsed.hasSeenCelebration || false
    };
  } catch {
    return {};
  }
};

const saveState = (state: ClearingState) => {
  try {
    const serializable = {
      ...state,
      includedIds: Array.from(state.includedIds),
      excludedIds: Array.from(state.excludedIds),
      excludedBy: Array.from(state.excludedBy.entries()),
      counterpartySubmittedById: Array.from(state.counterpartySubmittedById.entries()),
      submission: state.submission ? {
        ...state.submission,
        submittedIds: Array.from(state.submission.submittedIds)
      } : null
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch (error) {
    console.error('Failed to save clearing state:', error);
  }
};

export const ClearingStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const invoiceStore = useInvoiceStore();
  const { toast } = useToast();
  
  const [state, setState] = useState<ClearingState>(() => {
    const loaded = loadState();
    return {
      includedIds: loaded.includedIds || new Set(),
      excludedIds: loaded.excludedIds || new Set(),
      excludedBy: loaded.excludedBy || new Map(),
      counterpartySubmittedById: loaded.counterpartySubmittedById || new Map(),
      submission: loaded.submission || null,
      lastVisited: loaded.lastVisited || {},
      newEligibleSinceLastVisit: loaded.newEligibleSinceLastVisit || 0,
      // Initialize new submitted state properties
      hasSubmitted: loaded.hasSubmitted || false,
      submittedAtIso: loaded.submittedAtIso || null,
      deadlineIso: loaded.deadlineIso || '2025-09-28T23:59:59+01:00',
      mockDay: loaded.mockDay || 26,
      hasSeenCelebration: loaded.hasSeenCelebration || false
    };
  });

  // Save state to localStorage on changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Transform invoice data to new model
  const transformInvoice = (invoice: any): Invoice => {
    const direction: 'sent' | 'received' = invoice.from === 'Your Business' ? 'sent' : 'received';
    const matched = !invoice.description?.includes('unmatched'); // Simple prototype logic
    
    return {
      id: invoice.id,
      from: invoice.from,
      to: invoice.to,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      description: invoice.description,
      dueDate: invoice.dueDate,
      issuedAt: invoice.dueDate || new Date().toISOString(), // Fallback for prototype
      direction,
      matched,
      inclusion: state.includedIds.has(invoice.id) ? 'included' : 'excluded',
      exclusionReason: state.excludedBy.get(invoice.id) || null,
      counterpartySubmitted: state.counterpartySubmittedById.get(invoice.id)
    };
  };

  const store: ClearingStore = {
    getEligibleInvoices: (view = 'all') => {
      const allInvoices = invoiceStore.getAllInvoices().map(transformInvoice);
      const eligible = allInvoices.filter(inv => inv.matched);
      
      switch (view) {
        case 'sent':
          return eligible.filter(inv => inv.direction === 'sent');
        case 'received':
          return eligible.filter(inv => inv.direction === 'received');
        default:
          return eligible;
      }
    },

    getIncludedInvoices: (view = 'all') => {
      const allInvoices = invoiceStore.getAllInvoices().map(transformInvoice);
      const included = allInvoices.filter(inv => inv.matched && state.includedIds.has(inv.id));
      
      switch (view) {
        case 'sent':
          return included.filter(inv => inv.direction === 'sent');
        case 'received':
          return included.filter(inv => inv.direction === 'received');
        default:
          return included;
      }
    },

    getExcludedInvoices: (view = 'all') => {
      const allInvoices = invoiceStore.getAllInvoices().map(transformInvoice);
      const excluded = allInvoices.filter(inv => !inv.matched || state.excludedIds.has(inv.id));
      
      switch (view) {
        case 'sent':
          return excluded.filter(inv => inv.direction === 'sent');
        case 'received':
          return excluded.filter(inv => inv.direction === 'received');
        default:
          return excluded;
      }
    },

    getExclusionReason: (invoiceId: string) => {
      return state.excludedBy.get(invoiceId) || null;
    },

    getReadyToSubmit: () => {
      const eligible = store.getEligibleInvoices();
      const included = eligible.filter(inv => state.includedIds.has(inv.id));
      const submittedIds = state.submission?.submittedIds || new Set();
      return included.filter(inv => !submittedIds.has(inv.id));
    },

    getSubmittedThisCycle: () => {
      if (!state.submission) return [];
      const eligible = store.getEligibleInvoices();
      return eligible.filter(inv => state.submission!.submittedIds.has(inv.id));
    },

    isAwaitingCounterparty: (id: string) => {
      const submittedIds = state.submission?.submittedIds || new Set();
      if (!submittedIds.has(id)) return false;
      return state.counterpartySubmittedById.get(id) === false;
    },

    hasNewEligibleItems: () => {
      return state.newEligibleSinceLastVisit > 0;
    },

    hasSubmission: () => {
      return state.hasSubmitted;
    },
    
    newEligibleSinceLastVisit: state.newEligibleSinceLastVisit,

    include: (id: string) => {
      setState(prev => ({
        ...prev,
        includedIds: new Set([...prev.includedIds, id]),
        excludedIds: new Set([...prev.excludedIds].filter(eid => eid !== id)),
        excludedBy: new Map([...prev.excludedBy.entries()].filter(([eid]) => eid !== id))
      }));
      logEvent.invoiceReturned(id);
      
      toast({
        title: "Success",
        description: "Returned to Clearing Set.",
      });
    },

    exclude: (id: string, reason = 'by_customer') => {
      setState(prev => ({
        ...prev,
        includedIds: new Set([...prev.includedIds].filter(iid => iid !== id)),
        excludedIds: new Set([...prev.excludedIds, id]),
        excludedBy: new Map([...prev.excludedBy.entries(), [id, reason]])
      }));
      logEvent.invoiceExcluded(id, reason);
      
      toast({
        title: "Success",
        description: "Excluded from this cycle.",
      });
    },

    includeAll: (ids: string[]) => {
      setState(prev => ({
        ...prev,
        includedIds: new Set([...prev.includedIds, ...ids]),
        excludedIds: new Set([...prev.excludedIds].filter(eid => !ids.includes(eid))),
        excludedBy: new Map([...prev.excludedBy.entries()].filter(([eid]) => !ids.includes(eid)))
      }));
    },

    excludeAll: (ids: string[], reason = 'by_customer') => {
      setState(prev => {
        const newExcludedBy = new Map(prev.excludedBy);
        ids.forEach(id => newExcludedBy.set(id, reason));
        
        return {
          ...prev,
          includedIds: new Set([...prev.includedIds].filter(iid => !ids.includes(iid))),
          excludedIds: new Set([...prev.excludedIds, ...ids]),
          excludedBy: newExcludedBy
        };
      });
    },

    returnGroup: (ids: string[]) => {
      store.includeAll(ids);
    },

    returnToClearing: (id: string) => {
      store.include(id);
    },

    submitForClearing: () => {
      const readyToSubmit = store.getReadyToSubmit();
      const newSubmittedIds = new Set([
        ...(state.submission?.submittedIds || []),
        ...readyToSubmit.map(inv => inv.id)
      ]);
      
      const newVersion = (state.submission?.version || 0) + 1;
      const submittedAt = new Date().toISOString();
      
      setState(prev => ({
        ...prev,
        submission: {
          version: newVersion,
          submittedIds: newSubmittedIds,
          submittedAt
        },
        hasSubmitted: true,
        submittedAtIso: submittedAt,
        hasSeenCelebration: false
      }));

      const counts = {
        sent: readyToSubmit.filter(inv => inv.direction === 'sent').length,
        received: readyToSubmit.filter(inv => inv.direction === 'received').length
      };
      
      const totals = {
        sent: readyToSubmit.filter(inv => inv.direction === 'sent').reduce((sum, inv) => sum + inv.amount, 0),
        received: readyToSubmit.filter(inv => inv.direction === 'received').reduce((sum, inv) => sum + inv.amount, 0)
      };

      logEvent.submitConfirmed(newVersion, counts, totals);
      
      // Don't show toast - the celebration overlay handles the success message
      // const submittedState = store.getSubmittedState();
      // toast({
      //   title: "Success",
      //   description: `Clearing Set submitted. You can still make changes until ${submittedState.deadlineLocal}.`,
      // });
    },

    markVisitedHome: () => {
      setState(prev => ({
        ...prev,
        lastVisited: { ...prev.lastVisited, homeAt: Date.now() }
      }));
    },

    markVisitedClearing: () => {
      setState(prev => ({
        ...prev,
        lastVisited: { ...prev.lastVisited, clearingAt: Date.now() },
        newEligibleSinceLastVisit: 0
      }));
      logEvent.clearingTabBadgeCleared();
    },

    recomputeNewEligibleSinceLastVisit: () => {
      // Simplified for prototype - just check if we have new items
      const eligible = store.getEligibleInvoices();
      const lastClearingVisit = state.lastVisited.clearingAt || 0;
      const newCount = eligible.length; // In real app, would check timestamps
      
      setState(prev => ({
        ...prev,
        newEligibleSinceLastVisit: newCount > 0 && lastClearingVisit === 0 ? newCount : 0
      }));
    },

    getSubmittedState: () => {
      // Always use September 26, 2025 as the current date for prototype
      const now = new Date('2025-09-26T10:00:00+01:00'); // Fixed to Sep 26, 2025
      const deadline = new Date(state.deadlineIso);
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      const formatLocalDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      };
      
      const formatLocalDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + 
               ', ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      };
      
      return {
        hasSubmitted: state.hasSubmitted,
        submittedAtIso: state.submittedAtIso,
        deadlineIso: state.deadlineIso,
        mockDay: state.mockDay,
        daysLeft: Math.max(0, daysLeft), // This will always be 2 for Sep 26 -> Sep 28
        submittedAtLocal: state.submittedAtIso ? formatLocalDate(state.submittedAtIso) : '',
        deadlineLocal: formatLocalDateTime(state.deadlineIso),
        hasSeenCelebration: state.hasSeenCelebration
      };
    },

    simulateSubmit: () => {
      setState(prev => ({
        ...prev,
        hasSubmitted: true,
        submittedAtIso: new Date().toISOString(),
        hasSeenCelebration: false
      }));
      
      toast({
        title: "Success",
        description: "Clearing Set submitted. You can still make changes until 28 Sep, 23:59.",
      });
    },

    resetPrototype: () => {
      setState(prev => ({
        ...prev,
        hasSubmitted: false,
        submittedAtIso: null,
        hasSeenCelebration: false
      }));
    },

    markCelebrationSeen: () => {
      setState(prev => ({
        ...prev,
        hasSeenCelebration: true
      }));
    },

    resetCelebration: () => {
      setState(prev => ({
        ...prev,
        hasSeenCelebration: false
      }));
    },

    resetAllData: () => {
      // Get all eligible invoices to include them all
      const allEligibleInvoices = store.getEligibleInvoices();
      const allEligibleIds = allEligibleInvoices.map(inv => inv.id);
      
      // Reset all clearing data but include all eligible invoices
      setState({
        includedIds: new Set(allEligibleIds), // Include all eligible invoices
        excludedIds: new Set(), // Clear all exclusions
        excludedBy: new Map(), // Clear all exclusion reasons
        counterpartySubmittedById: new Map(), // Clear counterparty submission states
        submission: null, // Clear submission
        lastVisited: {}, // Clear visit tracking
        newEligibleSinceLastVisit: 0, // Reset new items counter
        hasSubmitted: false, // Reset submission state
        submittedAtIso: null, // Clear submission timestamp
        deadlineIso: '2025-09-28T23:59:59+01:00', // Keep deadline
        mockDay: 26, // Keep mock day
        hasSeenCelebration: false // Reset celebration state
      });
      
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);
      
      toast({
        title: "Success",
        description: "All invoices moved back to Clearing Set. Submission state reset.",
      });
    }
  };

  // Initialize eligible invoices on mount
  useEffect(() => {
    const eligible = store.getEligibleInvoices();
    const unmatched = invoiceStore.getAllInvoices().map(transformInvoice).filter(inv => !inv.matched);
    
    // Auto-include eligible invoices that aren't already excluded
    const toInclude = eligible.filter(inv => !state.excludedIds.has(inv.id) && !state.includedIds.has(inv.id));
    if (toInclude.length > 0) {
      setState(prev => ({
        ...prev,
        includedIds: new Set([...prev.includedIds, ...toInclude.map(inv => inv.id)])
      }));
    }

    // Auto-exclude unmatched invoices
    const toExclude = unmatched.filter(inv => !state.excludedIds.has(inv.id));
    if (toExclude.length > 0) {
      setState(prev => {
        const newExcludedBy = new Map(prev.excludedBy);
        toExclude.forEach(inv => newExcludedBy.set(inv.id, 'by_system'));
        
        return {
          ...prev,
          excludedIds: new Set([...prev.excludedIds, ...toExclude.map(inv => inv.id)]),
          excludedBy: newExcludedBy
        };
      });
      
      toExclude.forEach(inv => logEvent.autoExcluded('counterparty_not_member'));
    }

    logEvent.invoicesEligible(eligible.length);
    store.recomputeNewEligibleSinceLastVisit();
  }, []); // Only run on mount

  return (
    <ClearingStoreContext.Provider value={store}>
      {children}
    </ClearingStoreContext.Provider>
  );
};

export const useClearingStore = (): ClearingStore => {
  const context = useContext(ClearingStoreContext);
  if (!context) {
    throw new Error('useClearingStore must be used within a ClearingStoreProvider');
  }
  return context;
};
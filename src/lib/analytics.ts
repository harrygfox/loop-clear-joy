// Lightweight analytics for prototype instrumentation
interface AnalyticsEvent {
  name: string;
  payload: Record<string, any>;
  timestamp: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];

  log(name: string, payload: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      name,
      payload,
      timestamp: Date.now()
    };
    
    this.events.push(event);
    console.log('[Analytics]', name, payload);
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  clear() {
    this.events = [];
  }
}

export const analytics = new Analytics();

// Event helpers for type safety
export const logEvent = {
  integrationStateChanged: (source: string, state: string) => 
    analytics.log('integration_state_changed', { source, state }),
  
  invoicesEligible: (count: number) => 
    analytics.log('invoices_eligible', { count }),
  
  autoExcluded: (reason: string) => 
    analytics.log('auto_excluded', { reason }),
  
  clearingOpened: (view: string) => 
    analytics.log('clearing_opened', { view }),
  
  invoiceExcluded: (id: string, reason?: string) => 
    analytics.log('invoice_excluded', { id, reason }),
  
  invoiceReturned: (id: string) => 
    analytics.log('invoice_returned', { id }),
  
  submitConfirmed: (version: number, counts: any, totals: any) => 
    analytics.log('submit_confirmed', { version, counts, totals }),
  
  repeatSubmitToastSeen: () => 
    analytics.log('repeat_submit_toast_seen'),
  
  homeAttentionSeen: () => 
    analytics.log('home_attention_seen'),
  
  homeSubmitClicked: () => 
    analytics.log('home_submit_clicked'),
  
  awaitingCounterpartySeen: () => 
    analytics.log('awaiting_counterparty_seen'),
  
  timelineInfoOpened: () => 
    analytics.log('timeline_info_opened'),
  
  clearingTabBadgeShown: () => 
    analytics.log('clearing_tab_badge_shown'),
  
  clearingTabBadgeCleared: () => 
    analytics.log('clearing_tab_badge_cleared'),

  // Cycle events
  cycleBannerClicked: () => 
    analytics.log('cycle_banner_clicked'),
  
  cycleModalOpened: () => 
    analytics.log('cycle_modal_opened'),
  
  // Ready card events
  readyCardSubmitClicked: () => 
    analytics.log('ready_card_submit_clicked'),
  
  readyCardReviewClicked: () => 
    analytics.log('ready_card_review_clicked'),
  
  // Invoice events (updated for new terminology)
  invoicesViewOpened: (section: 'in-round' | 'removed' | 'included' | 'excluded', filter: 'all' | 'sent' | 'received') =>
    analytics.log('invoices_view_opened', { section, filter }),

  invoicesTabChanged: (tab: string) =>
    analytics.log('invoices_tab_changed', { tab }),

  filterChanged: (tab: string, value: string) =>
    analytics.log('filter_changed', { tab, value }),

  // Group events (updated terminology)
  groupToggled: (tab: string, counterparty: string, expanded: boolean) =>
    analytics.log('group_toggled', { tab, counterparty, expanded }),

  groupRemoveAll: (counterparty: string, count: number, sum: number) =>
    analytics.log('group_remove_all', { counterparty, count, sum }),

  groupMoveAllBack: (counterparty: string, count: number, sum: number) =>
    analytics.log('group_move_all_back', { counterparty, count, sum }),

  groupExcludeAll: (counterparty: string, count: number, sum: number) =>
    analytics.log('group_exclude_all', { counterparty, count, sum }),

  groupReturnAll: (counterparty: string, count: number, sum: number) =>
    analytics.log('group_return_all', { counterparty, count, sum }),

  // Individual invoice events (updated terminology)
  invoiceRemoved: (id: string) =>
    analytics.log('invoice_removed', { id }),

  invoiceMovedBack: (id: string) =>
    analytics.log('invoice_moved_back', { id }),

  invoiceExcludedNew: (id: string) =>
    analytics.log('invoice_excluded', { id }),

  invoiceReturnedNew: (id: string) =>
    analytics.log('invoice_returned', { id }),

  invoicesNewSinceLastClicked: () =>
    analytics.log('invoices_new_since_last_clicked'),

  invoicesConsentBannerSeen: () =>
    analytics.log('invoices_consent_banner_seen'),

  invoicesConsentCtaClicked: () =>
    analytics.log('invoices_consent_cta_clicked')
};
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

  // New Invoices screen events
  invoicesViewOpened: (section: 'included' | 'excluded', filter: 'all' | 'sent' | 'received') =>
    analytics.log('invoices_view_opened', { section, filter }),

  groupExcludeAll: (counterparty: string, count: number, sum: number) =>
    analytics.log('group_exclude_all', { counterparty, count, sum }),

  groupReturnAll: (counterparty: string, count: number, sum: number) =>
    analytics.log('group_return_all', { counterparty, count, sum }),

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
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClearingStore } from '@/store/ClearingStore';
import { logEvent } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';
import ConsentBanner from '@/components/ConsentBanner';
import FilterDropdown, { FilterOption } from '@/components/FilterDropdown';
import ExclusionReasonChip from '@/components/ExclusionReasonChip';
import { Invoice } from '@/types/invoice';

const InvoicesScreen: React.FC = () => {
  const { toast } = useToast();
  const { 
    getIncludedInvoices, 
    getExcludedInvoices, 
    exclude, 
    include,
    getExclusionReason 
  } = useClearingStore();

  const [includedFilter, setIncludedFilter] = useState<FilterOption>('all');
  const [excludedFilter, setExcludedFilter] = useState<FilterOption>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    logEvent.invoicesViewOpened('included', includedFilter);
  }, [includedFilter]);

  useEffect(() => {
    logEvent.invoicesViewOpened('excluded', excludedFilter);
  }, [excludedFilter]);

  const filterInvoices = (invoices: Invoice[], filter: FilterOption) => {
    switch (filter) {
      case 'sent': return invoices.filter(inv => inv.direction === 'sent');
      case 'received': return invoices.filter(inv => inv.direction === 'received');
      default: return invoices;
    }
  };

  const groupByCounterparty = (invoices: Invoice[]) => {
    const groups = invoices.reduce((acc, invoice) => {
      const counterparty = invoice.direction === 'sent' ? invoice.to : invoice.from;
      if (!acc[counterparty]) {
        acc[counterparty] = [];
      }
      acc[counterparty].push(invoice);
      return acc;
    }, {} as Record<string, Invoice[]>);

    return Object.entries(groups).map(([counterparty, invoices]) => ({
      counterparty,
      invoices,
      count: invoices.length,
      sum: invoices.reduce((sum, inv) => sum + inv.amount, 0)
    }));
  };

  const handleExclude = (invoiceId: string) => {
    exclude(invoiceId);
    logEvent.invoiceExcludedNew(invoiceId);
    toast({
      description: "Excluded from this clearing cycle",
      className: "animate-slide-up",
    });
  };

  const handleReturn = (invoiceId: string) => {
    include(invoiceId);
    logEvent.invoiceReturnedNew(invoiceId);
    toast({
      description: "Returned to this cycle",
      className: "animate-slide-up",
    });
  };

  const handleGroupExclude = (counterparty: string, invoices: Invoice[]) => {
    const count = invoices.length;
    const sum = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    
    invoices.forEach(invoice => exclude(invoice.id));
    logEvent.groupExcludeAll(counterparty, count, sum);
    
    toast({
      description: `Excluded ${count} invoices from this clearing cycle`,
      className: "animate-slide-up",
    });
  };

  const handleGroupReturn = (counterparty: string, invoices: Invoice[]) => {
    const count = invoices.length;
    const sum = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    
    invoices.forEach(invoice => include(invoice.id));
    logEvent.groupReturnAll(counterparty, count, sum);
    
    toast({
      description: `Returned ${count} invoices to this cycle`,
      className: "animate-slide-up",
    });
  };

  const toggleGroup = (counterparty: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(counterparty)) {
      newExpanded.delete(counterparty);
    } else {
      newExpanded.add(counterparty);
    }
    setExpandedGroups(newExpanded);
  };

  const includedInvoices = filterInvoices(getIncludedInvoices(), includedFilter);
  const excludedInvoices = filterInvoices(getExcludedInvoices(), excludedFilter);
  
  const includedGroups = groupByCounterparty(includedInvoices);
  const excludedGroups = groupByCounterparty(excludedInvoices);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Eligible invoices are included by default. Untick to exclude for this cycle.
          </p>
        </div>

        <ConsentBanner />

        {/* Section A: Included this cycle */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Included this cycle</h2>
            <FilterDropdown value={includedFilter} onChange={setIncludedFilter} />
          </div>

          {includedGroups.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
              Nothing included yet. Connect your accounts or return invoices from Excluded.
            </div>
          ) : (
            <div className="space-y-3">
              {includedGroups.map(({ counterparty, invoices, count, sum }) => (
                <div key={counterparty} className="border border-border rounded-lg bg-card">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGroup(counterparty)}
                        className="p-1 h-auto"
                      >
                        {expandedGroups.has(counterparty) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <div className="font-medium text-foreground">{counterparty}</div>
                        <div className="text-sm text-muted-foreground">
                          {count} invoice{count !== 1 ? 's' : ''} · £{sum.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGroupExclude(counterparty, invoices)}
                        className="text-sm"
                      >
                        Exclude all
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGroup(counterparty)}
                        className="text-sm"
                      >
                        Expand
                      </Button>
                    </div>
                  </div>
                  
                  {expandedGroups.has(counterparty) && (
                    <div className="border-t border-border">
                      {invoices.map((invoice) => (
                        <div 
                          key={invoice.id} 
                          className="p-4 border-b border-border last:border-b-0 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">{invoice.id}</span>
                              <Badge variant="outline" className="text-xs">
                                {invoice.direction}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              £{invoice.amount.toLocaleString()} · {new Date(invoice.issuedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExclude(invoice.id)}
                            className="text-sm text-muted-foreground hover:text-foreground"
                          >
                            Exclude
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section B: Excluded this cycle */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Excluded this cycle</h2>
            <FilterDropdown value={excludedFilter} onChange={setExcludedFilter} />
          </div>

          {excludedGroups.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
              No excluded invoices.
            </div>
          ) : (
            <div className="space-y-3">
              {excludedGroups.map(({ counterparty, invoices, count, sum }) => (
                <div key={counterparty} className="border border-border rounded-lg bg-card">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGroup(counterparty)}
                        className="p-1 h-auto"
                      >
                        {expandedGroups.has(counterparty) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <div className="font-medium text-foreground">{counterparty}</div>
                        <div className="text-sm text-muted-foreground">
                          {count} invoice{count !== 1 ? 's' : ''} · £{sum.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGroupReturn(counterparty, invoices)}
                        className="text-sm"
                      >
                        Return all
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGroup(counterparty)}
                        className="text-sm"
                      >
                        Expand
                      </Button>
                    </div>
                  </div>
                  
                  {expandedGroups.has(counterparty) && (
                    <div className="border-t border-border">
                      {invoices.map((invoice) => {
                        const exclusionReason = getExclusionReason(invoice.id);
                        const isSystemExcluded = exclusionReason === 'by_system';
                        
                        return (
                          <div 
                            key={invoice.id} 
                            className="p-4 border-b border-border last:border-b-0 flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-foreground">{invoice.id}</span>
                                <Badge variant="outline" className="text-xs">
                                  {invoice.direction}
                                </Badge>
                                <ExclusionReasonChip reason={exclusionReason} />
                              </div>
                              <div className="text-sm text-muted-foreground">
                                £{invoice.amount.toLocaleString()} · {new Date(invoice.issuedAt).toLocaleDateString()}
                              </div>
                            </div>
                            {!isSystemExcluded && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReturn(invoice.id)}
                                className="text-sm text-muted-foreground hover:text-foreground"
                              >
                                Return to Clearing
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicesScreen;
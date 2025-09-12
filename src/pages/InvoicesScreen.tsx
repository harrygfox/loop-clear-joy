import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useClearingStore } from '@/store/ClearingStore';
import { logEvent } from '@/lib/analytics';
import { useToast } from '@/hooks/use-toast';
import CountdownCard from '@/components/CountdownCard';
import ReadyToSubmitCard from '@/components/ReadyToSubmitCard';
import CycleModal from '@/components/CycleModal';
import FilterDropdown, { FilterOption } from '@/components/FilterDropdown';
import InvoiceGroup from '@/components/InvoiceGroup';
import { Invoice } from '@/types/invoice';
import { formatLocalCutoff } from '@/lib/cycle';

const InvoicesScreen: React.FC = () => {
  const { toast } = useToast();
  const { 
    getIncludedInvoices, 
    getExcludedInvoices, 
    exclude, 
    include,
    hasSubmission
  } = useClearingStore();

  const [activeTab, setActiveTab] = useState('in-round');
  const [inRoundFilter, setInRoundFilter] = useState<FilterOption>('all');
  const [removedFilter, setRemovedFilter] = useState<FilterOption>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showCycleModal, setShowCycleModal] = useState(false);
  const inRoundSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = activeTab === 'in-round' ? 'in-round' : 'removed';
    const filter = activeTab === 'in-round' ? inRoundFilter : removedFilter;
    logEvent.invoicesViewOpened(section, filter);
  }, [activeTab, inRoundFilter, removedFilter]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    logEvent.invoicesTabChanged(value);
  };

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

  const handleRemove = (invoiceId: string) => {
    exclude(invoiceId);
    logEvent.invoiceRemoved(invoiceId);
    toast({
      description: "Excluded from this cycle.",
      className: "animate-slide-up",
    });
  };

  const handleMoveBack = (invoiceId: string) => {
    include(invoiceId);
    logEvent.invoiceMovedBack(invoiceId);
    toast({
      description: "Returned to Clearing Set.",
      className: "animate-slide-up",
    });
  };

  const handleGroupRemove = (counterparty: string, invoices: Invoice[]) => {
    const count = invoices.length;
    const sum = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    
    invoices.forEach(invoice => exclude(invoice.id));
    logEvent.groupRemoveAll(counterparty, count, sum);
    
    toast({
      description: "Excluded from this cycle.",
      className: "animate-slide-up",
    });
  };

  const handleGroupMoveBack = (counterparty: string, invoices: Invoice[]) => {
    const count = invoices.length;
    const sum = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    
    invoices.forEach(invoice => include(invoice.id));
    logEvent.groupMoveAllBack(counterparty, count, sum);
    
    toast({
      description: "Returned to Clearing Set.",
      className: "animate-slide-up",
    });
  };

  const toggleGroup = (counterparty: string) => {
    const newExpanded = new Set(expandedGroups);
    const expanded = !newExpanded.has(counterparty);
    if (expanded) {
      newExpanded.add(counterparty);
    } else {
      newExpanded.delete(counterparty);
    }
    setExpandedGroups(newExpanded);
    logEvent.groupToggled(activeTab, counterparty, expanded);
  };

  // Filter out system-excluded invoices completely
  const getVisibleInvoices = (includeExcluded: boolean) => {
    const invoices = includeExcluded ? getExcludedInvoices() : getIncludedInvoices();
    return invoices; // System exclusions are now invisible
  };

  const inRoundInvoices = filterInvoices(getVisibleInvoices(false), inRoundFilter);
  const removedInvoices = filterInvoices(getVisibleInvoices(true), removedFilter);
  
  const inRoundGroups = groupByCounterparty(inRoundInvoices);
  const removedGroups = groupByCounterparty(removedInvoices);

  const deadlineLocal = formatLocalCutoff(new Date('2025-09-28T23:59:59'));

  const scrollToInRound = () => {
    inRoundSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <CountdownCard 
          day={25}
          daysLeft={3}
          deadlineLocal="28 Sep, 23:59"
          windowOpen={true}
          hasSubmitted={hasSubmission()}
          onInfoClick={() => setShowCycleModal(true)}
        />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Invoices</h1>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-3">
          <div className="mb-2">
            <TabsList className="w-full justify-start border-b border-border bg-transparent p-0 rounded-none h-auto">
              <TabsTrigger 
                value="in-round" 
                className="rounded-none px-0 py-0 mr-6 -mb-px text-lg font-semibold border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground"
              >
                Clearing Set ({inRoundInvoices.length})
              </TabsTrigger>
              <TabsTrigger 
                value="removed" 
                className="rounded-none px-0 py-0 -mb-px text-lg font-semibold border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground"
              >
                Excluded ({removedInvoices.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex flex-col items-end gap-4 justify-between mt-4 mb-4">
            <div className="text-sm w-full">
              <p>New invoices appear here automatically.</p>
              <p>Remove any that shouldn't count this round.</p>
            </div>
            <div>
              <FilterDropdown 
                value={activeTab === 'in-round' ? inRoundFilter : removedFilter} 
                onChange={(value) => {
                  if (activeTab === 'in-round') {
                    setInRoundFilter(value);
                    logEvent.filterChanged('in-round', value);
                  } else {
                    setRemovedFilter(value);
                    logEvent.filterChanged('removed', value);
                  }
                }} 
              />
            </div>
          </div>

          <TabsContent value="in-round" ref={inRoundSectionRef}>
            {inRoundGroups.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
                <p className="font-medium">No invoices in your Clearing Set yet</p>
                <p className="text-sm">New invoices will appear here automatically.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inRoundGroups.map(({ counterparty, invoices, count, sum }) => (
                  <InvoiceGroup
                    key={counterparty}
                    counterparty={counterparty}
                    invoices={invoices}
                    count={count}
                    sum={sum}
                    expanded={expandedGroups.has(counterparty)}
                    onToggle={() => toggleGroup(counterparty)}
                    onGroupAction={() => handleGroupRemove(counterparty, invoices)}
                    onItemAction={handleRemove}
                    actionLabel="Exclude all"
                    itemActionLabel="Exclude from this cycle"
                    variant="in-round"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="removed">
            {removedGroups.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
                No invoices in Excluded
              </div>
            ) : (
              <div className="space-y-3">
                {removedGroups.map(({ counterparty, invoices, count, sum }) => (
                  <InvoiceGroup
                    key={counterparty}
                    counterparty={counterparty}
                    invoices={invoices}
                    count={count}
                    sum={sum}
                    expanded={expandedGroups.has(counterparty)}
                    onToggle={() => toggleGroup(counterparty)}
                    onGroupAction={() => handleGroupMoveBack(counterparty, invoices)}
                    onItemAction={handleMoveBack}
                    actionLabel="Return all to Clearing Set"
                    itemActionLabel="Return to Clearing Set"
                    variant="removed"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <ReadyToSubmitCard 
          variant={hasSubmission() ? 'submitted' : 'window-open'}
          deadlineLocal={deadlineLocal}
        />

        <CycleModal 
          open={showCycleModal}
          onOpenChange={setShowCycleModal}
          day={25}
          deadlineLocal={deadlineLocal}
        />
      </div>
    </div>
  );
};

export default InvoicesScreen;
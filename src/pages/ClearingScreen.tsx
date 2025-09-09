import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClearingStore } from '@/store/ClearingStore';
import { Invoice } from '@/types/invoice';
import { logEvent } from '@/lib/analytics';
import { isReadOnly } from '@/lib/cycle';
import SubmitForClearingModal from '@/components/SubmitForClearingModal';
import StandaloneInvoice from '@/components/StandaloneInvoice';
import { useToast } from '@/hooks/use-toast';

type ViewFilter = 'all' | 'sent' | 'received';

const ClearingScreen = () => {
  const [currentView, setCurrentView] = useState<ViewFilter>('all');
  const [showExcluded, setShowExcluded] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const clearingStore = useClearingStore();
  const { toast } = useToast();

  useEffect(() => {
    clearingStore.markVisitedClearing();
    logEvent.clearingOpened(currentView);
  }, []);

  const readyToSubmit = clearingStore.getReadyToSubmit();
  const submittedThisCycle = clearingStore.getSubmittedThisCycle();
  const isAfterCutoff = isReadOnly();
  const hasSubmission = submittedThisCycle.length > 0;

  const getFilteredInvoices = (invoices: Invoice[], view: ViewFilter) => {
    switch (view) {
      case 'sent':
        return invoices.filter(inv => inv.direction === 'sent');
      case 'received':
        return invoices.filter(inv => inv.direction === 'received');
      default:
        return invoices;
    }
  };

  const groupByCounterparty = (invoices: Invoice[]) => {
    const groups = new Map<string, Invoice[]>();
    
    invoices.forEach(invoice => {
      const counterparty = invoice.direction === 'sent' ? invoice.to : invoice.from;
      if (!groups.has(counterparty)) {
        groups.set(counterparty, []);
      }
      groups.get(counterparty)!.push(invoice);
    });

    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  };

  const handleAction = (id: string, action: 'exclude' | 'return') => {
    if (action === 'exclude') {
      clearingStore.exclude(id);
      toast({
        title: "Excluded",
        description: "Excluded from this clearing cycle.",
      });
    } else {
      clearingStore.returnToClearing(id);
      toast({
        title: "Returned",
        description: "Returned to clearing set.",
      });
    }
  };

  const handleGroupAction = (ids: string[], action: 'exclude' | 'return') => {
    if (action === 'exclude') {
      clearingStore.excludeAll(ids);
      toast({
        title: "Excluded",
        description: `Excluded ${ids.length} invoices from this clearing cycle.`,
      });
    } else {
      clearingStore.returnGroup(ids);
      toast({
        title: "Returned",
        description: `Returned ${ids.length} invoices to clearing set.`,
      });
    }
  };

  const renderInvoiceGroup = (counterparty: string, invoices: Invoice[], isExcluded = false) => {
    if (invoices.length === 1) {
      const invoice = invoices[0];
      return (
        <div key={invoice.id} className="border border-border rounded-lg overflow-hidden">
          <StandaloneInvoice
            invoice={invoice}
            mode={invoice.direction === 'sent' ? 'sent' : 'received'}
            onAction={(id, action) => handleAction(id, isExcluded ? 'return' : 'exclude')}
          />
          {!isAfterCutoff && (
            <div className="p-3 border-t border-border bg-muted/30">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction(invoice.id, isExcluded ? 'return' : 'exclude')}
                className="w-full"
              >
                {isExcluded ? 'Return to Clearing' : 'Exclude'}
              </Button>
            </div>
          )}
        </div>
      );
    }

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div key={counterparty} className="border border-border rounded-lg overflow-hidden">
        <div 
          className="p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{counterparty}</h3>
              <p className="text-sm text-muted-foreground">
                {invoices.length} invoices • £{totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="text-muted-foreground">
              {isExpanded ? '−' : '+'}
            </div>
          </div>
        </div>
        
        {!isAfterCutoff && (
          <div className="p-3 border-t border-border bg-background flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGroupAction(
                invoices.map(inv => inv.id), 
                isExcluded ? 'return' : 'exclude'
              )}
              className="flex-1"
            >
              {isExcluded ? `Return all ${invoices.length}` : `Exclude all ${invoices.length}`}
            </Button>
          </div>
        )}

        {isExpanded && (
          <div className="border-t border-border">
            {invoices.map(invoice => (
              <div key={invoice.id} className="border-b border-border last:border-b-0">
                <StandaloneInvoice
                  invoice={invoice}
                  mode={invoice.direction === 'sent' ? 'sent' : 'received'}
                  onAction={(id, action) => handleAction(id, isExcluded ? 'return' : 'exclude')}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title: string, invoices: Invoice[], emptyMessage: string, isExcluded = false) => {
    const filteredInvoices = getFilteredInvoices(invoices, currentView);
    const groupedInvoices = groupByCounterparty(filteredInvoices);

    if (filteredInvoices.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {title && (
          <div className="border-b border-border pb-2 mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        )}
        
        <div className="space-y-3">
          {groupedInvoices.map(([counterparty, invoices]) => 
            renderInvoiceGroup(counterparty, invoices, isExcluded)
          )}
        </div>
      </div>
    );
  };

  const getHelperText = (view: ViewFilter) => {
    switch (view) {
      case 'sent':
        return "Invoices you issued.";
      case 'received':
        return "Invoices issued to you.";
      default:
        return "Invoices are included by default. Untick to exclude for this cycle.";
    }
  };

  const eligibleInvoices = showExcluded 
    ? clearingStore.getExcludedInvoices(currentView)
    : clearingStore.getEligibleInvoices(currentView);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Clearing</h1>
          
          {!isAfterCutoff && readyToSubmit.length > 0 && !showExcluded && (
            <Button onClick={() => setShowSubmitModal(true)}>
              Submit for clearing
              {hasSubmission && (
                <span className="ml-1 text-xs opacity-75">(update submission)</span>
              )}
            </Button>
          )}
        </div>

        <Tabs value={showExcluded ? 'excluded' : 'included'} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="included" onClick={() => setShowExcluded(false)}>
              Clearing Set
            </TabsTrigger>
            <TabsTrigger value="excluded" onClick={() => setShowExcluded(true)}>
              Excluded
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewFilter)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
                <TabsTrigger value="received">Received</TabsTrigger>
              </TabsList>
              
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {getHelperText(currentView)}
                </p>

                <TabsContent value="all" className="mt-0">
                  {showExcluded ? (
                    renderSection(
                      "", 
                      eligibleInvoices, 
                      "No excluded invoices.",
                      true
                    )
                  ) : (
                    <div className="space-y-8">
                      {readyToSubmit.length > 0 && (
                        renderSection(
                          "Ready to submit",
                          readyToSubmit,
                          "No items ready to submit."
                        )
                      )}
                      
                      {submittedThisCycle.length > 0 && (
                        <div className="space-y-4">
                          <div className="border-b border-border pb-2">
                            <h2 className="text-lg font-semibold">Submitted this cycle</h2>
                          </div>
                          
                          {renderSection("", submittedThisCycle, "")}
                        </div>
                      )}
                      
                      {readyToSubmit.length === 0 && submittedThisCycle.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No eligible invoices yet. Connect your accounts to get started.
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="sent" className="mt-0">
                  {renderSection(
                    showExcluded ? "" : (readyToSubmit.length > 0 ? "Ready to submit" : ""),
                    eligibleInvoices,
                    showExcluded ? "No excluded sent invoices." : "No sent invoices ready to submit.",
                    showExcluded
                  )}
                </TabsContent>
                
                <TabsContent value="received" className="mt-0">
                  {renderSection(
                    showExcluded ? "" : (readyToSubmit.length > 0 ? "Ready to submit" : ""),
                    eligibleInvoices,
                    showExcluded ? "No excluded received invoices." : "No received invoices ready to submit.",
                    showExcluded
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </Tabs>

        <SubmitForClearingModal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          onSubmit={() => {}}
          isRepeatSubmission={hasSubmission}
        />
      </div>
    </div>
  );
};

export default ClearingScreen;
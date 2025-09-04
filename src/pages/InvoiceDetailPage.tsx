import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, FileText, DollarSign, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import SubmitModal from '@/components/SubmitModal';
import { useToast } from '@/hooks/use-toast';
import { InvoiceAction } from '@/lib/utils';
import { useNavigationState } from '@/hooks/useNavigationState';
import { useInvoiceStore } from '@/context/InvoiceStore';

const InvoiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { restoreNavigationState } = useNavigationState();
  const { getInvoiceById, submitInvoice, rejectInvoice } = useInvoiceStore();
  const [submitModal, setSubmitModal] = useState<{ isOpen: boolean; invoice: any }>({
    isOpen: false,
    invoice: null
  });

  const invoice = getInvoiceById(id || '');

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Invoice not found</h2>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isReceived = invoice.from !== 'Your Business';
  const canTakeAction = isReceived ? 
    (invoice.userAction === 'none' || invoice.userAction === undefined) : 
    (invoice.status === 'pending');

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusBadge = () => {
    if (isReceived) {
      if (invoice.userAction === 'submitted') {
        return <Badge variant="default" className="bg-primary/10 text-primary">Added</Badge>;
      }
      if (invoice.supplierAction === 'submitted') {
        return <Badge variant="secondary">Awaiting Customer</Badge>;
      }
      return <Badge variant="secondary">Not decided</Badge>;
    } else {
      if (invoice.userAction === 'submitted') {
        return <Badge variant="default" className="bg-primary/10 text-primary">Added</Badge>;
      }
      if (invoice.supplierAction === 'submitted') {
        return <Badge variant="secondary">Awaiting Supplier</Badge>;
      }
      return <Badge variant="secondary">Not decided</Badge>;
    }
  };

  const handleAction = (action: InvoiceAction) => {
    if (!invoice) return;
    
    if (action === 'submit') {
      setSubmitModal({ isOpen: true, invoice });
    } else {
      rejectInvoice(invoice.id);
      toast({
        title: "Invoice Rejected",
        description: `Invoice has been rejected.`,
      });
    }
  };

  const handleSubmitConfirm = (createRule: boolean) => {
    if (!invoice) return;
    
    // Submit the invoice
    submitInvoice(invoice.id);
    
    // Check if counterparty already submitted to determine message
    const alreadySubmittedByCounterpart = invoice.supplierAction === 'submitted';
    const isReceived = invoice.to === 'Your Business';
    
    if (alreadySubmittedByCounterpart) {
      toast({
        title: "Added to clearing list",
        description: "Added to Clearing",
      });
    } else {
      const waitingFor = isReceived ? 'Awaiting Supplier' : 'Awaiting Customer';
      toast({
        title: "Added to clearing list",
        description: waitingFor,
      });
    }
    
    setSubmitModal({ isOpen: false, invoice: null });
  };

  const subtotal = invoice.amount;
  const tax = subtotal * 0.2; // 20% VAT
  const total = subtotal + tax;

  // Force scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => {
                const state = restoreNavigationState();
                const route = state.tab === 'home' ? '/home' : 
                              state.tab === 'received' ? `/received?view=${state.view}` :
                              state.tab === 'sent' ? `/sent?view=${state.view}` :
                              state.tab === 'clearing' ? '/clearing' : '/home';
                
                navigate(route);
                
                // Restore scroll position after navigation
                setTimeout(() => {
                  window.scrollTo(0, state.scrollPosition);
                }, 100);
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-foreground">Invoice Details</h1>
              <p className="text-sm text-muted-foreground">{invoice.id}</p>
            </div>
            <div className="w-16" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Invoice Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {invoice.from}
                </CardTitle>
                <p className="text-muted-foreground">to {invoice.to}</p>
                {getStatusBadge()}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-foreground">
                  £{invoice.amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Total Amount</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Invoice Information */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Invoice Number:</span>
                </div>
                <p className="text-foreground pl-6">{invoice.id}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Issue Date:</span>
                </div>
                <p className="text-foreground pl-6">N/A</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Due Date:</span>
                </div>
                <p className="text-foreground pl-6">{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Currency:</span>
                </div>
                <p className="text-foreground pl-6">{invoice.currency}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Description</h4>
              <p className="text-muted-foreground">{invoice.description}</p>
            </div>
            
          </CardContent>
        </Card>


        {/* Actions */}
        {canTakeAction && (
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleAction('submit')}
                  className="flex-1 flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Add Invoice to Clearing List
                </Button>
                <Button 
                  onClick={() => handleAction('reject')}
                  variant="outline"
                  className="flex-1 flex items-center gap-2 border-destructive/20 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Reject Invoice
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Taking an action will not close this view. Use the back button to return.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Submit Modal */}
      <SubmitModal
        isOpen={submitModal.isOpen}
        onClose={() => setSubmitModal({ isOpen: false, invoice: null })}
        onSubmit={handleSubmitConfirm}
        invoice={submitModal.invoice}
        mode="received"
      />
    </div>
  );
};

export default InvoiceDetailPage;
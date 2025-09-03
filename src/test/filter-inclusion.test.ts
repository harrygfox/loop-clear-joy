import { describe, it, expect } from 'vitest'
import { Invoice } from '@/types/invoice'

// Test the filtering logic that includes pending animation invoices
describe('Filter Inclusion Logic', () => {
  const mockInvoices: Invoice[] = [
    {
      id: 'invoice-1',
      from: 'Supplier A',
      to: 'Customer B',
      amount: 1000,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'none',
      description: 'Invoice 1'
    },
    {
      id: 'invoice-2', 
      from: 'Supplier A',
      to: 'Customer B',
      amount: 2000,
      currency: 'GBP',
      status: 'pending',
      userAction: 'submitted',
      supplierAction: 'submitted',
      description: 'Invoice 2'
    }
  ]

  // Simulate the filtering logic from SentPage/ReceivedPage
  const getFilteredInvoices = (
    invoices: Invoice[], 
    activeView: string, 
    pendingAnimationId: string | null
  ) => {
    let baseFiltered;
    switch (activeView) {
      case 'need-action':
        baseFiltered = invoices.filter(inv => inv.userAction === 'none');
        break;
      default:
        baseFiltered = invoices.filter(inv => inv.userAction === 'none');
    }
    
    // Include invoice with pending animation even if it no longer matches the filter
    if (pendingAnimationId) {
      const pendingInvoice = invoices.find(inv => inv.id === pendingAnimationId);
      if (pendingInvoice && !baseFiltered.find(inv => inv.id === pendingAnimationId)) {
        baseFiltered = [...baseFiltered, pendingInvoice];
      }
    }
    
    return baseFiltered;
  }

  it('includes pending animation invoice even when it no longer matches filter', () => {
    // Initially, invoice-2 would not match 'need-action' filter since userAction is 'submitted'
    const filtered = getFilteredInvoices(mockInvoices, 'need-action', 'invoice-2')
    
    expect(filtered).toHaveLength(2)
    expect(filtered.find(inv => inv.id === 'invoice-1')).toBeDefined() // Normal match
    expect(filtered.find(inv => inv.id === 'invoice-2')).toBeDefined() // Included due to pendingAnimationId
  })

  it('does not duplicate invoices that already match the filter', () => {
    // invoice-1 already matches 'need-action' filter
    const filtered = getFilteredInvoices(mockInvoices, 'need-action', 'invoice-1')
    
    expect(filtered).toHaveLength(1)
    expect(filtered.filter(inv => inv.id === 'invoice-1')).toHaveLength(1) // Only one copy
  })

  it('works normally when pendingAnimationId is null', () => {
    const filtered = getFilteredInvoices(mockInvoices, 'need-action', null)
    
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('invoice-1')
  })
})
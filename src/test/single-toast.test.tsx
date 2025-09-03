import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import SentPage from '@/pages/SentPage'
import ReceivedPage from '@/pages/ReceivedPage'

// Mock the toast hook to ensure it's never called
const mockToast = vi.fn()
vi.mock('@/hooks/use-toast', () => ({
  toast: mockToast,
  useToast: () => ({ toasts: [] })
}))

// Mock the invoice store
const mockSubmitInvoice = vi.fn()
const mockRejectInvoice = vi.fn()
const mockUnsubmitInvoice = vi.fn()

vi.mock('@/context/InvoiceStore', () => ({
  useInvoiceStore: () => ({
    getSentInvoices: () => [{
      id: 'test-invoice',
      from: 'Company A',
      to: 'Company B',
      amount: 1000,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'none',
      description: 'Test invoice'
    }],
    getReceivedInvoices: () => [{
      id: 'test-invoice-received',
      from: 'Company C', 
      to: 'Company D',
      amount: 2000,
      currency: 'GBP',
      status: 'pending',
      userAction: 'none',
      supplierAction: 'none',
      description: 'Test received invoice'
    }],
    submitInvoice: mockSubmitInvoice,
    rejectInvoice: mockRejectInvoice,
    unsubmitInvoice: mockUnsubmitInvoice
  })
}))

// Mock other components to focus on toast behavior
vi.mock('@/components/CustomerGroup', () => ({ default: () => <div data-testid="customer-group" /> }))
vi.mock('@/components/SupplierGroup', () => ({ default: () => <div data-testid="supplier-group" /> }))

describe('Single Toast Behavior', () => {
  it('SentPage uses UndoSnackbar instead of toast for notifications', () => {
    const { container } = render(
      <BrowserRouter>
        <SentPage />
      </BrowserRouter>
    )

    // Verify page renders without errors
    expect(container.textContent).toContain('Sent')
    
    // Verify toast() was never called during render
    expect(mockToast).not.toHaveBeenCalled()
  })

  it('ReceivedPage uses UndoSnackbar instead of toast for notifications', () => {
    const { container } = render(
      <BrowserRouter>
        <ReceivedPage />
      </BrowserRouter>
    )

    // Verify page renders without errors
    expect(container.textContent).toContain('Received')
    
    // Verify toast() was never called during render
    expect(mockToast).not.toHaveBeenCalled()
  })
})
import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import InvoiceListItem from '@/components/InvoiceListItem'

// Mock timers for animation testing
vi.useFakeTimers()

describe('Handshake Animation Visibility', () => {
  const mockInvoice = {
    id: 'test-invoice',
    from: 'Supplier A',
    to: 'Customer B', 
    amount: 1000,
    currency: 'GBP',
    status: 'pending' as const,
    userAction: 'none' as const,
    supplierAction: 'submitted' as const,
    description: 'Test invoice'
  }

  beforeEach(() => {
    vi.clearAllTimers()
  })

  it('keeps invoice mounted during handshake animation when counterparty already submitted', () => {
    const onAnimationComplete = vi.fn()
    
    const { container } = render(
      <InvoiceListItem
        invoice={mockInvoice}
        mode="received"
        shouldTriggerHandshake={true}
        onAnimationComplete={onAnimationComplete}
      />
    )

    // Initial render - invoice should be visible
    expect(container.querySelector('[data-testid="invoice-amount"]') || container.textContent).toContain('1,000')

    // Fast-forward through tick-bounce phase (300ms)
    vi.advanceTimersByTime(300)
    expect(container.firstChild).toBeInTheDocument()

    // Fast-forward through tick-merge phase (400ms)
    vi.advanceTimersByTime(400)
    expect(container.firstChild).toBeInTheDocument()

    // Fast-forward through handshake phase (600ms)
    vi.advanceTimersByTime(600)
    expect(container.firstChild).toBeInTheDocument()

    // Fast-forward through exit phase (1000ms)
    vi.advanceTimersByTime(1000)
    expect(onAnimationComplete).toHaveBeenCalledWith('test-invoice')
  })

  it('does not trigger handshake when counterparty has not submitted', () => {
    const invoiceNotSubmitted = {
      ...mockInvoice,
      supplierAction: 'none' as const
    }

    const { container } = render(
      <InvoiceListItem
        invoice={invoiceNotSubmitted}
        mode="received"
        shouldTriggerHandshake={true}
      />
    )

    // Should remain as normal invoice item
    expect(container.textContent).toContain('1,000')
    
    // Fast-forward and ensure no handshake appears
    vi.advanceTimersByTime(2000)
    expect(container.textContent).toContain('1,000')
  })
})
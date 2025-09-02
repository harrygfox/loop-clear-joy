
import React, { useState } from 'react';
import { Filter, Search } from 'lucide-react';
import InvoiceCard from '@/components/InvoiceCard';

const ReceivedPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Mock data
  const invoices = [
    {
      id: '1',
      from: 'Acme Corp',
      to: 'Your Business',
      amount: 2500.00,
      currency: 'USD',
      status: 'pending' as const,
      dueDate: '2024-09-05',
      description: 'Professional services Q3'
    },
    {
      id: '2',
      from: 'Tech Solutions Ltd',
      to: 'Your Business',
      amount: 1200.00,
      currency: 'USD',
      status: 'submitted' as const,
      dueDate: '2024-09-03',
      description: 'Software licensing'
    },
    {
      id: '3',
      from: 'Design Studio',
      to: 'Your Business',
      amount: 800.00,
      currency: 'USD',
      status: 'approved' as const,
      dueDate: '2024-09-01',
      description: 'Brand identity design'
    },
    {
      id: '4',
      from: 'Marketing Agency',
      to: 'Your Business',
      amount: 3200.00,
      currency: 'USD',
      status: 'pending' as const,
      dueDate: '2024-09-07',
      description: 'Digital marketing campaign'
    }
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || invoice.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleInvoiceAction = (id: string, action: 'approve' | 'reject') => {
    console.log(`Invoice ${id} action: ${action}`);
    // Add bounce animation to indicate action
    const element = document.getElementById(`invoice-${id}`);
    if (element) {
      element.classList.add('animate-bounce-soft');
      setTimeout(() => {
        element.classList.remove('animate-bounce-soft');
      }, 600);
    }
  };

  return (
    <div className="pb-20 px-4 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Received Invoices
        </h1>
        <p className="text-muted-foreground">
          {filteredInvoices.length} invoices to review
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-muted-foreground" />
          <div className="flex space-x-2 overflow-x-auto">
            {['all', 'pending', 'submitted', 'approved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  filter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice, index) => (
          <div 
            key={invoice.id} 
            id={`invoice-${invoice.id}`}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <InvoiceCard 
              invoice={invoice}
              onSwipeAction={handleInvoiceAction}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No invoices found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default ReceivedPage;

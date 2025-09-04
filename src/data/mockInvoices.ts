// Centralized mock data store for all invoices
export type MockInvoice = {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  userAction: 'none' | 'submitted' | 'rejected';
  supplierAction: 'none' | 'submitted' | 'rejected';
  description: string;
  dueDate?: string;
  invoiceNumber?: string;
  issueDate?: string;
  notes?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
};

// All invoices in the system
const mockInvoices: MockInvoice[] = [
  // ===== RECEIVED INVOICES (John Steel Co) =====
  {
    id: 'r1',
    from: 'John Steel Co',
    to: 'Your Business',
    amount: 1250.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'submitted',
    description: 'Steel supplies Q3',
    dueDate: '2024-09-15',
    invoiceNumber: 'JS-2024-001',
    issueDate: '2024-08-15',
    notes: 'Quarterly steel supply delivery including structural beams and reinforcement materials.',
    items: [
      { description: 'Structural Steel Beams', quantity: 10, unitPrice: 85.00, total: 850.00 },
      { description: 'Reinforcement Bars', quantity: 20, unitPrice: 20.00, total: 400.00 }
    ]
  },
  {
    id: 'r2',
    from: 'John Steel Co',
    to: 'Your Business',
    amount: 600.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'submitted',
    supplierAction: 'none',
    description: 'Monthly services',
    dueDate: '2024-09-10',
    invoiceNumber: 'JS-2024-002',
    issueDate: '2024-08-20',
    notes: 'Regular monthly maintenance and consultation services.',
    items: [
      { description: 'Consultation Services', quantity: 1, unitPrice: 600.00, total: 600.00 }
    ]
  },
  {
    id: 'r3',
    from: 'John Steel Co',
    to: 'Your Business',
    amount: 2000.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'submitted',
    description: 'Equipment rental',
    dueDate: '2024-09-12',
    invoiceNumber: 'JS-2024-003',
    issueDate: '2024-08-25',
    notes: 'Monthly equipment rental for construction project.',
    items: [
      { description: 'Crane Rental', quantity: 1, unitPrice: 1500.00, total: 1500.00 },
      { description: 'Safety Equipment', quantity: 1, unitPrice: 500.00, total: 500.00 }
    ]
  },
  {
    id: 'r4',
    from: 'John Steel Co',
    to: 'Your Business',
    amount: 875.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'submitted',
    description: 'Additional steel order',
    dueDate: '2024-09-18',
    invoiceNumber: 'JS-2024-004',
    issueDate: '2024-08-30',
    items: [
      { description: 'Steel Plates', quantity: 5, unitPrice: 175.00, total: 875.00 }
    ]
  },
  {
    id: 'r5',
    from: 'John Steel Co',
    to: 'Your Business',
    amount: 1450.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'none',
    description: 'Specialized materials',
    dueDate: '2024-09-20',
    invoiceNumber: 'JS-2024-005',
    issueDate: '2024-09-01',
    items: [
      { description: 'Specialized Steel Alloy', quantity: 3, unitPrice: 483.33, total: 1450.00 }
    ]
  },
  // ===== RECEIVED INVOICES (BuildMart Supplies) =====
  {
    id: 'r6',
    from: 'BuildMart Supplies',
    to: 'Your Business',
    amount: 320.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'submitted',
    description: 'Construction materials',
    dueDate: '2024-09-14',
    invoiceNumber: 'BM-2024-001',
    issueDate: '2024-08-22',
    items: [
      { description: 'Cement Bags', quantity: 20, unitPrice: 16.00, total: 320.00 }
    ]
  },
  {
    id: 'r7',
    from: 'BuildMart Supplies',
    to: 'Your Business',
    amount: 180.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'submitted',
    description: 'Hardware supplies',
    dueDate: '2024-09-11',
    invoiceNumber: 'BM-2024-002',
    issueDate: '2024-08-18',
    items: [
      { description: 'Screws and Bolts Set', quantity: 1, unitPrice: 180.00, total: 180.00 }
    ]
  },
  // ===== RECEIVED INVOICES (ElectroTech Ltd) =====
  {
    id: 'r8',
    from: 'ElectroTech Ltd',
    to: 'Your Business',
    amount: 750.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'none',
    description: 'Electrical components',
    dueDate: '2024-09-16',
    invoiceNumber: 'ET-2024-001',
    issueDate: '2024-08-28',
    items: [
      { description: 'Electrical Wiring', quantity: 100, unitPrice: 5.50, total: 550.00 },
      { description: 'Circuit Breakers', quantity: 10, unitPrice: 20.00, total: 200.00 }
    ]
  },
  {
    id: 'r9',
    from: 'ElectroTech Ltd',
    to: 'Your Business',
    amount: 425.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'rejected',
    description: 'Lighting fixtures',
    dueDate: '2024-09-13',
    invoiceNumber: 'ET-2024-002',
    issueDate: '2024-08-24',
    items: [
      { description: 'LED Light Fixtures', quantity: 15, unitPrice: 28.33, total: 425.00 }
    ]
  },
  
  // ===== SINGLE RECEIVED INVOICES (Unique Suppliers) =====
  {
    id: 'r10',
    from: 'GreenTech Solutions',
    to: 'Your Business',
    amount: 890.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'submitted',
    description: 'Solar panel installation',
    dueDate: '2024-09-22',
    invoiceNumber: 'GT-2024-001',
    issueDate: '2024-09-02',
    items: [
      { description: 'Solar Panel System', quantity: 1, unitPrice: 890.00, total: 890.00 }
    ]
  },
  {
    id: 'r11',
    from: 'QuickFix Plumbing',
    to: 'Your Business',
    amount: 375.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'none',
    description: 'Emergency plumbing repair',
    dueDate: '2024-09-17',
    invoiceNumber: 'QF-2024-001',
    issueDate: '2024-08-31',
    items: [
      { description: 'Pipe Repair Service', quantity: 1, unitPrice: 375.00, total: 375.00 }
    ]
  },
  {
    id: 'r12',
    from: 'DataSecure Ltd',
    to: 'Your Business',
    amount: 1200.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'submitted',
    supplierAction: 'none',
    description: 'IT security audit',
    dueDate: '2024-09-25',
    invoiceNumber: 'DS-2024-001',
    issueDate: '2024-09-03',
    items: [
      { description: 'Security Audit & Report', quantity: 1, unitPrice: 1200.00, total: 1200.00 }
    ]
  },
  {
    id: 'r13',
    from: 'OfficeMax Supplies',
    to: 'Your Business',
    amount: 245.50,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'rejected',
    description: 'Office furniture',
    dueDate: '2024-09-19',
    invoiceNumber: 'OM-2024-001',
    issueDate: '2024-08-29',
    items: [
      { description: 'Ergonomic Office Chair', quantity: 1, unitPrice: 245.50, total: 245.50 }
    ]
  },
  {
    id: 'r14',
    from: 'CloudHost Services',
    to: 'Your Business',
    amount: 85.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'submitted',
    description: 'Monthly hosting fee',
    dueDate: '2024-09-21',
    invoiceNumber: 'CH-2024-001',
    issueDate: '2024-09-01',
    items: [
      { description: 'Cloud Hosting Service', quantity: 1, unitPrice: 85.00, total: 85.00 }
    ]
  },
  
  // ===== SENT INVOICES (Client Corp) =====
  {
    id: 's1',
    from: 'Your Business',
    to: 'Client Corp',
    amount: 3500.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'none',
    description: 'Web development project',
    dueDate: '2024-09-08',
    invoiceNumber: 'YB-2024-001',
    issueDate: '2024-08-01',
    notes: 'Complete web development project including frontend and backend development.',
    items: [
      { description: 'Frontend Development', quantity: 40, unitPrice: 50.00, total: 2000.00 },
      { description: 'Backend Development', quantity: 30, unitPrice: 50.00, total: 1500.00 }
    ]
  },
  {
    id: 's2',
    from: 'Your Business',
    to: 'Client Corp',
    amount: 1800.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'submitted',
    supplierAction: 'none',
    description: 'Consulting services',
    dueDate: '2024-09-06',
    invoiceNumber: 'YB-2024-002',
    issueDate: '2024-08-05',
    notes: 'Strategic consulting and business development services.',
    items: [
      { description: 'Strategic Consulting', quantity: 20, unitPrice: 90.00, total: 1800.00 }
    ]
  },
  {
    id: 's3',
    from: 'Your Business',
    to: 'Client Corp',
    amount: 2200.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'submitted',
    description: 'Mobile app development',
    dueDate: '2024-09-05',
    invoiceNumber: 'YB-2024-003',
    issueDate: '2024-08-10',
    items: [
      { description: 'Mobile App Development', quantity: 44, unitPrice: 50.00, total: 2200.00 }
    ]
  },
  // ===== SENT INVOICES (Startup Inc) =====
  {
    id: 's4',
    from: 'Your Business',
    to: 'Startup Inc',
    amount: 950.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'submitted',
    description: 'Digital marketing setup',
    dueDate: '2024-09-10',
    invoiceNumber: 'YB-2024-004',
    issueDate: '2024-08-12',
    items: [
      { description: 'Digital Marketing Strategy', quantity: 1, unitPrice: 950.00, total: 950.00 }
    ]
  },
  {
    id: 's5',
    from: 'Your Business',
    to: 'Startup Inc',
    amount: 1275.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'submitted',
    description: 'Content creation package',
    dueDate: '2024-09-12',
    invoiceNumber: 'YB-2024-005',
    issueDate: '2024-08-15',
    items: [
      { description: 'Content Creation', quantity: 25, unitPrice: 51.00, total: 1275.00 }
    ]
  },
  
  // ===== SINGLE SENT INVOICES (Unique Customers) =====
  {
    id: 's6',
    from: 'Your Business',
    to: 'TechFlow Enterprises',
    amount: 2850.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'none',
    description: 'System integration project',
    dueDate: '2024-09-28',
    invoiceNumber: 'YB-2024-006',
    issueDate: '2024-09-04',
    items: [
      { description: 'System Integration Services', quantity: 57, unitPrice: 50.00, total: 2850.00 }
    ]
  },
  {
    id: 's7',
    from: 'Your Business',
    to: 'Retail Solutions Group',
    amount: 1650.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'submitted',
    supplierAction: 'none',
    description: 'E-commerce platform setup',
    dueDate: '2024-09-26',
    invoiceNumber: 'YB-2024-007',
    issueDate: '2024-09-05',
    items: [
      { description: 'E-commerce Development', quantity: 33, unitPrice: 50.00, total: 1650.00 }
    ]
  },
  {
    id: 's8',
    from: 'Your Business',
    to: 'MedCare Solutions',
    amount: 4200.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'submitted',
    description: 'Healthcare management system',
    dueDate: '2024-09-30',
    invoiceNumber: 'YB-2024-008',
    issueDate: '2024-09-06',
    items: [
      { description: 'Healthcare System Development', quantity: 84, unitPrice: 50.00, total: 4200.00 }
    ]
  },
  {
    id: 's9',
    from: 'Your Business',
    to: 'Finance Pro Ltd',
    amount: 975.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'rejected',
    description: 'Financial dashboard design',
    dueDate: '2024-09-24',
    invoiceNumber: 'YB-2024-009',
    issueDate: '2024-09-07',
    items: [
      { description: 'Dashboard Design & Implementation', quantity: 1, unitPrice: 975.00, total: 975.00 }
    ]
  },
  {
    id: 's10',
    from: 'Your Business',
    to: 'LogiTrans Corp',
    amount: 1580.00,
    currency: 'GBP',
    status: 'pending',
    userAction: 'none',
    supplierAction: 'submitted',
    description: 'Logistics tracking system',
    dueDate: '2024-09-29',
    invoiceNumber: 'YB-2024-010',
    issueDate: '2024-09-08',
    items: [
      { description: 'Tracking System Development', quantity: 31, unitPrice: 50.96, total: 1580.00 }
    ]
  }
];

// Helper functions
export const getAllInvoices = (): MockInvoice[] => mockInvoices;

export const getInvoiceById = (id: string): MockInvoice | undefined => 
  mockInvoices.find(invoice => invoice.id === id);

export const getReceivedInvoices = (): MockInvoice[] => 
  mockInvoices.filter(invoice => invoice.from !== 'Your Business');

export const getSentInvoices = (): MockInvoice[] => 
  mockInvoices.filter(invoice => invoice.from === 'Your Business');

export const updateInvoice = (id: string, updates: Partial<MockInvoice>): MockInvoice | null => {
  const index = mockInvoices.findIndex(invoice => invoice.id === id);
  if (index === -1) return null;
  
  mockInvoices[index] = { ...mockInvoices[index], ...updates };
  return mockInvoices[index];
};
import React from 'react';

type Props = { className?: string };

const InvoiceReceived: React.FC<Props> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
    <path d="M8 12h8"/>
  </svg>
);

export default InvoiceReceived;

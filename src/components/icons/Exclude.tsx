import React from 'react';

type Props = { className?: string };

const Exclude: React.FC<Props> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 62 62"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9 3H15L21 9V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V4C3 3.44772 3.44772 3 4 3H9Z"/>
    <path d="M9 3L15 9H9V3Z"/>
    <path d="M15 15L9 9M9 15L15 9"/>
  </svg>
);

export default Exclude;

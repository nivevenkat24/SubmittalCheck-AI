import React from 'react';
import { ReviewStatus } from '../types';

interface StatusBadgeProps {
  status: ReviewStatus;
  large?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, large = false }) => {
  let bg = 'bg-gray-100';
  let text = 'text-gray-800';
  let border = 'border-gray-200';

  switch (status) {
    case ReviewStatus.APPROVED:
      bg = 'bg-green-50';
      text = 'text-green-700';
      border = 'border-green-200';
      break;
    case ReviewStatus.APPROVED_AS_NOTED:
      bg = 'bg-blue-50';
      text = 'text-blue-700';
      border = 'border-blue-200';
      break;
    case ReviewStatus.REVISE_AND_RESUBMIT:
      bg = 'bg-red-50';
      text = 'text-red-700';
      border = 'border-red-200';
      break;
    case ReviewStatus.REJECT:
      bg = 'bg-rose-50';
      text = 'text-rose-700';
      border = 'border-rose-200';
      break;
  }

  return (
    <span className={`inline-flex items-center justify-center rounded-full border ${bg} ${text} ${border} font-medium ${large ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs'} print:border-2`}>
      {status}
    </span>
  );
};
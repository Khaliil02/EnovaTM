import React from 'react';

/**
 * Reusable component for displaying status badges with consistent styling
 * @param {string} status - The status value (open, in_progress, escalated, closed)
 * @param {string} type - The badge type (status or priority)
 * @returns {JSX.Element} - A styled status badge
 */
const StatusBadge = ({ status, type = 'status' }) => {
  const getStatusStyles = () => {
    // Status styles using CSS variables
    if (type === 'status') {
      switch(status?.toLowerCase()) {
        case 'open':
          return 'bg-warning-100 text-warning-700';
        case 'in_progress':
          return 'bg-info-100 text-info-700';
        case 'escalated':
          return 'bg-error-100 text-error-700';
        case 'closed':
          return 'bg-success-100 text-success-700';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    } 
    // Priority styles using CSS variables
    switch(status?.toLowerCase()) {
      case 'low':
        return 'bg-success-100 text-success-700';
      case 'medium':
        return 'bg-info-100 text-info-700';
      case 'high':
        return 'bg-warning-100 text-warning-700';
      case 'urgent':
        return 'bg-error-100 text-error-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status for display
  const formatStatus = () => {
    if (!status) return 'Unknown';
    
    // Handle statuses with underscores
    if (status.includes('_')) {
      return status.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    // Otherwise just capitalize the first letter
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}>
      {formatStatus()}
    </span>
  );
};

export default StatusBadge;
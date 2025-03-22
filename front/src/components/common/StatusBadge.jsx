import React from 'react';

/**
 * Reusable component for displaying status badges with consistent styling
 * @param {string} status - The status value (open, in_progress, escalated, closed)
 * @param {string} type - The badge type (status or priority)
 * @returns {JSX.Element} - A styled status badge
 */
const StatusBadge = ({ status, type = 'status' }) => {
  const getStatusStyles = () => {
    // Status styles mapping
    if (type === 'status') {
      return {
        open: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-blue-100 text-blue-800',
        escalated: 'bg-red-100 text-red-800',
        closed: 'bg-green-100 text-green-800'
      }[status] || 'bg-gray-100 text-gray-800';
    } 
    // Priority styles mapping
    return {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }[status] || 'bg-gray-100 text-gray-800';
  };

  // Format status label (e.g., "in_progress" -> "In Progress")
  const formatLabel = (status) => {
    if (status === 'in_progress') return 'In Progress';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyles()}`}>
      {formatLabel(status)}
    </span>
  );
};

export default React.memo(StatusBadge);
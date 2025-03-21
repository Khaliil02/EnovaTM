const TicketPriorityChart = ({ tickets }) => {
  // Count tickets by priority
  const urgentCount = tickets.filter(ticket => ticket.priority === 'urgent').length;
  const highCount = tickets.filter(ticket => ticket.priority === 'high').length;
  const mediumCount = tickets.filter(ticket => ticket.priority === 'medium').length;
  const lowCount = tickets.filter(ticket => ticket.priority === 'low').length;
  
  // Calculate percentages for bar widths
  const total = tickets.length || 1; // Avoid division by zero
  const urgentPercent = (urgentCount / total) * 100;
  const highPercent = (highCount / total) * 100;
  const mediumPercent = (mediumCount / total) * 100;
  const lowPercent = (lowCount / total) * 100;

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between mb-1 text-xs">
          <span>Urgent</span>
          <span>{urgentCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${urgentPercent}%` }}></div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between mb-1 text-xs">
          <span>High</span>
          <span>{highCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${highPercent}%` }}></div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between mb-1 text-xs">
          <span>Medium</span>
          <span>{mediumCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${mediumPercent}%` }}></div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between mb-1 text-xs">
          <span>Low</span>
          <span>{lowCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${lowPercent}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default TicketPriorityChart;
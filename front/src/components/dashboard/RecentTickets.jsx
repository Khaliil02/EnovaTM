import { Link } from 'react-router-dom';
import { FiClock } from 'react-icons/fi';

const RecentTickets = ({ tickets }) => {
  if (!tickets.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FiClock className="mx-auto text-3xl mb-2" />
        <p>No tickets yet</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {tickets.map((ticket) => (
        <li key={ticket.id} className="py-4">
          <Link to={`/tickets/${ticket.id}`} className="block hover:bg-gray-50 -mx-4 px-4 py-2 rounded-md">
            <div className="flex justify-between">
              <p className="font-medium text-gray-900">{ticket.title}</p>
              <span className="text-sm text-gray-500">#{ticket.id}</span>
            </div>
            
            <div className="mt-1 flex justify-between">
              <div className="flex space-x-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                  ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  ticket.status === 'escalated' ? 'bg-red-100 text-red-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {ticket.status === 'in_progress' ? 'In Progress' : 
                   ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  ticket.priority === 'low' ? 'bg-green-100 text-green-800' :
                  ticket.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                  ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(ticket.creation_date).toLocaleDateString()}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default RecentTickets;
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ticketApi } from '../services/api';
import { FiPlus, FiLoader } from 'react-icons/fi';
import TicketStatusCard from '../components/dashboard/TicketStatusCard';
import TicketPriorityChart from '../components/dashboard/TicketPriorityChart';
import RecentTickets from '../components/dashboard/RecentTickets';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await ticketApi.getAll();
        setTickets(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load tickets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTickets();
  }, []);
  
  // Calculate ticket stats
  const openTickets = tickets.filter(ticket => ticket.status === 'open').length;
  const inProgressTickets = tickets.filter(ticket => ticket.status === 'in_progress').length;
  const escalatedTickets = tickets.filter(ticket => ticket.status === 'escalated').length;
  const closedTickets = tickets.filter(ticket => ticket.status === 'closed').length;
  
  // Get recent tickets (limit to 5)
  const recentTickets = [...tickets].sort((a, b) => 
    new Date(b.creation_date) - new Date(a.creation_date)
  ).slice(0, 5);
  
  // Get tickets assigned to current user
  const myTickets = tickets.filter(ticket => ticket.assigned_to === user.id);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/tickets/new"
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-2" /> New Ticket
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <TicketStatusCard
          title="Open"
          count={openTickets}
          color="bg-yellow-100 text-yellow-800"
          link="/tickets?status=open"
        />
        <TicketStatusCard
          title="In Progress"
          count={inProgressTickets}
          color="bg-blue-100 text-blue-800"
          link="/tickets?status=in_progress"
        />
        <TicketStatusCard
          title="Escalated"
          count={escalatedTickets}
          color="bg-red-100 text-red-800"
          link="/tickets?status=escalated"
        />
        <TicketStatusCard
          title="Closed"
          count={closedTickets}
          color="bg-green-100 text-green-800"
          link="/tickets?status=closed"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4">Recent Tickets</h2>
            <RecentTickets tickets={recentTickets} />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4">Tickets by Priority</h2>
            <TicketPriorityChart tickets={tickets} />
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">My Assigned Tickets</h2>
          <Link to="/tickets?assigned_to_me=true" className="text-sm text-primary-600">
            View All
          </Link>
        </div>
        
        {myTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myTickets.slice(0, 5).map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">#{ticket.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/tickets/${ticket.id}`} className="text-primary-600 hover:text-primary-900">
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'escalated' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ticket.status === 'in_progress' ? 'In Progress' : 
                         ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ticket.priority === 'low' ? 'bg-green-100 text-green-800' :
                        ticket.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                        ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.creation_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">
            You don't have any assigned tickets.
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
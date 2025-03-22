import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ticketApi, userApi, departmentApi } from '../services/api';
import { FiPlus, FiFilter, FiSearch } from 'react-icons/fi';
import { getUserName } from '../utils/userUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    priority: '',
    searchTerm: '',
    assignedToMe: searchParams.get('assigned_to_me') === 'true',
    department: searchParams.get('department') || ''
  });
  
  const { user } = useContext(AuthContext);
  
  // Fetch tickets and related data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch users and departments first
        let usersResponse, departmentsResponse;
        try {
          [usersResponse, departmentsResponse] = await Promise.all([
            userApi.getAll(),
            departmentApi.getAll()
          ]);
          
          setUsers(usersResponse.data);
          setDepartments(departmentsResponse.data);
        } catch (err) {
          console.error('Error fetching users or departments:', err);
          // Continue to fetch tickets even if these fail
        }
        
        // Then fetch tickets
        let ticketsResponse;
        try {
          if (filters.status) {
            ticketsResponse = await ticketApi.getByStatus(filters.status);
          } else {
            ticketsResponse = await ticketApi.getAll();
          }
          
          setTickets(ticketsResponse.data || []);
          setError(null);
        } catch (err) {
          console.error('Error fetching tickets:', err);
          setError('Failed to load tickets. Please try again later.');
          setTickets([]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters.status]);
  
  // Optimized filtering function
  const applyFilters = useCallback(() => {
    let result = [...tickets];
    
    // Use early returns for faster filtering
    if (!result.length) return [];
    
    // Apply multiple filters with a single pass
    result = result.filter(ticket => {
      // Status filter
      if (filters.status && ticket.status !== filters.status) return false;
      
      // Priority filter
      if (filters.priority && ticket.priority !== filters.priority) return false;
      
      // Assigned to me filter
      if (filters.assignedToMe && ticket.assigned_to !== user.id) return false;
      
      // Department filter
      if (filters.department) {
        const deptId = String(filters.department);
        if (String(ticket.destination_department_id) !== deptId && 
            String(ticket.source_department_id) !== deptId) {
          return false;
        }
      }
      
      // Search term filter
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        return ticket.title.toLowerCase().includes(term) || 
               (ticket.description && ticket.description.toLowerCase().includes(term));
      }
      
      return true;
    });
    
    return result;
  }, [tickets, filters, user.id]);
  
  // Use the memoized filtered tickets
  const filteredTickets = useMemo(() => {
    return applyFilters();
  }, [applyFilters]);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.assignedToMe) params.set('assigned_to_me', 'true');
    if (filters.department) params.set('department', filters.department);
    
    setSearchParams(params);
  }, [filters.status, filters.assignedToMe, filters.department, setSearchParams]);
  
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'Unknown Department';
  };
  
  if (loading) {
    return <LoadingSpinner fullHeight text="Loading tickets..." />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
        <Link
          to="/tickets/new"
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-2" /> New Ticket
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex items-center">
          <span>{error}</span>
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center mb-2">
          <FiFilter className="mr-2 text-gray-500" />
          <h2 className="font-medium">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search field */}
          <div className="md:col-span-4">
            <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                id="searchTerm"
                name="searchTerm"
                placeholder="Search tickets..."
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 pl-10"
                value={filters.searchTerm}
                onChange={handleFilterChange}
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="escalated">Escalated</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              value={filters.priority}
              onChange={handleFilterChange}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              id="department"
              name="department"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              value={filters.department}
              onChange={handleFilterChange}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="assignedToMe"
                checked={filters.assignedToMe}
                onChange={handleFilterChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Assigned to me</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source Dept
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination Dept
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created On
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">#{ticket.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/tickets/${ticket.id}`} className="text-primary-600 hover:text-primary-900 font-medium">
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={ticket.priority} type="priority" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getUserName(ticket.created_by, users)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ticket.assigned_to ? getUserName(ticket.assigned_to, users) : '_ _ _'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDepartmentName(ticket.source_department_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDepartmentName(ticket.destination_department_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.creation_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                    {error ? 'Error loading tickets' : 'No tickets found matching your filters'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TicketsPage;
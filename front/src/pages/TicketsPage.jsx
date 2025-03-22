import { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ticketApi, userApi, departmentApi } from '../services/api';
import { FiPlus, FiLoader, FiFilter, FiSearch } from 'react-icons/fi';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
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
    department: searchParams.get('department') || '' // Added department filter
  });
  
  const { user } = useContext(AuthContext);
  
  // Fetch tickets and related data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tickets based on status if provided
        let ticketsResponse;
        if (filters.status) {
          ticketsResponse = await ticketApi.getByStatus(filters.status);
        } else {
          ticketsResponse = await ticketApi.getAll();
        }
        
        // Fetch users and departments for display names
        const [usersResponse, departmentsResponse] = await Promise.all([
          userApi.getAll(),
          departmentApi.getAll()
        ]);
        
        setTickets(ticketsResponse.data);
        setFilteredTickets(ticketsResponse.data);
        setUsers(usersResponse.data);
        setDepartments(departmentsResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load tickets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters.status]);
  
  // Apply filters whenever they change
  useEffect(() => {
    const applyFilters = () => {
      let result = [...tickets];
      
      // Filter by status
      if (filters.status) {
        result = result.filter(ticket => ticket.status === filters.status);
      }
      
      // Filter by priority
      if (filters.priority) {
        result = result.filter(ticket => ticket.priority === filters.priority);
      }
      
      // Filter by assigned to me
      if (filters.assignedToMe) {
        result = result.filter(ticket => ticket.assigned_to === user.id);
      }
      
      // Filter by department
      if (filters.department) {
        const deptId = String(filters.department);
        result = result.filter(ticket => 
          String(ticket.destination_department_id) === deptId || 
          String(ticket.source_department_id) === deptId
        );
      }
      
      // Filter by search term (in title or description)
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        result = result.filter(ticket => 
          ticket.title.toLowerCase().includes(term) || 
          ticket.description.toLowerCase().includes(term)
        );
      }
      
      setFilteredTickets(result);
    };
    
    applyFilters();
  }, [tickets, filters, user]);
  
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
  
  // Fixed getUserName function
  const getUserName = (userId) => {
    const foundUser = users.find(u => u.id === userId);
    if (!foundUser) return 'Unknown User';
    
    return foundUser.first_name && foundUser.last_name ? 
      `${foundUser.first_name} ${foundUser.last_name}` : 
      (foundUser.name || 'Unknown User');
  };
  
  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'Unknown Department';
  };
  
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
        <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
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
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center mb-2">
          <FiFilter className="mr-2 text-gray-500" />
          <h2 className="font-medium">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search field at the top for better visibility */}
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
                  Created
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getUserName(ticket.created_by)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ticket.assigned_to ? getUserName(ticket.assigned_to) : '_ _ _'}
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
                    No tickets found matching your filters
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
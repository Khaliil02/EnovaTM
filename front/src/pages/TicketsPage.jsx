import { useState, useEffect, useContext, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ticketApi, userApi, departmentApi } from '../services/api';
import { 
  FiPlus, FiFilter, FiSearch, FiCalendar, FiChevronDown, 
  FiChevronUp, FiSave, FiList, FiRefreshCw, FiDownload
} from 'react-icons/fi';
import { getUserName } from '../utils/userUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import DateRangePicker from '../components/common/DateRangePicker';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [savedFilters, setSavedFilters] = useState(
    JSON.parse(localStorage.getItem('savedTicketFilters') || '[]')
  );
  const [filterName, setFilterName] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    searchTerm: searchParams.get('search') || '',
    assignedToMe: searchParams.get('assigned_to_me') === 'true',
    department: searchParams.get('department') || '',
    dateFrom: searchParams.get('date_from') || '',
    dateTo: searchParams.get('date_to') || '',
    createdBy: searchParams.get('created_by') || '',
  });
  
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Fetch tickets and related data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch users and departments first
        const [usersResponse, departmentsResponse] = await Promise.all([
          userApi.getAll(),
          departmentApi.getAll()
        ]);
        
        setUsers(usersResponse.data || []);
        setDepartments(departmentsResponse.data || []);
        
        // Then fetch tickets
        let ticketsResponse;
        if (filters.status) {
          ticketsResponse = await ticketApi.getByStatus(filters.status);
        } else {
          ticketsResponse = await ticketApi.getAll();
        }
        
        setTickets(ticketsResponse.data || []);
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

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.searchTerm) params.set('search', filters.searchTerm);
    if (filters.assignedToMe) params.set('assigned_to_me', 'true');
    if (filters.department) params.set('department', filters.department);
    if (filters.dateFrom) params.set('date_from', filters.dateFrom);
    if (filters.dateTo) params.set('date_to', filters.dateTo);
    if (filters.createdBy) params.set('created_by', filters.createdBy);
    
    setSearchParams(params);
  }, [filters, setSearchParams]);
  
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleDateRangeChange = (range) => {
    setFilters(prev => ({
      ...prev,
      dateFrom: range.from ? range.from.toISOString().split('T')[0] : '',
      dateTo: range.to ? range.to.toISOString().split('T')[0] : ''
    }));
  };
  
  const handleResetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      searchTerm: '',
      assignedToMe: false,
      department: '',
      dateFrom: '',
      dateTo: '',
      createdBy: ''
    });
    setPagination({ pageIndex: 0, pageSize: 10 });
  };
  
  const handleSaveFilter = () => {
    if (!filterName.trim()) return;
    
    const newFilter = {
      id: Date.now(),
      name: filterName,
      filters: { ...filters }
    };
    
    const updatedFilters = [...savedFilters, newFilter];
    setSavedFilters(updatedFilters);
    localStorage.setItem('savedTicketFilters', JSON.stringify(updatedFilters));
    setFilterName('');
  };
  
  const handleApplySavedFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
  };
  
  const handleDeleteSavedFilter = (id) => {
    const updatedFilters = savedFilters.filter(filter => filter.id !== id);
    setSavedFilters(updatedFilters);
    localStorage.setItem('savedTicketFilters', JSON.stringify(updatedFilters));
  };
  
  const exportToCSV = () => {
    if (!filteredTickets.length) return;
    
    const headers = ['ID', 'Title', 'Status', 'Priority', 'Created By', 'Assigned To', 'Source Dept', 'Destination Dept', 'Created On'];
    const csvData = filteredTickets.map(ticket => [
      ticket.id,
      ticket.title,
      ticket.status,
      ticket.priority,
      getUserName(ticket.created_by, users),
      ticket.assigned_to ? getUserName(ticket.assigned_to, users) : 'Unassigned',
      getDepartmentName(ticket.source_department_id),
      getDepartmentName(ticket.destination_department_id),
      new Date(ticket.creation_date).toLocaleDateString()
    ]);
    
    const csv = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tickets_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Helper functions
  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'Unknown Department';
  };
  
  // Filter tickets based on all criteria
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
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
      
      // Created by filter
      if (filters.createdBy && String(ticket.created_by) !== filters.createdBy) return false;
      
      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const ticketDate = new Date(ticket.creation_date);
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          if (ticketDate < fromDate) return false;
        }
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999); // End of day
          if (ticketDate > toDate) return false;
        }
      }
      
      // Search term filter
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        return (
          ticket.title.toLowerCase().includes(term) || 
          (ticket.description && ticket.description.toLowerCase().includes(term))
        );
      }
      
      return true;
    });
  }, [tickets, filters, user.id]);
  
  // Define table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: info => <span>#{info.getValue()}</span>
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: info => (
        <Link to={`/tickets/${info.row.original.id}`} className="text-primary-600 hover:text-primary-900 font-medium">
          {info.getValue()}
        </Link>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => <StatusBadge status={info.getValue()} />
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: info => <StatusBadge status={info.getValue()} type="priority" />
    },
    {
      accessorKey: 'created_by',
      header: 'Created By',
      cell: info => getUserName(info.getValue(), users)
    },
    {
      accessorKey: 'assigned_to',
      header: 'Assigned To',
      cell: info => info.getValue() ? getUserName(info.getValue(), users) : '— — —'
    },
    {
      accessorKey: 'source_department_id',
      header: 'Source Dept',
      cell: info => getDepartmentName(info.getValue())
    },
    {
      accessorKey: 'destination_department_id',
      header: 'Destination Dept',
      cell: info => getDepartmentName(info.getValue())
    },
    {
      accessorKey: 'creation_date',
      header: 'Created On',
      cell: info => new Date(info.getValue()).toLocaleDateString()
    }
  ], [users, departments]);
  
  // Initialize TanStack Table
  const table = useReactTable({
    data: filteredTickets,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  
  if (loading) {
    return <LoadingSpinner fullHeight text="Loading tickets..." />;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setExpandedFilters(!expandedFilters)}
            className="btn btn-secondary flex items-center"
          >
            <FiFilter className="mr-2" /> 
            Filters
            {expandedFilters ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
          </button>
          
          <button 
            onClick={handleResetFilters}
            className="btn btn-outline flex items-center"
          >
            <FiRefreshCw className="mr-2" /> Reset
          </button>
          
          <button 
            onClick={exportToCSV}
            className="btn btn-outline flex items-center"
            disabled={!filteredTickets.length}
          >
            <FiDownload className="mr-2" /> Export
          </button>
          
          <Link
            to="/tickets/new"
            className="btn btn-primary flex items-center"
          >
            <FiPlus className="mr-2" /> New Ticket
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex items-center">
          <span>{error}</span>
        </div>
      )}
      
      {/* Filters Panel */}
      <div className={`bg-white p-4 rounded-lg shadow mb-6 ${expandedFilters ? '' : 'hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
          
          {/* Status filter */}
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
          
          {/* Priority filter */}
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
          
          {/* Department filter */}
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
          
          {/* Created By filter */}
          <div>
            <label htmlFor="createdBy" className="block text-sm font-medium text-gray-700 mb-1">
              Created By
            </label>
            <select
              id="createdBy"
              name="createdBy"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              value={filters.createdBy}
              onChange={handleFilterChange}
            >
              <option value="">All Users</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.name || u.username}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Date Range Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <DateRangePicker 
              onChange={handleDateRangeChange}
              initialDateFrom={filters.dateFrom ? new Date(filters.dateFrom) : null}
              initialDateTo={filters.dateTo ? new Date(filters.dateTo) : null}
            />
          </div>
          
          {/* Assigned to me checkbox */}
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
        
        {/* Save filter section */}
        <div className="border-t pt-4 mt-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-grow max-w-xs">
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Name this filter set"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              onClick={handleSaveFilter}
              disabled={!filterName.trim()}
              className="btn btn-secondary flex items-center"
            >
              <FiSave className="mr-1" /> Save Filter
            </button>
            
            {savedFilters.length > 0 && (
              <div className="ml-auto">
                <select
                  className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  onChange={(e) => {
                    const filterId = parseInt(e.target.value);
                    if (filterId) {
                      const selectedFilter = savedFilters.find(f => f.id === filterId);
                      if (selectedFilter) handleApplySavedFilter(selectedFilter);
                    }
                  }}
                  value=""
                >
                  <option value="">Saved Filters</option>
                  {savedFilters.map(filter => (
                    <option key={filter.id} value={filter.id}>
                      {filter.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {savedFilters.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {savedFilters.map(filter => (
                <div key={filter.id} className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
                  <span 
                    className="cursor-pointer hover:text-primary-600"
                    onClick={() => handleApplySavedFilter(filter)}
                  >
                    {filter.name}
                  </span>
                  <button
                    onClick={() => handleDeleteSavedFilter(filter.id)}
                    className="text-red-600 hover:text-red-800 text-xs ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <FiList className="mr-1" />
            <span>
              Showing <span className="font-medium">{filteredTickets.length}</span> of <span className="font-medium">{tickets.length}</span> tickets
            </span>
          </div>
          
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
              <span>Open: {tickets.filter(t => t.status === 'open').length}</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
              <span>In Progress: {tickets.filter(t => t.status === 'in_progress').length}</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span>
              <span>Escalated: {tickets.filter(t => t.status === 'escalated').length}</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
              <span>Closed: {tickets.filter(t => t.status === 'closed').length}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* TanStack Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    >
                      <div className="flex items-center space-x-1">
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        {{
                          asc: <span>↑</span>,
                          desc: <span>↓</span>
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-gray-50"
                    onClick={() => navigate(`/tickets/${row.original.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                    No tickets found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="btn btn-outline btn-sm"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="btn btn-outline btn-sm"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getPrePaginationRowModel().rows.length
                  )}
                </span>{' '}
                of <span className="font-medium">{table.getPrePaginationRowModel().rows.length}</span> tickets
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-400 border ${!table.getCanPreviousPage() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                {Array.from({ length: table.getPageCount() }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => table.setPageIndex(index)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${table.getState().pagination.pageIndex === index ? 'z-10 bg-primary-50 border-primary-500 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-400 border ${!table.getCanNextPage() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketsPage;
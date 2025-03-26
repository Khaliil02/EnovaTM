import { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ticketApi, userApi, departmentApi } from '../services/api';
import { FiAlertCircle, FiLoader, FiArrowLeft, FiCheck, FiAlertTriangle, FiCpu } from 'react-icons/fi';
import CommentSection from '../components/tickets/CommentSection';
import { 
  getTicketAttachments, 
  downloadAttachment, 
  deleteAttachment 
} from '../services/attachmentService';

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [ticket, setTicket] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [escalationReason, setEscalationReason] = useState('');
  const [reassignUserId, setReassignUserId] = useState('');
  const [showEscalateForm, setShowEscalateForm] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [departmentUsers, setDepartmentUsers] = useState([]);
  const [attachments, setAttachments] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch ticket, users, and departments in parallel
        const [ticketResponse, usersResponse, departmentsResponse] = await Promise.all([
          ticketApi.getById(id),
          userApi.getAll(),
          departmentApi.getAll()
        ]);
        
        const ticketData = ticketResponse.data;
        setTicket(ticketData);
        setUsers(usersResponse.data);
        setDepartments(departmentsResponse.data);
        
        // Initialize department selection with current department
        if (ticketData.destination_department_id) {
          setSelectedDepartmentId(ticketData.destination_department_id.toString());
        }
        
        // Fetch attachments
        const attachmentsResponse = await getTicketAttachments(id);
        setAttachments(attachmentsResponse.data);

        setError(null);
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setError('Failed to load ticket details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  useEffect(() => {
    if (selectedDepartmentId) {
      const usersInDepartment = users.filter(u => u.department_id === parseInt(selectedDepartmentId));
      setDepartmentUsers(usersInDepartment);
      setReassignUserId(''); // Reset selected user when department changes
    }
  }, [selectedDepartmentId, users]);
  
  // Function to handle claiming a ticket
  const handleClaim = async () => {
    try {
      setLoading(true);
      const response = await ticketApi.claim(id);
      setTicket(response.data);
    } catch (err) {
      setError(`Failed to claim ticket: ${err.response?.data?.error || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle closing a ticket
  const handleClose = async () => {
    try {
      setLoading(true);
      const response = await ticketApi.updateStatus(id, 'closed');
      setTicket(response.data);
    } catch (err) {
      setError(`Failed to close ticket: ${err.response?.data?.error || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle escalating a ticket
  const handleEscalate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await ticketApi.escalate(id, escalationReason);
      setTicket(response.data);
      setShowEscalateForm(false);
    } catch (err) {
      setError(`Failed to escalate ticket: ${err.response?.data?.error || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle reassigning a ticket (admin only)
  const handleReassign = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await ticketApi.reassign(
        id, 
        parseInt(reassignUserId), 
        parseInt(selectedDepartmentId)
      );
      setTicket(response.data);
    } catch (err) {
      setError(`Failed to reassign ticket: ${err.response?.data?.error || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Add handler for attachment deletion
  const handleDeleteAttachment = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await deleteAttachment(attachmentId);
        setAttachments(attachments.filter(a => a.id !== attachmentId));
      } catch (err) {
        setError(`Failed to delete attachment: ${err.response?.data?.error || 'Unknown error'}`);
      }
    }
  };

  // Function to handle deleting a ticket (admin only)
  const handleDeleteTicket = async () => {
    if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      try {
        setLoading(true);
        await ticketApi.delete(id);
        navigate('/tickets'); // Redirect to tickets list after deletion
      } catch (err) {
        setError(`Failed to delete ticket: ${err.response?.data?.error || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Helper functions to get name by ID
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
  
  // Check permissions for current user
  const canClaim = useMemo(() => {
    return (
      ticket &&
      ticket.status === 'open' &&
      user.department_id === ticket.destination_department_id
    );
  }, [ticket, user.department_id]);
  
  const canEscalate = useMemo(() => {
    return (
      ticket &&
      ticket.status === 'in_progress' &&
      ticket.assigned_to === user.id
    );
  }, [ticket, user.id]);
  
  const canReassign = useMemo(() => {
    return (
      user.is_admin &&
      ticket &&
      ticket.status === 'escalated' &&
      user.department_id === ticket.destination_department_id
    );
  }, [ticket, user.is_admin, user.department_id]);
  
  const canClose = useMemo(() => {
    return (
      ticket &&
      (ticket.status === 'in_progress' || ticket.status === 'escalated') &&
      (
        ticket.assigned_to === user.id || 
        (user.is_admin && user.department_id === ticket.destination_department_id)
      )
    );
  }, [ticket, user.id, user.is_admin, user.department_id]);
  
  if (loading && !ticket) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }
  
  if (error && !ticket) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg flex items-start">
        <FiAlertCircle className="mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium">Error Loading Ticket</h3>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/tickets')} 
            className="mt-3 text-red-700 hover:underline flex items-center"
          >
            <FiArrowLeft className="mr-1" /> Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg">
        <h3 className="font-medium">Ticket Not Found</h3>
        <p>The requested ticket could not be found.</p>
        <button 
          onClick={() => navigate('/tickets')} 
          className="mt-3 text-yellow-700 hover:underline flex items-center"
        >
          <FiArrowLeft className="mr-1" /> Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/tickets')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2" />
          Back to Tickets
        </button>
        
        <div className="flex space-x-3">
          {/* Admin Delete Button - Add this */}
          {user.is_admin && (
            <button 
              onClick={handleDeleteTicket}
              className="btn bg-red-600 text-white hover:bg-red-700"
              disabled={loading}
            >
              Delete Ticket
            </button>
          )}
          
          {canClaim && (
            <button 
              onClick={handleClaim}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Claim Ticket'}
            </button>
          )}
          
          {canEscalate && (
            <button 
              onClick={() => setShowEscalateForm(true)}
              className="btn btn-secondary"
              disabled={loading}
            >
              Escalate
            </button>
          )}
          
          {canClose && (
            <button 
              onClick={handleClose}
              className="btn btn-success"
              disabled={loading}
            >
              <FiCheck className="mr-1" /> Close Ticket
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex items-center">
          <FiAlertCircle className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Ticket Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-900">
              {ticket.title}
            </h1>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                ticket.status === 'escalated' ? 'bg-red-100 text-red-800' :
                'bg-green-100 text-green-800'
              }`}>
                {ticket.status === 'in_progress' ? 'In Progress' : 
                 ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </span>
              
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                ticket.priority === 'low' ? 'bg-primary-100 text-primary-800' :
                ticket.priority === 'medium' ? 'bg-primary-200 text-primary-700' :
                ticket.priority === 'high' ? 'bg-primary-300 text-primary-800' :
                'bg-primary-400 text-white'
              }`}>
                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
              </span>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Ticket #{ticket.id} • Created on {new Date(ticket.creation_date).toLocaleDateString()} • 
            Last updated {new Date(ticket.last_updated).toLocaleDateString()}
          </div>
        </div>
        
        {/* Ticket Body */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created By</h3>
              <div className="mt-1">{getUserName(ticket.created_by)}</div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
              {ticket.assigned_to ? (
                <div className="mt-1">{getUserName(ticket.assigned_to)}</div>
              ) : (
                <p className="text-sm text-gray-500 italic">Not assigned</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Source Department</h3>
              <p className="mt-1">{ticket.source_department_id ? getDepartmentName(ticket.source_department_id) : 'Unknown'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Destination Department</h3>
              <p className="mt-1">{ticket.destination_department_id ? getDepartmentName(ticket.destination_department_id) : 'Unknown'}</p>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{ticket.description}</p>
          </div>
          
          {ticket.status === 'escalated' && (
            <div className="mt-6 bg-red-50 p-4 rounded-md">
              <div className="flex">
                <FiAlertTriangle className="text-red-600 flex-shrink-0 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">This ticket has been escalated</h4>
                  <p className="mt-1 text-sm text-red-700">
                    Reason: {ticket.escalation_reason}
                  </p>
                  <p className="mt-1 text-sm text-red-700">
                    Escalated by: {ticket.escalated_by ? getUserName(ticket.escalated_by) : 'Unknown'}
                  </p>
                </div>
              </div>
              
              {/* Reassignment form for admin */}
              {canReassign && (
                <form onSubmit={handleReassign} className="mt-3 pt-3 border-t border-red-200">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Reassign this ticket</h4>
                  
                  {/* Department Selection */}
                  <div className="mb-3">
                    <label className="block text-sm text-red-800 mb-1">Select Department</label>
                    <select 
                      value={selectedDepartmentId} 
                      onChange={(e) => setSelectedDepartmentId(e.target.value)}
                      className="w-full border-red-300 focus:ring-red-500 focus:border-red-500 rounded-md shadow-sm"
                      required
                    >
                      <option value="">-- Select department --</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* User Selection (only shown when department is selected) */}
                  {selectedDepartmentId && (
                    <div className="mb-3">
                      <label className="block text-sm text-red-800 mb-1">Select User</label>
                      <select 
                        value={reassignUserId} 
                        onChange={(e) => setReassignUserId(e.target.value)}
                        className="w-full border-red-300 focus:ring-red-500 focus:border-red-500 rounded-md shadow-sm"
                        required
                      >
                        <option value="">-- Select user --</option>
                        {departmentUsers.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Submit button (only enabled when both department and user are selected) */}
                  <button 
                    type="submit" 
                    className="btn bg-red-600 text-white hover:bg-red-700"
                    disabled={loading || !selectedDepartmentId || !reassignUserId}
                  >
                    {loading ? 'Reassigning...' : 'Reassign Ticket'}
                  </button>
                </form>
              )}
            </div>
          )}
          
          {/* Escalation form */}
          {showEscalateForm && (
            <div className="mt-6 bg-yellow-50 p-4 rounded-md">
              <form onSubmit={handleEscalate}>
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Escalate this ticket</h4>
                <div className="mb-3">
                  <label htmlFor="escalation_reason" className="block text-sm text-yellow-800 mb-1">
                    Reason for escalation
                  </label>
                  <textarea
                    id="escalation_reason"
                    value={escalationReason}
                    onChange={(e) => setEscalationReason(e.target.value)}
                    rows="3"
                    className="w-full border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500 rounded-md shadow-sm"
                    required
                  ></textarea>
                </div>
                <div className="flex space-x-3">
                  <button 
                    type="submit" 
                    className="btn bg-yellow-600 text-white hover:bg-yellow-700"
                    disabled={loading}
                  >
                    Escalate Ticket
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowEscalateForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Closed info */}
          {ticket.status === 'closed' && (
            <div className="mt-6 bg-green-50 p-4 rounded-md">
              <div className="flex">
                <FiCheck className="text-green-600 flex-shrink-0 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-green-800">This ticket has been closed</h4>
                  <p className="mt-1 text-sm text-green-700">
                    Closed by: {ticket.closed_by ? getUserName(ticket.closed_by) : 'Unknown'}
                  </p>
                  <p className="mt-1 text-sm text-green-700">
                    Resolution date: {ticket.resolution_date ? new Date(ticket.resolution_date).toLocaleString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
      
      {/* Attachments Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Attachments</h2>
        </div>
        <div className="px-6 py-4">
          {attachments.length > 0 ? (
            <ul className="space-y-3">
              {attachments.map(attachment => (
                <li key={attachment.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FiCpu className="text-gray-500" />
                    <span>{attachment.file_name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => downloadAttachment(attachment.id)}
                      className="btn btn-secondary"
                    >
                      Download
                    </button>
                    {user.is_admin && (
                      <button 
                        onClick={() => handleDeleteAttachment(attachment.id)}
                        className="btn bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No attachments found.</p>
          )}
        </div>
      </div>
      
      {/* Comment Section */}
      <CommentSection ticketId={ticket.id} ticketDetails={ticket} />
    </div>
  );
};

export default TicketDetailPage;
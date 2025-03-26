import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ticketApi, departmentApi } from '../services/api';
import { FiArrowLeft, FiAlertCircle, FiLoader } from "react-icons/fi";
import { uploadAttachment } from "../services/attachmentService";

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    destination_department_id: ''
  });
  
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentApi.getAll();
        // Filter out user's own department
        const filteredDepts = response.data.filter(dept => dept.id !== user.department_id);
        setDepartments(filteredDepts);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments. Please try again later.');
      }
    };
    
    fetchDepartments();
  }, [user.department_id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.destination_department_id) {
      setError('Please select a destination department');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const ticketData = {
        ...formData,
        user_id: user.id,
        destination_department_id: Number(formData.destination_department_id)
      };
      
      const response = await ticketApi.create(ticketData);
      const newTicketId = response.data.id;
      
      // Upload attachments if any
      if (files.length > 0) {
        setUploading(true);
        await Promise.all(files.map(file => uploadAttachment(newTicketId, file)));
        setUploading(false);
      }
      
      // Redirect to the new ticket
      navigate(`/tickets/${newTicketId}`);
      
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError(err.response?.data?.error || 'Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/tickets')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2" />
          Back to Tickets
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Ticket</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex items-center">
            <FiAlertCircle className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="form-label">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows="6"
              className="form-input"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="priority" className="form-label">
                Priority *
              </label>
              <select
                id="priority"
                name="priority"
                className="form-input"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="destination_department_id" className="form-label">
                Destination Department *
              </label>
              <select
                id="destination_department_id"
                name="destination_department_id"
                className="form-input"
                value={formData.destination_department_id}
                onChange={handleChange}
                required
              >
                <option value="">Select department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Attachments</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
            {files.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Selected files:</p>
                <ul className="list-disc ml-5">
                  {files.map((file, index) => (
                    <li key={index} className="text-sm">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="btn btn-secondary mr-3"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketPage;
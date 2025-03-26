import { useState } from 'react';
import { FiAlertCircle } from 'react-icons/fi';

const UserForm = ({ user, departments, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    department_id: user?.department_id || '',
    is_admin: user?.is_admin || false
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // For updates, we may not want to send the password if it's empty
      const dataToSend = { ...formData };
      if (!user && !dataToSend.password) {
        setError('Password is required for new users');
        setLoading(false);
        return;
      }
      
      if (user && !dataToSend.password) {
        delete dataToSend.password;
      }
      
      dataToSend.department_id = Number(dataToSend.department_id);
      
      const error = await onSave(dataToSend);
      if (error) {
        setError(error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">
        {user ? 'Edit User' : 'Create New User'}
      </h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 flex items-center">
          <FiAlertCircle className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="name" className="form-label">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="form-label">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="form-label">
            {user ? 'Password (leave blank to keep current)' : 'Password *'}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            required={!user}
            minLength={user ? 0 : 8}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="department_id" className="form-label">Department *</label>
            <select
              id="department_id"
              name="department_id"
              className="form-input"
              value={formData.department_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
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
                name="is_admin"
                checked={formData.is_admin}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Administrator</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary mr-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
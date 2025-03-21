import { useState } from 'react';
import { FiAlertCircle } from 'react-icons/fi';

const DepartmentForm = ({ department, onSave, onCancel }) => {
  const [name, setName] = useState(department?.name || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (!name.trim()) {
        setError('Department name is required');
        return;
      }
      
      const error = await onSave(name.trim());
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
        {department ? 'Edit Department' : 'Create New Department'}
      </h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 flex items-center">
          <FiAlertCircle className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="name" className="form-label">Department Name *</label>
          <input
            type="text"
            id="name"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            {loading ? 'Saving...' : department ? 'Update Department' : 'Create Department'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DepartmentForm;
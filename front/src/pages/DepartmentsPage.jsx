import { useState, useEffect } from 'react';
import { departmentApi } from '../services/api';
import { FiLoader, FiAlertCircle, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import DepartmentForm from '../components/departments/DepartmentForm';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await departmentApi.getAll();
        setDepartments(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDepartments();
  }, []);

  const handleCreateDepartment = () => {
    setCurrentDepartment(null);
    setShowForm(true);
  };

  const handleEditDepartment = (department) => {
    setCurrentDepartment(department);
    setShowForm(true);
  };

  const handleDeleteDepartment = async (id) => {
    if (confirmDelete === id) {
      try {
        await departmentApi.delete(id);
        setDepartments(departments.filter(dept => dept.id !== id));
        setConfirmDelete(null);
      } catch (err) {
        console.error('Error deleting department:', err);
        setError('Failed to delete department. It may have associated users or tickets.');
      }
    } else {
      setConfirmDelete(id);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const handleSaveDepartment = async (name) => {
    try {
      if (currentDepartment) {
        // Update department
        const response = await departmentApi.update(currentDepartment.id, { name });
        setDepartments(departments.map(dept => 
          dept.id === currentDepartment.id ? response.data : dept
        ));
      } else {
        // Create new department
        const response = await departmentApi.create({ name });
        setDepartments([...departments, response.data]);
      }
      
      setShowForm(false);
      setCurrentDepartment(null);
    } catch (err) {
      console.error('Error saving department:', err);
      return err.response?.data?.error || 'Failed to save department';
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
        <button
          onClick={handleCreateDepartment}
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-2" /> Add Department
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex items-center">
          <FiAlertCircle className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {showForm && (
        <div className="mb-6">
          <DepartmentForm 
            department={currentDepartment} 
            onSave={handleSaveDepartment}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.length > 0 ? (
                departments.map((department) => (
                  <tr key={department.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{department.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {department.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEditDepartment(department)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(department.id)}
                        className={`${
                          confirmDelete === department.id 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                    No departments found
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

export default DepartmentsPage;
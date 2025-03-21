import { useState, useEffect } from 'react';
import { userApi, departmentApi } from '../services/api';
import { FiLoader, FiAlertCircle, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import UserForm from '../components/users/UserForm';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch users and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersResponse, departmentsResponse] = await Promise.all([
          userApi.getAll(),
          departmentApi.getAll()
        ]);
        
        setUsers(usersResponse.data);
        setDepartments(departmentsResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleCreateUser = () => {
    setCurrentUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setShowForm(true);
  };

  const handleDeleteUser = async (id) => {
    if (confirmDelete === id) {
      try {
        await userApi.delete(id);
        setUsers(users.filter(user => user.id !== id));
        setConfirmDelete(null);
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user. They may have associated tickets.');
      }
    } else {
      setConfirmDelete(id);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      if (currentUser) {
        // Update user
        const response = await userApi.update(currentUser.id, userData);
        setUsers(users.map(user => 
          user.id === currentUser.id ? response.data : user
        ));
      } else {
        // Create new user
        const response = await userApi.create(userData);
        setUsers([...users, response.data]);
      }
      
      setShowForm(false);
      setCurrentUser(null);
    } catch (err) {
      console.error('Error saving user:', err);
      return err.response?.data?.error || 'Failed to save user';
    }
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : 'Unknown Department';
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
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <button
          onClick={handleCreateUser}
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-2" /> Add User
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
          <UserForm 
            user={currentUser} 
            departments={departments}
            onSave={handleSaveUser}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDepartmentName(user.department_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.is_admin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className={`${
                          confirmDelete === user.id 
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
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No users found
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

export default UsersPage;
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { userApi, departmentApi } from '../services/api';
import { FiUser, FiSettings, FiMail, FiPhone, FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const UserProfilePage = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department_id: '',
    theme: 'light',
    notifications_enabled: true
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user details and departments
        const [userResponse, departmentsResponse] = await Promise.all([
          userApi.getById(user.id),
          departmentApi.getAll()
        ]);
        
        const userData = userResponse.data;
        setProfile(userData);
        setDepartments(departmentsResponse.data || []);
        
        // Set form data from user profile with name field
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          department_id: userData.department_id || '',
          theme: userData.preferences?.theme || 'light',
          notifications_enabled: userData.preferences?.notifications_enabled !== false
        });
        
        // Set avatar preview if exists
        if (userData.avatar_url) {
          setAvatarPreview(userData.avatar_url);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user.id]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // Create form data object for file upload
      const data = new FormData();
      
      // Add basic profile fields
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      
      // Add preferences as JSON
      const preferences = {
        theme: formData.theme || 'light',
        notifications_enabled: formData.notifications_enabled === true,
        sound_enabled: true // Include sound setting
      };
      data.append('preferences', JSON.stringify(preferences));
      
      // Add avatar if changed
      if (avatar) {
        data.append('avatar', avatar);
      }
      
      console.log('Submitting profile update with data:', Object.fromEntries(data.entries()));
      
      // Make the API call
      const response = await userApi.updateProfile(user.id, data);
      console.log('Profile update response:', response);
      
      if (response && response.data) {
        // Update local user context
        updateUser({
          ...user,
          ...response.data,
          preferences: {
            ...user.preferences,
            ...preferences
          }
        });
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(`Failed to update profile: ${err.response?.data?.error || err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner fullHeight text="Loading profile..." />;
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex items-center">
          <FiAlertCircle className="mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6 flex items-center">
          <FiCheck className="mr-2" />
          <span>Profile updated successfully!</span>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border border-gray-300">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiUser className="w-16 h-16" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 cursor-pointer shadow-md">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                />
                <FiSettings className="w-4 h-4" />
              </label>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold">
                {profile.name || 'User'}
              </h2>
              <p className="text-gray-500">
                {departments.find(d => d.id === profile.department_id)?.name || 'No Department'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mt-3 items-center justify-center sm:justify-start">
                <span className="flex items-center text-gray-600 text-sm">
                  <FiMail className="mr-2" /> {profile.email}
                </span>
                {profile.phone && (
                  <span className="flex items-center text-gray-600 text-sm">
                    <FiPhone className="mr-2" /> {profile.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-lg font-medium mb-4">Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  id="theme"
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifications_enabled"
                  name="notifications_enabled"
                  checked={formData.notifications_enabled}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="notifications_enabled" className="ml-2 block text-sm text-gray-700">
                  Enable Email Notifications
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfilePage;
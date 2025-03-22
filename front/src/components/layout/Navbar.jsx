import { useState, useContext } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import logoImage from '../../assets/enova-logo-bw.png';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation Links */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img 
                src={logoImage} 
                alt="Enova TM Logo" 
                className="h-10" 
              />
            </Link>
            
            {isAuthenticated && (
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) => 
                      `flex items-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                        isActive 
                          ? 'bg-primary-700 text-white'
                          : 'text-white hover:bg-primary-800'
                      }`
                    }
                  >
                    <span>Dashboard</span>
                  </NavLink>
                  <NavLink
                    to="/tickets"
                    className={({ isActive }) => 
                      `flex items-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                        isActive 
                          ? 'bg-primary-700 text-white'
                          : 'text-white hover:bg-primary-800'
                      }`
                    }
                  >
                    <span>Tickets</span>
                  </NavLink>
                  {isAdmin && (
                    <>
                      <NavLink
                        to="/users"
                        className={({ isActive }) => 
                          `flex items-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                            isActive 
                              ? 'bg-primary-700 text-white'
                              : 'text-white hover:bg-primary-800'
                          }`
                        }
                      >
                        <span>Users</span>
                      </NavLink>
                      <NavLink
                        to="/departments"
                        className={({ isActive }) => 
                          `flex items-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                            isActive 
                              ? 'bg-primary-700 text-white'
                              : 'text-white hover:bg-primary-800'
                          }`
                        }
                      >
                        <span>Departments</span>
                      </NavLink>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Right side items */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-4">
              {/* Notification dropdown first */}
              <NotificationDropdown />
              
              {/* User info second */}
              <div className="flex items-center bg-primary-700 px-3 py-1.5 rounded-md transition-colors hover:bg-primary-900">
                <FiUser className="text-white mr-2" />
                <span className="text-white font-medium">{user?.name || `${user?.first_name} ${user?.last_name}`}</span>
              </div>
              
              {/* Logout button last */}
              <button 
                onClick={handleLogout} 
                className="bg-primary-800 hover:bg-primary-900 text-white px-3 py-2 rounded-md flex items-center transition-colors"
              >
                <FiLogOut className="mr-2" /> Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-white hover:bg-primary-700 px-3 py-2 rounded-md">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-primary-600 text-white hover:bg-primary-500 px-3 py-2 rounded-md"
                >
                  Register
                </Link>
              </div>
            </div>
          )}
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {isAuthenticated && <NotificationDropdown />}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 ml-2 rounded-md text-white hover:bg-primary-700"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Mobile menu content - keep this unchanged */}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
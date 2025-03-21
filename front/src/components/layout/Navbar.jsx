import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import logoImage from '../../assets/enova-logo-bw.png';

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
                  <Link to="/dashboard" className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link to="/tickets" className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium">
                    Tickets
                  </Link>
                  {isAdmin && (
                    <>
                      <Link to="/users" className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium">
                        Users
                      </Link>
                      <Link to="/departments" className="text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium">
                        Departments
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {isAuthenticated ? (
            <div className="hidden md:block">
              <div className="flex items-center">
                <span className="mr-4 text-white">
                  <FiUser className="inline mr-1" /> {user?.name}
                </span>
                <button 
                  onClick={handleLogout} 
                  className="bg-primary-900 text-white hover:bg-primary-950 px-3 py-2 rounded-md flex items-center"
                >
                  <FiLogOut className="mr-1" /> Logout
                </button>
              </div>
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
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-700"
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
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className="block px-3 py-2 rounded-md text-white hover:bg-primary-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/tickets" 
                  className="block px-3 py-2 rounded-md text-white hover:bg-primary-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tickets
                </Link>
                {isAdmin && (
                  <>
                    <Link 
                      to="/users" 
                      className="block px-3 py-2 rounded-md text-white hover:bg-primary-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Users
                    </Link>
                    <Link 
                      to="/departments" 
                      className="block px-3 py-2 rounded-md text-white hover:bg-primary-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Departments
                    </Link>
                  </>
                )}
                <hr className="border-primary-700" />
                <div className="px-3 py-2">
                  <span className="block mb-2 text-white">Signed in as {user?.name}</span>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="bg-primary-900 text-white hover:bg-primary-950 px-3 py-2 rounded-md w-full text-left flex items-center"
                  >
                    <FiLogOut className="mr-2" /> Logout
                  </button>
                </div>
              </>
            )}
            
            {!isAuthenticated && (
              <>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 rounded-md text-white hover:bg-primary-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block px-3 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-500 mt-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
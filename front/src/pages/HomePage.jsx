import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiArrowRight } from 'react-icons/fi';
// Import the logo directly
import logoImage from '../assets/enova-tm-logo.png';

const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <img 
            src={logoImage} 
            alt="Enova Ticket Manager" 
            className="h-32 md:h-42" // Changed from h-24 md:h-32
          />
        </div>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          A streamlined ticket management system for efficient department communication and issue resolution.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
        {isAuthenticated ? (
        <Link 
          to="/dashboard" 
          className="btn btn-primary flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md md:text-lg"
        >
          Go to Dashboard <FiArrowRight className="ml-2" />
        </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/login"
                className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:text-lg"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:text-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900">Department-based Ticketing</h3>
            <p className="mt-2 text-base text-gray-500">
              Route tickets between departments for efficient communication and issue resolution.
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900">Escalation Workflow</h3>
            <p className="mt-2 text-base text-gray-500">
              Escalate complex issues to administrators with detailed reasoning.
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900">Priority Management</h3>
            <p className="mt-2 text-base text-gray-500">
              Assign priorities to ensure critical issues are addressed first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
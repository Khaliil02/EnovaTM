import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  FiArrowRight,
  FiCheckCircle,
  FiUsers,
  FiMessageSquare,
  FiBarChart2,
} from "react-icons/fi";

const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="bg-gradient-to-b from-white to-primary-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl tracking-tight">
            <span className="block">Streamline Department</span>
            <span className="block text-primary-600">Communication</span>
          </h1>
          <p className="mt-6 max-w-lg mx-auto text-xl text-gray-500">
            A modern ticket management system designed for efficient issue
            tracking, assignment, and resolution.
          </p>

          <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-all duration-150 shadow-md hover:shadow-lg"
              >
                Go to Dashboard <FiArrowRight className="ml-2" />
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg transition-all duration-150"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg transition-all duration-150 shadow-md hover:shadow-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Section with animated hover effect */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Powerful ticket management features
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Everything you need to manage your department's communication
              efficiently
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-5 mx-auto">
                  <FiMessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 text-center">
                  Department-based Ticketing
                </h3>
                <p className="mt-4 text-base text-gray-600 text-center">
                  Route tickets between departments for efficient communication
                  and issue resolution.
                </p>
              </div>

              <div className="bg-primary-50 border border-primary-100 rounded-xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-5 mx-auto">
                  <FiUsers className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 text-center">
                  Escalation Workflow
                </h3>
                <p className="mt-4 text-base text-gray-600 text-center">
                  Escalate complex issues to administrators with detailed
                  reasoning for faster resolution.
                </p>
              </div>

              <div className="bg-primary-50 border border-primary-100 rounded-xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-5 mx-auto">
                  <FiBarChart2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 text-center">
                  Priority Management
                </h3>
                <p className="mt-4 text-base text-gray-600 text-center">
                  Assign priorities to ensure critical issues are addressed
                  first with visual analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial/Benefit Section */}
      <div className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Benefits of using Enova TM
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center mb-4">
                <FiCheckCircle className="h-6 w-6 text-primary-600 mr-3" />
                <h3 className="text-xl font-medium text-gray-900">
                  Improved Response Time
                </h3>
              </div>
              <p className="text-gray-600">
                Reduce ticket resolution time by up to 40% with proper
                assignment and prioritization.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center mb-4">
                <FiCheckCircle className="h-6 w-6 text-primary-600 mr-3" />
                <h3 className="text-xl font-medium text-gray-900">
                  Cross-Department Collaboration
                </h3>
              </div>
              <p className="text-gray-600">
                Break down silos and improve communication between different
                departments.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center mb-4">
                <FiCheckCircle className="h-6 w-6 text-primary-600 mr-3" />
                <h3 className="text-xl font-medium text-gray-900">
                  Data-Driven Insights
                </h3>
              </div>
              <p className="text-gray-600">
                Gain valuable insights with advanced analytics on ticket volume,
                resolution time, and more.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center mb-4">
                <FiCheckCircle className="h-6 w-6 text-primary-600 mr-3" />
                <h3 className="text-xl font-medium text-gray-900">
                  User Accountability
                </h3>
              </div>
              <p className="text-gray-600">
                Track ownership of issues and create clear accountability for
                faster resolutions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

import { useState, useContext } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiSettings,
  FiChevronDown,
  FiMessageSquare,
} from "react-icons/fi";
import logoImage from "../../assets/enova-logo-bw.png";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-primary-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation Links */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img src={logoImage} alt="Enova TM Logo" className="h-10" />
            </Link>

            {isAuthenticated && (
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-3">
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary-700 text-white"
                          : "text-white hover:bg-primary-700"
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/tickets"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary-700 text-white"
                          : "text-white hover:bg-primary-700"
                      }`
                    }
                  >
                    Tickets
                  </NavLink>
                  <NavLink
                    to="/messages"
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary-700 text-white"
                          : "text-white hover:bg-primary-700"
                      }`
                    }
                  >
                    Messages
                  </NavLink>
                  {isAdmin && (
                    <>
                      <NavLink
                        to="/users"
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-primary-700 text-white"
                              : "text-white hover:bg-primary-700"
                          }`
                        }
                      >
                        Users
                      </NavLink>
                      <NavLink
                        to="/departments"
                        className={({ isActive }) =>
                          `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-primary-700 text-white"
                              : "text-white hover:bg-primary-700"
                          }`
                        }
                      >
                        Departments
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
              {/* Notification dropdown */}
              <NotificationDropdown />

              {/* User menu */}
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="flex items-center bg-primary-700 px-3 py-1.5 rounded-md transition-colors hover:bg-primary-900">
                  <FiUser className="text-white mr-2" />
                  <span className="text-white font-medium max-w-[120px] truncate">
                    {user?.name || `${user?.first_name} ${user?.last_name}`}
                  </span>
                  <FiChevronDown className="ml-2 h-4 w-4" />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active
                                ? "bg-primary-50 text-primary-900"
                                : "text-gray-700"
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          >
                            <FiUser
                              className="mr-2 h-5 w-5 text-primary-600"
                              aria-hidden="true"
                            />
                            Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/settings"
                            className={`${
                              active
                                ? "bg-primary-50 text-primary-900"
                                : "text-gray-700"
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          >
                            <FiSettings
                              className="mr-2 h-5 w-5 text-primary-600"
                              aria-hidden="true"
                            />
                            Settings
                          </Link>
                        )}
                      </Menu.Item>
                    </div>
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active
                                ? "bg-red-50 text-red-900"
                                : "text-gray-700"
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          >
                            <FiLogOut
                              className="mr-2 h-5 w-5 text-red-600"
                              aria-hidden="true"
                            />
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          ) : (
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:bg-primary-700 px-3 py-2 rounded-md"
                >
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
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive
                        ? "bg-primary-700 text-white"
                        : "text-white hover:bg-primary-700"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/tickets"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive
                        ? "bg-primary-700 text-white"
                        : "text-white hover:bg-primary-700"
                    }`
                  }
                >
                  Tickets
                </NavLink>
                <NavLink
                  to="/messages"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive
                        ? "bg-primary-700 text-white"
                        : "text-white hover:bg-primary-700"
                    }`
                  }
                >
                  Messages
                </NavLink>
                {isAdmin && (
                  <>
                    <NavLink
                      to="/users"
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-md text-base font-medium ${
                          isActive
                            ? "bg-primary-700 text-white"
                            : "text-white hover:bg-primary-700"
                        }`
                      }
                    >
                      Users
                    </NavLink>
                    <NavLink
                      to="/departments"
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-md text-base font-medium ${
                          isActive
                            ? "bg-primary-700 text-white"
                            : "text-white hover:bg-primary-700"
                        }`
                      }
                    >
                      Departments
                    </NavLink>
                  </>
                )}
                <div className="border-t border-primary-700 pt-2 mt-2">
                  <div className="px-3 py-2 text-white font-medium">
                    {user?.name || "User"}
                  </div>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary-700"
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

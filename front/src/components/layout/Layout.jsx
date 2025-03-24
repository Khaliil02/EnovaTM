import CustomNavbar from './Navbar';
import ApiStatus from '../common/ApiStatus';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CustomNavbar />
      <main className="flex-grow py-6 px-4 sm:px-6 max-w-7xl w-full mx-auto">
        {children}
      </main>
      
      {/* Custom Footer - no Flowbite dependency */}
      <footer className="bg-white shadow-inner mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <ApiStatus />
              <span className="text-gray-500 text-sm">EnovaTM © {new Date().getFullYear()}</span>
            </div>
            <div className="flex space-x-4 text-sm mt-2 md:mt-0">
              <a href="#" className="text-gray-600 hover:text-primary-600">Terms</a>
              <a href="#" className="text-gray-600 hover:text-primary-600">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-primary-600">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
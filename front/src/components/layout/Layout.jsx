import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-6 px-4 sm:px-6 max-w-7xl w-full mx-auto">
        {children}
      </main>
      <footer className="bg-gray-100 py-4 text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} Enova Ticket Manager</p>
      </footer>
    </div>
  );
};

export default Layout;
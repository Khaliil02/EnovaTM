import { Navbar, Footer } from 'flowbite-react';
import CustomNavbar from './Navbar'; // Keep your custom navbar for now

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CustomNavbar /> {/* Keep your existing navbar for now */}
      <main className="flex-grow py-6 px-4 sm:px-6 max-w-7xl w-full mx-auto">
        {children}
      </main>
      <Footer container>
        <Footer.Copyright href="#" by="Enova Ticket Manager" year={new Date().getFullYear()} />
        <Footer.LinkGroup>
          <Footer.Link href="#">About</Footer.Link>
          <Footer.Link href="#">Privacy Policy</Footer.Link>
          <Footer.Link href="#">Contact</Footer.Link>
        </Footer.LinkGroup>
      </Footer>
    </div>
  );
};

export default Layout;
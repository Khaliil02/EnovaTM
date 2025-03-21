import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Layouts
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import CreateTicketPage from './pages/CreateTicketPage';
import UsersPage from './pages/UsersPage';
import DepartmentsPage from './pages/DepartmentsPage';
import NotFoundPage from './pages/NotFoundPage';

// Tailwind imports
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useContext(AuthContext);
  
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  
  if (!isAdmin) return <Navigate to="/dashboard" />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/login" element={<Layout><LoginPage /></Layout>} />
        <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout><DashboardPage /></Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tickets" 
          element={
            <ProtectedRoute>
              <Layout><TicketsPage /></Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tickets/new" 
          element={
            <ProtectedRoute>
              <Layout><CreateTicketPage /></Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tickets/:id" 
          element={
            <ProtectedRoute>
              <Layout><TicketDetailPage /></Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/users" 
          element={
            <AdminRoute>
              <Layout><UsersPage /></Layout>
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/departments" 
          element={
            <AdminRoute>
              <Layout><DepartmentsPage /></Layout>
            </AdminRoute>
          } 
        />
        
        {/* 404 Page */}
        <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

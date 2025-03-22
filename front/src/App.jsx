import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

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
      <NotificationProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/tickets" 
              element={
                <ProtectedRoute>
                  <TicketsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/tickets/new" 
              element={
                <ProtectedRoute>
                  <CreateTicketPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/tickets/:id" 
              element={
                <ProtectedRoute>
                  <TicketDetailPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/users" 
              element={
                <AdminRoute>
                  <UsersPage />
                </AdminRoute>
              } 
            />
            
            <Route 
              path="/departments" 
              element={
                <AdminRoute>
                  <DepartmentsPage />
                </AdminRoute>
              } 
            />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

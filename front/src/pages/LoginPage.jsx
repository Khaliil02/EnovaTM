import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import logoImage from '../assets/enova-tm-logo.png';

const LoginPage = () => {
  return (
    <div className="max-w-md mx-auto py-12">
      <div className="flex justify-center mb-6">
        <img 
          src={logoImage} 
          alt="Enova Ticket Manager" 
          className="h-24 md:h-28" 
        />
      </div>
      <LoginForm />
      <p className="mt-6 text-center text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-500">
          Register here
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
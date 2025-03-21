import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import logoImage from '../assets/enova-tm-logo.png';

const RegisterPage = () => {
  return (
    <div className="max-w-md mx-auto py-12">
      <div className="flex justify-center mb-6">
        <img 
          src={logoImage} 
          alt="Enova Ticket Manager" 
          className="h-24 md:h-28" 
        />
      </div>
      <RegisterForm />
      <p className="mt-6 text-center text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-500">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
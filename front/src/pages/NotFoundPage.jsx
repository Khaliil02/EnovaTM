import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-9xl font-bold text-primary-600">404</h1>
      <h2 className="text-3xl font-medium text-gray-900 mt-4">Page Not Found</h2>
      <p className="text-gray-600 mt-2">The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/" className="mt-8 flex items-center text-primary-600 hover:text-primary-800">
        <FiArrowLeft className="mr-2" /> Go back home
      </Link>
    </div>
  );
};

export default NotFoundPage;
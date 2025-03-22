import React from 'react';
import { FiLoader } from 'react-icons/fi';

const LoadingSpinner = ({ text = 'Loading...', fullHeight = false }) => {
  return (
    <div className={`flex flex-col justify-center items-center ${fullHeight ? 'h-64' : 'py-8'}`}>
      <FiLoader className="animate-spin text-4xl text-primary-600 mb-2" />
      {text && <p className="text-gray-500">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
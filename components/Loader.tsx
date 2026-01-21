
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="relative h-24 w-24">
      <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
      <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;

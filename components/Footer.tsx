
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-8">
      <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Academic Schedule Planner. Powered by AI.</p>
      </div>
    </footer>
  );
};

export default Footer;

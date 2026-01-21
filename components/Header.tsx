
import React from 'react';

interface HeaderProps {
  onShowApiKeyManager?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowApiKeyManager }) => {
  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M12 12.75h.008v.008H12v-.008Z" />
            </svg>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">Academic</span>
                <span className="text-gray-900 dark:text-white"> Schedule Planner</span>
            </h1>
        </div>
        {onShowApiKeyManager && (
          <button
            onClick={onShowApiKeyManager}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Manage API Key"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
            </svg>
            <span className="hidden sm:inline text-sm font-medium">API Key</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;

import React, { useState, useEffect } from 'react';

interface ApiKeyManagerProps {
  onKeySet: (key: string) => void;
  onClose?: () => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onKeySet, onClose }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if API key already exists in localStorage
    const storedKey = localStorage.getItem('GOOGLE_AI_API_KEY');
    if (storedKey) {
      onKeySet(storedKey);
    }
  }, [onKeySet]);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }

    // Basic validation - ensure it's not empty and has reasonable length
    if (apiKey.trim().length < 20) {
      setError('API key appears to be too short. Please check and try again.');
      return;
    }

    // Store in localStorage
    localStorage.setItem('GOOGLE_AI_API_KEY', apiKey.trim());
    setError('');
    onKeySet(apiKey.trim());
  };

  const handleClearKey = () => {
    localStorage.removeItem('GOOGLE_AI_API_KEY');
    setApiKey('');
    // Force a page reload to clear any cached state
    window.location.reload();
  };

  const storedKey = localStorage.getItem('GOOGLE_AI_API_KEY');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8 pr-14 max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          🔑 API Key Required
        </h2>
        
        {storedKey ? (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              ✅ API Key is configured and stored in your browser.
            </p>
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-mono break-all">
                {storedKey.substring(0, 10)}...{storedKey.substring(storedKey.length - 4)}
              </p>
            </div>
            <button
              onClick={handleClearKey}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Clear API Key
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              This application uses Google's Gemini AI to generate schedules. To use it, you need your own free Google AI API key.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  📖 How to get a free Google AI API Key
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  {showInstructions ? '▼' : '▶'}
                </span>
              </button>
              
              {showInstructions && (
                <ol className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside">
                  <li>Visit <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Google AI Studio</a></li>
                  <li>Sign in with your Google account</li>
                  <li>Click "Create API Key" or "Get API Key"</li>
                  <li>Copy the generated API key</li>
                  <li>Paste it below</li>
                </ol>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Enter your Google AI API Key:
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError('');
                }}
                placeholder="AIza..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {error && (
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              )}
            </div>

            <button
              onClick={handleSaveKey}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Save API Key
            </button>

            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>🔒 Privacy Note:</strong> Your API key is stored only in your browser's local storage and is never sent to any server except Google AI to generate schedules.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeyManager;

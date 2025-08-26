import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface TopbarProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  hideControls?: boolean;
}

const Topbar: React.FC<TopbarProps> = ({ 
  darkMode, 
  setDarkMode, 
  hideControls = false
}) => {
  return (
    <div className="h-16 bg-white shadow border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Statistics Simulator
        </h2>
      </div>
      
      {!hideControls && (
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default Topbar;
import React from 'react';
import { LogOut, User } from 'lucide-react';
import { AuthService } from '../services/authService';

interface TopbarProps {
  hideControls?: boolean;
  onLogout?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ 
  hideControls = false,
  onLogout
}) => {
  const userEmail = localStorage.getItem('userEmail') || 'User';
  const userDisplayName = localStorage.getItem('userDisplayName') || '';

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      onLogout?.();
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback to manual logout
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userDisplayName');
      localStorage.removeItem('userUid');
      onLogout?.();
    }
  };

  return (
    <div className="h-16 bg-white shadow border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Statistics Simulator
        </h2>
      </div>
      
      {!hideControls && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{userDisplayName || userEmail}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Topbar;
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Dice6, 
  Calculator 
} from 'lucide-react';

interface SidebarProps {
  currentModule: string;
  setCurrentModule: (module: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentModule, setCurrentModule }) => {
  const location = useLocation();
  
  const modules = [
    { id: 'home', path: '/', name: 'Home', icon: Home },
    { id: 'regression', path: '/regression', name: 'Regression', icon: TrendingUp },
    { id: 'index-numbers', path: '/index-numbers', name: 'Index Numbers', icon: BarChart3 },
    { id: 'time-series', path: '/time-series', name: 'Time Series', icon: Activity },
    { id: 'probability', path: '/probability', name: 'Probability', icon: Dice6 },
    { id: 'distributions', path: '/distributions', name: 'Distributions', icon: Calculator }
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800">
          Business Statistics II
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          B.Com 2nd Year, Sem-4
        </p>
      </div>
      
      <nav className="mt-6">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = location.pathname === module.path;
          
          return (
            <Link
              key={module.id}
              to={module.path}
              onClick={() => setCurrentModule(module.id)}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {module.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
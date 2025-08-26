import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Home from './modules/Home';
import Regression from './modules/Regression';
import IndexNumbers from './modules/IndexNumbers';
import TimeSeries from './modules/TimeSeries';
import Probability from './modules/Probability';
import Distributions from './modules/Distributions';

// Component to determine current location for conditional rendering
function AppContent() {
  const location = useLocation();
  const [currentModule, setCurrentModule] = useState('home');
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    // Set theme to light only
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar currentModule={currentModule} setCurrentModule={setCurrentModule} />
        
        <div className="flex-1 flex flex-col">
          <Topbar 
            darkMode={false}
            setDarkMode={() => {}} // No-op function since theme is fixed
            hideControls={isHomePage}
          />
          
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/regression" element={<Regression />} />
              <Route path="/index-numbers" element={<IndexNumbers />} />
              <Route path="/time-series" element={<TimeSeries />} />
              <Route path="/probability" element={<Probability />} />
              <Route path="/distributions" element={<Distributions />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
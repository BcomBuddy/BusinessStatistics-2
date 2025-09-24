import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './components/Login';
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    // Set theme to light only
    document.documentElement.classList.remove('dark');
    
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setIsLoggedIn(true);
        // Update localStorage with current user data
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', user.email || '');
        localStorage.setItem('userDisplayName', user.displayName || '');
        localStorage.setItem('userUid', user.uid);
      } else {
        // User is signed out
        setIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userDisplayName');
        localStorage.removeItem('userUid');
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show login page
  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // If it's the login page but user is logged in, redirect to home
  if (isLoginPage && isLoggedIn) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen bg-gray-50">
        {/* Fixed Sidebar - Hidden on mobile, visible on md+ screens */}
        <div className="fixed left-0 top-0 h-full z-30 hidden md:block">
          <Sidebar currentModule={currentModule} setCurrentModule={setCurrentModule} />
        </div>
        
        {/* Main Content with responsive left margin */}
        <div className="flex-1 flex flex-col md:ml-64">
          <Topbar 
            hideControls={false}
            onLogout={() => setIsLoggedIn(false)}
          />
          
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />} />
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
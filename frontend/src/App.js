import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Manuals from './pages/Manuals';
import Troubleshooting from './pages/Troubleshooting';
import Maintenance from './pages/Maintenance';
import SafetyFeatures from './pages/SafetyFeatures';
import WarningLights from './pages/WarningLights';
import FAQ from './pages/FAQ';
import Recalls from './pages/Recalls';
import Parts from './pages/Parts';
import ServiceCenters from './pages/ServiceCenters';
import Tutorials from './pages/Tutorials';
import Warranty from './pages/Warranty';
import TechSpecs from './pages/TechSpecs';
import Feedback from './pages/Feedback';
import AIAssistant from './pages/AIAssistant';
import Layout from './components/Layout';

function App() {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard showToast={showToast} />} />
          <Route path="/vehicles" element={<Vehicles showToast={showToast} />} />
          <Route path="/manuals" element={<Manuals showToast={showToast} />} />
          <Route path="/troubleshooting" element={<Troubleshooting showToast={showToast} />} />
          <Route path="/maintenance" element={<Maintenance showToast={showToast} />} />
          <Route path="/safety" element={<SafetyFeatures showToast={showToast} />} />
          <Route path="/warnings" element={<WarningLights showToast={showToast} />} />
          <Route path="/faq" element={<FAQ showToast={showToast} />} />
          <Route path="/recalls" element={<Recalls showToast={showToast} />} />
          <Route path="/parts" element={<Parts showToast={showToast} />} />
          <Route path="/services" element={<ServiceCenters showToast={showToast} />} />
          <Route path="/tutorials" element={<Tutorials showToast={showToast} />} />
          <Route path="/warranty" element={<Warranty showToast={showToast} />} />
          <Route path="/specs" element={<TechSpecs showToast={showToast} />} />
          <Route path="/feedback" element={<Feedback showToast={showToast} />} />
          <Route path="/ai" element={<AIAssistant showToast={showToast} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}

export default App;

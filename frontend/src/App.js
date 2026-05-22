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
import MaintenancePredict from './pages/MaintenancePredict';
import RecallImpactAssess from './pages/RecallImpactAssess';
import Layout from './components/Layout';

// // === Batch 06 Gaps & Frontend Mounts ===
import CFAgenticVehicleHealthMonitoringPage from './pages/CFAgenticVehicleHealthMonitoringPage';
import CFComputerVisionDamageAssessmentPage from './pages/CFComputerVisionDamageAssessmentPage';
import CFRecallProactiveManagementPage from './pages/CFRecallProactiveManagementPage';
import CFSmartMaintenanceSchedulingPage from './pages/CFSmartMaintenanceSchedulingPage';
import CFPartsCompatibilityOptimizationPage from './pages/CFPartsCompatibilityOptimizationPage';
import GapMaintenanceWithoutMaintenancePage from './pages/GapMaintenanceWithoutMaintenancePage';
import GapRecallsWithoutRecallPage from './pages/GapRecallsWithoutRecallPage';
import GapServicesWithoutServicePage from './pages/GapServicesWithoutServicePage';
import GapNoRealVehicleApiIntegrationBmwConnecteddrivePage from './pages/GapNoRealVehicleApiIntegrationBmwConnecteddrivePage';
import GapNoPartsOrderingIntegrationWithRetailersPage from './pages/GapNoPartsOrderingIntegrationWithRetailersPage';
import GapNoIntegrationWithMechanicsServiceShopsPage from './pages/GapNoIntegrationWithMechanicsServiceShopsPage';
import GapNoAppointmentBookingSchedulingModulePage from './pages/GapNoAppointmentBookingSchedulingModulePage';
import GapNoNotificationsModuleGrep0Page from './pages/GapNoNotificationsModuleGrep0Page';
import GapNoAuditLoggingGrep0Page from './pages/GapNoAuditLoggingGrep0Page';
import GapNoWebhooksForRecallSafetyAlertsPage from './pages/GapNoWebhooksForRecallSafetyAlertsPage';
import GapNoMobileAppDespiteConsumerPage from './pages/GapNoMobileAppDespiteConsumerPage';
import CustomViewsPage from './pages/CustomViewsPage';
import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

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
        <Route path="/insights/timeline" element={<TimelineView />} />
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

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
          <Route path="/ai-maintenance-predict" element={<MaintenancePredict showToast={showToast} />} />
          <Route path="/ai-recall-impact" element={<RecallImpactAssess showToast={showToast} />} />
          <Route path="/custom-views" element={<CustomViewsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        
          {/* // === Batch 06 Gaps & Frontend Mounts === */}
          <Route path="/cf-agentic-vehicle-health-monitoring" element={<CFAgenticVehicleHealthMonitoringPage />} />
          <Route path="/cf-computer-vision-damage-assessment" element={<CFComputerVisionDamageAssessmentPage />} />
          <Route path="/cf-recall-proactive-management" element={<CFRecallProactiveManagementPage />} />
          <Route path="/cf-smart-maintenance-scheduling" element={<CFSmartMaintenanceSchedulingPage />} />
          <Route path="/cf-parts-compatibility-optimization" element={<CFPartsCompatibilityOptimizationPage />} />
          <Route path="/gap-maintenance-without-maintenance" element={<GapMaintenanceWithoutMaintenancePage />} />
          <Route path="/gap-recalls-without-recall" element={<GapRecallsWithoutRecallPage />} />
          <Route path="/gap-services-without-service" element={<GapServicesWithoutServicePage />} />
          <Route path="/gap-no-real-vehicle-api-integration-bmw-connecteddrive" element={<GapNoRealVehicleApiIntegrationBmwConnecteddrivePage />} />
          <Route path="/gap-no-parts-ordering-integration-with-retailers" element={<GapNoPartsOrderingIntegrationWithRetailersPage />} />
          <Route path="/gap-no-integration-with-mechanics-service-shops" element={<GapNoIntegrationWithMechanicsServiceShopsPage />} />
          <Route path="/gap-no-appointment-booking-scheduling-module" element={<GapNoAppointmentBookingSchedulingModulePage />} />
          <Route path="/gap-no-notifications-module-grep-0" element={<GapNoNotificationsModuleGrep0Page />} />
          <Route path="/gap-no-audit-logging-grep-0" element={<GapNoAuditLoggingGrep0Page />} />
          <Route path="/gap-no-webhooks-for-recall-safety-alerts" element={<GapNoWebhooksForRecallSafetyAlertsPage />} />
          <Route path="/gap-no-mobile-app-despite-consumer" element={<GapNoMobileAppDespiteConsumerPage />} />
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

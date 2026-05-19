const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/manuals', require('./routes/manuals'));
app.use('/api/troubleshooting', require('./routes/troubleshooting'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/safety', require('./routes/safety'));
app.use('/api/warnings', require('./routes/warnings'));
app.use('/api/faq', require('./routes/faq'));
app.use('/api/recalls', require('./routes/recalls'));
app.use('/api/parts', require('./routes/parts'));
app.use('/api/services', require('./routes/services'));
app.use('/api/tutorials', require('./routes/tutorials'));
app.use('/api/warranty', require('./routes/warranty'));
app.use('/api/specs', require('./routes/specs'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/extras', require('./routes/extras'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = 
// === Custom Feature Mounts (batch_06) ===
app.use('/api/cf-agentic-vehicle-health-monitoring', require('./routes/customFeat01_AgenticVehicleHealthMonitoring'));
app.use('/api/cf-computer-vision-damage-assessment', require('./routes/customFeat02_ComputerVisionDamageAssessment'));
app.use('/api/cf-recall-proactive-management', require('./routes/customFeat03_RecallProactiveManagement'));
app.use('/api/cf-smart-maintenance-scheduling', require('./routes/customFeat04_SmartMaintenanceScheduling'));
app.use('/api/cf-parts-compatibility-optimization', require('./routes/customFeat05_PartsCompatibilityOptimization'));


// === Batch 06 Gaps & Frontend Mounts ===
app.use('/api/gap-maintenance-without-maintenance', require('./routes/gapFeat_maintenance_without_maintenance'));
app.use('/api/gap-recalls-without-recall', require('./routes/gapFeat_recalls_without_recall'));
app.use('/api/gap-services-without-service', require('./routes/gapFeat_services_without_service'));
app.use('/api/gap-no-real-vehicle-api-integration-bmw-connecteddrive', require('./routes/gapFeat_no_real_vehicle_api_integration_bmw_connecteddrive'));
app.use('/api/gap-no-parts-ordering-integration-with-retailers', require('./routes/gapFeat_no_parts_ordering_integration_with_retailers'));
app.use('/api/gap-no-integration-with-mechanics-service-shops', require('./routes/gapFeat_no_integration_with_mechanics_service_shops'));
app.use('/api/gap-no-appointment-booking-scheduling-module', require('./routes/gapFeat_no_appointment_booking_scheduling_module'));
app.use('/api/gap-no-notifications-module-grep-0', require('./routes/gapFeat_no_notifications_module_grep_0'));
app.use('/api/gap-no-audit-logging-grep-0', require('./routes/gapFeat_no_audit_logging_grep_0'));
app.use('/api/gap-no-webhooks-for-recall-safety-alerts', require('./routes/gapFeat_no_webhooks_for_recall_safety_alerts'));
app.use('/api/gap-no-mobile-app-despite-consumer', require('./routes/gapFeat_no_mobile_app_despite_consumer'));

// === Custom Views (mounted BEFORE 404) ===
app.use('/api/custom-views', require('./routes/customViews'));

// 404 handler (mounted last)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Retrying in 3 seconds...`);
    setTimeout(() => {
      server.close();
      server.listen(PORT);
    }, 3000);
  } else {
    console.error('Server error:', err);
  }
});

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, () => {
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

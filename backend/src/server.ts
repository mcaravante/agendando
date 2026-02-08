import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import eventTypeRoutes from './routes/eventType.routes';
import availabilityRoutes from './routes/availability.routes';
import bookingRoutes from './routes/booking.routes';
import publicRoutes from './routes/public.routes';
import integrationsRoutes from './routes/integrations.routes';
import workflowRoutes from './routes/workflow.routes';
import dashboardRoutes from './routes/dashboard.routes';
import contactsRoutes from './routes/contacts.routes';
import { startJobProcessor } from './services/workflow.service';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Serve static files (avatars)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve widget files with CORS for any origin (embeddable)
app.use('/widget', cors(), express.static(path.join(__dirname, '../public/widget'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
  },
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/event-types', eventTypeRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contacts', contactsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Start the job processor for workflows
  startJobProcessor();
  console.log('Job processor started');
});

export default app;

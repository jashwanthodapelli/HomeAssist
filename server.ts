import express from 'express';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer as createViteServer } from 'vite';

// Import Routes
import authRoutes from './server/routes/auth';
import workersRoutes from './server/routes/workers';
import categoriesRoutes from './server/routes/categories';
import servicesRoutes from './server/routes/services';
import bookingsRoutes from './server/routes/bookings';
import reviewsRoutes from './server/routes/reviews';
import favoritesRoutes from './server/routes/favorites';
import complaintsRoutes from './server/routes/complaints';
import customServicesRoutes from './server/routes/customServices';
import adminRoutes from './server/routes/admin';
import uploadRoutes from './server/routes/upload';
import { db } from './server/datastore';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads directory
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // Connect to MongoDB if MONGODB_URI is provided
  if (process.env.MONGODB_URI) {
    try {
      console.log('Attempting MongoDB connection to:', process.env.MONGODB_URI);
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log('Connected to MongoDB successfully.');
    } catch (err: any) {
      console.warn('MongoDB connection failed or timed out. Falling back to persistent local datastore:', err.message);
    }
  } else {
    console.log('HomeAssist running with persistent zero-config datastore (ready for hackathon demo).');
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'HomeAssist API',
      database: mongoose.connection.readyState === 1 ? 'MongoDB' : 'Embedded DataStore',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/workers', workersRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/bookings', bookingsRoutes);
  app.use('/api/reviews', reviewsRoutes);
  app.use('/api/favorites', favoritesRoutes);
  app.use('/api/complaints', complaintsRoutes);
  app.use('/api/custom-services', customServicesRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/upload', uploadRoutes);

  // Users endpoint for admin or profile lookups
  app.get('/api/users/:id', (req, res) => {
    const user = db.getUserById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const safe = { ...user };
    delete safe.password;
    res.json({ success: true, user: safe });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HomeAssist server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
});

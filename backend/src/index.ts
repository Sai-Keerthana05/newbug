import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes/api';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Dynamic CORS to support localhost, configured FRONTEND_URL, and Vercel domains
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve generated videos statically
app.use('/videos', express.static(path.join(__dirname, '..', 'public', 'videos')));

// Base health check route
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'Connected' : dbState === 2 ? 'Connecting' : 'Disconnected';
  res.json({
    status: 'OK',
    service: 'Bug Replier Backend API',
    uptime: Math.round(process.uptime()),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API Routes mounting
app.use('/api', apiRoutes);

// Database Connection with Auto-Retry and Server Startup
// Database Connection with Auto-Retry and Server Startup
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://saikeerthana1112_db_user:Oyzj4OXMD1yX50l5@cluster1.2heizmj.mongodb.net/bug-replier?retryWrites=true&w=majority';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not configured');
}
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB.');
  } catch (error) {
    console.error('Database connection error:', error);
    console.log('Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bug Replier backend running on 0.0.0.0:${PORT}`);
  connectDB();
});

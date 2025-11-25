import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
// import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import errorHandlerMiddleware from './middleware/errorHandler.js';
import notFoundMiddleware from './middleware/notFound.js';

// Load environment variables
// dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import routes
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import electionRouter from './routes/electionRoutes.js';
import candidateRouter from './routes/candidateRoutes.js';
import voterRouter from './routes/voterRoutes.js';
import settingsRouter from './routes/settingsRoutes.js';

// Mount routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/elections', electionRouter);
app.use('/api/v1/candidates', candidateRouter);
app.use('/api/v1/voters', voterRouter);
app.use('/api/v1/settings', settingsRouter);

// 404 handler
app.use(notFoundMiddleware);

// Error handler
app.use(errorHandlerMiddleware);

// Server configuration
const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  // Close server & exit process
  process.exit(1);
});

// Database connection
const DB = process.env.MONGO_URL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB Connection Successful'))
  .catch((err) => {
    console.error('❌ Could Not Connect to MongoDB');
    console.error('Error details:', err.message);
    console.error('Make sure:');
    console.error('1. MongoDB is running and connection string is correct');
    console.error('2. The database name in the connection string is correct');
    console.error('3. If using MongoDB Atlas, ensure your IP is whitelisted');
    process.exit(1);
  });

// Start server
const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server Running on Port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM (for Heroku, etc.)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('👋 SIGINT RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
    process.exit(0);
  });
});

export default app;

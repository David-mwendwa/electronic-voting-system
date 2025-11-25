import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url)); // required when using es6 module type
import 'express-async-errors';
import 'dotenv/config.js';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';

// import extra security packages
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';

// import middleware
import errorHandlerMiddleware from './middleware/errorHandler.js';
import notFoundMiddleware from './middleware/notFound.js';

const app = express();

// Enable CORS
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// handle unhandled errors that occur in synchronous code i.e undefined value
process.on('uncaughtException', (err) => {
  console.log(`UNCAUGHT EXCEPTION! SHUTTING DOWN...`);
  console.log(err.name, err.message);
  process.exit(1);
});

app.use(helmet());

app.use(cookieParser());
if (!/production/i.test(process.env.NODE_ENV)) {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// render index page after executing 'npm run build-client'
if (/production/i.test(process.env.NODE_ENV)) {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
}

// Set security HTTP headers
app.use(helmet());

// Data sanitization against XSS
app.use(xss());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'price'],
  })
);

// Rate limiting
const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTES
// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    requestTime: req.requestTime,
  });
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

// 3) ERROR HANDLING
// 404 handler - must be after all other routes
app.use(notFoundMiddleware);

// Global error handler - must be after all other middleware
app.use(errorHandlerMiddleware);

// 4) DATABASE CONNECTION
if (!process.env.MONGO_URL) {
  console.error(' MONGO_URL is not defined in environment variables');
  process.exit(1);
}

const DB = process.env.MONGO_URL.replace(
  '<PASSWORD>',
  process.env.MONGO_PASSWORD || ''
);

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 10000, // Wait up to 10s for server selection
  socketTimeoutMS: 30000, // Close idle connections after 30s
  maxPoolSize: 10, // Reasonable default for most apps
  w: 'majority', // Ensure write acknowledgement
};

mongoose
  .connect(DB, mongooseOptions)
  .then(() => console.log(' MongoDB connection successful'))
  .catch((err) => {
    console.error(' MongoDB connection error:', err.message);
    process.exit(1);
  });

// 5) START SERVER
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(
    ` Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
  console.log(` Connect: http://localhost:${PORT}`);
});

// 6) GLOBAL ERROR HANDLERS
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION!  Shutting down...');
  console.error('Error:', err.name, err.message);

  server.close(() => {
    console.log(' Process terminated!');
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION!  Shutting down...');
  console.error('Error:', err.name, err.message);

  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM (for Heroku, etc.)
process.on('SIGTERM', () => {
  console.log(' SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log(' Process terminated!');
  });
});

// Handle process termination
process.on('SIGINT', () => {
  console.log(' SIGINT RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log(' Process terminated!');
    process.exit(0);
  });
});

export default app;

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

// import routes
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import electionRouter from './routes/electionRoutes.js';
import candidateRouter from './routes/candidateRoutes.js';
import voterRouter from './routes/voterRoutes.js';
import settingsRouter from './routes/settingsRoutes.js';

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
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Electronic Voting System API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        elections: '/api/v1/elections',
        candidates: '/api/v1/candidates',
        votes: '/api/v1/votes',
      },
    });
  });
}

// make static images available in the frontend - i.e when using multer
app.use(express.static(path.resolve(__dirname, '../frontend/public')));
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../frontend/public/uploads'))
);

// use extra security package middleware
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 60 minutes
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message:
    'Too many requests from this IP address! Please try again after an hour',
});
app.use('/api', limiter);
app.use(xss()); // sanitize data against XSS
app.use(mongoSanitize()); // sanitize data against NoSQL query injection i.e email: {$gt: ""}
app.use(hpp({ whitelist: [''] })); // prevent parameter pollution i.e sort=duration&sort=price - accepts params

// use routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/elections', electionRouter);
app.use('/api/v1/candidates', candidateRouter);
app.use('/api/v1/votes', voterRouter);
app.use('/api/v1/settings', settingsRouter);

// use error middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// start server
const PORT = process.env.PORT || 5000;
const DB = process.env.MONGO_URL;

mongoose
  .connect(DB)
  .then(() => console.log('✅ MongoDB Connection Successful'))
  .catch((err) => console.log(`❌ Could Not Connect to MongoDB`, err));

app.listen(PORT, () => console.log(`🚀 Server Running on Port ${PORT}`));

// handle errors occurring outside express i.e incorrect db password, invalid connection string
process.on('unhandledRejection', (err) => {
  console.log(`⚠️ UNHANDLED REJECTION! SHUTTING DOWN...`);
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});

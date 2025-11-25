import { StatusCodes } from 'http-status-codes';

// Environment detection
const isDevelopment = /dev/i.test(process.env.NODE_ENV || '');
const isProduction = /prod/i.test(process.env.NODE_ENV || '');
const isTest = /test/i.test(process.env.NODE_ENV || '');

/**
 * Logs error information for debugging and monitoring
 * @param {Error} err - The error object
 * @param {import('express').Request} req - Express request object
 */
const logError = (err, req) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    message: err.message,
    stack: isDevelopment ? err.stack : undefined,
    ...(err.name && { name: err.name }),
    ...(err.code && { code: err.code }),
  };

  if (isProduction) {
    // In production, log to a monitoring service
    console.error('Production Error:', JSON.stringify(errorInfo, null, 2));
  } else {
    // In development, log full error details
    console.error('Error:', errorInfo);
  }
};

/**
 * Handle development errors with detailed error information
 * @param {Error} err - The error object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Next middleware function
 * @returns {void}
 */
const handleDevelopmentErrors = (err, req, res, next) => {
  logError(err, req);

  res.status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message,
    error: err,
    stack: isDevelopment ? err.stack : undefined,
  });
};

/**
 * Handle production errors with user-friendly messages
 * @param {Error} err - The error object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Next middleware function
 * @returns {void}
 */
const handleProductionErrors = (err, req, res, next) => {
  const defaultError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'Something went wrong. Please try again later.',
  };

  // Handle known error types
  if (err.name === 'ValidationError') {
    defaultError.statusCode = StatusCodes.BAD_REQUEST;
    defaultError.message = Object.values(err.errors)
      .map((item) => item.message)
      .join('. ');
  } else if (err.code === 11000) {
    defaultError.statusCode = StatusCodes.BAD_REQUEST;
    defaultError.message = `${Object.keys(err.keyValue)} field must be unique`;
  } else if (err.name === 'JsonWebTokenError') {
    defaultError.statusCode = StatusCodes.UNAUTHORIZED;
    defaultError.message = 'Invalid token. Please log in again';
  } else if (err.name === 'TokenExpiredError') {
    defaultError.statusCode = StatusCodes.UNAUTHORIZED;
    defaultError.message = 'Session expired. Please log in again';
  } else if (err.name === 'CastError') {
    defaultError.statusCode = StatusCodes.NOT_FOUND;
    defaultError.message = 'The requested resource was not found';
  } else if (err.name === 'MongoServerError') {
    defaultError.statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    defaultError.message = 'Database service is currently unavailable';
  } else if (err.name === 'MongooseServerSelectionError') {
    defaultError.statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    defaultError.message = 'Unable to connect to the database';
  } else if (err.name === 'MulterError') {
    defaultError.statusCode = StatusCodes.BAD_REQUEST;
    defaultError.message = `File upload error: ${err.message}`;
  }

  // For 500 errors, log the full error
  if (defaultError.statusCode >= 500) {
    logError(err, req);

    // In production, don't expose internal error details
    if (isProduction) {
      defaultError.message =
        'An unexpected error occurred. Our team has been notified.';
    }
  }

  res.status(defaultError.statusCode).json({
    success: false,
    message: defaultError.message,
    ...(isDevelopment && { error: err.message, stack: err.stack }),
  });
};

/**
 * Central error handling middleware
 * @param {Error} err - The error object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Next middleware function
 * @returns {void}
 */
const errorHandlerMiddleware = (err, req, res, next) => {
  // Ensure headers are not sent twice
  if (res.headersSent) {
    return next(err);
  }

  // Handle different environments
  if (isProduction) {
    return handleProductionErrors(err, req, res, next);
  }
  return handleDevelopmentErrors(err, req, res, next);
};

export default errorHandlerMiddleware;

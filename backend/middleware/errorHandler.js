import { StatusCodes } from 'http-status-codes';
import { CustomAPIError } from '../errors/customErrors.js';

// Environment detection
const isProduction = /prod/i.test(process.env.NODE_ENV || '');

/**
 * Logs error information for debugging and monitoring
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 */
const logError = (err, req) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    message: err.message,
    ...(err.name && { name: err.name }),
    ...(err.code && { code: err.code }),
    ...(!isProduction && { stack: err.stack }),
  };

  console.error(
    isProduction ? 'Production Error:' : 'Error:',
    isProduction ? JSON.stringify(errorInfo, null, 2) : errorInfo
  );
};

/**
 * Handle development errors with detailed error information
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleDevelopmentErrors = (err, req, res) => {
  logError(err, req);

  const {
    message = 'An unexpected error occurred',
    name = 'InternalServerError',
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
    ...rest
  } = err;

  const errorResponse = {
    success: false,
    message,
    error: {
      name,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      stack: err.stack,
      details: rest,
    },
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * Handle production errors with user-friendly messages
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleProductionErrors = (err, req, res) => {
  // Handle custom errors first
  if (err instanceof CustomAPIError) {
    logError(err, req);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  const defaultError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: 'An unexpected error occurred. Please try again later.',
  };

  // Handle non-custom errors
  if (err.name === 'CastError') {
    defaultError.statusCode = StatusCodes.NOT_FOUND;
    defaultError.message = `Resource not found. Invalid: ${err.path}`;
  } else if (err.code === 11000) {
    defaultError.statusCode = StatusCodes.CONFLICT;
    const field = Object.keys(err.keyValue)[0];
    defaultError.message = `${field} '${err.keyValue[field]}' already exists.`;
  } else if (err.name === 'MongoServerError') {
    defaultError.statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    defaultError.message = 'Database operation failed. Please try again.';
  } else if (err.name === 'MongooseServerSelectionError') {
    defaultError.statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    defaultError.message =
      'Unable to connect to the database. Please try again later.';
  } else if (err.name === 'MulterError') {
    defaultError.statusCode = StatusCodes.BAD_REQUEST;
    defaultError.message = `File upload error: ${err.message}`;
  } else if (
    err.name === 'PayloadTooLargeError' ||
    err.type === 'entity.too.large'
  ) {
    defaultError.statusCode = StatusCodes.REQUEST_TOO_LONG;
    defaultError.message = 'Request payload is too large.';
  } else if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
    defaultError.statusCode = StatusCodes.REQUEST_TIMEOUT;
    defaultError.message = 'Request timeout. Please try again.';
  } else if (err.code === 'ECONNREFUSED') {
    defaultError.statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    defaultError.message =
      'Service temporarily unavailable. Please try again later.';
  } else if (err.code === 'EBADCSRFTOKEN') {
    defaultError.statusCode = StatusCodes.FORBIDDEN;
    defaultError.message = 'Invalid CSRF token.';
  } else if (err.name === 'MongoError' && err.message.includes('timed out')) {
    defaultError.statusCode = StatusCodes.GATEWAY_TIMEOUT;
    defaultError.message = 'Database operation timed out. Please try again.';
  } else if (err.name === 'ValidationError') {
    defaultError.statusCode = StatusCodes.BAD_REQUEST;
    defaultError.message = Object.values(err.errors)
      .map((error) => error.message)
      .join('; ');
  } else if (err.name === 'SyntaxError' && err.type === 'entity.parse.failed') {
    defaultError.statusCode = StatusCodes.BAD_REQUEST;
    defaultError.message = 'Invalid JSON payload';
  } else if (err.code === 'ENOENT') {
    defaultError.statusCode = StatusCodes.NOT_FOUND;
    defaultError.message = 'The requested resource was not found';
  } else if (err.code === 'EACCES' || err.code === 'EPERM') {
    defaultError.statusCode = StatusCodes.FORBIDDEN;
    defaultError.message = 'Permission denied';
  } else if (err.code === 'ENOSPC') {
    defaultError.statusCode = StatusCodes.INSUFFICIENT_STORAGE;
    defaultError.message = 'Storage limit reached';
  } else if (err.code === 'ECONNRESET') {
    defaultError.statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    defaultError.message = 'Connection was reset. Please try again.';
  } else if (err.code === 'ECONNABORTED') {
    defaultError.statusCode = StatusCodes.REQUEST_TIMEOUT;
    defaultError.message = 'Connection was aborted due to timeout.';
  }

  // Log the error
  console.error('Error:', {
    name: err.name,
    statusCode: defaultError.statusCode,
    message: err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(defaultError.statusCode >= 500 && { stack: err.stack }),
  });

  // Send error response
  res.status(defaultError.statusCode).json({
    success: false,
    message: defaultError.message,
  });
};

/**
 * Central error handling middleware
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandlerMiddleware = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  return isProduction
    ? handleProductionErrors(err, req, res)
    : handleDevelopmentErrors(err, req, res);
};

export default errorHandlerMiddleware;

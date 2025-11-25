import { StatusCodes } from 'http-status-codes';

/**
 * Middleware to handle 404 Not Found errors
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Next middleware function
 * @returns {void}
 * 
 * @example
 * // In your Express app:
 * app.use(notFound);
 * 
 * // This will catch all routes that don't match any route handlers
 * // and return a 404 response in the format:
 * // {
 * //   success: false,
 * //   message: "Route not found"
 * // }
 */
const notFoundMiddleware = (req, res, next) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Route not found'
  });
};

export default notFoundMiddleware;
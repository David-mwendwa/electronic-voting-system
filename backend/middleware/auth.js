import jwt from 'jsonwebtoken';
import {
  UnauthenticatedError,
  ForbiddenError,
} from '../errors/customErrors.js';

/**
 * Authenticates incoming requests by validating JWT tokens from multiple sources.
 * 
 * This middleware checks for tokens in the following order:
 * 1. Standard cookies (req.cookies.token)
 * 2. Signed cookies (req.signedCookies.token)
 * 3. Authorization header (Bearer token)
 * 4. Raw cookie header (as fallback)
 * 
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {UnauthenticatedError} If no valid token is found
 * @returns {Promise<void>}
 * 
 * @example
 * // In your route definitions
 * router.get('/protected-route', authenticate, (req, res) => {
 *   // Only accessible with valid authentication
 *   res.json({ message: 'Protected data' });
 * });
 * 
 * // The authenticated user is available as req.user
 * // Example: { id: 'user123', role: 'admin', iat: 1600000000, exp: 1600003600 }
 */
export const authenticate = async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;
  
  // Check for token in various locations
  if (req?.cookies?.token) {
    token = req.cookies.token;
  } else if (req?.signedCookies?.token) {
    token = req.signedCookies.token;
  } else if (authHeader && /^Bearer /i.test(authHeader)) {
    token = authHeader.split(' ')[1];
  } else if (req?.headers?.cookie) {
    token = req.headers.cookie.split('=')[1];
  }

  if (!token) {
    throw new UnauthenticatedError('Authentication invalid. Please log in');
  }

  try {
    // Verify and decode the JWT token
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    throw new UnauthenticatedError('Invalid or expired token. Please log in again');
  }
};

/**
 * Authorizes access to routes based on user roles.
 * 
 * This middleware verifies that the authenticated user has one of the required roles.
 * 
 * @function
 * @param {...(string|string[])} roles - One or more roles or arrays of roles
 * @returns {Function} Express middleware function
 * @throws {ForbiddenError} If user's role is not in the allowed roles
 * 
 * @example
 * // Single role check
 * router.get('/admin', authorizeRoles('admin'), adminHandler);
 * 
 * // Multiple roles check (any format works)
 * router.get('/admin', authorizeRoles('admin', 'sysadmin'), adminHandler);
 * router.get('/admin', authorizeRoles(['admin', 'sysadmin']), adminHandler);
 * 
 * // The authenticated user must be available in req.user
 * // Example req.user: { id: 'user123', role: 'admin', ... }
 */
export const authorizeRoles = (...roles) => {
  // Flatten and normalize roles array to handle both formats
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `${req.user.role} is not authorized to perform this action`
      );
    }
    next();
  };
};
import jwt from 'jsonwebtoken';
import {
  UnauthenticatedError,
  ForbiddenError,
} from '../errors/customErrors.js';

/**
 * Authenticate user - checks cookies, signedCookies & authorization headers
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const authenticate = async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (req?.cookies?.token) {
    token = req.cookies.token;
  } else if (req?.signedCookies?.token) {
    token = req.signedCookies.token;
  } else if (authHeader && /^Bearer /i.test(authHeader)) {
    token = authHeader.split(' ')[1];
  } else if (req?.headers?.cookie) {
    token = req.headers.cookie.split('=')[1];
  }
  if (!token)
    throw new UnauthenticatedError('Authentication invalid. Please log in');

  req.user = jwt.verify(token, process.env.JWT_SECRET); // user: { id, role, iat, exp}
  next();
};

/**
 * Authorize access to a forbidden resource based on user role
 * @param  {...any} roles one or more roles @example authorizeRoles('admin', 'lead', ...)
 * @returns Boolean
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(
        `${req.user.role} is not authorized to perfom this action`
      );
    }
    next();
  };
};

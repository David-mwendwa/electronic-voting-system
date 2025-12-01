import jwt from 'jsonwebtoken';

/**
 * Verify a JWT and return its decoded payload.
 *
 * Uses the application's `JWT_SECRET` environment variable. Intended for
 * verifying authentication tokens issued by the application.
 *
 * @param {{ token: string }} params - Wrapper object containing the token.
 * @param {string} params.token - JWT string to verify.
 * @returns {{ id: string, role: string, iat: number, exp: number }} Decoded
 *   user payload.
 * @throws {Error} If the token is invalid or expired.
 */
export const verifyJWT = ({ token }) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Create a JWT for the authenticated user and send it as an HTTP-only cookie.
 *
 * Relies on the `signJWT` instance method on the User model to generate the
 * token. The cookie lifetime is controlled via the `COOKIE_LIFETIME` (in days)
 * and `NODE_ENV` environment variables.
 *
 * @param {import('mongoose').Document & { signJWT: () => string }} user -
 *   Authenticated user document; must implement a `signJWT` method.
 * @param {number} statusCode - HTTP status code to send in the response.
 * @param {import('express').Response} res - Express response object.
 * @returns {void}
 */
export const sendToken = (user, statusCode, res) => {
  const token = user.signJWT();

  const oneDay = 24 * 60 * 60 * 1000;
  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_LIFETIME * oneDay),
    httpOnly: true,
    secure: /production/i.test(process.env.NODE_ENV),
  };

  user.password = undefined;

  res.status(statusCode).cookie('token', token, options).json({ token, user });
};

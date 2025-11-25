import { StatusCodes } from 'http-status-codes';

/**
 * Base class for all custom API errors
 * @extends Error
 * @property {number} statusCode - HTTP status code
 */
export class CustomAPIError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} [statusCode] - HTTP status code
   */
  constructor(message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// HTTP 4xx Client Errors

/**
 * 400 Bad Request Error
 * @extends CustomAPIError
 * @example
 * throw new BadRequestError('Invalid input provided');
 */
export class BadRequestError extends CustomAPIError {
  constructor(message = 'Bad Request') {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

/**
 * 401 Unauthorized Error
 * @extends CustomAPIError
 */
export class UnauthenticatedError extends CustomAPIError {
  constructor(message = 'Authentication required') {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

/**
 * 403 Forbidden Error
 * @extends CustomAPIError
 */
export class ForbiddenError extends CustomAPIError {
  constructor(message = 'Forbidden') {
    super(message, StatusCodes.FORBIDDEN);
  }
}

/**
 * 404 Not Found Error
 * @extends CustomAPIError
 */
export class NotFoundError extends CustomAPIError {
  constructor(message = 'Resource not found') {
    super(message, StatusCodes.NOT_FOUND);
  }
}

/**
 * 405 Method Not Allowed
 * @extends CustomAPIError
 */
export class MethodNotAllowedError extends CustomAPIError {
  constructor(message = 'Method not allowed') {
    super(message, StatusCodes.METHOD_NOT_ALLOWED);
  }
}

/**
 * 408 Request Timeout
 * @extends CustomAPIError
 */
export class RequestTimeoutError extends CustomAPIError {
  constructor(message = 'Request timeout') {
    super(message, StatusCodes.REQUEST_TIMEOUT);
  }
}

/**
 * 409 Conflict Error
 * @extends CustomAPIError
 */
export class ConflictError extends CustomAPIError {
  constructor(message = 'Resource already exists') {
    super(message, StatusCodes.CONFLICT);
  }
}

/**
 * 422 Unprocessable Entity Error
 * @extends CustomAPIError
 */
export class ValidationError extends CustomAPIError {
  /**
   * @param {string|Object} errors - Validation errors (string or object with error details)
   * @param {string} [message='Validation failed'] - Error message
   */
  constructor(errors, message = 'Validation failed') {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY);
    this.errors = typeof errors === 'string' ? { message: errors } : errors;
  }
}

/**
 * 429 Too Many Requests
 * @extends CustomAPIError
 */
export class TooManyRequestsError extends CustomAPIError {
  constructor(message = 'Too many requests, please try again later.') {
    super(message, StatusCodes.TOO_MANY_REQUESTS);
  }
}

// HTTP 5xx Server Errors

/**
 * 500 Internal Server Error
 * @extends CustomAPIError
 */
export class InternalServerError extends CustomAPIError {
  constructor(message = 'Internal server error') {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

/**
 * 503 Service Unavailable
 * @extends CustomAPIError
 */
export class ServiceUnavailableError extends CustomAPIError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, StatusCodes.SERVICE_UNAVAILABLE);
  }
}

// Business Logic Errors

/**
 * Error thrown when an election is not active
 * @extends CustomAPIError
 */
export class ElectionNotActiveError extends CustomAPIError {
  constructor(message = 'This election is not currently active') {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

/**
 * Error thrown when a user has already voted
 * @extends CustomAPIError
 */
export class AlreadyVotedError extends CustomAPIError {
  constructor(message = 'You have already voted in this election') {
    super(message, StatusCodes.CONFLICT);
  }
}

/**
 * Error thrown when a vote is invalid
 * @extends CustomAPIError
 */
export class InvalidVoteError extends CustomAPIError {
  constructor(message = 'Invalid vote') {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

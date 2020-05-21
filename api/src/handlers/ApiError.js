/**
 * Custom Error object that extends the Error class
 * https://nodejs.org/api/errors.html#errors_class_error
 *
 * @param {number} status - HTTP status code to return
 * @param {string} message - Error message
 * @example
 * throw new ApiError(500, 'Something bad happened');
 *
 * Just a more convenient way to write the following
 * const err = new Error('Something bad happened');
 * err.status = 500;
 * return err;
 */

class ApiError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.message = message;
  }
}

module.exports = ApiError;

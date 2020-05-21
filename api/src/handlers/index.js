const ApiError = require('./ApiError');

/*
  Catch Errors Handler
  With async/await, you need some way to catch errors
  Instead of using try{} catch(e) {} in each controller, we wrap the function in
  catchErrors(), catch any errors they throw, and pass it along to our express middleware with next()
*/
const catchErrors = fn =>
  function(req, res, next) {
    return fn(req, res, next).catch(next);
  };

/*
  Log Errors
  Print useful stacktraces to the console
*/
const logErrors = (err, req, res, next) => {
  if (err.stack) {
    // err.stack will be `undefined` unless the Error class is used
    // https://nodejs.org/api/errors.html#errors_error_stack
    console.error(`🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨 \n`, err.stack);
  } else {
    // Still log something useful in case we catch something like `throw 'oh no'`
    console.trace(`🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨 \n`, err);
  }

  next(err);
};

/*
  Not Found Error Handler
  If we hit a route that is not found, we mark it as 404 and pass it along to the next error handler to display
*/
const notFoundHandler = (req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
};

/*
  Error Handler
  If we hit a syntax error or any other previously unhandled error, return JSON with error details
*/
const errorHandler = (err, req, res, next) => {
  const errorDetails = {
    status: err.status,
    message: err.message,
  };

  res.status(err.status || 500).json(errorDetails);

  next(err);
};

module.exports = {
  ApiError,
  catchErrors,
  logErrors,
  notFoundHandler,
  errorHandler,
};

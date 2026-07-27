import ApiError from '../utils/ApiError.js';

const handleDuplicateKey = (error) => {
  const fields = Object.keys(error.keyValue || {}).join(', ');
  return new ApiError(`${fields || 'Record'} already exists`, 409);
};

const handleValidationError = (error) =>
  new ApiError(
    'Validation failed',
    400,
    Object.values(error.errors || {}).map((item) => item.message)
  );

const handleCastError = (error) => new ApiError(`Invalid ${error.path}: ${error.value}`, 400);

const handleJwtError = () => new ApiError('Invalid token. Please log in again.', 401);

const handleJwtExpiredError = () => new ApiError('Your session has expired. Please log in again.', 401);

const errorHandler = (error, req, res, next) => {
  let err = error;

  if (error.name === 'ValidationError') err = handleValidationError(error);
  if (error.code === 11000) err = handleDuplicateKey(error);
  if (error.name === 'CastError') err = handleCastError(error);
  if (error.name === 'JsonWebTokenError') err = handleJwtError();
  if (error.name === 'TokenExpiredError') err = handleJwtExpiredError();

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    message: err.isOperational || !isProduction ? err.message : 'Something went wrong',
    ...(err.details ? { details: err.details } : {}),
    ...(!isProduction && err.stack ? { stack: err.stack } : {}),
  });

  next;
};

export default errorHandler;

import logger from '../config/logger.js'

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled Error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  })

  console.error('Unhandled Error:', err) // Force console output
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    success: false,
    error: err.message, // Expose message for debugging
    stack: err.stack // Expose stack for debugging
  })
}

export default errorHandler

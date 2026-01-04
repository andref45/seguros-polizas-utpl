import logger from '../config/logger.js'

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled Error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  })

  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal Server Error' : err.message
  })
}

export default errorHandler

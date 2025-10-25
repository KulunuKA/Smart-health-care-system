export class ResponseHandler {
  /**
   * Send success response with standardized format
   * @param {Object} response - Express response object
   * @param {Object} data - Data to be sent
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  static sendSuccess(response, data = {}, message = "Success", statusCode = 200) {
    return response.status(statusCode).json({
      data: data,
      message: message
    });
  }

  /**
   * Send error response with standardized format
   * @param {Object} response - Express response object
   * @param {string|Error} error - Error message or Error object
   * @param {number} statusCode - HTTP status code (default: 500)
   */
  static sendError(response, error, statusCode = 500) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorData = error instanceof Error ? { stack: error.stack } : {};
    
    return response.status(statusCode).json({
      data: errorData,
      message: errorMessage
    });
  }

  /**
   * Send validation error response
   * @param {Object} response - Express response object
   * @param {Object} validationErrors - Validation error details
   * @param {string} message - Error message
   */
  static sendValidationError(response, validationErrors, message = "Validation failed") {
    return response.status(400).json({
      data: { errors: validationErrors },
      message: message
    });
  }

  /**
   * Send not found response
   * @param {Object} response - Express response object
   * @param {string} message - Not found message
   */
  static sendNotFound(response, message = "Resource not found") {
    return response.status(404).json({
      data: {},
      message: message
    });
  }

  /**
   * Send unauthorized response
   * @param {Object} response - Express response object
   * @param {string} message - Unauthorized message
   */
  static sendUnauthorized(response, message = "Unauthorized access") {
    return response.status(401).json({
      data: {},
      message: message
    });
  }

  /**
   * Send forbidden response
   * @param {Object} response - Express response object
   * @param {string} message - Forbidden message
   */
  static sendForbidden(response, message = "Access forbidden") {
    return response.status(403).json({
      data: {},
      message: message
    });
  }
}

// Export individual methods for backward compatibility
export const responseHandler = {
  sendSuccess: ResponseHandler.sendSuccess,
  sendError: ResponseHandler.sendError,
  sendValidationError: ResponseHandler.sendValidationError,
  sendNotFound: ResponseHandler.sendNotFound,
  sendUnauthorized: ResponseHandler.sendUnauthorized,
  sendForbidden: ResponseHandler.sendForbidden
};

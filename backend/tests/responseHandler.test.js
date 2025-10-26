import { ResponseHandler, responseHandler } from '../utils/ResponseHandler.js';

describe('ResponseHandler', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('sendSuccess', () => {
    it('should send success response with default values', () => {
      // Act
      ResponseHandler.sendSuccess(mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {},
        message: 'Success'
      });
    });

    it('should send success response with custom data and message', () => {
      // Arrange
      const data = { id: '123', name: 'Test' };
      const message = 'Operation completed successfully';
      const statusCode = 201;

      // Act
      ResponseHandler.sendSuccess(mockRes, data, message, statusCode);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: data,
        message: message
      });
    });

    it('should send success response with only data', () => {
      // Arrange
      const data = { result: 'success' };

      // Act
      ResponseHandler.sendSuccess(mockRes, data);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: data,
        message: 'Success'
      });
    });

    it('should send success response with data and message', () => {
      // Arrange
      const data = { count: 5 };
      const message = 'Items retrieved';

      // Act
      ResponseHandler.sendSuccess(mockRes, data, message);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: data,
        message: message
      });
    });
  });

  describe('sendError', () => {
    it('should send error response with Error object', () => {
      // Arrange
      const error = new Error('Database connection failed');
      const statusCode = 500;

      // Act
      ResponseHandler.sendError(mockRes, error, statusCode);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: { stack: error.stack },
        message: 'Database connection failed'
      });
    });

    it('should send error response with string message', () => {
      // Arrange
      const errorMessage = 'Validation failed';
      const statusCode = 400;

      // Act
      ResponseHandler.sendError(mockRes, errorMessage, statusCode);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {},
        message: 'Validation failed'
      });
    });

    it('should send error response with default status code', () => {
      // Arrange
      const error = new Error('Internal server error');

      // Act
      ResponseHandler.sendError(mockRes, error);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: { stack: error.stack },
        message: 'Internal server error'
      });
    });

    it('should handle null error gracefully', () => {
      // Act
      ResponseHandler.sendError(mockRes, null);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {},
        message: null
      });
    });

    it('should handle undefined error gracefully', () => {
      // Act
      ResponseHandler.sendError(mockRes, undefined);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {},
        message: undefined
      });
    });
  });

  describe('sendValidationError', () => {
    it('should send validation error response', () => {
      // Arrange
      const validationErrors = {
        email: 'Email is required',
        password: 'Password must be at least 8 characters'
      };
      const message = 'Validation failed';

      // Act
      ResponseHandler.sendValidationError(mockRes, validationErrors, message);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: { errors: validationErrors },
        message: message
      });
    });

    it('should send validation error response with default message', () => {
      // Arrange
      const validationErrors = {
        field: 'Field is invalid'
      };

      // Act
      ResponseHandler.sendValidationError(mockRes, validationErrors);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: { errors: validationErrors },
        message: 'Validation failed'
      });
    });

    it('should handle empty validation errors', () => {
      // Arrange
      const validationErrors = {};

      // Act
      ResponseHandler.sendValidationError(mockRes, validationErrors);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: { errors: {} },
        message: 'Validation failed'
      });
    });
  });

  describe('sendNotFound', () => {
    it('should send not found response with custom message', () => {
      // Arrange
      const message = 'User not found';

      // Act
      ResponseHandler.sendNotFound(mockRes, message);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {},
        message: 'User not found'
      });
    });

    it('should send not found response with default message', () => {
      // Act
      ResponseHandler.sendNotFound(mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {},
        message: 'Resource not found'
      });
    });
  });

  describe('sendUnauthorized', () => {
    it('should send unauthorized response with custom message', () => {
      // Arrange
      const message = 'Invalid credentials';

      // Act
      ResponseHandler.sendUnauthorized(mockRes, message);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {},
        message: 'Invalid credentials'
      });
    });

    it('should send unauthorized response with default message', () => {
      // Act
      ResponseHandler.sendUnauthorized(mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {},
        message: 'Unauthorized access'
      });
    });
  });

  describe('sendForbidden', () => {
    it('should send forbidden response with custom message', () => {
      // Arrange
      const message = 'Insufficient permissions';

      // Act
      ResponseHandler.sendForbidden(mockRes, message);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {},
        message: 'Insufficient permissions'
      });
    });

    it('should send forbidden response with default message', () => {
      // Act
      ResponseHandler.sendForbidden(mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {},
        message: 'Access forbidden'
      });
    });
  });

  describe('responseHandler (backward compatibility)', () => {
    it('should provide backward compatibility for sendSuccess', () => {
      // Arrange
      const data = { test: 'data' };
      const message = 'Test message';

      // Act
      responseHandler.sendSuccess(mockRes, data, message);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: data,
        message: message
      });
    });

    it('should provide backward compatibility for sendError', () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      responseHandler.sendError(mockRes, error);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: { stack: error.stack },
        message: 'Test error'
      });
    });

    it('should provide backward compatibility for sendValidationError', () => {
      // Arrange
      const validationErrors = { field: 'error' };

      // Act
      responseHandler.sendValidationError(mockRes, validationErrors);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: { errors: validationErrors },
        message: 'Validation failed'
      });
    });

    it('should provide backward compatibility for sendNotFound', () => {
      // Act
      responseHandler.sendNotFound(mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {},
        message: 'Resource not found'
      });
    });

    it('should provide backward compatibility for sendUnauthorized', () => {
      // Act
      responseHandler.sendUnauthorized(mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {},
        message: 'Unauthorized access'
      });
    });

    it('should provide backward compatibility for sendForbidden', () => {
      // Act
      responseHandler.sendForbidden(mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {},
        message: 'Access forbidden'
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large data objects', () => {
      // Arrange
      const largeData = {
        items: Array(1000).fill(0).map((_, i) => ({ id: i, value: `item-${i}` })),
        metadata: { timestamp: Date.now() }
      };

      // Act
      ResponseHandler.sendSuccess(mockRes, largeData);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: largeData,
        message: 'Success'
      });
    });

    it('should handle special characters in messages', () => {
      // Arrange
      const message = 'Error: "Invalid input" & <script>alert("xss")</script>';

      // Act
      ResponseHandler.sendError(mockRes, message);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {},
        message: message
      });
    });

    it('should handle circular references in error objects', () => {
      // Arrange
      const circularError = new Error('Circular reference error');
      circularError.circular = circularError;

      // Act
      ResponseHandler.sendError(mockRes, circularError);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: { stack: circularError.stack },
        message: 'Circular reference error'
      });
    });

    it('should handle numeric status codes', () => {
      // Arrange
      const data = { result: 'success' };
      const statusCode = 201;

      // Act
      ResponseHandler.sendSuccess(mockRes, data, 'Created', statusCode);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: data,
        message: 'Created'
      });
    });

    it('should handle boolean values in data', () => {
      // Arrange
      const data = { 
        success: true, 
        enabled: false, 
        count: 0,
        empty: null,
        undefined: undefined
      };

      // Act
      ResponseHandler.sendSuccess(mockRes, data);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: data,
        message: 'Success'
      });
    });
  });
});

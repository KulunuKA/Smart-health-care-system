import Joi from "joi";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        data: { errors: errorDetails },
        message: "Validation failed"
      });
    }
    
    req.validatedData = value;
    next();
  };
};

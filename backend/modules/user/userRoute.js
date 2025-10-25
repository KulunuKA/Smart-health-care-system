import { Router } from "express";
import Joi from "joi";
import { UserController } from "./userController.js";
import { validateRequest } from "../../middleware/joiValidation.js";

const router = Router();

// Joi validation schema for user signup
const signupSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ minDomainSegments: 2 })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
  firstName: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': 'First name is required'
    }),
  lastName: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': 'Last name is required'
    }),
});

// User signup route with Joi validation
router.post("/user/signup", validateRequest(signupSchema), UserController.signUp);

export { router as userRoute };

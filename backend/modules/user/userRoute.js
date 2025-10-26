import { Router } from "express";
import Joi from "joi";
import { UserController } from "./userController.js";
import { validateRequest, loginSchema } from "../../middleware/joiValidation.js";

const router = Router();

// Joi validation schema for user signup
const signupSchema = Joi.object({
  role: Joi.string().valid("Patient", "Doctor", "Admin").required().messages({
    "any.required": "Role is required",
  }),
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ minDomainSegments: 2 })
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
  firstName: Joi.string().trim().required().messages({
    "any.required": "First name is required",
  }),
  lastName: Joi.string().trim().required().messages({
    "any.required": "Last name is required",
  }),
  role: Joi.string()
    .valid('Patient', 'Doctor', 'Admin', 'Customer')
    .default('Patient')
    .messages({
      'any.only': 'Role must be one of: Patient, Doctor, Admin, Customer'
    }),
});

// User signup route with Joi validation
router.post(
  "/user/signup",
  validateRequest(signupSchema),
  UserController.signUp
);

// User login route with Joi validation
router.post(
  "/user/login",
  validateRequest(loginSchema),
  UserController.login
);

// User logout route
router.post("/user/logout", UserController.logout);

// Get doctors route
router.get("/doctors", UserController.getDoctors);

export { router as userRoute };

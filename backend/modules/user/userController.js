import mongoose from "mongoose";
import { MESSAGES } from "../../config/constants.js";
import { UserDao } from "./userDao.js";
import { UserModel } from "./userModel.js";
import { responseHandler } from "../../utils/ResponseHandler.js";

export class UserController {
  static async signUp(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if email already exists
      const isExist = await UserDao.isEmailExists({ email });

      if (isExist) {
        await session.abortTransaction();
        session.endSession();
        return responseHandler.sendError(res, MESSAGES.ERROR.EMAIL_ALREADY_EXIST, 400);
      }

      // Create user data
      const userData = {
        email,
        password,
        firstName,
        lastName,
      };

      console.log("Creating user with data:", userData);

      // Create new user
      const newUser = await UserDao.signUp(userData, session);
      
      // Generate auth token
      const accessToken = await newUser.generateAuthToken();

      await session.commitTransaction();
      session.endSession();

      const result = {
        accessToken,
        _id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      };

      return responseHandler.sendSuccess(res, result, "User signed up successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return responseHandler.sendError(res, error);
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by credentials
      const user = await UserModel.findByCredentials(email, password);
      
      // Generate auth token
      const accessToken = await user.generateAuthToken();

      const result = {
        accessToken,
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.toLowerCase(),
          name: `${user.firstName} ${user.lastName}`
        }
      };

      return responseHandler.sendSuccess(res, result, "Login successful");
    } catch (error) {
      return responseHandler.sendError(res, error);
    }
  }

  static async logout(req, res) {
    try {
      // For now, just return success
      // In a more sophisticated implementation, you might want to:
      // - Blacklist the token
      // - Remove the token from the user's tokens array
      return responseHandler.sendSuccess(res, null, "Logout successful");
    } catch (error) {
      return responseHandler.sendError(res, error);
    }
  }

  static async getDoctors(req, res) {
    try {
      // Get all users with role "Doctor"
      const doctors = await UserModel.find({ role: "Doctor" })
        .select('_id firstName lastName email specialty')
        .sort({ firstName: 1 });

      return responseHandler.sendSuccess(res, doctors, "Doctors retrieved successfully");
    } catch (error) {
      console.error("Error fetching doctors:", error);
      return responseHandler.sendError(res, error);
    }
  }
}

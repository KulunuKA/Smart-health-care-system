import mongoose from "mongoose";
import { MESSAGES } from "../../config/constants.js";
import { UserDao } from "./userDao.js";
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
}

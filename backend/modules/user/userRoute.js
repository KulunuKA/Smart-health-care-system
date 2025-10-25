import * as Joi from "joi";
import { SERVER } from "../../config/environment";
import { UserController } from "./userController";
import { responseHandler } from "../../utils/ResponseHandler";   


export const userRoute = [
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/user/signup`,
    handler: async (request, response) => {
      try {
        const payload = request.payload;

        const result = await UserController.signUp(payload);
        return responseHandler.sendSuccess(h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "user"],
      description: "User SignUp without email verification",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        payload: Joi.object({
          email: Joi.string()
            .trim()
            .lowercase()
            .email({ minDomainSegments: 2 })
            .regex(REGEX.EMAIL)
            .default(SERVER.DEFAULT_EMAIL)
            .required(),
          password: Joi.string().min(6).required(),
          name: Joi.string().trim().required(),
        }),
      },
    },
  },
];

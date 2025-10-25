import { UserModel } from "./userModel.js";

export class UserDao {
  /**
   * @function isEmailExists
   */
  static async isEmailExists(params, userId) {
    try {
      const query = {};
      query.email = params.email;
      if (userId) query._id = { $not: { $eq: userId } };
      const projection = { updatedAt: 0 };
      return await UserModel.findOne(query, projection);
    } catch (error) {
      throw error;
    }
  }

  /**
	 * @function signUp
	 */
	static async signUp(params, session) {
		try {
			const users = await UserModel.create([params], { session });
			return users[0]; // Return the first (and only) user
		} catch (error) {
			throw error;
		}
	}
}

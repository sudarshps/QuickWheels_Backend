import userRepository from "../repositories/user_repository";
import { IUserRepository } from "../interface/user/IUserRepository";
import { IOrderRepository } from "../interface/order/IOrderRepository";
import OrderRepository from "../repositories/order_repository";
import { IUser } from "../models/user_model";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { signAccessToken, signRefreshToken } from "../utils/jwt_utils";
import { IReview } from "../models/review_model";
import { Types } from "mongoose";
import { IUserService } from "../interface/user/IUserService";

interface EmailValidate {
  emailExists: boolean;
  password?: string;
  token?: string;
  message?: string;
}

interface UserUpdateResponse {
  userUpdated: boolean;
  email?: string;
  isHost?: boolean;
  userName?: string;
  profileUpdated?: boolean;
  message?: string;
}

interface userValidate {
  validUser: boolean;
  username: string;
  accessToken?: string;
  refreshToken?: string;
  userId?: ObjectId;
  profileUpdated?: boolean;
  isHost?: boolean;
  isVerified?: boolean;
  status?: string;
  role?: string[];
  message?: string;
}

interface UserDetails {
  id?: ObjectId;
  dob: string;
  phone: string;
  address: string;
  drivingExpDate: string;
  drivingID: string;
  drivingIDFront: string;
  drivingIDBack: String;
  profileUpdated: boolean;
  isHost: boolean;
  status: string;
  note: string;
  role: string[];
  isVerified: boolean;
}

class UserService implements IUserService {
  constructor(
    private _userRepository: IUserRepository,
    private _orderRepository: IOrderRepository
  ) {}

  async createUser(
    userData: Partial<IUser>,
    loginMethod: string
  ): Promise<userValidate | null> {
    try {
      const userPassword = userData.password;
      const hashedPassword = await bcrypt.hash(userData.password as string, 10);
      userData.password = hashedPassword;

      const userWallet = await this._userRepository.createWallet();

      if (!userWallet) {
        return null;
      }

      userData.wallet = userWallet._id;
      const user = await this._userRepository.createUser(userData);

      if (user) {
        const email = user.email;

        return await this.validateUser(
          { email, password: userPassword },
          loginMethod
        );
      }

      return {
        validUser: false,
        username: "",
        message: "Incorrect Password",
      };
    } catch (error) {
      console.error("error while creating user!");
      throw error;
    }
  }

  async userProfile(
    userData: Partial<IUser>,
    longitude: number,
    latitude: number
  ): Promise<UserUpdateResponse> {
    try {
      const user = await this._userRepository.updateUserProfile(
        userData,
        longitude,
        latitude
      );

      if (user) {
        return {
          userUpdated: true,
          userName: user.name,
          email: user.email,
          isHost: Boolean(user.isHost),
          profileUpdated: Boolean(user.profileUpdated),
          message: "User updated successfully",
        };
      }

      return {
        userUpdated: false,
        message: "User updation failed",
      };
    } catch (error) {
      console.error("error while updating user profile!");
      throw error;
    }
  }

  async editUserProfile(
    userData: Partial<IUser>,
    email: string
  ): Promise<IUser | null> {
    try {
      const user = await this._userRepository.editUserProfile(userData, email);

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      console.error("error while editing user profile!");
      throw error;
    }
  }

  async validateEmail(userData: Partial<IUser>): Promise<EmailValidate> {
    try {
      const user = await this._userRepository.findUserByEmail(
        userData.email as string
      );
      if (user) {
        return {
          emailExists: true,
          password: user.password,
          message: "Email is already registered",
        };
      }

      return {
        emailExists: false,
        message: "Email is not registered",
      };
    } catch (error) {
      console.error("error while validating email!");
      throw error;
    }
  }

  async validateUser(
    userData: Partial<IUser>,
    loginMethod: string
  ): Promise<userValidate> {
    try {
      const user = await this._userRepository.validateUser(userData);
      if (user) {
        let isMatch = await bcrypt.compare(
          userData.password as string,
          user.password
        );

        if (loginMethod === "googleauth") {
          isMatch = user.password === userData.password;
        }

        if (isMatch) {
          const accessToken = signAccessToken({
            id: user._id,
            username: user.name,
            email: user.email,
            profileUpdated: user.profileUpdated,
            isHost: user.isHost,
            role: user.role,
          });
          const refreshToken = signRefreshToken({
            id: user._id,
            username: user.name,
            email: user.email,
            profileUpdated: user.profileUpdated,
            isHost: user.isHost,
            role: user.role,
          });
          return {
            validUser: true,
            username: user.name,
            userId: user._id,
            isVerified: Boolean(user.isVerified),
            accessToken: accessToken,
            refreshToken: refreshToken,
            profileUpdated: Boolean(user.profileUpdated),
            isHost: Boolean(user.isHost),
            status: user.status,
            role: user.role,
            message: "User validation is successful",
          };
        }
      }

      return {
        validUser: false,
        username: "",
        message: "Incorrect Password",
      };
    } catch (error) {
      console.error("error while validating user!");
      throw error;
    }
  }

  async updatePassword(
    email: string,
    password: string
  ): Promise<Partial<IUser> | null> {
    try {
      const hashedPassword = await bcrypt.hash(password as string, 10);

      return await this._userRepository.updatePassword(email, hashedPassword);
    } catch (error) {
      console.error("error while updating password!");
      throw error;
    }
  }

  async userDetails(email: string): Promise<UserDetails | void> {
    try {
      const user = await this._userRepository.findUserByEmail(email);
      if (user) {
        return {
          id: user._id,
          dob: user.dob,
          phone: user.phone,
          address: user.address,
          drivingExpDate: user.drivingExpDate,
          drivingID: user.drivingID,
          drivingIDFront: user.drivingIDFront,
          drivingIDBack: user.drivingIDBack,
          profileUpdated: Boolean(user.profileUpdated),
          isHost: Boolean(user.isHost),
          status: user.status,
          role: user.role,
          note: user.note,
          isVerified: Boolean(user.isVerified),
        };
      }
    } catch (error) {
      console.error("error while get user details!");
      throw error;
    }
  }

  async getWallet(userId: string): Promise<Partial<IUser> | null> {
    try {
      return await this._userRepository.getWallet(userId);
    } catch (error) {
      console.error("error while getting wallet!");
      throw error;
    }
  }

  async carRating(
    userId: string,
    carId: string,
    orderId: string,
    rating: number,
    feedback: string
  ): Promise<IReview | null> {
    try {
      const reviewDetails = {
        reviewerId: userId,
        carId,
        rating,
        feedback,
      };
      const review = await this._userRepository.carRating(reviewDetails);
      if (!review) {
        return null;
      }
      const reviewId = (review._id as Types.ObjectId).toString();
      const updateOrderWithReview =
        await this._orderRepository.updateOrderReview(orderId, reviewId);
      if (!updateOrderWithReview) {
        return null;
      }
      return review;
    } catch (error) {
      console.error("error on car rating!");
      throw error;
    }
  }

  async carReview(id: string): Promise<IReview[] | null> {
    try {
      return await this._userRepository.carReview(id);
    } catch (error) {
      console.error('error on car review!');
      throw error
    }
  }
}

export default new UserService(userRepository, OrderRepository);
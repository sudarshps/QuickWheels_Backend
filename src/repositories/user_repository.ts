import User, { IUser } from "../models/user_model";
import mongoose, { QueryOptions } from "mongoose";
import WalletModel, { IWallet } from "../models/wallet_model";
import ReviewModel, { IReview } from "../models/review_model";
import { IUserRepository } from "../interface/user/IUserRepository";
import BaseRepository from "./base_repository";

class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      return await this.create(userData);
    } catch (error) {
      console.error("error in creating user:", error);
      throw error;
    }
  }
  async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await this.findOne({ email });
    } catch (error) {
      console.error("error in finding user mail:", error);
      throw error;
    }
  }

  async validateUser(userData: Partial<IUser>): Promise<IUser | null> {
    try {
      return await this.findOne({ email: userData.email });
    } catch (error) {
      console.error("error in validate user:", error);
      throw error;
    }
  }

  async updatePassword(
    email: string,
    password: string
  ): Promise<Partial<IUser> | null> {
    try {
      return await this.findOneAndUpdate({ email }, { password }, {
        new: true,
      } as QueryOptions);
    } catch (error) {
      console.error("error in update password:", error);
      throw error;
    }
  }

  async updateUserProfile(
    userData: Partial<IUser>,
    longitude: number,
    latitude: number
  ): Promise<IUser | null> {
    try {
      const email = userData.email;
      return await this.findOneAndUpdate(
        { email },
        {
          $set: {
            ...userData,
            location: { type: "Point", coordinates: [longitude, latitude] },
          },
        }
      );
    } catch (error) {
      console.error("error in update user profile:", error);
      throw error;
    }
  }

  async editUserProfile(
    userData: Partial<IUser>,
    email: string
  ): Promise<IUser | null> {
    try {
      return await this.findOneAndUpdate(
        { email },
        {
          $set: {
            ...userData,
            status: "Verification Pending",
            isVerified: false,
          },
        }
      );
    } catch (error) {
      console.error("error in updating user profile:", error);
      throw error;
    }
  }

  async getUserDetails(id: string): Promise<IUser | null> {
    try {
      return await this.findById(id);
    } catch (error) {
      console.error("error in getting userdetails:", error);
      throw error;
    }
  }

  async getWallet(userId: string): Promise<IUser | null> {
    try {
      return await User.findById(userId).select("wallet").populate("wallet");
    } catch (error) {
      console.error("error in getting wallet:", error);
      throw error;
    }
  }

  async createWallet(): Promise<IWallet> {
    try {
      const wallet = new WalletModel({ balance: 0 });
      return wallet.save();
    } catch (error) {
      console.error("error in creating wallet:", error);
      throw error;
    }
  }

  async carRating(reviewDetails: object): Promise<IReview> {
    try {
      const review = new ReviewModel(reviewDetails);
      return review.save();
    } catch (error) {
      console.error("error in creating car rating:", error);
      throw error;
    }
  }

  async carReview(id: string): Promise<IReview[]> {
    try {
      const carId = new mongoose.Types.ObjectId(id);
      const res = await ReviewModel.aggregate([
        { $match: { carId: carId } },
        {
          $group: {
            _id: null,
            overallRating: { $avg: "$rating" },
            ratingCount: { $sum: 1 },
          },
        },
      ]);
      return res;
    } catch (error) {
      console.error("error in getting review:", error);
      throw error;
    }
  }

  async findWallet(userId: string): Promise<IUser | null> {
    try {
      return await User.findById(userId).select("wallet");
    } catch (error) {
      console.error('error in finding wallet:',error);
      throw error
    }
  }
}

export default new UserRepository();

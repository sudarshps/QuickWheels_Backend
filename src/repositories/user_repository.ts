import User, { IUser } from "../models/user_model";
import mongoose,{ QueryOptions } from "mongoose";
import WalletModel, { IWallet } from '../models/wallet_model'
import ReviewModel, { IReview } from '../models/review_model'
import { IUserRepository } from "../interface/user/IUserRepository";
import BaseRepository from "./base_repository";

class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor(){
    super(User)
  }
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    return await this.create(userData)
  }
  async findUserByEmail(email: string): Promise<IUser | null> {
    return await this.findOne({ email })
  }

  async validateUser(userData: Partial<IUser>): Promise<IUser | null> {
    return await this.findOne({ email: userData.email });
  }

  async updatePassword(email:string,password:string):Promise<Partial<IUser> | null> {
    return await this.findOneAndUpdate({email},{password},{new:true} as QueryOptions) 
  }

  async updateUserProfile(
    userData: Partial<IUser>,
    longitude: number,
    latitude: number
  ): Promise<IUser | null> {
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
  }

  async editUserProfile(userData:Partial<IUser>,email:string):Promise<IUser | null> {
      return await this.findOneAndUpdate({email},{$set:{...userData,status:'Verification Pending',isVerified:false}})
  }


  async getUserDetails(id: string): Promise<IUser | null> {
    return await this.findById(id);
  }


  async getWallet(userId:string): Promise<IUser | null>{
    return await User.findById(userId).select('wallet').populate('wallet')
  }

  async createWallet(): Promise<IWallet>{
    const wallet = new WalletModel({balance:0})
    return wallet.save()
  }

  async carRating(reviewDetails:object): Promise<IReview>{
    const review = new ReviewModel(reviewDetails)
    return review.save()
  } 

  async carReview(id:string): Promise<IReview[]>{    
    const carId = new mongoose.Types.ObjectId(id)
    const res = await ReviewModel.aggregate([{$match:{carId:carId}},{
      $group: {
          _id: null,                               
          overallRating: { $avg: "$rating" },      
          ratingCount: { $sum: 1 }                 
      }
  }])
    return res
  }

  async findWallet(userId: string):Promise<IUser | null> {
    return await User.findById(userId).select("wallet");
  }

}

export default new UserRepository();

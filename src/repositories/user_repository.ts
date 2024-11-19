import User, { IUser } from "../models/user_model";
import CarModel, { ICar } from "../models/car_model";
import CarMake, { ICarMakeCategory } from "../models/carmake-category_model";
import CarType, { ICarTypeCategory } from "../models/cartype-category_model";
import OrderModel from "../models/orders";
import mongoose,{ ObjectId, Types,Schema,QueryOptions } from "mongoose";
import WalletModel from '../models/wallet_model'
import ReviewModel from '../models/review_model'

class UserRepository {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);

    return await user.save();
  }
  async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).exec();
  }

  async validateUser(userData: Partial<IUser>): Promise<IUser | null> {
    return await User.findOne({ email: userData.email });
  }

  async updatePassword(email:string,password:string):Promise<Partial<IUser> | null> {
    return await User.findOneAndUpdate({email},{password},{new:true} as QueryOptions).lean() 
  }

  async updateUserProfile(
    userData: Partial<IUser>,
    longitude: number,
    latitude: number
  ): Promise<IUser | null> {
    const email = userData.email;
    return await User.findOneAndUpdate(
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
      return await User.findOneAndUpdate({email},{$set:{...userData,status:'Verification Pending',isVerified:false}})
  }

  async editCarDetails(carId:string,editedDetails:object,images:string[]|undefined,isVerified:boolean,status:string):Promise<ICar | null> {    
    const updatedData:any = {$set:{...editedDetails,isVerified,status}}

    const carDetails = await CarModel.findByIdAndUpdate(carId,updatedData,{new:true})

    return carDetails || null
  }

  async carDetails(   
    email: string,
    carData: object,
    isVerified: boolean,
    status: string,
    isActive: boolean
  ): Promise<ICar | null> {
    try {
      const user = await User.findOne({ email });

      if (user) {
        const newCar = new CarModel({
          ...carData,
          userId: user._id,
          address: user.address,
          location: user.location,
          isVerified,
          status,
          isActive,
        });

        const response = await newCar.save();
        if (response) {
          await User.findByIdAndUpdate(
            { _id: user._id },
            { isHost: true, $addToSet: { role: "HOST" } }
          );
          return response;
        }
      }

      return null;
    } catch (error) {
      console.error("Error in creating car document", error);

      return null;
    }
  }

  async getCarDetails(email: string): Promise<ICar[] | null> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.error("User not found with the provided email:", email);
        return null;
      }

      const carDetails = await CarModel.find({ userId: user._id });

      if (!carDetails) {
        console.error("Car details not found for user:", user._id);
        return null;
      }

      return carDetails;
    } catch (error) {
      console.error("error fetching car details", error);
      return null;
    }
  }

  async getRentCarDetails(): Promise<ICar[] | null> {
    const response = await CarModel.find({ isVerified: 1 });
    return await CarModel.populate(response, [
      { path: "make", model: "CarMake" },
      { path: "carType", model: "CarType" },
    ]);
  }

  async userCarDetails(id: string): Promise<ICar | null> {
    // return await CarModel.findById(id)
    const carId = new Types.ObjectId(id);
    const result = await CarModel.aggregate([
      { $match: { _id: carId } },
      {
        $lookup: {
          from: "carmakes",
          localField: "make",
          foreignField: "_id",
          as: "carMake",
        },
      },
      {
        $lookup: {
          from: "cartypes",
          localField: "carType",
          foreignField: "_id",
          as: "carType",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
    ]);
    return result.length > 0 ? (result[0] as ICar) : null;
  }

  async getUserDetails(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async getCarDistance(
    lng: number,
    lat: number,
    distanceValue: number
  ): Promise<ICar[] | null> {
    const geoNearStage: any = {
      $geoNear: {
        near: { type: "Point", coordinates: [lng, lat] },
        distanceField: "distance",
        spherical: true,
      },
    };

    if (distanceValue !== 0) {
      geoNearStage.$geoNear.maxDistance = distanceValue * 1000;
    }

    const result = await CarModel.aggregate([geoNearStage]);

    return await CarModel.populate(result, [
      { path: "make", model: "CarMake" },
      { path: "carType", model: "CarType" },
    ]);
  }

  async getCarMake(): Promise<ICarMakeCategory[]> {
    return await CarMake.find();
  }

  async getCarType(): Promise<ICarTypeCategory[]> {
    return await CarType.find();
  }

  async setCarDate(
    dateFrom: Date,
    dateTo: Date,
    carId: string
  ): Promise<ICar | null> {
    return await CarModel.findByIdAndUpdate(carId, {
      availabilityFrom: dateFrom,
      availabilityTo: dateTo,
    });
  }

  async successOrder(order: object) {
    const orderData = new OrderModel(order);
    return await orderData.save();
  }

  async removeHostCar(carId: string) {
    return await CarModel.findByIdAndDelete(carId);
  } 


  async getWallet(userId:string){
    return await User.findById(userId).select('wallet').populate('wallet')
  }

  async createWallet(){
    const wallet = new WalletModel({balance:0})
    return wallet.save()
  }

  async carRating(reviewDetails:object){
    const review = new ReviewModel(reviewDetails)
    return review.save()
  } 

  async carReview(id:string){    
    const carId = new mongoose.Types.ObjectId(id)
    // const res = await ReviewModel.find({carId:id})
    const res = await ReviewModel.aggregate([{$match:{carId:carId}},{
      $group: {
          _id: null,                               
          overallRating: { $avg: "$rating" },      
          ratingCount: { $sum: 1 }                 
      }
  }])
    return res
  }

}

export default new UserRepository();

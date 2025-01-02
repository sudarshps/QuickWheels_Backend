import CarModel, { ICar } from "../models/car_model";
import CarMake, { ICarMakeCategory } from "../models/carmake-category_model";
import CarType, { ICarTypeCategory } from "../models/cartype-category_model";
import User from "../models/user_model";
import { Types } from "mongoose";
import { ICarRepository } from "../interface/car/ICarRepository";
import BaseRepository from "./base_repository";

class CarRepository extends BaseRepository<ICar> implements ICarRepository {
  constructor() {
    super(CarModel);
  }
  async editCarDetails(
    carId: string,
    editedDetails: object,
    images: string[] | undefined,
    isVerified: boolean,
    status: string
  ): Promise<ICar | null> {
    try {
      const updatedData: any = {
        $set: { ...editedDetails, isVerified, status },
      };

      const carDetails = await this.findByIdAndUpdate(carId, updatedData, {
        new: true,
      });

      return carDetails || null;
    } catch (error) {
      console.error("error in editing car details:", error);
      throw error;
    }
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

      const carDetails = await this.find({ userId: user._id });

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

  async reserveCar(
    carId: string,
    toDate: Date,
    fromDate: Date
  ): Promise<ICar | null> {
    try {
      return await CarModel.findByIdAndUpdate(carId, {
        reservedDateFrom: fromDate,
        reservedDateTo: toDate,
      });
    } catch (error) {
      console.error('error in reserving car:',error);
      throw error
    }
  }

  async cancelCarReservation(carId: string): Promise<ICar | null> {
    try {
      return await CarModel.findByIdAndUpdate(carId, {
        $unset: { reservedDateFrom: 1, reservedDateTo: 1 },
      });
    } catch (error) {
      console.error('error in cancelling reserving car:',error);
      throw error
    }
  }

  async getRentCarDetails(): Promise<ICar[] | null> {
    try {
      const response = await this.find({ isVerified: 1 });
    return await CarModel.populate(response, [
      { path: "make", model: "CarMake" },
      { path: "carType", model: "CarType" },
    ]);
    } catch (error) {
      console.error('error in getting rent car details:',error);
      throw error
    }
    
  }

  async userCarDetails(id: string): Promise<ICar | null> {
    try {
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
    } catch (error) {
      console.error('error in getting user car details:',error);
      throw error
    }
  }

  async getCarDistance(
    lng: number,
    lat: number,
    distanceValue: number
  ): Promise<ICar[] | null> {
    try {
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
    } catch (error) {
      console.error('error in getting car distance:',error);
      throw error
    }
   
  }

  async getCarMake(): Promise<ICarMakeCategory[]> {
    try {
      return await CarMake.find();
    } catch (error) {
      console.error('error in finding car make:',error);
      throw error
    }
  }

  async getCarType(): Promise<ICarTypeCategory[]> {
    try {
      return await CarType.find();
    } catch (error) {
      console.error('error in finding car type:',error);
      throw error
    }
  }

  async setCarDate(
    dateFrom: Date,
    dateTo: Date,
    carId: string
  ): Promise<ICar | null> {
    try {
      return await this.findByIdAndUpdate(carId, {
        availabilityFrom: dateFrom,
        availabilityTo: dateTo,
      });
    } catch (error) {
      console.error('error in setting car date:',error);
      throw error
    }
    
  }

  async removeHostCar(carId: string): Promise<ICar | null> {
    try {
      return await this.findByIdAndDelete(carId);

    } catch (error) {
      console.error('error in remove host car:',error);
      throw error
    }
  }
}

export default new CarRepository();

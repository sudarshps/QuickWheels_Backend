import User, { IUser } from "../models/user_model";
import CarModel, { ICar } from "../models/car_model";
import CarType, { ICarTypeCategory } from "../models/cartype-category_model";
import CarMake, { ICarMakeCategory } from "../models/carmake-category_model";
import { Types } from "mongoose";
import OrderModel, { IOrder } from "../models/orders";
import { IAdminRepository } from "../interface/admin/IAdminRepository";
import BaseRepository from '../repositories/base_repository'

interface ICarWithUserDetails extends ICar {
  userDetails: IUser;
}

class AdminRepository implements IAdminRepository{

  private userRepository: BaseRepository<IUser>;
  private carRepository: BaseRepository<ICar>;
  private carTypeRepository: BaseRepository<ICarTypeCategory>;
  private carMakeRepository: BaseRepository<ICarMakeCategory>;
  private orderRepository: BaseRepository<IOrder>;

  constructor() {
    this.userRepository = new BaseRepository(User);
    this.carRepository = new BaseRepository(CarModel);
    this.carTypeRepository = new BaseRepository(CarType);
    this.carMakeRepository = new BaseRepository(CarMake);
    this.orderRepository = new BaseRepository(OrderModel);
  }

  async getUsers(): Promise<IUser[] | null> {
    try {
      return await this.userRepository.findAll();
    } catch (error) {
      console.error('error while getting users:',error);
      throw error
    }
  }

  async getHosts(): Promise<ICarWithUserDetails[] | null> {
    try {
      return await CarModel.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
      ]);
    } catch (error) {
      console.error('error while getting hosts:',error);
      throw error
    }
  }

  async userDetails(id: string): Promise<IUser | null> {
    try {
      return await this.userRepository.findById(id);
    } catch (error) {
      console.error('error while getting user details:',error);
      throw error
    }
  }

  async hostDetails(id: string): Promise<ICar | null> {
    try {
      const hostId = new Types.ObjectId(id);
    const result = await CarModel.aggregate([
      { $match: { _id: hostId } },
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
    ]);
    return result.length > 0 ? (result[0] as ICar) : null;
    } catch (error) {
      console.error('error while getting host details:',error);
      throw error
    }
  }

  async verifyUser(
    status: string,
    id: string,
    isVerified: boolean,
    note: string
  ): Promise<string | undefined> {
    try {
      const response = await this.userRepository.findByIdAndUpdate(id, {
        status: status,
        isVerified: isVerified,
        note: note,
      });
      return response?.status;
    } catch (error) {
      console.error('error while verifying user:',error);
      throw error
    }
  }

  async verifyHost(
    status: string,
    id: string,
    isVerified: boolean,
    note: string
  ): Promise<string | undefined> {
    try {
      const response = await this.carRepository.findByIdAndUpdate(id, {
        status: status,
        isVerified: isVerified,
        note: note,
      });
      return response?.status;
    } catch (error) {
      console.error('error while verifying host:',error);
      throw error
    }
  }

  async findTypeCategory(
    newCategory: string
  ): Promise<ICarTypeCategory | null> {
    try {
      return await this.carTypeRepository.findOne({ name: newCategory });
    } catch (error) {
      console.error('error while getting car type:',error);
      throw error
    }
  }

  async addTypeCategory(newCategory: string): Promise<ICarTypeCategory> {
    try {
      const carType = new CarType({name:newCategory})

    return await carType.save()
    } catch (error) {
      console.error('error while adding type category:',error);
      throw error
    }
  }

  async findMakeCategory(
    newCategory: string
  ): Promise<ICarMakeCategory | null> {
    try {
      return await this.carMakeRepository.findOne({ name: newCategory });
    } catch (error) {
      console.error('error while finding make category:',error);
      throw error
    }
  }

  async addMakeCategory(newCategory: string): Promise<ICarMakeCategory> {
    try {
      const carType = new CarMake({ name: newCategory });

      return await carType.save();
    } catch (error) {
      console.error('error while adding make category:',error);
      throw error
    }
  }

  async makeCategory(): Promise<ICarMakeCategory[]> {
    try {
      return await this.carMakeRepository.findAll();
    } catch (error) {
      console.error('error while getting make category:',error);
      throw error
    }
  }

  async typeCategory(): Promise<ICarTypeCategory[]> {
    try {
      return await this.carTypeRepository.findAll();
    } catch (error) {
      console.error('error while getting type category:',error);
      throw error
    }
  }

  async removeMakeCategory(categoryId: string): Promise<any> {
    try {
      return await this.carMakeRepository.findByIdAndDelete(categoryId);
    } catch (error) {
      console.error('error while removing make category:',error);
      throw error
    }
  }

  async removeTypeCategory(categoryId: string): Promise<any> {
    try {
      return await this.carTypeRepository.findByIdAndDelete(categoryId);
    } catch (error) {
      console.error('error while removing type category:',error);
      throw error
    }
  }

  async updateMakeCategory(
    newCategory: string,
    categoryId: string
  ): Promise<ICarMakeCategory | null> {
    try {
      return await this.carMakeRepository.findByIdAndUpdate(categoryId, { name: newCategory });
    } catch (error) {
      console.error('error while updating make category:',error);
      throw error
    }
  }

  async updateTypeCategory( 
    newCategory: string,
    categoryId: string
  ): Promise<ICarTypeCategory | null> {
    try {
      return await this.carTypeRepository.findByIdAndUpdate(categoryId, { name: newCategory });
    } catch (error) {
      console.error('error while updating type category:',error);
      throw error
    }
  }

  async userStatus(status: boolean, userId: string): Promise<IUser | null> {
    try {
      return await this.userRepository.findByIdAndUpdate(userId, { isActive: status });
    } catch (error) {
      console.error('error while getting user status:',error);
      throw error
    }
  }

  async hostStatus(
    status: boolean,
    hostId: string,
    carId: string
  ): Promise<IUser | ICar | null> {
    try {
      const response = await this.carRepository.findByIdAndUpdate(carId, {
        isActive: status,
      });
      if (response) {
        const user = await this.userRepository.findById(hostId);
        if (user?.isActive !== status) {
          return await this.userRepository.findByIdAndUpdate(hostId, { isActive: status });
        }
      }
      return response;
    } catch (error) {
      console.error('error while getting host status:',error);
      throw error
    }
  }

  async getOrderList(): Promise<IOrder[]> {
    try {
      return await OrderModel.find()
      .populate("userId")
      .populate({
        path: "carId",
        populate: {
          path: "userId",
        },
      });
    } catch (error) {
      console.error('error while getting order list:',error);
      throw error
    }
    
  }

  async getOrderDetails(id: string): Promise<IOrder | null> {
    try {
      return await OrderModel.findOne({ _id: id })
      .populate("userId")
      .populate({
        path: "carId",
        populate: [
          {
            path: "userId",
          },
          {
            path: "make",
          },
        ],
      });
    } catch (error) {
      console.error('error while getting order details:',error);
      throw error
    }
    
  }

  async dashboardOrder(): Promise<IOrder[] | null> {
    try {
      return await this.orderRepository.findAll();
    } catch (error) {
      console.error('error while getting dashboard order:',error);
      throw error
    }
  }

  async leaderboard(): Promise<IOrder[] | null> {
    try {
      return await OrderModel.aggregate([
        {$match:{
          status:"success"
        }},
        {
          $lookup: {
            from: "carmodels",
            localField: "carId",
            foreignField: "_id",
            as: "carInfo",
          },
        },
        {
          $unwind: "$carInfo",
        },
        {
          $lookup:{
            from:"users",
            localField:"carInfo.userId",
            foreignField:"_id",
            as:"hostInfo"
          }
        },
        {
          $unwind:"$hostInfo"
        },
        {
          $group: {
            _id: "$carInfo.userId",
            hostName:{$first:"$hostInfo.name"},
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$amount" },
          },
        },
        {
          $sort: {
            totalOrders: -1,
            totalRevenue: -1,
          },
        },
        {
          $limit: 5,
        },
      ]);
    } catch (error) {
      console.error('error while getting leaderboard:',error);
      throw error
    }
    
  }

  async recentOrders():Promise<IOrder[] | null>{
    try {
      return await OrderModel.find().populate("userId")
    .populate({
      path: "carId",
      populate: {
        path: "userId",
      },
    }).sort({createdAt:-1}).limit(3)
    } catch (error) {
      console.error('error while getting recent orders:',error);
      throw error
    }
    
  }
}

export default new AdminRepository();

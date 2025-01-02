import adminRepository from "../repositories/admin_repository";
import { IUser } from "../models/user_model";
import { ICar } from "../models/car_model";
import { Types } from "mongoose";
import jwt, { SignOptions } from "jsonwebtoken";
import { ICarMakeCategory } from "../models/carmake-category_model";
import { IOrder } from "../models/orders";
import {IAdminRepository} from '../interface/admin/IAdminRepository'
import {IAdminService} from '../interface/admin/IAdminService'


interface AdminValidation {    
  validated: boolean;
  accessToken?: string;
  message: string;
}

interface UserVerification {
  statusUpdated: boolean;
  message: string;
}

interface CategoryResponseType {
  categoryAdded?: boolean;
  categoryRemoved?: boolean;
  message: string;
}


interface HostDetails {
  _id: Types.ObjectId;
  hostName: string;
  email: string;
  carModel: string;
  dob: string;
  status: string;
}


class AdminService implements IAdminService{

  constructor(private _adminRepository: IAdminRepository){}

  async getUsers(): Promise<IUser[] | null> {
    try {
      return await this._adminRepository.getUsers();
    } catch (error) {
      console.error('Error fetching users:',error);
      throw error
    }
  }

  async hostList(): Promise<HostDetails[] | null> {
    try {
      const hostDetails = await this._adminRepository.getHosts();
    if (!hostDetails) {
      return null;
    }    
    return hostDetails
      .filter((host) => host.userDetails.isHost)
      .map((host) => ({
        _id: host._id,
        
        userId:host.userDetails._id,
        hostName: host.userDetails.name,
        email: host.userDetails.email,
        carModel: host.carModel,
        dob: host.userDetails.dob,
        isActive:host.isActive,
        status: host.status,
      }));
    } catch (error) {
      console.error('Error fetching hosts:',error);
      throw error
    }
  }

  async userDetails(id: string): Promise<IUser | null> {
    try {
      return await this._adminRepository.userDetails(id);
    } catch (error) {
      console.error('Error fetching userdetails:',error);
      throw error
    }
  }

  async hostDetails(id: string): Promise<ICar | null> {
    try {
      return await this._adminRepository.hostDetails(id);
    } catch (error) {
      console.error('Error fetching hostdetails:',error);
      throw error
    }
  }

  async login(email: string, password: string): Promise<AdminValidation> {
    try {
      const adminMail = process.env.ADMIN_EMAIL;
    const adminPass = process.env.ADMIN_PASS;
    const accessSecret = process.env.JWT_ACCESS_SECRET;

    if (email === adminMail && password === adminPass) {
      const accessToken = (options?: SignOptions): string => {
        return jwt.sign({ adminmail: adminMail,role:'admin' }, accessSecret as string, {
          ...(options && options),
        });
      };
      return {
        validated: true,
        accessToken: accessToken(),
        message: "admin validation successful",
      };
    }

    return {
      validated: false,
      message: "admin validation failed",
    };
    } catch (error) {
      console.error('Error on logging in:',error);
      throw error
    }
  }

  async verifyUser(
    status: string,
    id: string,
    note: string
  ): Promise<UserVerification> {
    try {
      let isVerified = false;
    if (status === "Verified") {
      isVerified = true;
    }
    const response = await this._adminRepository.verifyUser(
      status,
      id,
      isVerified,
      note
    );

    if (response === "Verified") {
      return {
        statusUpdated: true,
        message: "status updated",
      };
    }

    return {
      statusUpdated: false,
      message: "status updated",
    };
    } catch (error) {
      console.error('Error verifying user:',error);
      throw error
    }
  }

  async verifyHost(
    status: string,
    id: string,
    note: string
  ): Promise<UserVerification> {
    try {
      let isVerified = false;
    if (status === "Verified") {
      isVerified = true;
    }
    const response = await this._adminRepository.verifyHost(
      status,
      id,
      isVerified,
      note
    );

    if (response === "Verified") {
      return {
        statusUpdated: true,
        message: "status updated",
      };
    }

    return {
      statusUpdated: false,
      message: "status updated",
    };
    } catch (error) {
      console.error('Error verifying hosts:',error);
      throw error
    }
  }

  async addTypeCategory(newCategory: string): Promise<CategoryResponseType | null> {
    try {
      const exist = await this._adminRepository.findTypeCategory(newCategory)
    if(!exist){
      const response = await this._adminRepository.addTypeCategory(newCategory);
      if (!response) {
        return {
          categoryAdded: false,
          message: "Category was not added",
        };
      }
      return {
        categoryAdded: true,
        message: "category added successfully",
      };
    }
    return null 
    } catch (error) {
      console.error('Error in adding type category:',error);
      throw error
    }
    
  }

  async addMakeCategory(newCategory: string): Promise<CategoryResponseType | null> {
    try {
      const exist = await this._adminRepository.findMakeCategory(newCategory)
    if(!exist){
      const response = await this._adminRepository.addMakeCategory(newCategory);
    if (!response) {
      return {
        categoryAdded: false,
        message: "Category was not added",
      };
    }
    return {
      categoryAdded: true,
      message: "category added successfully",
    };
    }
    return null
    } catch (error) {
      console.error('Error in adding make category:',error);
      throw error
    }
  }

  async makeCategory(page:number,dataSize:number): Promise<{totalPages:number,data:ICarMakeCategory[]}> {
    try {
      let response = await this._adminRepository.makeCategory();
    const startIndex = (page-1) * dataSize 
    const endIndex = page * dataSize 
    const totalPages = Math.ceil(response.length/dataSize)
    response = response.slice(startIndex,endIndex)
    return {
      totalPages,
      data:response
    }
    } catch (error) {
      console.error('Error fetching make category:',error);
      throw error
    }
  }

  async typeCategory(page:number,dataSize:number): Promise<{totalPages:number,data:ICarMakeCategory[]}> {
    try {
      let response = await this._adminRepository.typeCategory()
    const startIndex = (page-1) * dataSize
    const endIndex = page * dataSize
    const totalPages = Math.ceil(response.length/dataSize)
    response = response.slice(startIndex,endIndex)
    return {
      totalPages,
      data:response
    }
    } catch (error) {
      console.error('Error fetching type category:',error);
      throw error
    }
  }

  async removeMakeCategory(categoryId: string): Promise<CategoryResponseType | undefined> {
    try {
      if (typeof categoryId === "string") {
        const response = await this._adminRepository.removeMakeCategory(categoryId);
        if(!response){
          return{
            categoryRemoved:false,
            message:'category was not removed'
          }
        }
        return{
          categoryRemoved:true,
          message:'category removed successfully'
        }
      }
    } catch (error) {
      console.error('Error in remove make category:',error);
      throw error
    }
  }

  async removeTypeCategory(categoryId: string): Promise<CategoryResponseType | undefined> {
    try {
      if (typeof categoryId === "string") {
        const response = await this._adminRepository.removeTypeCategory(categoryId);
        if(!response){
          return{
            categoryRemoved:false,
            message:'category was not removed'
          }
        }
        return{
          categoryRemoved:true,
          message:'category removed successfully'
        }
      }
    } catch (error) {
      console.error('Error in remove type category:',error);
      throw error
    }
   
  }

  async updateMakeCategory(newCategory:string,categoryId:string): Promise<CategoryResponseType | undefined | null> {
    try {
      const exist = await this._adminRepository.findMakeCategory(newCategory)
    if(!exist){
      if(typeof categoryId === "string"){
        const response = await this._adminRepository.updateMakeCategory(newCategory,categoryId)
        if(!response){
          return{
            categoryAdded:false,
            message:'category was not edited'
          }
        }
        return{
          categoryAdded:true,
          message:'category edited successfully!'
        }
      }
    }
    return null
    } catch (error) {
      console.error('Error in updating make category:',error);
      throw error
    }
    
    
  }

  async updateTypeCategory(newCategory:string,categoryId:string): Promise<CategoryResponseType | undefined | null> {
    try {
      const exist = await this._adminRepository.findTypeCategory(newCategory)
    if(!exist){
      if(typeof categoryId === "string"){
        const response = await this._adminRepository.updateTypeCategory(newCategory,categoryId)
        if(!response){
          return{
            categoryAdded:false,
            message:'category was not edited'
          }
        }
        return{
          categoryAdded:true,
          message:'category edited successfully!'
        }
      }
    }
    return null
    } catch (error) {
      console.error('Error in remove type category:',error);
      throw error
    }
    
  }

  async userStatus(status:boolean,userId:string):Promise<UserVerification | null> {
    try {
      const response = await this._adminRepository.userStatus(status,userId)
    if(!response){
      return{
        statusUpdated:false,
        message:'status was not updated'
      }
    }
    return{
      statusUpdated:true,
      message:'status updated'
    }
    } catch (error) {
      console.error('Error in fetching user status:',error);
      throw error
    }
    
  }

  async hostStatus(status:boolean,hostId:string,carId:string):Promise<UserVerification | null> {
    try {
      const response = await this._adminRepository.hostStatus(status,hostId,carId)
    if(!response){
      return{
        statusUpdated:false,
        message:'status was not updated'
      }
    }
    return{
      statusUpdated:true,
      message:'status updated'
    }
    } catch (error) {
      console.error('Error in fetching host status:',error);
      throw error
    }
    
  }

  async getOrderList():Promise<IOrder[]>{
    try {
      return await this._adminRepository.getOrderList()
    } catch (error) {
      console.error('Error in fetching order list:',error);
      throw error
    }
  }

  async getOrderDetails(id:string):Promise<IOrder | null>{
    try {
      return await this._adminRepository.getOrderDetails(id)
    } catch (error) {
      console.error('Error in fetching order details:',error);
      throw error
    }
  } 

  async dashboardOrder():Promise<IOrder[] | null>{
    try {
      return await this._adminRepository.dashboardOrder()
    } catch (error) {
      console.error('Error in fetching dashboard order:',error);
      throw error
    }
  }

  async leaderboard():Promise<IOrder[] | null>{
    try {
      return await this._adminRepository.leaderboard()
    } catch (error) {
      console.error('Error in fetching leaderboard list:',error);
      throw error
    }
  }

  async recentOrders():Promise<IOrder[] | null>{
    try {
      return await this._adminRepository.recentOrders()
    } catch (error) {
      console.error('Error in fetching recent orders:',error);
      throw error
    }
  }
}

export default new AdminService(adminRepository);

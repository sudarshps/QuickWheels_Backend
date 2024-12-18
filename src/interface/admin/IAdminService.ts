import {IUser} from '../../models/user_model'
import { Types } from "mongoose";
import {ICar} from '../../models/car_model'
import { ICarMakeCategory } from '../../models/carmake-category_model';
import {IOrder} from '../../models/orders'

interface HostDetails {
    _id: Types.ObjectId;
    hostName: string;
    email: string;
    carModel: string;
    dob: string;
    status: string;
  }

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

export interface IAdminService{
    getUsers(): Promise<IUser[] | null>
    hostList(): Promise<HostDetails[] | null>
    userDetails(id: string): Promise<IUser | null>
    hostDetails(id: string): Promise<ICar | null>
    login(email: string, password: string): Promise<AdminValidation>
    verifyUser(
        status: string,
        id: string,
        note: string
      ): Promise<UserVerification>
      verifyHost(
        status: string,
        id: string,
        note: string
      ): Promise<UserVerification>
      addTypeCategory(newCategory: string): Promise<CategoryResponseType | null>
      addMakeCategory(newCategory: string): Promise<CategoryResponseType | null>
      makeCategory(page:number,dataSize:number): Promise<{totalPages:number,data:ICarMakeCategory[]}>
      typeCategory(page:number,dataSize:number): Promise<{totalPages:number,data:ICarMakeCategory[]}>
      removeMakeCategory(categoryId: string): Promise<CategoryResponseType | undefined>
      removeTypeCategory(categoryId: string): Promise<CategoryResponseType | undefined> 
      updateMakeCategory(newCategory:string,categoryId:string): Promise<CategoryResponseType | undefined | null>
      updateTypeCategory(newCategory:string,categoryId:string): Promise<CategoryResponseType | undefined | null>
      userStatus(status:boolean,userId:string):Promise<UserVerification | null>
      hostStatus(status:boolean,hostId:string,carId:string):Promise<UserVerification | null>
      getOrderList():Promise<IOrder[]>
      getOrderDetails(id:string):Promise<IOrder | null>
      dashboardOrder():Promise<IOrder[] | null>
      leaderboard():Promise<IOrder[] | null>
      recentOrders():Promise<IOrder[] | null>
}
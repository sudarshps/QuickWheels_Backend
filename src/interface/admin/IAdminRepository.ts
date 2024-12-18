import { IUser } from "../../models/user_model";
import { ICar } from "../../models/car_model";
import { IOrder } from "../../models/orders";
import { ICarMakeCategory } from "../../models/carmake-category_model";
import { ICarTypeCategory } from "../../models/cartype-category_model";

interface ICarWithUserDetails extends ICar {
  userDetails: IUser;
}

export interface IAdminRepository {
  getUsers(): Promise<IUser[] | null>;
  getHosts(): Promise<ICarWithUserDetails[] | null>;
  userDetails(id: string): Promise<IUser | null>;
  hostDetails(id: string): Promise<ICar | null>;
  verifyUser(
    status: string,
    id: string,
    isVerified: boolean,
    note: string
  ): Promise<string | undefined>;
  verifyHost(
    status: string,
    id: string,
    isVerified: boolean,
    note: string
  ): Promise<string | undefined>;
  findTypeCategory(newCategory: string): Promise<ICarTypeCategory | null>;
  addTypeCategory(newCategory: string): Promise<ICarTypeCategory>;
  findMakeCategory(newCategory: string): Promise<ICarMakeCategory | null>;
  addMakeCategory(newCategory: string): Promise<ICarMakeCategory>;
  makeCategory(): Promise<ICarMakeCategory[]>
  typeCategory(): Promise<ICarTypeCategory[]>
  removeMakeCategory(categoryId: string): Promise<any>
  removeTypeCategory(categoryId: string): Promise<any>
  updateMakeCategory(
    newCategory: string,
    categoryId: string
  ): Promise<ICarMakeCategory | null>
  updateTypeCategory( 
    newCategory: string,
    categoryId: string
  ): Promise<ICarTypeCategory | null>
  userStatus(status: boolean, userId: string): Promise<IUser | null>
  hostStatus(
    status: boolean,
    hostId: string,
    carId: string
  ): Promise<IUser | ICar | null>
  getOrderList(): Promise<IOrder[]>
  getOrderDetails(id: string): Promise<IOrder | null>
  dashboardOrder(): Promise<IOrder[] | null>
  leaderboard(): Promise<IOrder[] | null>
  recentOrders():Promise<IOrder[] | null>

}

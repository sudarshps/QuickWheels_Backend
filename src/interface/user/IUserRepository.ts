import { IUser } from "../../models/user_model";
import {ICar} from '../../models/car_model'
import { ICarMakeCategory } from "../../models/carmake-category_model";
import { ICarTypeCategory } from "../../models/cartype-category_model";
import { IOrder } from "../../models/orders";
import { IWallet } from "../../models/wallet_model";
import { IReview } from "../../models/review_model";

export interface IUserRepository{
    createUser(userData: Partial<IUser>): Promise<IUser> 
    findUserByEmail(email: string): Promise<IUser | null>
    validateUser(userData: Partial<IUser>): Promise<IUser | null>
    updatePassword(email:string,password:string):Promise<Partial<IUser> | null>
    updateUserProfile(
        userData: Partial<IUser>,
        longitude: number,
        latitude: number
      ): Promise<IUser | null>
      editUserProfile(userData:Partial<IUser>,email:string):Promise<IUser | null>
      editCarDetails(carId:string,editedDetails:object,images:string[]|undefined,isVerified:boolean,status:string):Promise<ICar | null>
      carDetails(   
        email: string,
        carData: object,
        isVerified: boolean,
        status: string,
        isActive: boolean
      ): Promise<ICar | null>
      getCarDetails(email: string): Promise<ICar[] | null>
      getRentCarDetails(): Promise<ICar[] | null>
      userCarDetails(id: string): Promise<ICar | null>
      getUserDetails(id: string): Promise<IUser | null>
      getCarDistance(
        lng: number,
        lat: number,
        distanceValue: number
      ): Promise<ICar[] | null>
      getCarMake(): Promise<ICarMakeCategory[]>
      getCarType(): Promise<ICarTypeCategory[]>
      setCarDate(
        dateFrom: Date,
        dateTo: Date,
        carId: string
      ): Promise<ICar | null>
      successOrder(order: object): Promise<IOrder>
      removeHostCar(carId: string): Promise<Document | null>
      getWallet(userId:string): Promise<IUser | null>
      createWallet(): Promise<IWallet>
      carRating(reviewDetails:object): Promise<IReview>
      carReview(id:string): Promise<IReview[]>
}
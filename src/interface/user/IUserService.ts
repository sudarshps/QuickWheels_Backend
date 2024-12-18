import {IUser} from '../../models/user_model'
import {ICar} from '../../models/car_model'
import { ObjectId } from "mongodb";
import { ICarMakeCategory } from '../../models/carmake-category_model';
import { ICarTypeCategory } from '../../models/cartype-category_model';
import {IReview} from '../../models/review_model'


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

  interface UserUpdateResponse {
    userUpdated: boolean;
    email?: string;
    isHost?: boolean;
    userName?: string;
    profileUpdated?: boolean;
    message?: string;
  }

  interface EmailValidate {
    emailExists: boolean;
    password?:string;
    token?: string;
    message?: string;
  }

  interface EditedCarDetailsType {
    make?:string,
    carModel?:string,
    carType?:string,
    transmission?:string,
    fuel?:string,
    seatCapacity?:string,
    rentAmount?:number,
    registerNumber?:string,
    insuranceExp?:Date,
    images?:string[],
    RCDoc?:string,
    InsuranceDoc?:string
  }

  interface CarDetailsResponse {
    updatedCarDetails: boolean;
    message?: string;
  }

  type ICarWithHostName = ICar & {
    hostName?: string;
  };

  interface CarStatus {
    isRemoved: boolean;
    message: string;
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



export interface IUserService{
    createUser(userData: Partial<IUser>,loginMethod:string): Promise<userValidate | null>
    userProfile(
        userData: Partial<IUser>,
        longitude: number,
        latitude: number
      ): Promise<UserUpdateResponse>
      editUserProfile(userData:Partial<IUser>,email:string):Promise<IUser | null>
      validateEmail(userData: Partial<IUser>): Promise<EmailValidate>
      validateUser(userData: Partial<IUser>,loginMethod:string): Promise<userValidate>
      updatePassword(email:string,password:string):Promise<Partial<IUser> | null>
      userDetails(email: string): Promise<UserDetails | void>
      editCarDetails(carId:string,editedDetails:EditedCarDetailsType,isVerified:boolean,status:string):Promise<ICar | null>
      carDetails(
        email: string,
        carData: object,
        isVerified: boolean,
        status: string,
        isActive: boolean
      ): Promise<CarDetailsResponse>
      getCarDetails(email: string): Promise<ICar[] | null>
      rentCarDetails(
        userId: string,
        sort: string,
        transmission: string[],
        fuel: string[],
        seat: string[],
        lng: number,
        lat: number,
        distanceValue: number,
        searchInput: string,
        carType: string[],
        make: string,
        dateFrom: Date | undefined,
        dateTo: Date | undefined
      ): Promise<ICar[] | null>
      userCarDetails(id: string): Promise<ICarWithHostName | null>
      getCarMake(): Promise<ICarMakeCategory[]>
      getCarType(): Promise<ICarTypeCategory[]>
      setCarDate(
        dateFrom: Date,
        dateTo: Date,
        carId: string
      ): Promise<ICar | null>
      removeHostCar(carId: string): Promise<CarStatus>
      getWallet(userId: string): Promise<Partial<IUser> | null>
      carRating(userId:string,carId:string,orderId:string,rating:number,feedback:string):Promise<IReview | null>
      carReview(id:string):Promise<IReview[] | null>
}
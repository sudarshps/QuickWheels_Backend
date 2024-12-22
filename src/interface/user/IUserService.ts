import {IUser} from '../../models/user_model'
import { ObjectId } from "mongodb";
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
      getWallet(userId: string): Promise<Partial<IUser> | null>
      carRating(userId:string,carId:string,orderId:string,rating:number,feedback:string):Promise<IReview | null>
      carReview(id:string):Promise<IReview[] | null>
}
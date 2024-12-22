import { IUser } from "../../models/user_model";
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
      getUserDetails(id: string): Promise<IUser | null>
      getWallet(userId:string): Promise<IUser | null>
      createWallet(): Promise<IWallet>
      carRating(reviewDetails:object): Promise<IReview>
      carReview(id:string): Promise<IReview[]>
      findWallet(userId: string):Promise<IUser | null>
}